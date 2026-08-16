#!/usr/bin/env node

process.env.DATABASE_PROVIDER ||= 'postgres';
process.env.OPSTRAX_VALIDATE_SEED = '1';
process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let db;
try {
  const dbModule = await import('../src/db.js');
  db = dbModule.db;
  const { selectAll, selectOne } = dbModule;
  const {
    listEvidence,
    listExportCandidates,
    listExports,
    listInternalRequests,
    listInventoryBins,
    listInventoryItems,
    listIssueReadyRequests,
    listReceivingPurchaseOrders,
    listRfqRequests,
    listWarehouseBins,
    listWarehouseTasks,
    resolveContext,
    runReport
  } = await import('../src/services.js');
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

  const tenantCount = Number(selectOne('SELECT COUNT(*) AS count FROM tenants')?.count || 0);
  if (!tenantCount) {
    process.env.OPSTRAX_SEED_KEEP_DB_OPEN = '1';
    try {
      await import('./seed-production-runtime.mjs');
    } finally {
      delete process.env.OPSTRAX_SEED_KEEP_DB_OPEN;
    }
  }
  ensureWmsSchema();

  const version = Number(selectOne('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations')?.version || 0);
  assert(version === 29, `Expected schema version 29, got ${version}`);

  const context = resolveContext(new Headers({
    'x-tenant-id': 'tenant_intelliflow_systems',
    'x-user-id': 'tenant_intelliflow_systems_user_admin'
  }));
  context.requestId = 'postgres-wms-certification';
  const facilityId = context.user.facility_id;

  // Exercise the aggregate-backed surfaces loaded by the production shell. SQLite
  // permits ungrouped joined columns here; PostgreSQL intentionally does not.
  const bootstrapSurfaces = [
    listInventoryBins(context),
    listInternalRequests(context),
    listIssueReadyRequests(context),
    listWarehouseBins(context),
    listWarehouseTasks(context),
    listRfqRequests(context),
    listReceivingPurchaseOrders(context),
    listEvidence(context),
    listExports(context),
    listExportCandidates(context)
  ];
  assert(bootstrapSurfaces.every((surface) => surface != null), 'Production bootstrap surfaces must load on PostgreSQL');
  for (const reportKey of ['inventory_stock_position', 'low_stock_reorder_risk', 'receiving_activity']) {
    const report = runReport(context, { reportKey, format: 'CSV' });
    assert(report?.run?.status === 'COMPLETED', `${reportKey} report must complete on PostgreSQL`);
  }

  const tower = getWmsControlTower(context, { facilityId });
  assert(Number(tower.capacity.total || 0) > 0, 'WMS capacity must exist on PostgreSQL');
  const capacity = listWmsCapacity(context, { facilityId });
  const free = capacity.units.find((unit) => !unit.occupancy && !unit.blocked && unit.bin_id);
  assert(free, 'A free bin-backed capacity unit is required');
  const item = listInventoryItems(context)[0];
  assert(item?.id, 'A seeded inventory item is required');

  const readBalance = () => selectOne(
    'SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?',
    [context.tenant.id, item.id, free.bin_id]
  ) || { on_hand: 0, reserved: 0, available: 0 };
  const before = readBalance();
  const stamp = Date.now();
  const customerRef = `PG-WMS-${stamp}`;
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
    lpn: `PG-LPN-${stamp}`,
    customerRef,
    itemId: item.id,
    quantity: 10,
    uom: 'EA',
    qualityRequired: true
  });
  assert(checkIn.handlingUnit.inventory_status === 'RECEIVED_NOT_INSPECTED', 'Receipt must be quality-gated');
  let balance = readBalance();
  assert(Number(balance.on_hand) === Number(before.on_hand), 'QC-gated stock must not increase canonical on-hand before acceptance');

  const quality = recordWmsQualitySafe(context, checkIn.handlingUnit.id, {
    acceptedQty: 10,
    rejectedQty: 0,
    reason: 'PostgreSQL certification inspection passed'
  });
  assert(quality.handlingUnit.inventory_status === 'AVAILABLE', 'Accepted stock must become AVAILABLE');
  balance = readBalance();
  assert(Number(balance.on_hand) === Number(before.on_hand) + 10, 'QC acceptance must increase canonical on-hand');
  assert(Number(balance.available) === Number(before.available) + 10, 'QC acceptance must increase canonical available');

  const allocation = allocateWmsInventorySafe(context, {
    facilityId,
    itemId: item.id,
    demandType: 'SALES_ORDER',
    demandId: `PG-SO-${stamp}`,
    quantity: 10
  });
  assert(Number(allocation.allocated) === 10, 'Full quantity must allocate');
  balance = readBalance();
  assert(Number(balance.reserved) === Number(before.reserved) + 10, 'Allocation must increase canonical reserved');
  assert(Number(balance.available) === Number(before.available), 'Allocation must remove accepted quantity from canonical available');

  const release = releaseWmsHandlingUnitSafe(context, checkIn.handlingUnit.id, { reason: 'SHIPPED' });
  assert(release.inventoryPosting?.movement?.movement_type === 'WMS_SHIP', 'Shipment must post a canonical stock movement');
  balance = readBalance();
  assert(Number(balance.on_hand) === Number(before.on_hand), 'Shipment must restore canonical on-hand to baseline');
  assert(Number(balance.reserved) === Number(before.reserved), 'Shipment must clear canonical reservation');
  assert(Number(balance.available) === Number(before.available), 'Shipment must preserve baseline canonical available');

  const movements = selectAll(
    "SELECT movement_type FROM stock_movements WHERE tenant_id = ? AND reference_type = 'wms_handling_unit' AND reference_id = ? ORDER BY created_at",
    [context.tenant.id, checkIn.handlingUnit.id]
  );
  assert(movements.map((row) => row.movement_type).join(',') === 'WMS_RECEIVE,WMS_SHIP', 'Expected WMS_RECEIVE and WMS_SHIP movements');
  const billing = listWmsBillableEvents(context, { customerRef }).events;
  assert(billing.some((row) => row.event_type === 'RECEIVING'), 'Receiving billing evidence missing');
  assert(billing.some((row) => row.event_type === 'STORAGE'), 'Storage billing evidence missing');
  assert(billing.some((row) => row.event_type === 'OUTBOUND_HANDLING'), 'Outbound billing evidence missing');
  const reopened = listWmsCapacity(context, { facilityId }).units.find((row) => row.id === free.id);
  assert(!reopened.occupancy, 'Released pallet position must become physically free again');

  process.stdout.write(`[verify-wms-postgres] OK version=${version} hu=${checkIn.handlingUnit.id} canonical-ledger=reconciled billing=${billing.length}\n`);
  try { db.close?.(); } catch {}
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-wms-postgres] ERROR ${error.stack || error.message}\n`);
  try { db?.close?.(); } catch {}
  process.exit(1);
}
