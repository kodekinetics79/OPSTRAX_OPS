import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'opstrax-wms-integration-'));
process.env.OPSTRAX_DB_PATH = join(dir, 'wms-integration.sqlite');
process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';

const { db, selectAll, selectOne } = await import('../src/db.js');
const { resolveContext, listInventoryItems } = await import('../src/services.js');
const { ensureWmsSchema } = await import('../src/wms-schema.js');
const {
  getWmsControlTower,
  listWmsBillableEvents,
  listWmsCapacity,
  saveWmsCustomerContract
} = await import('../src/wms.js');
const {
  allocateWmsInventorySafe,
  checkInWmsHandlingUnitSafe,
  recordWmsQualitySafe,
  releaseWmsHandlingUnitSafe
} = await import('../src/wms-safety.js');

ensureWmsSchema();

const context = resolveContext(new Headers({
  'x-tenant-id': 'tenant_intelliflow_systems',
  'x-user-id': 'tenant_intelliflow_systems_user_admin'
}));
context.requestId = 'wms-integration-test';
const facilityId = context.user.facility_id;

after(() => {
  try { db.close?.(); } catch {}
  rmSync(dir, { recursive: true, force: true });
});

function canonicalBalance(itemId, binId) {
  return selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, itemId, binId]) || {
    on_hand: 0,
    reserved: 0,
    available: 0
  };
}

test('warehouse journey stays wired to canonical inventory, capacity, quality and 3PL billing', () => {
  const tower = getWmsControlTower(context, { facilityId });
  assert.ok(tower.capacity.total > 0, 'existing bins should seed sellable capacity positions');

  const capacity = listWmsCapacity(context, { facilityId });
  const free = capacity.units.find((unit) => !unit.occupancy && !unit.blocked && unit.bin_id);
  assert.ok(free, 'a bin-backed available capacity position is required');

  const item = listInventoryItems(context)[0];
  assert.ok(item?.id, 'seeded inventory item required');
  const before = canonicalBalance(item.id, free.bin_id);

  const customerRef = `WMS-TEST-${Date.now()}`;
  saveWmsCustomerContract(context, {
    customerRef,
    receivingRatePerUnit: 4.5,
    storageRatePerUnitDay: 8.25,
    outboundRatePerUnit: 3.25,
    minimumBillableDays: 1
  });

  const checkIn = checkInWmsHandlingUnitSafe(context, {
    facilityId,
    capacityUnitId: free.id,
    lpn: `LPN-${Date.now()}`,
    customerRef,
    itemId: item.id,
    quantity: 10,
    uom: 'EA',
    qualityRequired: true
  });
  assert.equal(checkIn.handlingUnit.inventory_status, 'RECEIVED_NOT_INSPECTED');
  assert.equal(checkIn.billable.pricing_status, 'PRICED');
  assert.equal(checkIn.inventoryPosting, null, 'QC-controlled receipt must not post available stock before acceptance');
  const afterCheckIn = canonicalBalance(item.id, free.bin_id);
  assert.equal(Number(afterCheckIn.on_hand), Number(before.on_hand));
  assert.equal(Number(afterCheckIn.available), Number(before.available));

  const huId = checkIn.handlingUnit.id;
  const quality = recordWmsQualitySafe(context, huId, {
    acceptedQty: 10,
    rejectedQty: 0,
    reason: 'Inspection passed'
  });
  assert.equal(quality.handlingUnit.inventory_status, 'AVAILABLE');
  assert.equal(quality.inventoryPosting?.movement?.movement_type, 'WMS_RECEIVE');
  const afterQuality = canonicalBalance(item.id, free.bin_id);
  assert.equal(Number(afterQuality.on_hand), Number(before.on_hand) + 10);
  assert.equal(Number(afterQuality.available), Number(before.available) + 10);

  const allocation = allocateWmsInventorySafe(context, {
    facilityId,
    itemId: item.id,
    demandType: 'SALES_ORDER',
    demandId: `SO-WMS-${Date.now()}`,
    quantity: 10
  });
  assert.equal(allocation.allocated, 10);
  const afterAllocation = canonicalBalance(item.id, free.bin_id);
  assert.equal(Number(afterAllocation.on_hand), Number(before.on_hand) + 10);
  assert.equal(Number(afterAllocation.reserved), Number(before.reserved) + 10);
  assert.equal(Number(afterAllocation.available), Number(before.available));

  const release = releaseWmsHandlingUnitSafe(context, huId, { reason: 'SHIPPED' });
  assert.equal(release.inventoryPosting?.movement?.movement_type, 'WMS_SHIP');
  assert.equal(release.billing.length, 2);
  assert.equal(release.billing.every((event) => event.pricing_status === 'PRICED'), true);
  const afterShip = canonicalBalance(item.id, free.bin_id);
  assert.equal(Number(afterShip.on_hand), Number(before.on_hand));
  assert.equal(Number(afterShip.reserved), Number(before.reserved));
  assert.equal(Number(afterShip.available), Number(before.available));

  const movements = selectAll(
    "SELECT movement_type, reference_id FROM stock_movements WHERE tenant_id = ? AND reference_type = 'wms_handling_unit' AND reference_id = ? ORDER BY created_at",
    [context.tenant.id, huId]
  );
  assert.deepEqual(movements.map((movement) => movement.movement_type), ['WMS_RECEIVE', 'WMS_SHIP']);
  assert.ok(selectOne("SELECT id FROM audit_logs WHERE tenant_id = ? AND entity_type = 'wms_handling_unit' AND entity_id = ? AND action = 'WMS_POST_CANONICAL_RECEIPT'", [context.tenant.id, huId]));
  assert.ok(selectOne("SELECT id FROM audit_logs WHERE tenant_id = ? AND entity_type = 'wms_handling_unit' AND entity_id = ? AND action = 'WMS_POST_CANONICAL_SHIPMENT'", [context.tenant.id, huId]));

  const billing = listWmsBillableEvents(context, { customerRef }).events;
  assert.ok(billing.some((event) => event.event_type === 'RECEIVING'));
  assert.ok(billing.some((event) => event.event_type === 'STORAGE'));
  assert.ok(billing.some((event) => event.event_type === 'OUTBOUND_HANDLING'));

  const afterRelease = listWmsCapacity(context, { facilityId });
  const same = afterRelease.units.find((unit) => unit.id === free.id);
  assert.equal(Boolean(same.occupancy), false, 'space should be sellable again after release');
});
