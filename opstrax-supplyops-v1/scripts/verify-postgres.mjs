#!/usr/bin/env node
/**
 * verify-postgres.mjs — validates the PostgreSQL runtime path, migrations,
 * deterministic seed, and a few core service flows against the production
 * database provider.
 */

process.env.NODE_ENV ||= 'production';
process.env.OPSTRAX_DB_PROVIDER ||= 'postgres';
process.env.OPSTRAX_EVIDENCE_STORAGE ||= 's3';

const { getDatabaseRuntimeInfo, selectOne } = await import('../src/db.js');
const {
  getTenantById,
  getUserById,
  getProcurementSummary,
  listSupplierContracts,
  listDepartmentBudgets,
  listVendorInvoices,
  listComplianceControls,
  listAuditLogs,
  getVendorDetail,
  listVendors
} = await import('../src/services.js');

async function seedIfNeeded() {
  const tenantCount = Number(selectOne('SELECT COUNT(*) AS count FROM tenants')?.count || 0);
  if (tenantCount > 0) return false;
  process.env.OPSTRAX_VALIDATE_SEED = '1';
  await import('./seed-production-runtime.mjs');
  return true;
}

function buildContext(tenantId, userId) {
  return {
    tenant: getTenantById(tenantId),
    user: getUserById(userId),
    device: null,
    requestId: 'verify-postgres-runtime'
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const runtime = getDatabaseRuntimeInfo();
  assert(runtime.provider === 'postgres', `Expected postgres provider, got ${runtime.provider}`);
  const versionRow = selectOne('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations');
  const version = Number(versionRow?.version || runtime.currentVersion || 0);
  assert(version === 20, `Expected migration version 20, got ${version}`);

  const seeded = await seedIfNeeded();
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

  const firstVendor = selectOne("SELECT id FROM vendors WHERE tenant_id = ? ORDER BY created_at LIMIT 1", ['tenant_intelliflow_systems']);
  if (firstVendor?.id) {
    let denied = false;
    try {
      getVendorDetail(restrictedCtx, firstVendor.id);
    } catch (error) {
      denied = true;
    }
    assert(denied, 'Cross-tenant vendor access should be denied');
  }

  process.stdout.write(`[verify-postgres] OK provider=postgres version=20 seed=${seeded ? 'applied' : 'present'} procurement=${procurement.summary.vendors}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-postgres] ERROR ${error.message}\n`);
  process.exit(1);
}
