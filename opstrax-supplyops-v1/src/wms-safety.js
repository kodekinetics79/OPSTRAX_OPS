import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';
import { fail, requireString } from './validation.js';
import { allocateFefo, validateQualitySplit } from './wms-engine.js';
import {
  checkInWmsHandlingUnit as baseCheckIn,
  recordWmsQuality as baseQuality,
  releaseWmsHandlingUnit as baseRelease
} from './wms.js';

const ALLOCATION_ROLES = new Set(['admin', 'supervisor']);

function resolveCapacityUnit(context, body) {
  const id = body.capacityUnitId || body.capacity_unit_id;
  const code = String(body.capacityCode || body.capacity_code || '').trim();
  if (id) return String(id);
  if (!code) throw fail('capacityUnitId or capacityCode is required');
  const row = selectOne('SELECT id FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ? AND code = ?', [context.tenant.id, body.facilityId || body.facility_id || context.user.facility_id, code]);
  if (!row) throw fail(`Capacity position not found for code ${code}`, 404);
  return row.id;
}

function facilityRow(context, facilityId) {
  const id = String(facilityId || context.user.facility_id || '');
  const row = selectOne('SELECT * FROM facilities WHERE tenant_id = ? AND id = ?', [context.tenant.id, id]);
  if (!row) throw fail('Facility not found for tenant', 404);
  return row;
}

function transactionItem(context, itemId) {
  if (!itemId) return null;
  const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, itemId]);
  if (!item) throw fail('Item not found', 404);
  if (Number(item.active || 0) !== 1 || String(item.status || 'ACTIVE').toUpperCase() !== 'ACTIVE') {
    throw fail('Item must be ACTIVE before warehouse transactions are allowed', 409);
  }
  return item;
}

function wholeUnitQuantity(value, field = 'quantity') {
  const quantity = Number(value || 0);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw fail(`${field} must be a positive whole-unit quantity while the existing inventory ledger remains integer-based`, 409);
  }
  return quantity;
}

function capacityWithBin(context, facilityId, capacityUnitId) {
  const unit = selectOne('SELECT * FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ? AND id = ?', [context.tenant.id, facilityId, capacityUnitId]);
  if (!unit) throw fail('Capacity position not found', 404);
  if (!unit.bin_id) throw fail('Item-linked warehouse inventory must use a bin-backed capacity position', 409);
  const bin = selectOne('SELECT * FROM bins WHERE tenant_id = ? AND facility_id = ? AND id = ?', [context.tenant.id, facilityId, unit.bin_id]);
  if (!bin) throw fail('Capacity position is not linked to a valid inventory bin', 409);
  return { unit, bin };
}

function inventoryMovement(context, movementType, handlingUnitId) {
  return selectOne(
    'SELECT * FROM stock_movements WHERE tenant_id = ? AND reference_type = ? AND reference_id = ? AND movement_type = ? ORDER BY created_at DESC LIMIT 1',
    [context.tenant.id, 'wms_handling_unit', handlingUnitId, movementType]
  );
}

function postCanonicalReceipt(context, hu, quantity, capacityUnitId, note = 'WMS quality release to available inventory') {
  if (!hu.item_id || Number(quantity || 0) <= 0) return null;
  const qty = wholeUnitQuantity(quantity, 'accepted quantity');
  transactionItem(context, hu.item_id);
  const existing = inventoryMovement(context, 'WMS_RECEIVE', hu.id);
  if (existing) return { replayed: true, movement: existing };
  const { bin } = capacityWithBin(context, hu.facility_id, capacityUnitId);
  const now = nowIso();
  let balance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, hu.item_id, bin.id]);
  const before = Number(balance?.on_hand || 0);
  const after = before + qty;
  transaction(() => {
    if (balance) {
      execute('UPDATE stock_balances SET on_hand = on_hand + ?, available = available + ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [qty, qty, now, context.tenant.id, balance.id]);
    } else {
      const id = newId('stock');
      insert('stock_balances', {
        id, tenant_id: context.tenant.id, item_id: hu.item_id, facility_id: hu.facility_id,
        bin_id: bin.id, on_hand: qty, reserved: 0, available: qty, updated_at: now
      });
      balance = { id, on_hand: 0, reserved: 0, available: 0 };
    }
    insert('stock_movements', {
      id: newId('movement'), tenant_id: context.tenant.id, item_id: hu.item_id,
      facility_id: hu.facility_id, bin_id: bin.id, movement_type: 'WMS_RECEIVE', quantity: qty,
      reference_type: 'wms_handling_unit', reference_id: hu.id, performed_by_user_id: context.user.id,
      department_id: context.user.department_id, note, reason: note, before_quantity: before,
      after_quantity: after, status: 'POSTED', lot_no: hu.lot_no || '', serial_no: hu.serial_no || '',
      expiry_date: hu.expiry_date || null, evidence_document_id: null, adjustment_id: null,
      posted_by_user_id: context.user.id, posted_at: now, created_at: now
    });
    insert('audit_logs', {
      id: newId('audit'), tenant_id: context.tenant.id, actor_user_id: context.user.id,
      actor_role: context.user.role_key, department_id: context.user.department_id,
      facility_id: hu.facility_id, device_id: context.device?.id ?? null,
      action: 'WMS_POST_CANONICAL_RECEIPT', entity_type: 'wms_handling_unit', entity_id: hu.id,
      summary: `${qty} ${hu.uom || 'EA'} posted to canonical inventory from ${hu.lpn}`,
      before_json: JSON.stringify({ on_hand: before }), after_json: JSON.stringify({ on_hand: after, bin_id: bin.id }),
      request_id: context.requestId || ''
    });
  });
  return { replayed: false, movement: inventoryMovement(context, 'WMS_RECEIVE', hu.id) };
}

function postCanonicalShipment(context, hu, quantity, capacityUnitId) {
  if (!hu.item_id || Number(quantity || 0) <= 0) return null;
  const qty = wholeUnitQuantity(quantity, 'shipment quantity');
  const existing = inventoryMovement(context, 'WMS_SHIP', hu.id);
  if (existing) return { replayed: true, movement: existing };
  const { bin } = capacityWithBin(context, hu.facility_id, capacityUnitId);
  const balance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, hu.item_id, bin.id]);
  if (!balance || Number(balance.on_hand || 0) < qty) throw fail('Canonical inventory balance is insufficient for shipment', 409);
  if (Number(balance.reserved || 0) < qty) throw fail('Canonical inventory must be allocated before shipment', 409);
  const before = Number(balance.on_hand || 0);
  const after = before - qty;
  const now = nowIso();
  transaction(() => {
    execute('UPDATE stock_balances SET on_hand = on_hand - ?, reserved = reserved - ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [qty, qty, now, context.tenant.id, balance.id]);
    insert('stock_movements', {
      id: newId('movement'), tenant_id: context.tenant.id, item_id: hu.item_id,
      facility_id: hu.facility_id, bin_id: bin.id, movement_type: 'WMS_SHIP', quantity: qty,
      reference_type: 'wms_handling_unit', reference_id: hu.id, performed_by_user_id: context.user.id,
      department_id: context.user.department_id, note: `WMS shipment for ${hu.lpn}`,
      reason: 'Customer shipment', before_quantity: before, after_quantity: after, status: 'POSTED',
      lot_no: hu.lot_no || '', serial_no: hu.serial_no || '', expiry_date: hu.expiry_date || null,
      evidence_document_id: null, adjustment_id: null, posted_by_user_id: context.user.id,
      posted_at: now, created_at: now
    });
    insert('audit_logs', {
      id: newId('audit'), tenant_id: context.tenant.id, actor_user_id: context.user.id,
      actor_role: context.user.role_key, department_id: context.user.department_id,
      facility_id: hu.facility_id, device_id: context.device?.id ?? null,
      action: 'WMS_POST_CANONICAL_SHIPMENT', entity_type: 'wms_handling_unit', entity_id: hu.id,
      summary: `${qty} ${hu.uom || 'EA'} shipped from canonical inventory for ${hu.lpn}`,
      before_json: JSON.stringify({ on_hand: before, reserved: Number(balance.reserved || 0) }),
      after_json: JSON.stringify({ on_hand: after, reserved: Number(balance.reserved || 0) - qty, bin_id: bin.id }),
      request_id: context.requestId || ''
    });
  });
  return { replayed: false, movement: inventoryMovement(context, 'WMS_SHIP', hu.id) };
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
  const itemId = body.itemId || body.item_id || null;
  const qualityRequired = body.qualityRequired !== false && body.quality_required !== false;
  if (itemId) {
    transactionItem(context, itemId);
    wholeUnitQuantity(body.quantity, 'quantity');
    capacityWithBin(context, body.facilityId || body.facility_id || context.user.facility_id, capacityUnitId);
  }
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
  const inventoryPosting = !qualityRequired && result.handlingUnit.item_id
    ? postCanonicalReceipt(context, result.handlingUnit, result.handlingUnit.quantity, capacityUnitId, 'WMS receipt released directly to available inventory')
    : null;
  return { ...result, activatedReservationIds: matching.map((row) => row.id), inventoryPosting };
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
  if (split.outcome === 'PARTIAL_PENDING') throw fail('Quality decision must account for the full received quantity', 409);
  if (hu.item_id && split.accepted > 0) wholeUnitQuantity(split.accepted, 'accepted quantity');
  if (hu.item_id && split.rejected > 0) wholeUnitQuantity(split.rejected, 'rejected quantity');
  let rejectedUnit = null;
  if (split.outcome === 'PARTIAL') {
    rejectedUnit = validateRejectedDestination(context, hu, body.rejectedCapacityUnitId || body.rejected_capacity_unit_id);
  }

  const result = baseQuality(context, handlingUnitId, body);
  let rejectedHandlingUnit = null;
  let rejectedOccupancy = null;
  if (split.outcome === 'PARTIAL') {
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
    rejectedHandlingUnit = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, rejectedHu.id]);
    rejectedOccupancy = selectOne('SELECT * FROM wms_space_occupancies WHERE tenant_id = ? AND id = ?', [context.tenant.id, occupancyId]);
  }

  const acceptedHu = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, hu.id]);
  const inventoryPosting = split.accepted > 0 && hu.item_id
    ? postCanonicalReceipt(context, acceptedHu, split.accepted, hu.current_capacity_unit_id, 'WMS quality acceptance released to available inventory')
    : null;
  return { ...result, handlingUnit: acceptedHu, rejectedHandlingUnit, rejectedOccupancy, inventoryPosting };
}

export function allocateWmsInventorySafe(context, body) {
  if (!context?.tenant?.id || !context?.user?.id) throw fail('Authentication required', 401);
  if (!ALLOCATION_ROLES.has(context.user.role_key)) throw fail('Allocation requires supervisor-level authorization', 403);
  const fac = facilityRow(context, body.facilityId || body.facility_id || context.user.facility_id);
  const itemId = requireString(body.itemId || body.item_id, 'itemId', { max: 120 });
  transactionItem(context, itemId);
  const demandType = requireString(body.demandType || body.demand_type || 'SALES_ORDER', 'demandType', { max: 60 });
  const demandId = requireString(body.demandId || body.demand_id, 'demandId', { max: 120 });
  const requested = wholeUnitQuantity(body.quantity, 'allocation quantity');
  const existing = selectAll(
    "SELECT * FROM wms_allocations WHERE tenant_id = ? AND facility_id = ? AND demand_type = ? AND demand_id = ? AND item_id = ? AND status = 'ALLOCATED' ORDER BY allocated_at",
    [context.tenant.id, fac.id, demandType, demandId, itemId]
  );
  if (existing.length) {
    const allocated = existing.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    if (allocated !== requested) throw fail('Existing active allocation for this demand has a different quantity', 409);
    return { requested, allocated, short: 0, allocations: existing, replayed: true };
  }

  const hus = selectAll(
    "SELECT * FROM wms_handling_units WHERE tenant_id = ? AND facility_id = ? AND item_id = ? AND inventory_status = 'AVAILABLE' AND status NOT IN ('RELEASED','SHIPPED')",
    [context.tenant.id, fac.id, itemId]
  );
  for (const hu of hus) {
    const allocated = Number(selectOne("SELECT COALESCE(SUM(quantity),0) AS qty FROM wms_allocations WHERE tenant_id = ? AND handling_unit_id = ? AND status = 'ALLOCATED'", [context.tenant.id, hu.id]).qty || 0);
    hu.available_qty = Math.max(0, Number(hu.quantity || 0) - allocated);
  }
  const plan = allocateFefo(hus, requested);
  if (plan.short > 0 && body.allowShort !== true && body.allow_short !== true) throw fail(`Insufficient available inventory: short ${plan.short}`, 409);

  const prepared = plan.allocations.map((entry) => {
    const hu = hus.find((row) => row.id === entry.handling_unit_id);
    const qty = wholeUnitQuantity(entry.quantity, 'allocated quantity');
    if (!hu?.current_capacity_unit_id) throw fail(`Handling unit ${entry.handling_unit_id} has no active storage position`, 409);
    const { bin } = capacityWithBin(context, fac.id, hu.current_capacity_unit_id);
    const balance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, itemId, bin.id]);
    if (!balance || Number(balance.available || 0) < qty) throw fail(`Canonical inventory is insufficient in ${bin.code}`, 409);
    return { entry, hu, bin, balance, qty };
  });

  const now = nowIso();
  const rows = [];
  transaction(() => {
    for (const preparedEntry of prepared) {
      const row = {
        id: newId('wmsalloc'), tenant_id: context.tenant.id, facility_id: fac.id,
        demand_type: demandType, demand_id: demandId, item_id: itemId,
        handling_unit_id: preparedEntry.hu.id, quantity: preparedEntry.qty, status: 'ALLOCATED',
        allocated_by_user_id: context.user.id, allocated_at: now, released_at: null
      };
      insert('wms_allocations', row);
      execute('UPDATE stock_balances SET reserved = reserved + ?, available = available - ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [preparedEntry.qty, preparedEntry.qty, now, context.tenant.id, preparedEntry.balance.id]);
      rows.push(row);
    }
    insert('wms_operational_events', {
      id: newId('wmse'), tenant_id: context.tenant.id, facility_id: fac.id,
      event_type: 'INVENTORY_ALLOCATED', entity_type: demandType, entity_id: demandId,
      idempotency_key: String(body.clientRequestId || body.client_request_id || `${demandType}-${demandId}-${itemId}`),
      actor_user_id: context.user.id, device_id: context.device?.id ?? null,
      payload_json: JSON.stringify({ itemId, requested, allocated: plan.allocated, short: plan.short, allocations: rows.map((row) => row.id) }),
      occurred_at: now, created_at: now
    });
    insert('audit_logs', {
      id: newId('audit'), tenant_id: context.tenant.id, actor_user_id: context.user.id,
      actor_role: context.user.role_key, department_id: context.user.department_id,
      facility_id: fac.id, device_id: context.device?.id ?? null,
      action: 'WMS_ALLOCATE_CANONICAL_INVENTORY', entity_type: demandType, entity_id: demandId,
      summary: `${plan.allocated}/${requested} allocated using FEFO and reserved in canonical inventory`,
      before_json: '{}', after_json: JSON.stringify({ itemId, requested, allocated: plan.allocated, short: plan.short }),
      request_id: context.requestId || ''
    });
  });
  return { ...plan, allocations: rows, replayed: false };
}

export function releaseWmsHandlingUnitSafe(context, handlingUnitId, body = {}) {
  const hu = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, handlingUnitId]);
  if (!hu) throw fail('Handling unit not found', 404);
  const reason = String(body.reason || 'SHIPPED').toUpperCase();
  const originalCapacityUnitId = hu.current_capacity_unit_id;
  if (reason === 'SHIPPED' && hu.inventory_status !== 'AVAILABLE') {
    throw fail(`Only AVAILABLE inventory can be customer-shipped; current status is ${hu.inventory_status}`, 409);
  }
  if (reason === 'SHIPPED' && hu.item_id) {
    wholeUnitQuantity(hu.quantity, 'shipment quantity');
    if (!inventoryMovement(context, 'WMS_RECEIVE', hu.id)) throw fail('Handling unit has not been posted to canonical inventory', 409);
    const allocated = Number(selectOne("SELECT COALESCE(SUM(quantity),0) AS qty FROM wms_allocations WHERE tenant_id = ? AND handling_unit_id = ? AND status = 'ALLOCATED'", [context.tenant.id, hu.id]).qty || 0);
    if (allocated < Number(hu.quantity || 0)) throw fail('Customer shipment requires prior allocation of the full handling-unit quantity', 409);
    const { bin } = capacityWithBin(context, hu.facility_id, originalCapacityUnitId);
    const balance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, hu.item_id, bin.id]);
    if (!balance || Number(balance.on_hand || 0) < Number(hu.quantity || 0) || Number(balance.reserved || 0) < Number(hu.quantity || 0)) {
      throw fail('Canonical inventory balance/reservation is inconsistent with the handling unit', 409);
    }
  }

  const result = baseRelease(context, handlingUnitId, body);
  const inventoryPosting = reason === 'SHIPPED' && hu.item_id
    ? postCanonicalShipment(context, hu, hu.quantity, originalCapacityUnitId)
    : null;
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
  return { ...result, inventoryPosting };
}
