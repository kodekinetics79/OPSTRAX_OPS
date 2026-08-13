import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'opstrax-wms-http-'));
process.env.OPSTRAX_DB_PATH = join(dir, 'wms-http.sqlite');
process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';

const { startWms, server } = await import('../wms-server.js');
const HEADERS = {
  'x-tenant-id': 'tenant_intelliflow_systems',
  'x-user-id': 'tenant_intelliflow_systems_user_admin'
};

async function request(port, path, { method = 'GET', body } = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: { ...HEADERS, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

test('warehouse journey connects capacity, quality, release and 3PL billing', async () => {
  const srv = await startWms(0);
  const port = srv.address().port;
  try {
    const tower = await request(port, '/api/wms/control-tower');
    assert.equal(tower.response.status, 200);
    assert.ok(tower.payload.capacity.total > 0, 'existing bins should seed sellable capacity positions');

    const capacity = await request(port, '/api/wms/capacity');
    const free = capacity.payload.units.find((u) => !u.occupancy && !u.blocked);
    assert.ok(free, 'an available capacity position is required');

    const inventory = await request(port, '/api/inventory/items');
    const item = inventory.payload.items[0];
    assert.ok(item?.id, 'seeded inventory item required');

    const customerRef = `WMS-TEST-${Date.now()}`;
    const contract = await request(port, '/api/wms/contracts', {
      method: 'POST',
      body: { customerRef, receivingRatePerUnit: 4.5, storageRatePerUnitDay: 8.25, outboundRatePerUnit: 3.25, minimumBillableDays: 1 }
    });
    assert.equal(contract.response.status, 200);

    const checkIn = await request(port, '/api/wms/handling-units/check-in', {
      method: 'POST',
      body: { facilityId: free.facility_id, capacityUnitId: free.id, lpn: `LPN-${Date.now()}`, customerRef, itemId: item.id, quantity: 10, uom: 'EA', qualityRequired: true }
    });
    assert.equal(checkIn.response.status, 200);
    assert.equal(checkIn.payload.handlingUnit.inventory_status, 'RECEIVED_NOT_INSPECTED');
    assert.equal(checkIn.payload.billable.pricing_status, 'PRICED');

    const huId = checkIn.payload.handlingUnit.id;
    const quality = await request(port, `/api/wms/handling-units/${huId}/quality`, {
      method: 'POST', body: { acceptedQty: 10, rejectedQty: 0, reason: 'Inspection passed' }
    });
    assert.equal(quality.response.status, 200);
    assert.equal(quality.payload.handlingUnit.inventory_status, 'AVAILABLE');

    const release = await request(port, `/api/wms/handling-units/${huId}/release`, { method: 'POST', body: { reason: 'SHIPPED' } });
    assert.equal(release.response.status, 200);
    assert.equal(release.payload.billing.length, 2);
    assert.equal(release.payload.billing.every((b) => b.pricing_status === 'PRICED'), true);

    const billing = await request(port, `/api/wms/billing/events?customerRef=${encodeURIComponent(customerRef)}`);
    assert.equal(billing.response.status, 200);
    assert.ok(billing.payload.events.some((e) => e.event_type === 'RECEIVING'));
    assert.ok(billing.payload.events.some((e) => e.event_type === 'STORAGE'));
    assert.ok(billing.payload.events.some((e) => e.event_type === 'OUTBOUND_HANDLING'));

    const after = await request(port, '/api/wms/capacity');
    const same = after.payload.units.find((u) => u.id === free.id);
    assert.equal(Boolean(same.occupancy), false, 'space should be sellable again after release');
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
