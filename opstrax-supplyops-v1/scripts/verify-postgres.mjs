#!/usr/bin/env node
/** verify-postgres.mjs — validates production Postgres plus WMS migration contract. */
process.env.NODE_ENV ||= 'production';
process.env.DATABASE_PROVIDER ||= process.env.OPSTRAX_DB_PROVIDER || 'postgres';
process.env.EVIDENCE_STORAGE_PROVIDER ||= process.env.OPSTRAX_EVIDENCE_STORAGE || 's3';

const { db, getDatabaseRuntimeInfo, selectOne } = await import('../src/db.js');
const { ensureWmsSchema } = await import('../src/wms-schema.js');
const {
  getTenantById, getUserById, getProcurementSummary, listSupplierContracts, listDepartmentBudgets,
  listVendorInvoices, listComplianceControls, listAuditLogs, getVendorDetail, listVendors
} = await import('../src/services.js');

async function seedIfNeeded() {
  const tenantCount = Number(selectOne('SELECT COUNT(*) AS count FROM tenants')?.count || 0);
  if (tenantCount > 0) return false;
  process.env.OPSTRAX_VALIDATE_SEED = '1';
  process.env.OPSTRAX_SEED_KEEP_DB_OPEN = '1';
  try {
    await import('./seed-production-runtime.mjs');
  } finally {
    delete process.env.OPSTRAX_SEED_KEEP_DB_OPEN;
  }
  return true;
}
function buildContext(tenantId, userId) { return { tenant: getTenantById(tenantId), user: getUserById(userId), device: null, requestId: 'verify-postgres-runtime' }; }
function assert(condition, message) { if (!condition) throw new Error(message); }

try {
  const runtime = getDatabaseRuntimeInfo();
  assert(runtime.provider === 'postgres', `Expected postgres provider, got ${runtime.provider}`);
  ensureWmsSchema();
  const seeded = await seedIfNeeded();
  ensureWmsSchema();
  const version = Number(selectOne('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations')?.version || 0);
  assert(version === 29, `Expected migration version 29, got ${version}`);
  assert(Number(selectOne('SELECT COUNT(*) AS count FROM wms_capacity_units')?.count || 0) > 0, 'WMS capacity positions should be created from seeded bins');

  const adminCtx = buildContext('tenant_intelliflow_systems', 'tenant_intelliflow_systems_user_admin');
  const restrictedCtx = buildContext('tenant_evostel', 'tenant_evostel_user_admin');
  const procurement = getProcurementSummary(adminCtx);
  assert((procurement?.summary?.vendors || 0) > 0, 'Procurement summary should have vendors');
  assert((listSupplierContracts(adminCtx) || []).length > 0, 'Supplier contracts should be available');
  assert((listDepartmentBudgets(adminCtx) || []).length > 0, 'Department budgets should be available');
  assert((listVendorInvoices(adminCtx) || []).length > 0, 'Vendor invoices should be available');
  assert((listComplianceControls(adminCtx)?.controls || []).length > 0, 'Compliance controls should be available');
  assert((listAuditLogs(adminCtx, { limit: 5 }) || []).length > 0, 'Audit log should not be empty');
  assert((listVendors(adminCtx) || []).length > 0, 'Vendor list should be available');
  const firstVendor = selectOne('SELECT id FROM vendors WHERE tenant_id = ? ORDER BY created_at LIMIT 1', ['tenant_intelliflow_systems']);
  if (firstVendor?.id) {
    let denied = false; try { getVendorDetail(restrictedCtx, firstVendor.id); } catch { denied = true; }
    assert(denied, 'Cross-tenant vendor access should be denied');
  }
  process.stdout.write(`[verify-postgres] OK provider=postgres version=29 seed=${seeded ? 'applied' : 'present'} wms=ready procurement=${procurement.summary.vendors}\n`);
  try { db.close?.(); } catch {}
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-postgres] ERROR ${error.message}\n`);
  try { db.close?.(); } catch {}
  process.exit(1);
}
