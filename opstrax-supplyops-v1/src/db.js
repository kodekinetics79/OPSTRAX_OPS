import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath as toFileURLPath } from 'node:url';
import { createSynchronousWorkerBridge } from './sync-rpc.js';
import { getDatabaseRuntimeSelection } from './runtime-config.js';
import { seedData } from './seed.js';
import { getInvOptSeedRows } from './inventory-optimization.js';
import { getAssetCustodySeedRows } from './asset-custody.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(__dirname);
const dataDir = join(rootDir, 'data');
const runtimeSelection = getDatabaseRuntimeSelection();
const isProduction = runtimeSelection.nodeEnv === 'production';
const requestedDbProvider = runtimeSelection.requestedProvider;
const dbProviderMode = runtimeSelection.provider;
const dbPath = process.env.OPSTRAX_DB_PATH || join(dataDir, 'opstrax.production.sqlite');
const databaseUrl = runtimeSelection.databaseUrl;
const migrationDir = join(rootDir, 'db', 'migrations');
const migrations = [
  { version: 1, file: '001_init.sql' },
  { version: 2, file: '002_gap_closure.sql' },
  { version: 3, file: '003_auth.sql' },
  { version: 4, file: '004_feature_flags.sql' },
  { version: 5, file: '005_tenant_tier.sql' },
  { version: 6, file: '006_foundation_contract.sql' },
  { version: 7, file: '007_inventory_core.sql' },
  { version: 8, file: '008_internal_request_core.sql' },
  { version: 9, file: '009_internal_request_contract.sql' },
  { version: 10, file: '010_warehouse_execution_core.sql' },
  { version: 11, file: '011_procurement_core.sql' },
  { version: 12, file: '012_evidence_receiving_core.sql' },
  { version: 13, file: '013_finance_integration_hardening.sql' },
  { version: 14, file: '014_barcode_deviceops_offline_sync.sql' },
  { version: 15, file: '015_ai_governance.sql' },
  { version: 16, file: '016_procure_to_pay_intelligence.sql' },
  { version: 17, file: '017_procure_to_pay_invoice_hardening.sql' },
  { version: 18, file: '018_procurement_governance_hardening.sql' },
  { version: 19, file: '019_compliance_trust_center.sql' },
  { version: 20, file: '020_production_foundation.sql' },
  { version: 21, file: '021_platform_admin_control_plane.sql' },
  { version: 22, file: '022_platform_admin_control_plane_refresh.sql' },
  { version: 23, file: '023_platform_oidc_cutover.sql' },
  { version: 24, file: '024_reporting_export_center.sql' },
  { version: 25, file: '025_inventory_optimization.sql' },
  { version: 26, file: '026_asset_custody_lifecycle.sql' },
  { version: 27, file: '027_ocr_review.sql' },
  { version: 28, file: '028_ocr_evidence_id.sql' }
];

mkdirSync(dataDir, { recursive: true });
function failFast(message) {
  throw new Error(message);
}

function resolveProviderMode() {
  if (isProduction && requestedDbProvider && requestedDbProvider !== 'postgres') {
    if (requestedDbProvider === 'sqlite') {
      failFast('SQLite is not permitted in production. Set DATABASE_PROVIDER=postgres and DATABASE_URL.');
    }
    failFast(`Unsupported DATABASE_PROVIDER="${requestedDbProvider}" in production. Set DATABASE_PROVIDER=postgres and DATABASE_URL.`);
  }
  if (dbProviderMode === 'sqlite') return 'sqlite';
  if (dbProviderMode === 'postgres') return 'postgres';
  if (isProduction) return 'postgres';
  return 'sqlite';
}

function makeSqliteDb() {
  const sqlite = new DatabaseSync(dbPath);
  sqlite.exec('PRAGMA foreign_keys = ON;');
  return sqlite;
}

function makePostgresDb() {
  if (!databaseUrl) {
    failFast('DATABASE_URL is required when DATABASE_PROVIDER=postgres or NODE_ENV=production.');
  }
  const bridge = createSynchronousWorkerBridge(new URL('./postgres-db-worker.js', import.meta.url), {
    connectionString: databaseUrl,
    ssl: String(process.env.OPSTRAX_PG_SSL || '').toLowerCase() === 'true' || String(process.env.OPSTRAX_PG_SSL || '').toLowerCase() === 'require'
  });
  bridge.request('init', {});
  return {
    mode: 'postgres',
    exec(sql) {
      return bridge.request('exec', { sql });
    },
    prepare(sql) {
      return {
        all: (...params) => bridge.request('all', { sql, params }).rows,
        get: (...params) => bridge.request('one', { sql, params }).row,
        run: (...params) => bridge.request('run', { sql, params }).result
      };
    },
    transaction(handler) {
      bridge.request('begin', {});
      try {
        const result = handler();
        bridge.request('commit', {});
        return result;
      } catch (error) {
        bridge.request('rollback', {});
        throw error;
      }
    },
    info() {
      return bridge.request('info', {}).info;
    },
    close() {
      return bridge.close();
    }
  };
}

const runtimeDbProvider = resolveProviderMode();

export const db = runtimeDbProvider === 'postgres' ? makePostgresDb() : makeSqliteDb();

const isPostgres = runtimeDbProvider === 'postgres';

if (isPostgres && !databaseUrl) {
  failFast('Production PostgreSQL runtime requires DATABASE_URL or OPSTRAX_DATABASE_URL.');
}

function tableCount(table) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
}

function insertRows(table, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const quotedColumns = columns.map((column) => `"${column.replaceAll('"', '""')}"`);
  const statement = `INSERT INTO "${table.replaceAll('"', '""')}" (${quotedColumns.join(',')}) VALUES (${quotedColumns.map(() => '?').join(',')}) ON CONFLICT DO NOTHING`;
  const stmt = db.prepare(statement);
  for (const record of rows) {
    stmt.run(...columns.map((column) => record[column]));
  }
}

function applyMigration() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const pragmaVersion = db.prepare('PRAGMA user_version').get().user_version;
  const recordedVersion = db.prepare('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations').get().version;
  let currentVersion = Math.max(pragmaVersion, recordedVersion);
  for (const migration of migrations) {
    if (currentVersion >= migration.version) continue;
    const schema = readFileSync(join(migrationDir, migration.file), 'utf8');
    db.exec(schema);
    db.prepare('INSERT OR IGNORE INTO schema_migrations(version) VALUES (?)').run(migration.version);
    currentVersion = migration.version;
  }
  db.exec(`PRAGMA user_version = ${currentVersion};`);
}

function seedIfNeeded() {
  if (tableCount('tenants') > 0) return;
  db.exec('BEGIN IMMEDIATE;');
  try {
    insertRows('tenants', seedData.tenants);
    insertRows('roles', seedData.roles);
    insertRows('departments', seedData.departments);
    insertRows('facilities', seedData.facilities);
    insertRows('users', seedData.users);
    insertRows('devices', seedData.devices);
    insertRows('item_categories', seedData.itemCategories);
    insertRows('items', seedData.items);
    insertRows('bins', seedData.bins);
    insertRows('stock_balances', seedData.stockBalances);
    insertRows('vendors', seedData.vendors);
    insertRows('vendor_scores', seedData.vendorScores);
    insertRows('cost_centers', seedData.costCenters);
    insertRows('internal_requests', seedData.internalRequests);
    insertRows('request_lines', seedData.requestLines);
    insertRows('warehouse_tasks', seedData.warehouseTasks);
    insertRows('warehouse_task_lines', seedData.warehouseTaskLines);
    insertRows('purchase_requests', seedData.purchaseRequests);
    insertRows('purchase_request_lines', seedData.purchaseRequestLines);
    insertRows('purchase_orders', seedData.purchaseOrders);
    insertRows('purchase_order_lines', seedData.purchaseOrderLines);
    insertRows('receive_sessions', seedData.receiveSessions);
    insertRows('receive_session_lines', seedData.receiveSessionLines);
    insertRows('vendor_invoices', seedData.vendorInvoices);
    insertRows('vendor_invoice_lines', seedData.vendorInvoiceLines);
    insertRows('invoice_extraction_runs', seedData.invoiceExtractionRuns);
    insertRows('invoice_match_results', seedData.invoiceMatchResults);
    insertRows('invoice_match_exceptions', seedData.invoiceMatchExceptions);
    insertRows('invoice_approval_events', seedData.invoiceApprovalEvents);
    insertRows(
      'rfq_requests',
      seedData.rfqRequests.map(({ awarded_quote_id, ...row }) => ({
        ...row,
        awarded_quote_id: null
      }))
    );
    insertRows('rfq_lines', seedData.rfqLines);
    insertRows('vendor_quotes', seedData.vendorQuotes);
    insertRows('vendor_quote_lines', seedData.vendorQuoteLines);
    insertRows('vendor_scorecards', seedData.vendorScorecards);
    for (const row of seedData.rfqRequests) {
      if (!row.awarded_quote_id) continue;
      execute(
        'UPDATE rfq_requests SET awarded_quote_id = ?, awarded_at = ?, updated_at = ? WHERE tenant_id = ? AND rfq_no = ?',
        [row.awarded_quote_id, row.awarded_at ?? null, row.updated_at ?? null, row.tenant_id, row.rfq_no]
      );
    }
    insertRows('sync_batches', seedData.syncBatches);
    insertRows('sync_tasks', seedData.syncTasks);
    insertRows('label_print_jobs', seedData.labelPrintJobs);
    insertRows('export_batches', seedData.exportBatches);
    insertRows('export_validation_errors', seedData.exportValidationErrors);
    insertRows('integration_connections', seedData.integrationConnections);
    insertRows('integration_jobs', seedData.integrationJobs);
    insertRows('documents', seedData.documents);
    insertRows('evidence_links', seedData.evidenceLinks);
    insertRows('audit_logs', seedData.auditLogs);
    insertRows('report_definitions', seedData.reportDefinitions);
    insertRows('backup_records', seedData.backupRecords);
    insertRows('restore_test_records', seedData.restoreTestRecords);
    insertRows('sso_configurations', seedData.ssoConfigurations);
    insertRows('platform_users', seedData.platformUsers);
    insertRows('report_runs', seedData.reportRuns);
    insertRows('report_exports', seedData.reportExports);
    insertRows('platform_user_roles', seedData.platformUserRoles);
    insertRows('tenant_plans', seedData.tenantPlans);
    insertRows('tenant_subscriptions', seedData.tenantSubscriptions);
    insertRows('tenant_feature_entitlements', seedData.tenantFeatureEntitlements);
    insertRows('tenant_usage_snapshots', seedData.tenantUsageSnapshots);
    insertRows('tenant_health_snapshots', seedData.tenantHealthSnapshots);
    insertRows('platform_audit_events', seedData.platformAuditEvents);
    insertRows('platform_support_sessions', seedData.platformSupportSessions);
    insertRows('platform_billing_events', seedData.platformBillingEvents);
    insertRows('platform_security_events', seedData.platformSecurityEvents);
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

function seedGapClosures() {
  if (tableCount('sync_conflicts') === 0) {
    insertRows('sync_conflicts', seedData.syncConflicts);
  }
  if (tableCount('export_transfers') === 0) {
    insertRows('export_transfers', seedData.exportTransfers);
  }
  if (tableCount('integration_connections') === 0) {
    insertRows('integration_connections', seedData.integrationConnections);
  }
  if (tableCount('integration_jobs') === 0) {
    insertRows('integration_jobs', seedData.integrationJobs);
  }
  if (tableCount('evidence_links') === 0) {
    insertRows('evidence_links', seedData.evidenceLinks);
  }
}

function seedFeatureFlags() {
  if (tableCount('tenant_features') === 0) {
    insertRows('tenant_features', seedData.tenantFeatures);
  }
}

function seedMissingFeatureFlags() {
  for (const row of seedData.tenantFeatures) {
    const existing = db.prepare('SELECT 1 FROM tenant_features WHERE tenant_id = ? AND feature_key = ?').get(row.tenant_id, row.feature_key);
    if (!existing) {
      db.prepare('INSERT INTO tenant_features (tenant_id, feature_key, enabled) VALUES (?, ?, ?)').run(row.tenant_id, row.feature_key, row.enabled);
    }
  }
}

function seedFoundationAccess() {
  insertRows('permissions', seedData.permissions);
  insertRows('role_permissions', seedData.rolePermissions);
  if (tableCount('user_roles') === 0) {
    insertRows('user_roles', seedData.userRoles);
  }
  if (tableCount('user_scopes') === 0) {
    insertRows('user_scopes', seedData.userScopes);
  }
}

function seedWarehouseExecution() {
  if (tableCount('warehouse_tasks') === 0) {
    insertRows('warehouse_tasks', seedData.warehouseTasks);
  }
  if (tableCount('warehouse_task_lines') === 0) {
    insertRows('warehouse_task_lines', seedData.warehouseTaskLines);
  }
}

function seedProcurement() {
  if (tableCount('vendors') === 0) {
    insertRows('vendors', seedData.vendors);
  }
  if (tableCount('vendor_scores') === 0) {
    insertRows('vendor_scores', seedData.vendorScores);
  }
  if (tableCount('purchase_orders') === 0) {
    insertRows('purchase_orders', seedData.purchaseOrders);
  }
  if (tableCount('purchase_order_lines') === 0) {
    insertRows('purchase_order_lines', seedData.purchaseOrderLines);
  }
}

function seedProcurementGovernance() {
  if (tableCount('cost_centers') === 0) {
    insertRows('cost_centers', seedData.costCenters);
  }
  if (tableCount('supplier_compliance_documents') === 0) {
    insertRows('supplier_compliance_documents', seedData.supplierComplianceDocuments);
  }
  if (tableCount('supplier_contracts') === 0) {
    insertRows('supplier_contracts', seedData.supplierContracts);
  }
  if (tableCount('procurement_waivers') === 0) {
    insertRows('procurement_waivers', seedData.procurementWaivers);
  }
  if (tableCount('department_budgets') === 0) {
    insertRows('department_budgets', seedData.departmentBudgets);
  }
  if (tableCount('budget_ledger_entries') === 0) {
    insertRows('budget_ledger_entries', seedData.budgetLedgerEntries);
  }
}

function seedProcureToPayIntelligence() {
  if (tableCount('vendor_invoices') === 0) {
    insertRows('vendor_invoices', seedData.vendorInvoices);
  }
  if (tableCount('vendor_invoice_lines') === 0) {
    insertRows('vendor_invoice_lines', seedData.vendorInvoiceLines);
  }
  if (tableCount('invoice_extraction_runs') === 0) {
    insertRows('invoice_extraction_runs', seedData.invoiceExtractionRuns);
  }
  if (tableCount('invoice_match_results') === 0) {
    insertRows('invoice_match_results', seedData.invoiceMatchResults);
  }
  if (tableCount('invoice_match_exceptions') === 0) {
    insertRows('invoice_match_exceptions', seedData.invoiceMatchExceptions);
  }
  if (tableCount('invoice_approval_events') === 0) {
    insertRows('invoice_approval_events', seedData.invoiceApprovalEvents);
  }
  if (tableCount('rfq_requests') === 0) {
    insertRows('rfq_requests', seedData.rfqRequests);
  }
  if (tableCount('rfq_lines') === 0) {
    insertRows('rfq_lines', seedData.rfqLines);
  }
  if (tableCount('vendor_quotes') === 0) {
    insertRows('vendor_quotes', seedData.vendorQuotes);
  }
  if (tableCount('vendor_quote_lines') === 0) {
    insertRows('vendor_quote_lines', seedData.vendorQuoteLines);
  }
  if (tableCount('vendor_scorecards') === 0) {
    insertRows('vendor_scorecards', seedData.vendorScorecards);
  }
}

function seedComplianceTrustCenter() {
  if (tableCount('compliance_controls') === 0) {
    insertRows('compliance_controls', seedData.complianceControls);
  }
  if (tableCount('access_reviews') === 0) {
    insertRows('access_reviews', seedData.accessReviews);
  }
  if (tableCount('access_review_entries') === 0) {
    insertRows('access_review_entries', seedData.accessReviewEntries);
  }
  if (tableCount('risk_register') === 0) {
    insertRows('risk_register', seedData.riskRegister);
  }
  if (tableCount('incident_register') === 0) {
    insertRows('incident_register', seedData.incidentRegister);
  }
  if (tableCount('ai_governance_logs') === 0) {
    insertRows('ai_governance_logs', seedData.aiGovernanceLogs);
  }
  if (tableCount('platform_users') === 0) {
    insertRows('platform_users', seedData.platformUsers);
  }
  if (tableCount('platform_user_roles') === 0) {
    insertRows('platform_user_roles', seedData.platformUserRoles);
  }
  if (tableCount('tenant_plans') === 0) {
    insertRows('tenant_plans', seedData.tenantPlans);
  }
  if (tableCount('tenant_subscriptions') === 0) {
    insertRows('tenant_subscriptions', seedData.tenantSubscriptions);
  }
  if (tableCount('tenant_feature_entitlements') === 0) {
    insertRows('tenant_feature_entitlements', seedData.tenantFeatureEntitlements);
  }
  if (tableCount('tenant_usage_snapshots') === 0) {
    insertRows('tenant_usage_snapshots', seedData.tenantUsageSnapshots);
  }
  if (tableCount('tenant_health_snapshots') === 0) {
    insertRows('tenant_health_snapshots', seedData.tenantHealthSnapshots);
  }
  if (tableCount('platform_audit_events') === 0) {
    insertRows('platform_audit_events', seedData.platformAuditEvents);
  }
  if (tableCount('platform_support_sessions') === 0) {
    insertRows('platform_support_sessions', seedData.platformSupportSessions);
  }
  if (tableCount('platform_billing_events') === 0) {
    insertRows('platform_billing_events', seedData.platformBillingEvents);
  }
  if (tableCount('platform_security_events') === 0) {
    insertRows('platform_security_events', seedData.platformSecurityEvents);
  }
}

function seedInventoryOptimization() {
  if (tableCount('cycle_count_plans') > 0) return;
  const items = db.prepare("SELECT id, controlled, restricted FROM items WHERE tenant_id='tenant_intelliflow_systems' AND status='ACTIVE' LIMIT 5").all();
  const facilities = db.prepare('SELECT id FROM facilities LIMIT 2').all();
  const bins = db.prepare('SELECT id FROM bins LIMIT 2').all();
  const intelliflowUsers = db.prepare(
    "SELECT id, (SELECT rp.role_key FROM user_roles rp WHERE rp.user_id = u.id LIMIT 1) AS role FROM users u WHERE u.tenant_id='tenant_intelliflow_systems' LIMIT 6"
  ).all();
  if (!items.length) return;
  const seed = getInvOptSeedRows('tenant_intelliflow_systems', items, facilities, bins, intelliflowUsers);
  insertRows('cycle_count_plans', seed.cycleCountPlans);
  insertRows('cycle_count_plan_lines', seed.cycleCountPlanLines);
  insertRows('cycle_count_sessions', seed.cycleCountSessions);
  insertRows('cycle_count_session_lines', seed.cycleCountSessionLines);
  insertRows('inventory_variances', seed.inventoryVariances);
  insertRows('inventory_optimization_runs', seed.optimizationRuns);
  insertRows('replenishment_recommendations', seed.replenishmentRecs);
  insertRows('inventory_classifications', seed.inventoryClassifications);
  insertRows('inventory_accuracy_snapshots', seed.accuracySnapshots);
}

function seedAssetCustody() {
  if (tableCount('asset_records') > 0) return;
  const users = db.prepare("SELECT id, department_id, facility_id FROM users WHERE tenant_id='tenant_intelliflow_systems' LIMIT 6").all();
  const facilities = db.prepare("SELECT id FROM facilities LIMIT 2").all();
  const departments = db.prepare("SELECT id FROM departments LIMIT 3").all();
  if (!users.length) return;
  const seed = getAssetCustodySeedRows('tenant_intelliflow_systems', users, facilities, departments);
  insertRows('asset_records', seed.assetRecords);
  insertRows('asset_custody_events', seed.custodyEvents);
  insertRows('asset_assignments', seed.assignments);
  insertRows('asset_transfer_requests', seed.transferRequests);
  insertRows('asset_return_requests', seed.returnRequests);
  insertRows('asset_condition_reports', seed.conditionReports);
  insertRows('asset_maintenance_cases', seed.maintenanceCases);
  insertRows('asset_disposal_requests', seed.disposalRequests);
  insertRows('asset_evidence_links', seed.evidenceLinks);
  insertRows('asset_lifecycle_snapshots', seed.lifeCycleSnapshots);
}

applyMigration();
if (!isPostgres) {
  seedIfNeeded();
  seedGapClosures();
  seedFeatureFlags();
  seedMissingFeatureFlags();
  seedFoundationAccess();
  seedWarehouseExecution();
  seedProcurement();
  seedProcurementGovernance();
  seedProcureToPayIntelligence();
  seedComplianceTrustCenter();
  seedInventoryOptimization();
  seedAssetCustody();
}

export function selectAll(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function selectOne(sql, params = []) {
  return db.prepare(sql).get(...params) ?? null;
}

export function execute(sql, params = []) {
  return db.prepare(sql).run(...params);
}

export function transaction(handler) {
  db.exec(isPostgres ? 'BEGIN;' : 'BEGIN IMMEDIATE;');
  try {
    const result = handler();
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

export function insert(table, row) {
  const columns = Object.keys(row);
  const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
  return execute(sql, columns.map((column) => row[column]));
}

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-6)}`;
}

export function getDatabaseRuntimeInfo() {
  if (isPostgres && typeof db.info === 'function') {
    return db.info();
  }
  const row = db.prepare('PRAGMA user_version').get();
  return {
    provider: 'sqlite',
    currentVersion: row?.user_version ?? 0,
    inTransaction: false
  };
}
