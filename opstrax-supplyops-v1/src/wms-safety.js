import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';
import { fail, requireString } from './validation.js';
import { validateQualitySplit } from './wms-engine.js';
import {
  checkInWmsHandlingUnit as baseCheckIn,
  recordWmsQuality as baseQuality,
  releaseWmsHandlingUnit as baseRelease
} from './wms.js';

function resolveCapacityUnit(context, body) {
  const id = body.capacityUnitId || body.capacity_unit_id;
  const code = String(body.capacityCode || body.capacity_code || '').trim();
  if (id) return String(id);
  if (!code) throw fail('capacityUnitId or capacityCode is required');
  const row = selectOne('SELECT id FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ? AND code = ?', [context.tenant.id, body.facilityId || body.facility_id || context.user.facility_id, code]);
  if (!row) throw fail(`Capacity position not found for code ${code}`, 404);
  return row.id;
}

function overlappingReservations(context, capacityUnitId, startedAt, expectedReleaseAt) {
  const rows = selectAll(
    "SELECT * FROM wms_space_reservations WHERE tenant_id = ? AND capacity_unit_id = ? AND status IN ('HELD','CONFIRMED','ACTIVE') ORDER BY reserved_from",
    [context.tenant.id, capacityUnitId]
  );
  const start = Date.parse(startedAt);
  const end = expectedReleaseAt ? Date.parse(expectedReleaseAt) : Number.POSITIVE_INFINITY;
  return rows.filter((row) => Date.parse(row.reserved_until) > start && Date.parse(row.reserved_from) < end);
}

export function checkInWmsHandlingUnitSafe(context, body) {
  const capacityUnitId = resolveCapacityUnit(context, body);
  const customerRef = requireString(body.customerRef || body.customer_ref, 'customerRef', { max: 160 });
  const startedAt = nowIso();
  const expectedReleaseAt = body.expectedReleaseAt || body.expected_release_at || null;
  const overlapping = overlappingReservations(context, capacityUnitId, startedAt, expectedReleaseAt);
  const conflict = overlapping.find((row) => row.customer_ref !== customerRef);
  if (conflict) {
    throw fail(`Capacity position is reserved for another customer from ${conflict.reserved_from} to ${conflict.reserved_until}`, 409);
  }
  const result = baseCheckIn(context, { ...body, capacityUnitId, customerRef });
  const matching = overlapping.filter((row) => row.customer_ref === customerRef);
  if (matching.length) {
    transaction(() => {
      for (const row of matching) {
        execute("UPDATE wms_space_reservations SET status = 'ACTIVE' WHERE tenant_id = ? AND id = ?", [context.tenant.id, row.id]);
      }
    });
  }
  return { ...result, activatedReservationIds: matching.map((row) => row.id) };
}

function validateRejectedDestination(context, hu, capacityUnitId) {
  if (!capacityUnitId) throw fail('rejectedCapacityUnitId is required for partial quality acceptance', 409);
  if (capacityUnitId === hu.current_capacity_unit_id) throw fail('Rejected quantity must be segregated to a different capacity position', 409);
  const unit = selectOne('SELECT * FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ? AND id = ?', [context.tenant.id, hu.facility_id, capacityUnitId]);
  if (!unit) throw fail('Rejected destination capacity position not found', 404);
  if (unit.blocked_reason || unit.status === 'BLOCKED') throw fail('Rejected destination capacity position is blocked', 409);
  const occupied = selectOne("SELECT id FROM wms_space_occupancies WHERE tenant_id = ? AND capacity_unit_id = ? AND status = 'ACTIVE'", [context.tenant.id, capacityUnitId]);
  if (occupied) throw fail('Rejected destination capacity position is already occupied', 409);
  return unit;
}

export function recordWmsQualitySafe(context, handlingUnitId, body) {
  const hu = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, handlingUnitId]);
  if (!hu) throw fail('Handling unit not found', 404);
  const split = validateQualitySplit(hu.quantity, body.acceptedQty ?? body.accepted_qty ?? 0, body.rejectedQty ?? body.rejected_qty ?? 0);
  let rejectedUnit = null;
  if (split.outcome === 'PARTIAL') {
    rejectedUnit = validateRejectedDestination(context, hu, body.rejectedCapacityUnitId || body.rejected_capacity_unit_id);
  }

  const result = baseQuality(context, handlingUnitId, body);
  if (split.outcome !== 'PARTIAL') return result;

  const rejectedHu = selectOne(
    "SELECT * FROM wms_handling_units WHERE tenant_id = ? AND parent_handling_unit_id = ? AND inventory_status = 'REJECTED' ORDER BY created_at DESC LIMIT 1",
    [context.tenant.id, handlingUnitId]
  );
  if (!rejectedHu) throw fail('Rejected quality split was not created', 500);

  const occupancyId = newId('wmsocc');
  const eventId = newId('wmse');
  const auditId = newId('audit');
  const now = nowIso();
  transaction(() => {
    execute('UPDATE wms_handling_units SET current_capacity_unit_id = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [rejectedUnit.id, now, context.tenant.id, rejectedHu.id]);
    insert('wms_space_occupancies', {
      id: occupancyId, tenant_id: context.tenant.id, facility_id: hu.facility_id,
      capacity_unit_id: rejectedUnit.id, handling_unit_id: rejectedHu.id, customer_ref: hu.owner_ref || '',
      status: 'ACTIVE', started_at: now, expected_release_at: null, ended_at: null,
      release_confidence: 0, created_at: now, updated_at: now
    });
    execute("UPDATE wms_capacity_units SET status = 'OCCUPIED', updated_at = ? WHERE tenant_id = ? AND id = ?", [now, context.tenant.id, rejectedUnit.id]);
    insert('wms_operational_events', {
      id: eventId, tenant_id: context.tenant.id, facility_id: hu.facility_id,
      event_type: 'QUALITY_REJECT_SEGREGATED', entity_type: 'wms_handling_unit', entity_id: rejectedHu.id,
      idempotency_key: String(body.clientRequestId || body.client_request_id || `quality-segregation-${handlingUnitId}-${rejectedHu.id}`),
      actor_user_id: context.user.id, device_id: context.device?.id ?? null,
      payload_json: JSON.stringify({ parentHandlingUnitId: handlingUnitId, rejectedHandlingUnitId: rejectedHu.id, rejectedCapacityUnitId: rejectedUnit.id, rejectedQty: split.rejected }),
      occurred_at: now, created_at: now
    });
    insert('audit_logs', {
      id: auditId, tenant_id: context.tenant.id, actor_user_id: context.user.id,
      actor_role: context.user.role_key, department_id: context.user.department_id,
      facility_id: context.user.facility_id, device_id: context.device?.id ?? null,
      action: 'WMS_SEGREGATE_REJECTED_QUALITY', entity_type: 'wms_handling_unit', entity_id: rejectedHu.id,
      summary: `${rejectedHu.lpn} segregated to ${rejectedUnit.code}`,
      before_json: JSON.stringify({ capacity_unit_id: hu.current_capacity_unit_id }),
      after_json: JSON.stringify({ capacity_unit_id: rejectedUnit.id, rejected_qty: split.rejected }),
      request_id: context.requestId || ''
    });
  });

  return {
    ...result,
    rejectedHandlingUnit: selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, rejectedHu.id]),
    rejectedOccupancy: selectOne('SELECT * FROM wms_space_occupancies WHERE tenant_id = ? AND id = ?', [context.tenant.id, occupancyId])
  };
}

export function releaseWmsHandlingUnitSafe(context, handlingUnitId, body = {}) {
  const hu = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, handlingUnitId]);
  if (!hu) throw fail('Handling unit not found', 404);
  const reason = String(body.reason || 'SHIPPED').toUpperCase();
  if (reason === 'SHIPPED' && hu.inventory_status !== 'AVAILABLE') {
    throw fail(`Only AVAILABLE inventory can be customer-shipped; current status is ${hu.inventory_status}`, 409);
  }
  const result = baseRelease(context, handlingUnitId, body);
  const capacityUnitId = result.occupancy?.capacity_unit_id;
  if (capacityUnitId) {
    transaction(() => {
      execute(
        "UPDATE wms_space_reservations SET status = 'FULFILLED' WHERE tenant_id = ? AND capacity_unit_id = ? AND customer_ref = ? AND status = 'ACTIVE'",
        [context.tenant.id, capacityUnitId, hu.owner_ref || '']
      );
      execute(
        "UPDATE wms_allocations SET status = 'FULFILLED', released_at = ? WHERE tenant_id = ? AND handling_unit_id = ? AND status = 'ALLOCATED'",
        [nowIso(), context.tenant.id, handlingUnitId]
      );
    });
  }
  return result;
}
