#!/usr/bin/env node
/**
 * seed-production-runtime.mjs — deterministic seed helper for PostgreSQL
 * production-validation runs. This is opt-in and never used by normal startup.
 */

if (String(process.env.OPSTRAX_VALIDATE_SEED || '').trim() !== '1') {
  process.stderr.write('[seed-production-runtime] ERROR OPSTRAX_VALIDATE_SEED=1 is required.\n');
  process.exit(1);
}

const { seedData } = await import('../src/seed.js');
const { db, selectOne, execute, nowIso } = await import('../src/db.js');

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

function tableCount(table) {
  return Number(selectOne(`SELECT COUNT(*) AS count FROM ${table}`)?.count || 0);
}

function seedIfEmpty() {
  if (tableCount('tenants') > 0) return false;
  execute('BEGIN;');
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
    insertRows('supplier_compliance_documents', seedData.supplierComplianceDocuments);
    insertRows('supplier_contracts', seedData.supplierContracts);
    insertRows('procurement_waivers', seedData.procurementWaivers);
    insertRows('department_budgets', seedData.departmentBudgets);
    insertRows('budget_ledger_entries', seedData.budgetLedgerEntries);
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
    insertRows('rfq_requests', seedData.rfqRequests.map(({ awarded_quote_id, ...row }) => ({
      ...row,
      awarded_quote_id: null
    })));
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
    insertRows('backup_records', seedData.backupRecords);
    insertRows('restore_test_records', seedData.restoreTestRecords);
    insertRows('sso_configurations', seedData.ssoConfigurations);
    insertRows('tenant_features', seedData.tenantFeatures);
    insertRows('permissions', seedData.permissions);
    insertRows('role_permissions', seedData.rolePermissions);
    insertRows('user_roles', seedData.userRoles);
    insertRows('user_scopes', seedData.userScopes);
    insertRows('sync_conflicts', seedData.syncConflicts);
    insertRows('export_transfers', seedData.exportTransfers);
    insertRows('compliance_controls', seedData.complianceControls);
    insertRows('access_reviews', seedData.accessReviews);
    insertRows('access_review_entries', seedData.accessReviewEntries);
    insertRows('risk_register', seedData.riskRegister);
    insertRows('incident_register', seedData.incidentRegister);
    insertRows('ai_governance_logs', seedData.aiGovernanceLogs);
    execute('COMMIT;');
    return true;
  } catch (error) {
    execute('ROLLBACK;');
    throw error;
  }
}

try {
  seedIfEmpty();
  process.stdout.write(`[seed-production-runtime] Completed at ${nowIso()}\n`);
} finally {
  if (typeof db.close === 'function') {
    await db.close();
  }
}
