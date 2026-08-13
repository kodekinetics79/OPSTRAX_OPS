import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';
import { fail, requireString } from './validation.js';
import { allocateFefo, computeStorageCharge, forecastCapacity, scoreReleaseConfidence, selectBookableUnits, validateQualitySplit } from './wms-engine.js';

const VIEW_ROLES = new Set(['admin', 'supervisor', 'worker', 'finance']);
const MANAGE_ROLES = new Set(['admin', 'supervisor']);
const EXECUTE_ROLES = new Set(['admin', 'supervisor', 'worker']);
const FINANCE_ROLES = new Set(['admin', 'supervisor', 'finance']);

function requireRole(context, allowed, message = 'Warehouse access denied') {
  if (!context?.tenant?.id || !context?.user?.id) throw fail('Authentication required', 401);
  if (!allowed.has(context.user.role_key)) throw fail(message, 403);
}

function facility(context, facilityId) {
  const id = requireString(facilityId || context.user.facility_id, 'facilityId', { max: 120 });
  const row = selectOne('SELECT * FROM facilities WHERE tenant_id = ? AND id = ?', [context.tenant.id, id]);
  if (!row) throw fail('Facility not found for tenant', 404);
  if (context.user.role_key === 'worker' && context.user.facility_id !== id) throw fail('Worker is restricted to the assigned facility', 403);
  return row;
}

function audit(context, { action, entityType, entityId, summary, before = {}, after = {} }) {
  insert('audit_logs', {
    id: newId('audit'), tenant_id: context.tenant.id, actor_user_id: context.user.id,
    actor_role: context.user.role_key, department_id: context.user.department_id,
    facility_id: context.user.facility_id, device_id: context.device?.id ?? null,
    action, entity_type: entityType, entity_id: entityId, summary,
    before_json: JSON.stringify(before), after_json: JSON.stringify(after), request_id: context.requestId || ''
  });
}

function opEvent(context, { eventType, entityType, entityId, facilityId, payload = {}, idempotencyKey }) {
  const key = String(idempotencyKey || newId('idem'));
  const existing = selectOne(
    'SELECT * FROM wms_operational_events WHERE tenant_id = ? AND event_type = ? AND idempotency_key = ?',
    [context.tenant.id, eventType, key]
  );
  if (existing) return { replayed: true, event: existing };
  const event = {
    id: newId('wmse'), tenant_id: context.tenant.id, facility_id: facilityId || null,
    event_type: eventType, entity_type: entityType, entity_id: entityId,
    idempotency_key: key, actor_user_id: context.user.id, device_id: context.device?.id ?? null,
    payload_json: JSON.stringify(payload), occurred_at: nowIso(), created_at: nowIso()
  };
  insert('wms_operational_events', event);
  return { replayed: false, event };
}

function activeContract(tenantId, customerRef, at = nowIso()) {
  if (!customerRef) return null;
  return selectOne(
    `SELECT * FROM wms_customer_contracts
     WHERE tenant_id = ? AND customer_ref = ? AND status = 'ACTIVE'
       AND effective_from <= ? AND (effective_until IS NULL OR effective_until = '' OR effective_until >= ?)
     ORDER BY effective_from DESC LIMIT 1`,
    [tenantId, customerRef, at, at]
  );
}

function bill(context, { customerRef, eventType, sourceType, sourceId, handlingUnitId = null, capacityUnitId = null, quantity = 1, unitRate = 0, amount = null, currency = 'USD' }) {
  const rate = Number(unitRate || 0);
  const qty = Number(quantity || 0);
  const calculated = amount === null ? Math.round(rate * qty * 100) / 100 : Math.round(Number(amount || 0) * 100) / 100;
  const row = {
    id: newId('wmsbill'), tenant_id: context.tenant.id, customer_ref: customerRef || '', event_type: eventType,
    source_type: sourceType, source_id: sourceId, handling_unit_id: handlingUnitId, capacity_unit_id: capacityUnitId,
    quantity: qty, unit_rate: rate, amount: calculated, currency,
    pricing_status: rate > 0 || calculated > 0 ? 'PRICED' : 'UNPRICED', occurred_at: nowIso(), created_at: nowIso()
  };
  insert('wms_billable_events', row);
  return row;
}

function refreshCapacityStatus(context, capacityUnitId) {
  const unit = selectOne('SELECT * FROM wms_capacity_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, capacityUnitId]);
  if (!unit) return null;
  let status = unit.blocked_reason ? 'BLOCKED' : 'AVAILABLE';
  const active = selectOne("SELECT id FROM wms_space_occupancies WHERE tenant_id = ? AND capacity_unit_id = ? AND status = 'ACTIVE' LIMIT 1", [context.tenant.id, capacityUnitId]);
  if (active) status = 'OCCUPIED';
  else {
    const now = nowIso();
    const reservation = selectOne(
      "SELECT id FROM wms_space_reservations WHERE tenant_id = ? AND capacity_unit_id = ? AND status IN ('HELD','CONFIRMED','ACTIVE') AND reserved_from <= ? AND reserved_until > ? LIMIT 1",
      [context.tenant.id, capacityUnitId, now, now]
    );
    if (reservation) status = 'RESERVED';
  }
  execute('UPDATE wms_capacity_units SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [status, nowIso(), context.tenant.id, capacityUnitId]);
  return status;
}

function capacitySnapshot(context, facilityId) {
  const units = selectAll('SELECT * FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ? ORDER BY code', [context.tenant.id, facilityId]);
  const occupancies = selectAll("SELECT * FROM wms_space_occupancies WHERE tenant_id = ? AND facility_id = ? AND status = 'ACTIVE'", [context.tenant.id, facilityId]);
  const reservations = selectAll("SELECT * FROM wms_space_reservations WHERE tenant_id = ? AND facility_id = ? AND status IN ('HELD','CONFIRMED','ACTIVE') ORDER BY reserved_from", [context.tenant.id, facilityId]);
  const huIds = occupancies.map((o) => o.handling_unit_id);
  const hus = huIds.length ? selectAll(`SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id IN (${huIds.map(() => '?').join(',')})`, [context.tenant.id, ...huIds]) : [];
  const huMap = new Map(hus.map((h) => [h.id, h]));
  return units.map((unit) => {
    const occupancy = occupancies.find((o) => o.capacity_unit_id === unit.id) || null;
    return {
      ...unit,
      blocked: unit.status === 'BLOCKED' || Boolean(unit.blocked_reason),
      occupancy: occupancy ? { ...occupancy, handling_unit: huMap.get(occupancy.handling_unit_id) || null } : null,
      reservations: reservations.filter((r) => r.capacity_unit_id === unit.id)
    };
  });
}

export function syncWmsCapacityFromBins(context, body = {}) {
  requireRole(context, MANAGE_ROLES, 'Only warehouse management can synchronize capacity');
  const fac = facility(context, body.facilityId || body.facility_id || context.user.facility_id);
  const bins = selectAll('SELECT * FROM bins WHERE tenant_id = ? AND facility_id = ? ORDER BY code', [context.tenant.id, fac.id]);
  let created = 0;
  for (const bin of bins) {
    const existing = selectOne('SELECT id FROM wms_capacity_units WHERE tenant_id = ? AND bin_id = ?', [context.tenant.id, bin.id]);
    if (existing) continue;
    insert('wms_capacity_units', {
      id: newId('wmscu'), tenant_id: context.tenant.id, facility_id: fac.id, bin_id: bin.id,
      code: `${bin.code}-P01`, capacity_type: 'PALLET_POSITION', status: 'AVAILABLE', zone: bin.zone || '',
      temperature_class: 'AMBIENT', max_weight: 0, blocked_reason: '', created_at: nowIso(), updated_at: nowIso()
    });
    created += 1;
  }
  audit(context, { action: 'WMS_SYNC_CAPACITY_FROM_BINS', entityType: 'facility', entityId: fac.id, summary: `${created} capacity positions created from bin master`, after: { created } });
  return { facility: fac, created, total: selectOne('SELECT COUNT(*) AS count FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ?', [context.tenant.id, fac.id]).count };
}

export function createWmsCapacityUnit(context, body) {
  requireRole(context, MANAGE_ROLES, 'Only warehouse management can create capacity positions');
  const fac = facility(context, body.facilityId || body.facility_id);
  const code = requireString(body.code, 'code', { max: 120 });
  if (selectOne('SELECT id FROM wms_capacity_units WHERE tenant_id = ? AND code = ?', [context.tenant.id, code])) throw fail('Capacity code already exists', 409);
  const binId = body.binId || body.bin_id || null;
  if (binId && !selectOne('SELECT id FROM bins WHERE tenant_id = ? AND facility_id = ? AND id = ?', [context.tenant.id, fac.id, binId])) throw fail('Bin not found in facility', 404);
  const row = {
    id: newId('wmscu'), tenant_id: context.tenant.id, facility_id: fac.id, bin_id: binId,
    code, capacity_type: String(body.capacityType || body.capacity_type || 'PALLET_POSITION').toUpperCase(),
    status: 'AVAILABLE', zone: String(body.zone || ''), temperature_class: String(body.temperatureClass || 'AMBIENT').toUpperCase(),
    max_weight: Number(body.maxWeight || 0), blocked_reason: '', created_at: nowIso(), updated_at: nowIso()
  };
  insert('wms_capacity_units', row);
  audit(context, { action: 'WMS_CREATE_CAPACITY_UNIT', entityType: 'wms_capacity_unit', entityId: row.id, summary: `Capacity ${code} created`, after: row });
  return row;
}

export function listWmsCapacity(context, query = {}) {
  requireRole(context, VIEW_ROLES);
  const fac = facility(context, query.facilityId || query.facility_id || context.user.facility_id);
  return { facility: fac, units: capacitySnapshot(context, fac.id) };
}

export function getWmsControlTower(context, query = {}) {
  requireRole(context, VIEW_ROLES);
  const fac = facility(context, query.facilityId || query.facility_id || context.user.facility_id);
  const units = capacitySnapshot(context, fac.id);
  const forecast = forecastCapacity(units, nowIso(), [0, 4, 24]);
  const active = units.filter((u) => u.occupancy).length;
  const blocked = units.filter((u) => u.blocked).length;
  const now = nowIso();
  const release4 = new Date(Date.now() + 4 * 3600000).toISOString();
  const overdue = selectOne("SELECT COUNT(*) AS count FROM wms_space_occupancies WHERE tenant_id = ? AND facility_id = ? AND status = 'ACTIVE' AND expected_release_at IS NOT NULL AND expected_release_at < ?", [context.tenant.id, fac.id, now]).count;
  const qcHold = selectOne("SELECT COUNT(*) AS count FROM wms_handling_units WHERE tenant_id = ? AND facility_id = ? AND inventory_status IN ('RECEIVED_NOT_INSPECTED','QUARANTINE','PARTIAL_HOLD','REJECTED') AND status NOT IN ('RELEASED','SHIPPED')", [context.tenant.id, fac.id]).count;
  const releasingSoon = selectOne("SELECT COUNT(*) AS count FROM wms_space_occupancies WHERE tenant_id = ? AND facility_id = ? AND status = 'ACTIVE' AND expected_release_at >= ? AND expected_release_at <= ?", [context.tenant.id, fac.id, now, release4]).count;
  const revenue = selectOne("SELECT COALESCE(SUM(amount),0) AS amount FROM wms_billable_events WHERE tenant_id = ? AND occurred_at >= ?", [context.tenant.id, new Date(Date.now() - 30 * 86400000).toISOString()]).amount;
  const unpriced = selectOne("SELECT COUNT(*) AS count FROM wms_billable_events WHERE tenant_id = ? AND pricing_status = 'UNPRICED'", [context.tenant.id]).count;
  return {
    facility: fac,
    capacity: { total: units.length, occupied: active, blocked, availableNow: forecast[0] || 0, available4h: forecast[4] || 0, available24h: forecast[24] || 0, releasingSoon },
    operations: { qualityHolds: qcHold, overdueReleases: overdue },
    economics: { billableRevenue30d: Number(revenue || 0), unpricedEvents: Number(unpriced || 0) },
    generatedAt: now
  };
}

export function saveWmsCustomerContract(context, body) {
  requireRole(context, FINANCE_ROLES, 'Finance or warehouse management access required');
  const customerRef = requireString(body.customerRef || body.customer_ref, 'customerRef', { max: 160 });
  const effectiveFrom = requireString(body.effectiveFrom || body.effective_from || nowIso(), 'effectiveFrom', { max: 40 });
  const row = {
    id: newId('wmscontract'), tenant_id: context.tenant.id, customer_ref: customerRef, status: 'ACTIVE',
    currency: String(body.currency || 'USD').toUpperCase(), storage_rate_per_unit_day: Number(body.storageRatePerUnitDay || 0),
    receiving_rate_per_unit: Number(body.receivingRatePerUnit || 0), outbound_rate_per_unit: Number(body.outboundRatePerUnit || 0),
    minimum_billable_days: Math.max(1, Number(body.minimumBillableDays || 1)), effective_from: effectiveFrom,
    effective_until: body.effectiveUntil || body.effective_until || null, created_at: nowIso(), updated_at: nowIso()
  };
  insert('wms_customer_contracts', row);
  audit(context, { action: 'WMS_CREATE_CUSTOMER_CONTRACT', entityType: 'wms_customer_contract', entityId: row.id, summary: `3PL rate card created for ${customerRef}`, after: row });
  return row;
}

export function reserveWmsCapacity(context, body) {
  requireRole(context, MANAGE_ROLES, 'Only warehouse management can reserve capacity');
  const fac = facility(context, body.facilityId || body.facility_id);
  const customerRef = requireString(body.customerRef || body.customer_ref, 'customerRef', { max: 160 });
  const reservedFrom = requireString(body.reservedFrom || body.reserved_from, 'reservedFrom', { max: 40 });
  const reservedUntil = requireString(body.reservedUntil || body.reserved_until, 'reservedUntil', { max: 40 });
  const quantity = Number(body.quantity || 1);
  const units = capacitySnapshot(context, fac.id);
  const choice = selectBookableUnits(units, reservedFrom, reservedUntil, quantity);
  if (choice.short > 0) throw fail(`Insufficient bookable capacity: short ${choice.short} position(s)`, 409);
  return transaction(() => {
    const rows = choice.selected.map((unit) => {
      const row = {
        id: newId('wmsres'), tenant_id: context.tenant.id, facility_id: fac.id, capacity_unit_id: unit.id,
        customer_ref: customerRef, status: 'CONFIRMED', reserved_from: reservedFrom, reserved_until: reservedUntil,
        source_type: String(body.sourceType || 'SALES').toUpperCase(), source_id: String(body.sourceId || ''),
        quoted_rate: Number(body.quotedRate || 0), currency: String(body.currency || 'USD').toUpperCase(),
        created_by_user_id: context.user.id, created_at: nowIso(), cancelled_at: null
      };
      insert('wms_space_reservations', row);
      refreshCapacityStatus(context, unit.id);
      return row;
    });
    const event = opEvent(context, { eventType: 'SPACE_RESERVED', entityType: 'facility', entityId: fac.id, facilityId: fac.id, payload: { customerRef, quantity, reservationIds: rows.map((r) => r.id), reservedFrom, reservedUntil }, idempotencyKey: body.clientRequestId || body.client_request_id });
    audit(context, { action: 'WMS_RESERVE_CAPACITY', entityType: 'facility', entityId: fac.id, summary: `${quantity} position(s) reserved for ${customerRef}`, after: { reservationIds: rows.map((r) => r.id), reservedFrom, reservedUntil } });
    return { reservations: rows, event: event.event };
  });
}

export function listWmsHandlingUnits(context, query = {}) {
  requireRole(context, VIEW_ROLES);
  const fac = facility(context, query.facilityId || query.facility_id || context.user.facility_id);
  const status = query.status ? String(query.status).toUpperCase() : '';
  const params = [context.tenant.id, fac.id, ...(status ? [status] : [])];
  const rows = selectAll(
    `SELECT hu.*, i.sku, i.name AS item_name, cu.code AS capacity_code
     FROM wms_handling_units hu
     LEFT JOIN items i ON i.id = hu.item_id
     LEFT JOIN wms_capacity_units cu ON cu.id = hu.current_capacity_unit_id
     WHERE hu.tenant_id = ? AND hu.facility_id = ?${status ? ' AND hu.inventory_status = ?' : ''}
     ORDER BY hu.created_at DESC LIMIT 250`, params
  );
  return { facility: fac, handlingUnits: rows };
}

export function checkInWmsHandlingUnit(context, body) {
  requireRole(context, EXECUTE_ROLES, 'Warehouse execution access required');
  const fac = facility(context, body.facilityId || body.facility_id || context.user.facility_id);
  const capacityUnitId = requireString(body.capacityUnitId || body.capacity_unit_id, 'capacityUnitId', { max: 120 });
  const unit = selectOne('SELECT * FROM wms_capacity_units WHERE tenant_id = ? AND facility_id = ? AND id = ?', [context.tenant.id, fac.id, capacityUnitId]);
  if (!unit) throw fail('Capacity position not found', 404);
  if (unit.blocked_reason || unit.status === 'BLOCKED') throw fail(`Capacity position is blocked: ${unit.blocked_reason || 'blocked'}`, 409);
  if (selectOne("SELECT id FROM wms_space_occupancies WHERE tenant_id = ? AND capacity_unit_id = ? AND status = 'ACTIVE'", [context.tenant.id, unit.id])) throw fail('Capacity position is already occupied', 409);
  const lpn = requireString(body.lpn || body.sscc, 'lpn', { max: 160 });
  if (selectOne('SELECT id FROM wms_handling_units WHERE tenant_id = ? AND lpn = ?', [context.tenant.id, lpn])) throw fail('LPN already exists', 409);
  const itemId = body.itemId || body.item_id || null;
  if (itemId && !selectOne('SELECT id FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, itemId])) throw fail('Item not found', 404);
  const quantity = Number(body.quantity || 0);
  if (!Number.isFinite(quantity) || quantity <= 0) throw fail('quantity must be positive');
  const customerRef = String(body.customerRef || body.customer_ref || '').trim();
  const qualityRequired = body.qualityRequired !== false && body.quality_required !== false;
  return transaction(() => {
    const hu = {
      id: newId('wmshu'), tenant_id: context.tenant.id, facility_id: fac.id, parent_handling_unit_id: null,
      lpn, sscc: String(body.sscc || ''), item_id: itemId, owner_type: String(body.ownerType || 'CUSTOMER').toUpperCase(),
      owner_ref: customerRef, quantity, uom: String(body.uom || 'EA').toUpperCase(), lot_no: String(body.lotNo || body.lot_no || ''),
      serial_no: String(body.serialNo || body.serial_no || ''), expiry_date: body.expiryDate || body.expiry_date || null,
      inventory_status: qualityRequired ? 'RECEIVED_NOT_INSPECTED' : 'AVAILABLE', status: 'RECEIVED',
      current_capacity_unit_id: unit.id, source_type: String(body.sourceType || 'RECEIPT').toUpperCase(), source_id: String(body.sourceId || ''),
      expected_release_at: body.expectedReleaseAt || body.expected_release_at || null, received_at: nowIso(), released_at: null, created_at: nowIso(), updated_at: nowIso()
    };
    insert('wms_handling_units', hu);
    const confidence = scoreReleaseConfidence(body.releaseEvidence || {});
    const occupancy = { id: newId('wmsocc'), tenant_id: context.tenant.id, facility_id: fac.id, capacity_unit_id: unit.id, handling_unit_id: hu.id, customer_ref: customerRef, status: 'ACTIVE', started_at: nowIso(), expected_release_at: hu.expected_release_at, ended_at: null, release_confidence: confidence, created_at: nowIso(), updated_at: nowIso() };
    insert('wms_space_occupancies', occupancy);
    execute('UPDATE wms_capacity_units SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['OCCUPIED', nowIso(), context.tenant.id, unit.id]);
    if (qualityRequired) {
      insert('wms_quality_inspections', { id: newId('wmsqc'), tenant_id: context.tenant.id, handling_unit_id: hu.id, status: 'PENDING', received_qty: quantity, accepted_qty: 0, rejected_qty: 0, pending_qty: quantity, reason: '', inspected_by_user_id: null, inspected_at: null, created_at: nowIso() });
    }
    const contract = activeContract(context.tenant.id, customerRef);
    const receivingRate = Number(contract?.receiving_rate_per_unit || 0);
    const billable = bill(context, { customerRef, eventType: 'RECEIVING', sourceType: hu.source_type, sourceId: hu.source_id || hu.id, handlingUnitId: hu.id, capacityUnitId: unit.id, quantity: 1, unitRate: receivingRate, currency: contract?.currency || 'USD' });
    const event = opEvent(context, { eventType: 'PALLET_PLACED', entityType: 'wms_handling_unit', entityId: hu.id, facilityId: fac.id, payload: { lpn, capacityUnitId: unit.id, customerRef, inventoryStatus: hu.inventory_status }, idempotencyKey: body.clientRequestId || body.client_request_id });
    audit(context, { action: 'WMS_CHECK_IN_HANDLING_UNIT', entityType: 'wms_handling_unit', entityId: hu.id, summary: `${lpn} placed at ${unit.code}`, after: { hu, occupancy, billable } });
    return { handlingUnit: hu, occupancy, billable, event: event.event };
  });
}

export function recordWmsQuality(context, handlingUnitId, body) {
  requireRole(context, MANAGE_ROLES, 'Quality release requires supervisor-level authorization');
  return transaction(() => {
    const hu = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, handlingUnitId]);
    if (!hu) throw fail('Handling unit not found', 404);
    facility(context, hu.facility_id);
    const split = validateQualitySplit(hu.quantity, body.acceptedQty ?? body.accepted_qty ?? 0, body.rejectedQty ?? body.rejected_qty ?? 0);
    const inspection = selectOne("SELECT * FROM wms_quality_inspections WHERE tenant_id = ? AND handling_unit_id = ? AND status = 'PENDING' ORDER BY created_at DESC LIMIT 1", [context.tenant.id, hu.id]);
    if (!inspection) throw fail('No pending quality inspection exists', 409);
    const reason = String(body.reason || '').trim();
    let inventoryStatus = split.outcome === 'ACCEPTED' ? 'AVAILABLE' : split.outcome === 'REJECTED' ? 'REJECTED' : 'PARTIAL_HOLD';
    execute('UPDATE wms_quality_inspections SET status = ?, accepted_qty = ?, rejected_qty = ?, pending_qty = ?, reason = ?, inspected_by_user_id = ?, inspected_at = ? WHERE tenant_id = ? AND id = ?', [split.outcome, split.accepted, split.rejected, split.pending, reason, context.user.id, nowIso(), context.tenant.id, inspection.id]);
    if (split.outcome === 'PARTIAL' && split.accepted > 0 && split.rejected > 0) {
      execute('UPDATE wms_handling_units SET quantity = ?, inventory_status = ?, status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [split.accepted, 'AVAILABLE', 'RECEIVED', nowIso(), context.tenant.id, hu.id]);
      insert('wms_handling_units', {
        id: newId('wmshu'), tenant_id: context.tenant.id, facility_id: hu.facility_id, parent_handling_unit_id: hu.id,
        lpn: `${hu.lpn}-REJ-${Date.now().toString(36).slice(-5)}`, sscc: '', item_id: hu.item_id, owner_type: hu.owner_type, owner_ref: hu.owner_ref,
        quantity: split.rejected, uom: hu.uom, lot_no: hu.lot_no, serial_no: '', expiry_date: hu.expiry_date,
        inventory_status: 'REJECTED', status: 'HOLD', current_capacity_unit_id: hu.current_capacity_unit_id,
        source_type: 'QUALITY_SPLIT', source_id: hu.id, expected_release_at: null, received_at: hu.received_at, released_at: null, created_at: nowIso(), updated_at: nowIso()
      });
      inventoryStatus = 'AVAILABLE_WITH_REJECTED_SPLIT';
    } else {
      execute('UPDATE wms_handling_units SET inventory_status = ?, status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [inventoryStatus, inventoryStatus === 'REJECTED' ? 'HOLD' : 'RECEIVED', nowIso(), context.tenant.id, hu.id]);
    }
    const event = opEvent(context, { eventType: 'QUALITY_DECIDED', entityType: 'wms_handling_unit', entityId: hu.id, facilityId: hu.facility_id, payload: { ...split, inventoryStatus, reason }, idempotencyKey: body.clientRequestId || body.client_request_id });
    audit(context, { action: 'WMS_QUALITY_DECISION', entityType: 'wms_handling_unit', entityId: hu.id, summary: `${hu.lpn} quality outcome ${split.outcome}`, before: hu, after: { ...split, inventoryStatus, reason } });
    return { inspection: { ...inspection, status: split.outcome, accepted_qty: split.accepted, rejected_qty: split.rejected, pending_qty: split.pending, reason }, handlingUnit: selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, hu.id]), event: event.event };
  });
}

export function allocateWmsInventory(context, body) {
  requireRole(context, MANAGE_ROLES, 'Allocation requires supervisor-level authorization');
  const fac = facility(context, body.facilityId || body.facility_id || context.user.facility_id);
  const itemId = requireString(body.itemId || body.item_id, 'itemId', { max: 120 });
  const demandType = requireString(body.demandType || body.demand_type || 'SALES_ORDER', 'demandType', { max: 60 });
  const demandId = requireString(body.demandId || body.demand_id, 'demandId', { max: 120 });
  const requested = Number(body.quantity || 0);
  if (!Number.isFinite(requested) || requested <= 0) throw fail('quantity must be positive');
  const hus = selectAll("SELECT * FROM wms_handling_units WHERE tenant_id = ? AND facility_id = ? AND item_id = ? AND inventory_status = 'AVAILABLE' AND status NOT IN ('RELEASED','SHIPPED')", [context.tenant.id, fac.id, itemId]);
  for (const hu of hus) {
    const allocated = Number(selectOne("SELECT COALESCE(SUM(quantity),0) AS qty FROM wms_allocations WHERE tenant_id = ? AND handling_unit_id = ? AND status = 'ALLOCATED'", [context.tenant.id, hu.id]).qty || 0);
    hu.available_qty = Math.max(0, Number(hu.quantity) - allocated);
  }
  const plan = allocateFefo(hus, requested);
  if (plan.short > 1e-9 && body.allowShort !== true && body.allow_short !== true) throw fail(`Insufficient available inventory: short ${plan.short}`, 409);
  return transaction(() => {
    const rows = plan.allocations.map((entry) => {
      const row = { id: newId('wmsalloc'), tenant_id: context.tenant.id, facility_id: fac.id, demand_type: demandType, demand_id: demandId, item_id: itemId, handling_unit_id: entry.handling_unit_id, quantity: entry.quantity, status: 'ALLOCATED', allocated_by_user_id: context.user.id, allocated_at: nowIso(), released_at: null };
      insert('wms_allocations', row); return row;
    });
    const event = opEvent(context, { eventType: 'INVENTORY_ALLOCATED', entityType: demandType, entityId: demandId, facilityId: fac.id, payload: { itemId, requested, allocated: plan.allocated, short: plan.short, allocations: rows.map((r) => r.id) }, idempotencyKey: body.clientRequestId || body.client_request_id });
    audit(context, { action: 'WMS_ALLOCATE_INVENTORY', entityType: demandType, entityId: demandId, summary: `${plan.allocated}/${requested} allocated using FEFO`, after: plan });
    return { ...plan, allocations: rows, event: event.event };
  });
}

export function releaseWmsHandlingUnit(context, handlingUnitId, body = {}) {
  requireRole(context, EXECUTE_ROLES, 'Warehouse execution access required');
  return transaction(() => {
    const hu = selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, handlingUnitId]);
    if (!hu) throw fail('Handling unit not found', 404);
    facility(context, hu.facility_id);
    const occupancy = selectOne("SELECT * FROM wms_space_occupancies WHERE tenant_id = ? AND handling_unit_id = ? AND status = 'ACTIVE' ORDER BY started_at DESC LIMIT 1", [context.tenant.id, hu.id]);
    if (!occupancy) throw fail('Handling unit has no active occupancy', 409);
    const endedAt = nowIso();
    execute("UPDATE wms_space_occupancies SET status = 'CLOSED', ended_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", [endedAt, endedAt, context.tenant.id, occupancy.id]);
    execute("UPDATE wms_handling_units SET status = ?, current_capacity_unit_id = NULL, released_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", [String(body.reason || 'SHIPPED').toUpperCase() === 'SHIPPED' ? 'SHIPPED' : 'RELEASED', endedAt, endedAt, context.tenant.id, hu.id]);
    refreshCapacityStatus(context, occupancy.capacity_unit_id);
    const contract = activeContract(context.tenant.id, hu.owner_ref, endedAt);
    const charge = computeStorageCharge({ startedAt: occupancy.started_at, endedAt, ratePerDay: Number(contract?.storage_rate_per_unit_day || 0), minimumDays: Number(contract?.minimum_billable_days || 1) });
    const storageBill = bill(context, { customerRef: hu.owner_ref, eventType: 'STORAGE', sourceType: 'SPACE_OCCUPANCY', sourceId: occupancy.id, handlingUnitId: hu.id, capacityUnitId: occupancy.capacity_unit_id, quantity: charge.billableDays, unitRate: Number(contract?.storage_rate_per_unit_day || 0), amount: charge.amount, currency: contract?.currency || 'USD' });
    const outboundRate = Number(contract?.outbound_rate_per_unit || 0);
    const outboundBill = bill(context, { customerRef: hu.owner_ref, eventType: 'OUTBOUND_HANDLING', sourceType: 'HANDLING_UNIT', sourceId: hu.id, handlingUnitId: hu.id, capacityUnitId: occupancy.capacity_unit_id, quantity: 1, unitRate: outboundRate, currency: contract?.currency || 'USD' });
    const event = opEvent(context, { eventType: 'OCCUPANCY_ENDED', entityType: 'wms_handling_unit', entityId: hu.id, facilityId: hu.facility_id, payload: { lpn: hu.lpn, capacityUnitId: occupancy.capacity_unit_id, reason: body.reason || 'SHIPPED', storageCharge: charge.amount, billableDays: charge.billableDays }, idempotencyKey: body.clientRequestId || body.client_request_id });
    audit(context, { action: 'WMS_RELEASE_HANDLING_UNIT', entityType: 'wms_handling_unit', entityId: hu.id, summary: `${hu.lpn} released from capacity`, before: { hu, occupancy }, after: { endedAt, storageBill, outboundBill } });
    return { handlingUnit: selectOne('SELECT * FROM wms_handling_units WHERE tenant_id = ? AND id = ?', [context.tenant.id, hu.id]), occupancy: { ...occupancy, status: 'CLOSED', ended_at: endedAt }, billing: [storageBill, outboundBill], event: event.event };
  });
}

export function listWmsBillableEvents(context, query = {}) {
  requireRole(context, FINANCE_ROLES, 'Finance or warehouse management access required');
  const customer = String(query.customerRef || query.customer_ref || '').trim();
  const status = String(query.pricingStatus || query.pricing_status || '').trim().toUpperCase();
  const where = ['tenant_id = ?']; const params = [context.tenant.id];
  if (customer) { where.push('customer_ref = ?'); params.push(customer); }
  if (status) { where.push('pricing_status = ?'); params.push(status); }
  return { events: selectAll(`SELECT * FROM wms_billable_events WHERE ${where.join(' AND ')} ORDER BY occurred_at DESC LIMIT 500`, params) };
}

export function getWmsCustomerEconomics(context) {
  requireRole(context, FINANCE_ROLES, 'Finance or warehouse management access required');
  return {
    customers: selectAll(
      `SELECT customer_ref, COUNT(*) AS event_count,
              SUM(CASE WHEN pricing_status = 'UNPRICED' THEN 1 ELSE 0 END) AS unpriced_events,
              COALESCE(SUM(amount),0) AS revenue
       FROM wms_billable_events WHERE tenant_id = ?
       GROUP BY customer_ref ORDER BY revenue DESC`, [context.tenant.id]
    )
  };
}

export function getWmsExceptions(context, query = {}) {
  requireRole(context, VIEW_ROLES);
  const fac = facility(context, query.facilityId || query.facility_id || context.user.facility_id);
  const now = nowIso();
  const overdue = selectAll("SELECT o.*, hu.lpn FROM wms_space_occupancies o JOIN wms_handling_units hu ON hu.id = o.handling_unit_id WHERE o.tenant_id = ? AND o.facility_id = ? AND o.status = 'ACTIVE' AND o.expected_release_at IS NOT NULL AND o.expected_release_at < ? ORDER BY o.expected_release_at", [context.tenant.id, fac.id, now]);
  const quality = selectAll("SELECT hu.id, hu.lpn, hu.owner_ref, hu.quantity, hu.inventory_status, hu.created_at FROM wms_handling_units hu WHERE hu.tenant_id = ? AND hu.facility_id = ? AND hu.inventory_status IN ('RECEIVED_NOT_INSPECTED','QUARANTINE','PARTIAL_HOLD','REJECTED') AND hu.status NOT IN ('RELEASED','SHIPPED') ORDER BY hu.created_at", [context.tenant.id, fac.id]);
  const unpriced = FINANCE_ROLES.has(context.user.role_key) ? selectAll("SELECT * FROM wms_billable_events WHERE tenant_id = ? AND pricing_status = 'UNPRICED' ORDER BY occurred_at DESC LIMIT 100", [context.tenant.id]) : [];
  return { facility: fac, overdueReleases: overdue, qualityHolds: quality, unpricedBilling: unpriced };
}
