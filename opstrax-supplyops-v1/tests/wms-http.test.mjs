import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'opstrax-wms-integration-'));
process.env.OPSTRAX_DB_PATH = join(dir, 'wms-integration.sqlite');
process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';

const { db } = await import('../src/db.js');
const { resolveContext, listInventoryItems } = await import('../src/services.js');
const { ensureWmsSchema } = await import('../src/wms-schema.js');
const {
  checkInWmsHandlingUnit,
  getWmsControlTower,
  listWmsBillableEvents,
  listWmsCapacity,
  recordWmsQuality,
  releaseWmsHandlingUnit,
  saveWmsCustomerContract
} = await import('../src/wms.js');

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

test('warehouse journey connects capacity, quality, release and 3PL billing', () => {
  const tower = getWmsControlTower(context, { facilityId });
  assert.ok(tower.capacity.total > 0, 'existing bins should seed sellable capacity positions');

  const capacity = listWmsCapacity(context, { facilityId });
  const free = capacity.units.find((unit) => !unit.occupancy && !unit.blocked);
  assert.ok(free, 'an available capacity position is required');

  const item = listInventoryItems(context)[0];
  assert.ok(item?.id, 'seeded inventory item required');

  const customerRef = `WMS-TEST-${Date.now()}`;
  saveWmsCustomerContract(context, {
    customerRef,
    receivingRatePerUnit: 4.5,
    storageRatePerUnitDay: 8.25,
    outboundRatePerUnit: 3.25,
    minimumBillableDays: 1
  });

  const checkIn = checkInWmsHandlingUnit(context, {
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

  const huId = checkIn.handlingUnit.id;
  const quality = recordWmsQuality(context, huId, {
    acceptedQty: 10,
    rejectedQty: 0,
    reason: 'Inspection passed'
  });
  assert.equal(quality.handlingUnit.inventory_status, 'AVAILABLE');

  const release = releaseWmsHandlingUnit(context, huId, { reason: 'SHIPPED' });
  assert.equal(release.billing.length, 2);
  assert.equal(release.billing.every((event) => event.pricing_status === 'PRICED'), true);

  const billing = listWmsBillableEvents(context, { customerRef }).events;
  assert.ok(billing.some((event) => event.event_type === 'RECEIVING'));
  assert.ok(billing.some((event) => event.event_type === 'STORAGE'));
  assert.ok(billing.some((event) => event.event_type === 'OUTBOUND_HANDLING'));

  const afterRelease = listWmsCapacity(context, { facilityId });
  const same = afterRelease.units.find((unit) => unit.id === free.id);
  assert.equal(Boolean(same.occupancy), false, 'space should be sellable again after release');
});
