import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runStartupChecks } from './src/startup.js';
import {
  authEnabled,
  completeLogin,
  completePlatformLogin,
  createDemoSession,
  getAuthBootstrap,
  getLoginUrl,
  getPlatformLoginUrl,
  isDemoLoginEnabled,
  logoutSession,
  requireCsrf
} from './src/auth.js';
import { auditDenied, getAdminSnapshot, getAuditSummary, getEntityAudit, getMe, getReceiveSessionDetail, getReceivingSummary, getEvidenceDetail, downloadEvidenceContent, linkEvidence, verifyEvidence, archiveEvidence, listEvidenceLinks, listAuditLogs, listBootstrap, listCompliance, listDepartments, listDevices, listDocuments, listExports, listExportSummary, listExportCandidates, listExportBatches, getExportBatchDetail, listExportBatchErrors, validateExportBatch, approveExportBatch, generateExportBatch, dispatchExportBatch, cancelExportBatch, listFacilities, listFeatureFlags, listInternalRequests, listItems, listItemCategories, listInventorySummary, listInventoryBalances, listStockMovements, listStockAdjustments, listInventoryBins, getItemDetail, getInventoryAdjustmentDetail, createItem, updateItem, createStockAdjustment, listLabelJobs, listPermissions, listPurchaseRequests, listPurchaseOrders, listReceivingMovements, listReceivingPurchaseOrders, listReceivingSessions, listVendors, getProcurementSummary, getVendorDetail, createVendor, updateVendor, getPurchaseDetail, getPurchaseOrderDetail, createPurchaseRequest, updatePurchaseRequest, submitPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest, cancelPurchaseRequest, listPurchaseRequestLines, createPurchaseRequestLine, updatePurchaseRequestLine, deletePurchaseRequestLine, createPurchaseOrderFromPurchaseRequest, updatePurchaseOrder, approvePurchaseOrder, issuePurchaseOrder, cancelPurchaseOrder, listSupplierContracts, getSupplierContractDetail, createSupplierContract, updateSupplierContract, listDepartmentBudgets, getDepartmentBudgetDetail, updateDepartmentBudget, listProcurementWaivers, createProcurementWaiver, getProcurementAdvisory, getProcureToPaySummary, listVendorInvoices, listVendorInvoiceLines, listVendorInvoiceExceptions, getVendorInvoiceExceptionDetail, getVendorInvoiceDetail, createVendorInvoice, createVendorInvoiceLine, updateVendorInvoice, updateVendorInvoiceLine, deleteVendorInvoiceLine, uploadVendorInvoice, extractVendorInvoice, matchVendorInvoice, waiveInvoiceException, approveVendorInvoice, rejectVendorInvoice, cancelVendorInvoice, markVendorInvoiceExportReady, exportVendorInvoice, listRfqRequests, getRfqRequestDetail, createRfqRequest, updateRfqRequest, sendRfqRequest, evaluateRfqRequest, awardRfqRequest, cancelRfqRequest, listRfqLines, createRfqLine, updateRfqLine, deleteRfqLine, listVendorQuotes, getVendorQuoteDetail, createVendorQuote, updateVendorQuote, submitVendorQuote, shortlistVendorQuote, awardVendorQuote, rejectVendorQuote, expireVendorQuote, listVendorScorecards, createReceiveSessionFromPurchaseOrder, startReceiveSession, recordReceiveLine, recordReceiveException, postReceiveSession, cancelReceiveSession, listRoles, listSyncBatches, listSyncConflicts, listUsers, resolveContext, createInternalRequest, submitInternalRequest, cancelInternalRequest, approveInternalRequest, rejectInternalRequest, issueInternalRequest, reviewSyncBatch, createLabelJob, createExportBatch, validateFinanceExport, generateFinanceExport as generateFinanceExportAction, uploadDocument, resolveSyncConflict, dispatchExport, getRequestDetail, listAvailableRequestItems, updateInternalRequest, listRequestLines, createRequestLine, updateRequestLine, deleteRequestLine, listWarehouseSummary, listWarehouseTasks, listIssueReadyRequests, listWarehouseBins, getWarehouseTaskDetail, createWarehouseTaskFromRequest, startWarehouseTask, pickWarehouseTaskLine, issueWarehouseTaskLine, closeWarehouseTask, cancelWarehouseTask, listIntegrationSummary, listIntegrationConnections, createIntegrationConnection, listIntegrationJobs, getIntegrationConnectionDetail, getIntegrationJobDetail, retryIntegrationJob, cancelIntegrationJob, listDeviceOpsSummary, createDevice, getDeviceDetail, updateDevice, trustDevice, suspendDevice, revokeDevice, listDeviceEvents, recordScanEvent, validateScan, listOfflineSummary, createOfflineBatch, listOfflineBatches, getOfflineBatchDetail, uploadOfflineBatch, validateOfflineBatch, replayOfflineBatch, approveOfflineBatch, rejectOfflineBatch, listSyncConflictsNew, getSyncConflictDetail, approveSyncConflict, rejectSyncConflict, listOfflineTasks, getOfflineTaskDetail , listAiSummary, listAiAgents, listAiRecommendations, generateAiRecommendations, getAiRecommendationDetail, dismissAiRecommendation, approveAiRecommendationPlaceholder, listAiRuns, getAiRunDetail, queryOpsCopilot, listComplianceControls, updateComplianceControl, listComplianceEvidence, listAccessReviews, createAccessReview, reviewAccessEntry, listRiskRegister, createRiskEntry, updateRiskEntry, listIncidentRegister, createIncident, updateIncident, listVendorIntegrationRegister, listAiGovernanceLogs, getSecurityPosture, getAvailabilityPosture, listSsoConfigurations, listBackupRecords, listRestoreTests, listReportDefinitions, listReportSummary, listReportRuns, getReportRun, runReport, cancelReportRun, exportReportRunCsv, exportReportRunPdf, getInventoryOptimizationSummary, listInventoryCycleCountPlans, createInventoryCycleCountPlan, getInventoryCycleCountPlanDetail, updateInventoryCycleCountPlan, scheduleInventoryCycleCountPlan, startInventoryCycleCountPlan, cancelInventoryCycleCountPlan, addInventoryCycleCountPlanLine, updateInventoryCycleCountPlanLine, createInventoryCountSession, getInventoryCountSessionDetail, recordCountSessionLine, submitCountSessionForReview, approveInventoryCountSession, postInventoryCountSession, listInventoryVariances, getInventoryVarianceDetail, approveInventoryVariance, rejectInventoryVariance, waiveInventoryVariance, listInventoryReplenishmentRecommendations, generateInventoryReplenishmentRecommendations, approveInventoryRecommendation, dismissInventoryRecommendation, convertInventoryRecommendationToRequest, listInventoryClassifications, recalculateInventoryClassifications,
  getAssetCustodySummary, listAssets, createAsset, getAssetDetail, updateAsset, getAssetTimeline, assignAsset, createAssetTransferRequest, approveAssetTransferRequest, createAssetReturnRequest, acceptAssetReturn, createAssetConditionReport, reportAssetDamage, reportAssetLoss, quarantineAsset, releaseAssetQuarantine, openAssetMaintenance, closeAssetMaintenance, listAssetMaintenanceCases, listAssetDisposalRequests, createAssetDisposalRequest, approveAssetDisposalRequest, rejectAssetDisposalRequest, postAssetDisposal, addAssetEvidence, getAssetEvidence,
  getOcrProviderStatus, acceptOcrProposedFields, rejectOcrExtraction, listOcrExtractionRuns, getOcrExtractionRunDetail
} from './src/services.js';
import { getPlatformAuthBootstrap, createPlatformDemoSession as createPlatformSession, endPlatformWorkspaceSession, resolvePlatformContext, getPlatformMe, getPlatformSummary, listPlatformTenants, getPlatformTenantDetail, getPlatformTenantUsers, getPlatformTenantModules, getPlatformTenantUsage, getPlatformTenantHealth, listPlatformAuditEvents, listPlatformSecurityEvents, listPlatformBillingEvents, listPlatformSupportSessions, createPlatformSupportSession, updatePlatformTenantSubscription, updatePlatformTenantPlan, updatePlatformTenantEntitlements, endPlatformSupportSession, suspendPlatformTenant, reactivatePlatformTenant, auditPlatformDenied, listPlatformReportDefinitions, listPlatformReportSummary, listPlatformReportRuns, getPlatformReportRun, runPlatformReport, cancelPlatformReportRun, exportPlatformReportRunCsv, exportPlatformReportRunPdf } from './src/platform.js';
import { getDatabaseRuntimeInfo, selectOne as dbSelectOne } from './src/db.js';
import { probeEvidenceStorage } from './src/evidence-storage.js';
import { parseJsonBody } from './src/validation.js';
import { getPlatformOidcRuntimeSelection, getSessionRuntimeSelection, getTenantOidcRuntimeSelection } from './src/runtime-config.js';
import { connectRedis, pingRedis } from './src/redis-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const root = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:"
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS });
  res.end(JSON.stringify(data));
}

function sendJsonWithHeaders(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...headers });
  res.end(JSON.stringify(data));
}

function sendRedirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

// CORS — used when the backend is accessed directly (e.g. Railway URL) from a trusted cross-origin client.
// When served behind Vercel proxy, requests are same-origin and CORS headers are not exercised.
// Read ALLOWED_ORIGINS lazily on each request so it resolves after the process environment is fully set.
function resolveAllowedOrigin(origin) {
  if (!origin) return null;
  const o = origin.replace(/\/$/, '');
  const allowed = (process.env.ALLOWED_ORIGINS || process.env.APP_BASE_URL || '')
    .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  return allowed.includes(o) ? o : null;
}

function routeAction(pathname, method) {
  const base = pathname.split('/').filter(Boolean);
  if (pathname === '/api/platform/me') return 'VIEW_PLATFORM_ME';
  if (pathname === '/api/platform/summary') return 'VIEW_PLATFORM_SUMMARY';
  if (pathname === '/api/platform/tenants') return 'VIEW_PLATFORM_TENANTS';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/users$/)) return 'VIEW_PLATFORM_TENANT_USERS';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/modules$/)) return 'VIEW_PLATFORM_TENANT_MODULES';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/usage$/)) return 'VIEW_PLATFORM_TENANT_USAGE';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/health$/)) return 'VIEW_PLATFORM_TENANT_HEALTH';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/subscription$/)) return 'MANAGE_PLATFORM_SUBSCRIPTION';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/plan$/)) return 'MANAGE_PLATFORM_SUBSCRIPTION';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/entitlements$/)) return 'MANAGE_PLATFORM_ENTITLEMENTS';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/suspend$/)) return 'MANAGE_PLATFORM_TENANT_STATUS';
  if (pathname.match(/^\/api\/platform\/tenants\/[^/]+\/reactivate$/)) return 'MANAGE_PLATFORM_TENANT_STATUS';
  if (pathname.match(/^\/api\/platform\/support-sessions\/[^/]+\/end$/)) return 'MANAGE_PLATFORM_SUPPORT_SESSIONS';
  if (pathname.match(/^\/api\/platform\/support-sessions$/)) return method === 'POST' ? 'MANAGE_PLATFORM_SUPPORT_SESSIONS' : 'VIEW_PLATFORM_SUPPORT_SESSIONS';
  if (pathname.match(/^\/api\/platform\/audit-events$/)) return 'VIEW_PLATFORM_AUDIT_EVENTS';
  if (pathname.match(/^\/api\/platform\/security-events$/)) return 'VIEW_PLATFORM_SECURITY_EVENTS';
  if (pathname.match(/^\/api\/platform\/billing-events$/)) return 'VIEW_PLATFORM_BILLING_EVENTS';
  if (pathname === '/api/platform/auth/bootstrap') return 'VIEW_PLATFORM_ME';
  if (pathname === '/api/me') return 'VIEW_ME';
  if (pathname === '/api/admin') return 'VIEW_ADMIN';
  if (pathname === '/api/exports') return 'VIEW_EXPORTS';
  if (pathname === '/api/exports/summary') return 'VIEW_EXPORTS';
  if (pathname === '/api/exports/candidates') return 'VIEW_EXPORTS';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+\/validate$/)) return 'VALIDATE_EXPORT_BATCH';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+\/approve$/)) return 'APPROVE_EXPORT_BATCH';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+\/generate$/)) return 'GENERATE_EXPORT_BATCH';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+\/cancel$/)) return 'CANCEL_EXPORT_BATCH';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+\/errors$/)) return 'VIEW_EXPORT_ERRORS';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+\/dispatch$/)) return 'DISPATCH_EXPORT_BATCH';
  if (pathname === '/api/exports/batches') return method === 'POST' ? 'CREATE_EXPORT_BATCH' : 'VIEW_EXPORTS';
  if (pathname.match(/^\/api\/exports\/batches\/[^/]+$/)) return 'VIEW_EXPORTS';
  if (pathname === '/api/exports/movements') return 'VIEW_EXPORTS';
  if (pathname === '/api/exports/purchase-orders') return 'VIEW_EXPORTS';
  if (pathname === '/api/exports/receipts') return 'VIEW_EXPORTS';
  if (pathname === '/api/integrations/summary') return 'VIEW_INTEGRATIONS';
  if (pathname === '/api/integrations/connections') return method === 'POST' ? 'MANAGE_INTEGRATIONS' : 'VIEW_INTEGRATIONS';
  if (pathname.match(/^\/api\/integrations\/connections\/[^/]+\/test$/)) return 'MANAGE_INTEGRATIONS';
  if (pathname.match(/^\/api\/integrations\/connections\/[^/]+$/)) return 'VIEW_INTEGRATIONS';
  if (pathname.match(/^\/api\/integrations\/jobs\/[^/]+\/retry$/)) return 'RETRY_INTEGRATION_JOB';
  if (pathname.match(/^\/api\/integrations\/jobs\/[^/]+\/cancel$/)) return 'CANCEL_INTEGRATION_JOB';
  if (pathname === '/api/integrations/jobs') return 'VIEW_INTEGRATIONS';
  if (pathname.match(/^\/api\/integrations\/jobs\/[^/]+$/)) return 'VIEW_INTEGRATIONS';
  if (pathname === '/api/audit') return 'VIEW_AUDIT';
  if (pathname === '/api/audit/summary') return 'VIEW_AUDIT';
  if (pathname.match(/^\/api\/audit\/[^/]+\/[^/]+$/)) return 'VIEW_AUDIT';
  if (pathname === '/api/users') return 'VIEW_USERS';
  if (pathname === '/api/roles') return 'VIEW_ROLES';
  if (pathname === '/api/permissions') return 'VIEW_PERMISSIONS';
  if (pathname === '/api/facilities') return 'VIEW_FACILITIES';
  if (pathname === '/api/departments') return 'VIEW_DEPARTMENTS';
  if (pathname === '/api/devices') return method === 'POST' ? 'MANAGE_DEVICES' : 'VIEW_DEVICES';
  if (pathname === '/api/deviceops/summary') return 'VIEW_DEVICES';
  if (pathname.match(/^\/api\/devices\/[^/]+\/trust$/)) return 'TRUST_DEVICE';
  if (pathname.match(/^\/api\/devices\/[^/]+\/suspend$/)) return 'SUSPEND_DEVICE';
  if (pathname.match(/^\/api\/devices\/[^/]+\/revoke$/)) return 'REVOKE_DEVICE';
  if (pathname.match(/^\/api\/devices\/[^/]+\/events$/)) return method === 'POST' ? 'RECORD_SCAN_EVENT' : 'VIEW_DEVICES';
  if (pathname.match(/^\/api\/devices\/[^/]+\/scan-events$/)) return 'RECORD_SCAN_EVENT';
  if (pathname.match(/^\/api\/devices\/[^/]+$/)) return method === 'PATCH' ? 'MANAGE_DEVICES' : 'VIEW_DEVICES';
  if (pathname === '/api/deviceops/validate-scan') return 'VALIDATE_SCAN';
  if (pathname === '/api/offline/summary') return 'VIEW_OFFLINE_BATCHES';
  if (pathname === '/api/offline/batches') return method === 'POST' ? 'CREATE_OFFLINE_BATCH' : 'VIEW_OFFLINE_BATCHES';
  if (pathname.match(/^\/api\/offline\/batches\/[^/]+\/upload$/)) return 'CREATE_OFFLINE_BATCH';
  if (pathname.match(/^\/api\/offline\/batches\/[^/]+\/validate$/)) return 'VALIDATE_OFFLINE_BATCH';
  if (pathname.match(/^\/api\/offline\/batches\/[^/]+\/replay$/)) return 'REPLAY_OFFLINE_BATCH';
  if (pathname.match(/^\/api\/offline\/batches\/[^/]+\/approve$/)) return 'APPROVE_OFFLINE_BATCH';
  if (pathname.match(/^\/api\/offline\/batches\/[^/]+\/reject$/)) return 'REJECT_OFFLINE_BATCH';
  if (pathname.match(/^\/api\/offline\/batches\/[^/]+$/)) return 'VIEW_OFFLINE_BATCHES';
  if (pathname === '/api/offline/conflicts') return 'VIEW_SYNC_CONFLICTS';
  if (pathname.match(/^\/api\/offline\/conflicts\/[^/]+\/approve$/)) return 'RESOLVE_SYNC_CONFLICTS';
  if (pathname.match(/^\/api\/offline\/conflicts\/[^/]+\/reject$/)) return 'RESOLVE_SYNC_CONFLICTS';
  if (pathname.match(/^\/api\/offline\/conflicts\/[^/]+$/)) return 'VIEW_SYNC_CONFLICTS';
  if (pathname === '/api/offline/tasks') return 'VIEW_OFFLINE_BATCHES';
  if (pathname.match(/^\/api\/offline\/tasks\/[^/]+$/)) return 'VIEW_OFFLINE_BATCHES';
  if (pathname === '/api/ai/summary') return 'VIEW_AI_SUMMARY';
  if (pathname === '/api/ai/agents') return 'VIEW_AI_SUMMARY';
  if (pathname === '/api/ai/recommendations') return 'VIEW_AI_RECOMMENDATIONS';
  if (pathname === '/api/ai/recommendations/generate') return 'GENERATE_AI_RECOMMENDATIONS';
  if (pathname.match(/^\/api\/ai\/recommendations\/[^/]+\/dismiss$/)) return 'DISMISS_AI_RECOMMENDATIONS';
  if (pathname.match(/^\/api\/ai\/recommendations\/[^/]+\/approve-placeholder$/)) return 'APPROVE_AI_PLACEHOLDER';
  if (pathname.match(/^\/api\/ai\/recommendations\/[^/]+$/)) return 'VIEW_AI_RECOMMENDATIONS';
  if (pathname === '/api/ai/runs') return 'VIEW_AI_RUNS';
  if (pathname.match(/^\/api\/ai\/runs\/[^/]+$/)) return 'VIEW_AI_RUNS';
  if (pathname === '/api/ai/copilot/query') return 'QUERY_OPS_COPILOT';
  if (pathname === '/api/feature-flags') return 'VIEW_FEATURE_FLAGS';
  if (pathname === '/api/inventory/summary') return 'VIEW_INVENTORY_SUMMARY';
  if (pathname === '/api/inventory/categories') return 'VIEW_INVENTORY_CATEGORIES';
  if (pathname === '/api/inventory/items') return method === 'POST' ? 'CREATE_ITEM' : 'VIEW_INVENTORY_ITEMS';
  if (pathname.match(/^\/api\/inventory\/items\/[^/]+$/)) return method === 'PATCH' ? 'UPDATE_ITEM' : 'VIEW_ITEM_DETAIL';
  if (pathname === '/api/inventory/balances') return 'VIEW_INVENTORY_BALANCES';
  if (pathname === '/api/inventory/movements') return 'VIEW_STOCK_MOVEMENTS';
  if (pathname === '/api/inventory/adjustments') return method === 'POST' ? 'POST_STOCK_ADJUSTMENT' : 'VIEW_STOCK_ADJUSTMENTS';
  if (pathname.match(/^\/api\/inventory\/adjustments\/[^/]+$/)) return 'VIEW_STOCK_ADJUSTMENT_DETAIL';
  if (pathname === '/api/inventory/bins') return 'VIEW_INVENTORY_BINS';
  if (pathname === '/api/warehouse/summary') return 'VIEW_WAREHOUSE_SUMMARY';
  if (pathname === '/api/warehouse/tasks') return method === 'GET' ? 'VIEW_WAREHOUSE_TASKS' : 'CREATE_WAREHOUSE_TASK';
  if (pathname.match(/^\/api\/warehouse\/tasks\/from-request\/[^/]+$/)) return 'CREATE_WAREHOUSE_TASK';
  if (pathname.match(/^\/api\/warehouse\/tasks\/[^/]+$/)) {
    if (method === 'POST' && base[3] === 'start') return 'START_WAREHOUSE_TASK';
    if (method === 'POST' && base[3] === 'pick') return 'PICK_WAREHOUSE_TASK_LINE';
    if (method === 'POST' && base[3] === 'issue') return 'ISSUE_WAREHOUSE_TASK_LINE';
    if (method === 'POST' && base[3] === 'close') return 'CLOSE_WAREHOUSE_TASK';
    if (method === 'POST' && base[3] === 'cancel') return 'CANCEL_WAREHOUSE_TASK';
    return 'VIEW_WAREHOUSE_TASK';
  }
  if (pathname === '/api/warehouse/issue-ready-requests') return 'VIEW_WAREHOUSE_REQUESTS';
  if (pathname === '/api/warehouse/bins') return 'VIEW_WAREHOUSE_BINS';
  if (pathname === '/api/procurement/summary') return 'VIEW_PROCUREMENT_SUMMARY';
  if (pathname === '/api/procurement/contracts') return method === 'POST' ? 'CREATE_SUPPLIER_CONTRACT' : 'VIEW_SUPPLIER_CONTRACTS';
  if (pathname.match(/^\/api\/procurement\/contracts\/[^/]+$/)) return method === 'PATCH' ? 'UPDATE_SUPPLIER_CONTRACT' : 'VIEW_SUPPLIER_CONTRACT';
  if (pathname === '/api/procurement/budgets') return 'VIEW_DEPARTMENT_BUDGETS';
  if (pathname.match(/^\/api\/procurement\/budgets\/[^/]+$/)) return method === 'PATCH' ? 'UPDATE_DEPARTMENT_BUDGET' : 'VIEW_DEPARTMENT_BUDGET';
  if (pathname === '/api/procurement/waivers') return method === 'POST' ? 'CREATE_PROCUREMENT_WAIVER' : 'VIEW_PROCUREMENT_WAIVERS';
  if (pathname.match(/^\/api\/procurement\/waivers\/[^/]+$/)) return 'VIEW_PROCUREMENT_WAIVERS';
  if (pathname === '/api/procurement/advisory') return 'VIEW_PROCUREMENT_ADVISORY';
  if (pathname === '/api/procure-to-pay/summary') return 'VIEW_PROCURE_TO_PAY';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/extract$/)) return 'EXTRACT_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/match$/)) return 'MATCH_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/exceptions\/[^/]+\/waive$/)) return 'WAIVE_INVOICE_EXCEPTION';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/exceptions\/[^/]+$/)) return 'VIEW_VENDOR_INVOICE_EXCEPTIONS';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/exceptions$/)) return 'VIEW_VENDOR_INVOICE_EXCEPTIONS';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/approve$/)) return 'APPROVE_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/reject$/)) return 'REJECT_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/export-ready$/)) return 'MARK_INVOICE_EXPORT_READY';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/export$/)) return 'EXPORT_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/upload$/)) return 'UPDATE_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/cancel$/)) return 'UPDATE_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/lines$/)) return method === 'POST' ? 'CREATE_VENDOR_INVOICE' : 'VIEW_VENDOR_INVOICES';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/lines\/[^/]+$/)) return method === 'DELETE' ? 'UPDATE_VENDOR_INVOICE' : 'UPDATE_VENDOR_INVOICE';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/send$/)) return 'SEND_RFQ_REQUEST';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/evaluate$/)) return 'EVALUATE_RFQ_REQUEST';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/award$/)) return 'AWARD_RFQ_REQUEST';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/cancel$/)) return 'CANCEL_RFQ_REQUEST';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/lines$/)) return method === 'POST' ? 'CREATE_RFQ_LINE' : 'VIEW_RFQ_REQUESTS';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/lines\/[^/]+$/)) return method === 'DELETE' ? 'DELETE_RFQ_LINE' : 'UPDATE_RFQ_LINE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/submit$/)) return 'SUBMIT_VENDOR_QUOTE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/shortlist$/)) return 'SHORTLIST_VENDOR_QUOTE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/award$/)) return 'AWARD_VENDOR_QUOTE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/reject$/)) return 'REJECT_VENDOR_QUOTE';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/expire$/)) return 'EXPIRE_VENDOR_QUOTE';
  if (pathname === '/api/procure-to-pay/vendor-scorecards') return 'VIEW_VENDOR_SCORECARDS';
  if (pathname === '/api/procure-to-pay/vendor-invoices') return method === 'POST' ? 'CREATE_VENDOR_INVOICE' : 'VIEW_VENDOR_INVOICES';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+$/)) {
    if (method === 'PATCH') return 'UPDATE_VENDOR_INVOICE';
    return 'VIEW_VENDOR_INVOICES';
  }
  if (pathname === '/api/procure-to-pay/rfqs') return method === 'POST' ? 'CREATE_RFQ_REQUEST' : 'VIEW_RFQ_REQUESTS';
  if (pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+$/)) {
    if (method === 'PATCH') return 'UPDATE_RFQ_REQUEST';
    return 'VIEW_RFQ_REQUESTS';
  }
  if (pathname === '/api/procure-to-pay/vendor-quotes') return method === 'POST' ? 'CREATE_VENDOR_QUOTE' : 'VIEW_VENDOR_QUOTES';
  if (pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+$/)) {
    if (method === 'PATCH') return 'UPDATE_VENDOR_QUOTE';
    return 'VIEW_VENDOR_QUOTES';
  }
  if (pathname === '/api/procurement/vendors') return method === 'POST' ? 'CREATE_VENDOR' : 'VIEW_VENDORS';
  if (pathname.match(/^\/api\/procurement\/vendors\/[^/]+$/)) return method === 'PATCH' ? 'UPDATE_VENDOR' : 'VIEW_VENDOR_DETAIL';
  if (pathname === '/api/procurement/purchase-requests') return method === 'POST' ? 'CREATE_PURCHASE_REQUEST' : 'VIEW_PURCHASING';
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+$/)) {
    if (method === 'PATCH') return 'UPDATE_PURCHASE_REQUEST';
    return 'VIEW_PURCHASE_REQUEST';
  }
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/submit$/)) return 'SUBMIT_PURCHASE_REQUEST';
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/approve$/)) return 'APPROVE_PURCHASE_REQUEST';
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/reject$/)) return 'REJECT_PURCHASE_REQUEST';
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/cancel$/)) return 'CANCEL_PURCHASE_REQUEST';
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/lines$/)) return method === 'POST' ? 'CREATE_PURCHASE_REQUEST_LINE' : 'VIEW_PURCHASE_REQUEST';
  if (pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/lines\/[^/]+$/)) return method === 'DELETE' ? 'DELETE_PURCHASE_REQUEST_LINE' : 'UPDATE_PURCHASE_REQUEST_LINE';
  if (pathname.match(/^\/api\/procurement\/purchase-orders\/from-purchase-request\/[^/]+$/)) return 'CREATE_PURCHASE_ORDER';
  if (pathname === '/api/procurement/purchase-orders') return 'VIEW_PURCHASE_ORDERS';
  if (pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+$/)) {
    if (method === 'PATCH') return 'UPDATE_PURCHASE_ORDER';
    return 'VIEW_PURCHASE_ORDER';
  }
  if (pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+\/approve$/)) return 'APPROVE_PURCHASE_ORDER';
  if (pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+\/issue$/)) return 'ISSUE_PURCHASE_ORDER';
  if (pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+\/cancel$/)) return 'CANCEL_PURCHASE_ORDER';
  if (pathname === '/api/reports/summary') return 'VIEW_REPORTS';
  if (pathname === '/api/reports/definitions') return 'VIEW_REPORTS';
  if (pathname === '/api/reports/runs') return method === 'POST' ? 'RUN_REPORTS' : 'VIEW_REPORTS';
  if (pathname.match(/^\/api\/reports\/runs\/[^/]+\/cancel$/)) return 'RUN_REPORTS';
  if (pathname.match(/^\/api\/reports\/runs\/[^/]+\/export\.csv$/)) return 'VIEW_REPORTS';
  if (pathname.match(/^\/api\/reports\/runs\/[^/]+\/export\.pdf$/)) return 'VIEW_REPORTS';
  if (pathname.match(/^\/api\/reports\/runs\/[^/]+$/)) return 'VIEW_REPORTS';
  if (pathname.startsWith('/api/inventory-optimization/')) return method === 'GET' ? 'VIEW_INVENTORY_OPTIMIZATION' : 'MANAGE_INVENTORY_OPTIMIZATION';
  if (pathname === '/api/platform/reports/summary') return 'VIEW_PLATFORM_REPORTS';
  if (pathname === '/api/platform/reports/definitions') return 'VIEW_PLATFORM_REPORTS';
  if (pathname === '/api/platform/reports/runs') return method === 'POST' ? 'RUN_PLATFORM_REPORTS' : 'VIEW_PLATFORM_REPORTS';
  if (pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+\/cancel$/)) return 'RUN_PLATFORM_REPORTS';
  if (pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+\/export\.csv$/)) return 'VIEW_PLATFORM_REPORTS';
  if (pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+\/export\.pdf$/)) return 'VIEW_PLATFORM_REPORTS';
  if (pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+$/)) return 'VIEW_PLATFORM_REPORTS';
  if (pathname === '/api/evidence' || pathname === '/api/documents') return 'VIEW_EVIDENCE';
  if (pathname.match(/^\/api\/evidence\/[^/]+$/)) return method === 'PATCH' ? 'VERIFY_EVIDENCE' : 'VIEW_EVIDENCE';
  if (pathname.match(/^\/api\/evidence\/[^/]+\/content$/)) return 'VIEW_EVIDENCE_BINARY';
  if (pathname.match(/^\/api\/evidence\/[^/]+\/link$/)) return 'MANAGE_EVIDENCE';
  if (pathname.match(/^\/api\/evidence\/[^/]+\/verify$/)) return 'VERIFY_EVIDENCE';
  if (pathname.match(/^\/api\/evidence\/[^/]+\/archive$/)) return 'ARCHIVE_EVIDENCE';
  if (pathname.match(/^\/api\/evidence\/links\/[^/]+\/[^/]+$/)) return 'VIEW_EVIDENCE';
  if (pathname === '/api/receiving/summary') return 'VIEW_RECEIVING_SUMMARY';
  if (pathname === '/api/receiving/purchase-orders') return 'VIEW_RECEIVING';
  if (pathname === '/api/receiving/sessions') return 'VIEW_RECEIVING';
  if (pathname.match(/^\/api\/receiving\/sessions\/from-purchase-order\/[^/]+$/)) return 'CREATE_RECEIVE_SESSION';
  if (pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/start$/)) return 'START_RECEIVE_SESSION';
  if (pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/receive-line$/)) return 'RECEIVE_STOCK';
  if (pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/post$/)) return 'POST_RECEIPT';
  if (pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/cancel$/)) return 'CANCEL_RECEIVE_SESSION';
  if (pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/exception$/)) return 'RECORD_RECEIVE_EXCEPTION';
  if (pathname.match(/^\/api\/receiving\/sessions\/[^/]+$/)) return 'VIEW_RECEIVING';
  if (pathname === '/api/receiving/movements') return 'VIEW_RECEIVING';
  if (pathname === '/api/requests/available-items') return 'VIEW_AVAILABLE_REQUEST_ITEMS';
  if (pathname.match(/^\/api\/requests\/[^/]+$/)) return 'VIEW_INTERNAL_REQUEST';
  if (base[1] === 'requests' && method === 'POST' && base[3] === 'approve') return 'APPROVE_INTERNAL_REQUEST';
  if (base[1] === 'requests' && method === 'POST' && base[3] === 'submit') return 'SUBMIT_INTERNAL_REQUEST';
  if (base[1] === 'requests' && method === 'POST' && base[3] === 'cancel') return 'CANCEL_INTERNAL_REQUEST';
  if (base[1] === 'requests' && method === 'POST' && base[3] === 'reject') return 'REJECT_INTERNAL_REQUEST';
  if (base[1] === 'requests' && base[3] === 'lines' && method === 'GET') return 'VIEW_REQUEST_LINES';
  if (base[1] === 'requests' && base[3] === 'lines' && method === 'POST') return 'CREATE_REQUEST_LINE';
  if (base[1] === 'requests' && base[3] === 'lines' && method === 'PATCH') return 'UPDATE_REQUEST_LINE';
  if (base[1] === 'requests' && base[3] === 'lines' && method === 'DELETE') return 'DELETE_REQUEST_LINE';
  if (base[1] === 'requests' && method === 'PATCH' && base.length === 3) return 'UPDATE_INTERNAL_REQUEST';
  if (base[1] === 'purchase-requests' && method === 'POST' && base[3] === 'approve') return 'APPROVE_PURCHASE_REQUEST';
  if (base[1] === 'exports' && method === 'POST' && base[3] === 'dispatch') return 'QUEUE_EXPORT_TRANSFER';
  if (base[1] === 'offline-conflicts' && method === 'POST' && base[3] === 'resolve') return 'RESOLVE_SYNC_CONFLICT';
  return `${method}_${pathname.replaceAll('/', '_').replace(/^_+/, '').toUpperCase()}`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  return JSON.parse(text);
}

function serveStatic(req, res, pathname) {
  const candidate = pathname === '/' ? '/index.html' : pathname;
  const filePath = join(root, candidate.replace(/\.\./g, ''));
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return false;
  const ext = extname(filePath);
  const type = mimeTypes[ext] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  res.end(readFileSync(filePath));
  return true;
}

function sendError(res, error, { context, route, method, requestId }) {
  const status = error.status ?? 500;
  if (context && (status === 403 || status === 409)) {
    const payload = {
      route,
      method,
      action: routeAction(route, method),
      reason: error.message ?? 'Unexpected error',
      requestId,
      target: error.target ?? ''
    };
    if (context.platformUser) {
      auditPlatformDenied(context, payload);
    } else {
      auditDenied(context, payload);
    }
  }
  const isProduction = process.env.NODE_ENV === 'production';
  const message = (isProduction && status === 500) ? 'Internal server error' : (error.message ?? 'Unexpected error');
  if (status >= 500) {
    process.stderr.write(`[server] ERROR ${method} ${route} → ${status} requestId=${requestId} ${error.stack || error.message}\n`);
  }
  sendJson(res, status, { error: message, loginUrl: error.loginUrl, requestId });
}

function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestId = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', requestId);
  let context;
  try {
    if (req.method === 'GET' && (url.pathname === '/auth/login' || url.pathname === '/auth/oidc/start')) {
      if (url.pathname === '/auth/login' && !authEnabled()) return sendRedirect(res, '/');
      if (url.pathname === '/auth/oidc/start' && !authEnabled()) return sendJson(res, 503, { error: 'OIDC is not configured', requestId });
      return getLoginUrl(req.headers, url.searchParams.get('returnTo') || url.searchParams.get('return_to') || '/')
        .then((loginUrl) => sendRedirect(res, loginUrl))
        .catch((error) => sendJson(res, error.status ?? 500, { error: error.message ?? 'Unexpected error' }));
    }
    if (req.method === 'GET' && (url.pathname === '/auth/callback' || url.pathname === '/auth/oidc/callback')) {
      return completeLogin(req.headers, Object.fromEntries(url.searchParams.entries()))
        .then(({ cookie, returnTo }) => sendRedirect(res, returnTo || '/', { 'Set-Cookie': cookie }))
        .catch((error) => sendJson(res, error.status ?? 500, { error: error.message ?? 'Unexpected error' }));
    }
    if (req.method === 'POST' && url.pathname === '/auth/logout') {
      const cookie = logoutSession(req.headers);
      return sendRedirect(res, '/', { 'Set-Cookie': cookie });
    }
    if (req.method === 'GET' && url.pathname === '/api/auth/bootstrap') {
      return sendJson(res, 200, getAuthBootstrap());
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/auth/bootstrap') {
      return sendJson(res, 200, getPlatformAuthBootstrap());
    }
    if (req.method === 'GET' && (url.pathname === '/platform/login' || url.pathname === '/platform/auth/oidc/start')) {
      if (url.pathname === '/platform/login' && !getPlatformAuthBootstrap().enabled) return sendRedirect(res, '/platform');
      if (url.pathname === '/platform/auth/oidc/start' && !getPlatformAuthBootstrap().enabled) return sendJson(res, 503, { error: 'OIDC is not configured', requestId });
      return getPlatformLoginUrl(req.headers, url.searchParams.get('returnTo') || url.searchParams.get('return_to') || '/platform/dashboard')
        .then((loginUrl) => sendRedirect(res, loginUrl))
        .catch((error) => sendJson(res, error.status ?? 500, { error: error.message ?? 'Unexpected error' }));
    }
    if (req.method === 'GET' && (url.pathname === '/platform/callback' || url.pathname === '/platform/auth/oidc/callback')) {
      return completePlatformLogin(req.headers, Object.fromEntries(url.searchParams.entries()))
        .then(({ cookie, returnTo }) => sendRedirect(res, returnTo || '/platform/dashboard', { 'Set-Cookie': cookie }))
        .catch((error) => sendJson(res, error.status ?? 500, { error: error.message ?? 'Unexpected error' }));
    }
    if (req.method === 'POST' && url.pathname === '/api/dev/demo-login') {
      if (!isDemoLoginEnabled()) {
        return sendJson(res, 404, { error: 'Not found', requestId });
      }
      return handleJson(req, res, () => {
        const payload = parseJsonBody(req.body || {});
        const result = createDemoSession(req.headers, {
          tenantId: payload.tenantId || payload.tenant_id,
          userId: payload.userId || payload.user_id
        });
        sendJsonWithHeaders(res, 200, {
          ok: true,
          auth: result.auth,
          session: {
            authenticated: true,
            provider: result.session.provider,
            display_name: result.session.display_name,
            email: result.session.email,
            tenant_id: result.session.tenant_id,
            user_id: result.session.user_id
          },
        returnTo: '/'
      }, { 'Set-Cookie': result.cookie });
      }, { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/platform/dev/demo-login') {
      if (!isDemoLoginEnabled()) {
        return sendJson(res, 404, { error: 'Not found', requestId });
      }
      return handleJson(req, res, () => {
        const payload = parseJsonBody(req.body || {});
        const result = createPlatformSession(req.headers, {
          userId: payload.userId || payload.user_id
        });
        sendJsonWithHeaders(res, 200, {
          ok: true,
          auth: result.auth,
          session: {
            authenticated: true,
            provider: result.session.provider,
            display_name: result.session.display_name,
            email: result.session.email,
            platform_user_id: result.session.platform_user_id
          },
          returnTo: '/platform/dashboard'
        }, { 'Set-Cookie': result.cookie });
      }, { route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/platform/logout') {
      const cookie = endPlatformWorkspaceSession(req.headers);
      return sendRedirect(res, '/platform/login', { 'Set-Cookie': cookie });
    }
    if (url.pathname.startsWith('/api/platform/')) {
      context = resolvePlatformContext(req.headers, Object.fromEntries(url.searchParams.entries()));
      context.requestId = requestId;
      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
        requireCsrf(req.headers, context.session);
      }
    }
    if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/platform/')) {
      context = resolveContext(req.headers, Object.fromEntries(url.searchParams.entries()));
      context.requestId = requestId;
      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) && authEnabled() && !url.pathname.startsWith('/api/bootstrap')) {
        requireCsrf(req.headers, context.session);
      }
    }
    if (req.method === 'GET' && url.pathname === '/healthz') {
      return sendJson(res, 200, { ok: true, service: 'opstrax-supplyops' });
    }
    if (req.method === 'GET' && url.pathname === '/healthz/ready') {
      let dbOk = false;
      let dbError = null;
      let storageOk = false;
      let storageError = null;
      let authOk = false;
      let authError = null;
      let integrationOk = false;
      let queueOk = false;
      try {
        const dbInfo = getDatabaseRuntimeInfo();
        const row = dbSelectOne('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations');
        const currentVersion = Number(row?.version ?? dbInfo.currentVersion ?? 0);
        dbOk = process.env.NODE_ENV === 'production'
          ? dbInfo.provider === 'postgres' && currentVersion >= 24
          : (dbInfo.provider === 'postgres' ? currentVersion >= 24 : currentVersion > 0);
        try {
          const storageProbe = probeEvidenceStorage();
          storageOk = Boolean(storageProbe?.reachable);
        } catch (e) {
          storageError = e.message;
          storageOk = false;
        }
        const tenantAuth = getTenantOidcRuntimeSelection(process.env);
        const platformAuth = getPlatformOidcRuntimeSelection(process.env);
        const sessionSelection = getSessionRuntimeSelection(process.env);
        const authConfigured = Boolean(tenantAuth.issuer && tenantAuth.clientId && tenantAuth.clientSecret && tenantAuth.redirectUri && platformAuth.issuer && platformAuth.clientId && platformAuth.clientSecret && platformAuth.redirectUri && sessionSelection.tenantSecret && sessionSelection.platformSecret);
        authOk = process.env.NODE_ENV !== 'production' ? true : authConfigured;
        if (process.env.NODE_ENV === 'production' && !authConfigured) {
          authError = 'tenant/platform OIDC or session configuration missing';
        }
        integrationOk = process.env.NODE_ENV !== 'production'
          ? true
          : (dbSelectOne("SELECT COUNT(*) AS count FROM integration_connections WHERE status = 'CONFIGURED'")?.count || 0) > 0;
        queueOk = ((dbSelectOne("SELECT COUNT(*) AS count FROM integration_jobs WHERE status = 'FAILED'")?.count || 0) < 1000);
      } catch (e) {
        dbError = e.message;
      }
      const ready = dbOk && (process.env.NODE_ENV !== 'production' || (storageOk && authOk && integrationOk && queueOk));
      const buildResponse = (redisStatus) => {
        const checks = {
          db: dbOk ? 'ok' : `error: ${dbError ?? 'no migrations applied'}`,
          storage: storageOk ? 'ok' : `error: ${storageError ?? 'storage configuration required'}`,
          auth: authOk ? 'ok' : `error: ${authError ?? 'auth configuration required'}`,
          integration: integrationOk ? 'ok' : 'error: integration posture unavailable',
          queue: queueOk ? 'ok' : 'error: failed integration jobs exceed threshold'
        };
        if (redisStatus !== null) checks.redis = redisStatus ? 'ok' : 'error: ping failed';
        sendJson(res, ready ? 200 : 503, { ok: ready, service: 'opstrax-supplyops', checks });
      };
      if (process.env.REDIS_URL) {
        return pingRedis().then((r) => buildResponse(r)).catch(() => buildResponse(false));
      }
      return buildResponse(null);
    }
    if (req.method === 'GET' && url.pathname === '/api/me') {
      return sendJson(res, 200, getMe(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
      return sendJson(res, 200, { ...listBootstrap(context), compliance: listCompliance(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/me') {
      return sendJson(res, 200, getPlatformMe(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/summary') {
      return sendJson(res, 200, getPlatformSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/tenants') {
      return sendJson(res, 200, { tenants: listPlatformTenants(context) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+$/)) {
      const tenantId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPlatformTenantDetail(context, tenantId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/users$/)) {
      const tenantId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPlatformTenantUsers(context, tenantId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/modules$/)) {
      const tenantId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPlatformTenantModules(context, tenantId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/usage$/)) {
      const tenantId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPlatformTenantUsage(context, tenantId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/health$/)) {
      const tenantId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPlatformTenantHealth(context, tenantId));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/audit-events') {
      return sendJson(res, 200, listPlatformAuditEvents(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/security-events') {
      return sendJson(res, 200, listPlatformSecurityEvents(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/billing-events') {
      return sendJson(res, 200, listPlatformBillingEvents(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/support-sessions') {
      return sendJson(res, 200, listPlatformSupportSessions(context));
    }
    if (req.method === 'POST' && url.pathname === '/api/platform/support-sessions') {
      return handleJson(req, res, () => {
        const body = parseJsonBody(req.body);
        const tenantId = body.tenantId || body.tenant_id || '';
        return sendJson(res, 201, createPlatformSupportSession(context, tenantId, body));
      }, { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/reports/summary') {
      return sendJson(res, 200, listPlatformReportSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/reports/definitions') {
      return sendJson(res, 200, listPlatformReportDefinitions(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/platform/reports/runs') {
      return sendJson(res, 200, listPlatformReportRuns(context));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+$/) && !url.pathname.match(/\/(cancel|export\.csv|export\.pdf)$/)) {
      const runId = url.pathname.split('/')[5];
      return sendJson(res, 200, getPlatformReportRun(context, runId));
    }
    if (req.method === 'POST' && url.pathname === '/api/platform/reports/runs') {
      return handleJson(req, res, () => sendJson(res, 200, runPlatformReport(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+\/cancel$/)) {
      const runId = url.pathname.split('/')[5];
      return handleJson(req, res, () => sendJson(res, 200, cancelPlatformReportRun(context, runId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+\/export\.csv$/)) {
      const runId = url.pathname.split('/')[5];
      return handleJson(req, res, () => {
        const result = exportPlatformReportRunCsv(context, runId);
        const exportRow = result.export || {};
        const body = exportRow.content_text || '';
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${exportRow.file_name || `${runId}.csv`}"`,
          ...SECURITY_HEADERS
        });
        res.end(body);
      }, { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/platform\/reports\/runs\/[^/]+\/export\.pdf$/)) {
      const runId = url.pathname.split('/')[5];
      return handleJson(req, res, () => {
        const result = exportPlatformReportRunPdf(context, runId);
        const exportRow = result.export || {};
        const body = exportRow.content_blob || Buffer.from(exportRow.content_text || '', 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${exportRow.file_name || `${runId}.pdf`}"`,
          ...SECURITY_HEADERS
        });
        res.end(body);
      }, { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/subscription$/)) {
      const tenantId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updatePlatformTenantSubscription(context, tenantId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/plan$/)) {
      const tenantId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updatePlatformTenantPlan(context, tenantId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/entitlements$/)) {
      const tenantId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updatePlatformTenantEntitlements(context, tenantId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/platform\/support-sessions\/[^/]+\/end$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, endPlatformSupportSession(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/suspend$/)) {
      const tenantId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, suspendPlatformTenant(context, tenantId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/platform\/tenants\/[^/]+\/reactivate$/)) {
      const tenantId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, reactivatePlatformTenant(context, tenantId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/users') {
      return sendJson(res, 200, { users: listUsers(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/roles') {
      return sendJson(res, 200, { roles: listRoles(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/permissions') {
      return sendJson(res, 200, listPermissions(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/facilities') {
      return sendJson(res, 200, { facilities: listFacilities(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/departments') {
      return sendJson(res, 200, { departments: listDepartments(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/devices') {
      return sendJson(res, 200, { devices: listDevices(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/feature-flags') {
      return sendJson(res, 200, listFeatureFlags(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/summary') {
      return sendJson(res, 200, listInventorySummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/categories') {
      return sendJson(res, 200, { categories: listItemCategories(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/items') {
      return sendJson(res, 200, { items: listItems(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/inventory/items') {
      return handleJson(req, res, () => sendJson(res, 200, createItem(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/inventory\/items\/[^/]+$/)) {
      const itemId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateItem(context, itemId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/inventory\/items\/[^/]+$/)) {
      const itemId = url.pathname.split('/')[4];
      return sendJson(res, 200, getItemDetail(context, itemId));
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/balances') {
      return sendJson(res, 200, { balances: listInventoryBalances(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/movements') {
      return sendJson(res, 200, { movements: listStockMovements(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/adjustments') {
      return sendJson(res, 200, { adjustments: listStockAdjustments(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/inventory/adjustments') {
      return handleJson(req, res, () => sendJson(res, 200, createStockAdjustment(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/inventory\/adjustments\/[^/]+$/)) {
      const adjustmentId = url.pathname.split('/')[4];
      return sendJson(res, 200, getInventoryAdjustmentDetail(context, adjustmentId));
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory/bins') {
      return sendJson(res, 200, { bins: listInventoryBins(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/warehouse/summary') {
      return sendJson(res, 200, listWarehouseSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/warehouse/tasks') {
      return sendJson(res, 200, { tasks: listWarehouseTasks(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/warehouse/issue-ready-requests') {
      return sendJson(res, 200, { requests: listIssueReadyRequests(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/warehouse/bins') {
      return sendJson(res, 200, { bins: listWarehouseBins(context) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/warehouse\/tasks\/from-request\/[^/]+$/)) {
      const requestId = url.pathname.split('/')[5];
      return handleJson(req, res, () => sendJson(res, 200, createWarehouseTaskFromRequest(context, requestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/warehouse\/tasks\/[^/]+$/)) {
      const taskId = url.pathname.split('/')[4];
      return sendJson(res, 200, getWarehouseTaskDetail(context, taskId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/warehouse\/tasks\/[^/]+\/start$/)) {
      const taskId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, startWarehouseTask(context, taskId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/warehouse\/tasks\/[^/]+\/pick$/)) {
      const taskId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, pickWarehouseTaskLine(context, taskId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/warehouse\/tasks\/[^/]+\/issue$/)) {
      const taskId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, issueWarehouseTaskLine(context, taskId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/warehouse\/tasks\/[^/]+\/close$/)) {
      const taskId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, closeWarehouseTask(context, taskId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/warehouse\/tasks\/[^/]+\/cancel$/)) {
      const taskId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelWarehouseTask(context, taskId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/summary') {
      return sendJson(res, 200, getProcurementSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/contracts') {
      return sendJson(res, 200, { contracts: listSupplierContracts(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/procurement/contracts') {
      return handleJson(req, res, () => sendJson(res, 200, createSupplierContract(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/contracts\/[^/]+$/)) {
      const contractId = url.pathname.split('/')[4];
      return sendJson(res, 200, getSupplierContractDetail(context, contractId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procurement\/contracts\/[^/]+$/)) {
      const contractId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateSupplierContract(context, contractId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/budgets') {
      return sendJson(res, 200, { budgets: listDepartmentBudgets(context) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/budgets\/[^/]+$/)) {
      const budgetId = url.pathname.split('/')[4];
      return sendJson(res, 200, getDepartmentBudgetDetail(context, budgetId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procurement\/budgets\/[^/]+$/)) {
      const budgetId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateDepartmentBudget(context, budgetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/waivers') {
      return sendJson(res, 200, { waivers: listProcurementWaivers(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/procurement/waivers') {
      return handleJson(req, res, () => sendJson(res, 200, createProcurementWaiver(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/waivers\/[^/]+$/)) {
      const waiverId = url.pathname.split('/')[4];
      const waiver = dbSelectOne('SELECT * FROM procurement_waivers WHERE tenant_id = ? AND id = ?', [context.tenant.id, waiverId]);
      if (!waiver) return sendJson(res, 404, { error: 'Waiver not found' });
      return sendJson(res, 200, waiver);
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/advisory') {
      return sendJson(res, 200, getProcurementAdvisory(context, Object.fromEntries(url.searchParams.entries())));
    }
    if (req.method === 'GET' && url.pathname === '/api/reports/summary') {
      return sendJson(res, 200, listReportSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/reports/definitions') {
      return sendJson(res, 200, listReportDefinitions(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/reports/runs') {
      return sendJson(res, 200, listReportRuns(context));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/reports\/runs\/[^/]+$/) && !url.pathname.match(/\/(cancel|export\.csv|export\.pdf)$/)) {
      const runId = url.pathname.split('/')[4];
      return sendJson(res, 200, getReportRun(context, runId));
    }
    if (req.method === 'POST' && url.pathname === '/api/reports/runs') {
      return handleJson(req, res, () => sendJson(res, 200, runReport(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/reports\/runs\/[^/]+\/cancel$/)) {
      const runId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelReportRun(context, runId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/reports\/runs\/[^/]+\/export\.csv$/)) {
      const runId = url.pathname.split('/')[4];
      return handleJson(req, res, () => {
        const result = exportReportRunCsv(context, runId);
        const exportRow = result.export || {};
        const body = exportRow.content_text || '';
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${exportRow.file_name || `${runId}.csv`}"`,
          ...SECURITY_HEADERS
        });
        res.end(body);
      }, { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/reports\/runs\/[^/]+\/export\.pdf$/)) {
      const runId = url.pathname.split('/')[4];
      return handleJson(req, res, () => {
        const result = exportReportRunPdf(context, runId);
        const exportRow = result.export || {};
        const body = exportRow.content_blob || Buffer.from(exportRow.content_text || '', 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${exportRow.file_name || `${runId}.pdf`}"`,
          ...SECURITY_HEADERS
        });
        res.end(body);
      }, { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procure-to-pay/summary') {
      return handleJson(req, res, () => sendJson(res, 200, getProcureToPaySummary(context)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procure-to-pay/vendor-invoices') {
      return handleJson(req, res, () => sendJson(res, 200, { vendorInvoices: listVendorInvoices(context) }), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/procure-to-pay/vendor-invoices') {
      return handleJson(req, res, () => sendJson(res, 200, createVendorInvoice(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/lines$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, listVendorInvoiceLines(context, vendorInvoiceId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/lines$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, createVendorInvoiceLine(context, vendorInvoiceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/lines\/[^/]+$/)) {
      const [,,,, vendorInvoiceId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, updateVendorInvoiceLine(context, vendorInvoiceId, lineId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'DELETE' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/lines\/[^/]+$/)) {
      const [,,,, vendorInvoiceId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, deleteVendorInvoiceLine(context, vendorInvoiceId, lineId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+$/) && !url.pathname.match(/\/(extract|match|approve|reject|export-ready|export|exceptions\/[^/]+\/waive)$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, getVendorInvoiceDetail(context, vendorInvoiceId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateVendorInvoice(context, vendorInvoiceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/upload$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, uploadVendorInvoice(context, vendorInvoiceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/extract$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, extractVendorInvoice(context, vendorInvoiceId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/match$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, matchVendorInvoice(context, vendorInvoiceId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/exceptions$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, listVendorInvoiceExceptions(context, vendorInvoiceId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/exceptions\/[^/]+$/) && !url.pathname.match(/\/waive$/)) {
      const [,,,, vendorInvoiceId, , exceptionId] = url.pathname.split('/');
      return sendJson(res, 200, getVendorInvoiceExceptionDetail(context, vendorInvoiceId, exceptionId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/exceptions\/[^/]+\/waive$/)) {
      const parts = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, waiveInvoiceException(context, parts[4], parts[6], parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/approve$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, approveVendorInvoice(context, vendorInvoiceId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/reject$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectVendorInvoice(context, vendorInvoiceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/cancel$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelVendorInvoice(context, vendorInvoiceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/export-ready$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, markVendorInvoiceExportReady(context, vendorInvoiceId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/export$/)) {
      const vendorInvoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, exportVendorInvoice(context, vendorInvoiceId));
    }
    if (req.method === 'GET' && url.pathname === '/api/procure-to-pay/rfqs') {
      return handleJson(req, res, () => sendJson(res, 200, { rfqRequests: listRfqRequests(context) }), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/procure-to-pay/rfqs') {
      return handleJson(req, res, () => sendJson(res, 200, createRfqRequest(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+$/) && !url.pathname.match(/\/(send|evaluate|award|cancel|lines)$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, getRfqRequestDetail(context, rfqRequestId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateRfqRequest(context, rfqRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/send$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, sendRfqRequest(context, rfqRequestId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/evaluate$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, evaluateRfqRequest(context, rfqRequestId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/award$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, awardRfqRequest(context, rfqRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/cancel$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelRfqRequest(context, rfqRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/lines$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, { lines: listRfqLines(context, rfqRequestId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/lines$/)) {
      const rfqRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, createRfqLine(context, rfqRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/lines\/[^/]+$/)) {
      const [,,,, rfqRequestId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, updateRfqLine(context, rfqRequestId, lineId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'DELETE' && url.pathname.match(/^\/api\/procure-to-pay\/rfqs\/[^/]+\/lines\/[^/]+$/)) {
      const [,,,, rfqRequestId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, deleteRfqLine(context, rfqRequestId, lineId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procure-to-pay/vendor-quotes') {
      return handleJson(req, res, () => sendJson(res, 200, { vendorQuotes: listVendorQuotes(context) }), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/procure-to-pay/vendor-quotes') {
      return handleJson(req, res, () => sendJson(res, 200, createVendorQuote(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+$/) && !url.pathname.match(/\/(submit|shortlist|award|reject|expire)$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, getVendorQuoteDetail(context, vendorQuoteId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateVendorQuote(context, vendorQuoteId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/submit$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return sendJson(res, 200, submitVendorQuote(context, vendorQuoteId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/shortlist$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return sendJson(res, 200, shortlistVendorQuote(context, vendorQuoteId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/award$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return sendJson(res, 200, awardVendorQuote(context, vendorQuoteId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/reject$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectVendorQuote(context, vendorQuoteId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-quotes\/[^/]+\/expire$/)) {
      const vendorQuoteId = url.pathname.split('/')[4];
      return sendJson(res, 200, expireVendorQuote(context, vendorQuoteId));
    }
    if (req.method === 'GET' && url.pathname === '/api/procure-to-pay/vendor-scorecards') {
      return handleJson(req, res, () => sendJson(res, 200, { vendorScorecards: listVendorScorecards(context) }), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/vendors') {
      return sendJson(res, 200, { vendors: listVendors(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/procurement/vendors') {
      return handleJson(req, res, () => sendJson(res, 200, createVendor(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/vendors\/[^/]+$/)) {
      const vendorId = url.pathname.split('/')[4];
      return sendJson(res, 200, getVendorDetail(context, vendorId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procurement\/vendors\/[^/]+$/)) {
      const vendorId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateVendor(context, vendorId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/purchase-requests') {
      return sendJson(res, 200, { purchaseRequests: listPurchaseRequests(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/procurement/purchase-requests') {
      return handleJson(req, res, () => sendJson(res, 200, createPurchaseRequest(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPurchaseDetail(context, purchaseRequestId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updatePurchaseRequest(context, purchaseRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/submit$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, submitPurchaseRequest(context, purchaseRequestId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/approve$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, approvePurchaseRequest(context, purchaseRequestId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/reject$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectPurchaseRequest(context, purchaseRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/cancel$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelPurchaseRequest(context, purchaseRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/lines$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return sendJson(res, 200, { lines: listPurchaseRequestLines(context, purchaseRequestId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/lines$/)) {
      const purchaseRequestId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, createPurchaseRequestLine(context, purchaseRequestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/lines\/[^/]+$/)) {
      const [,, , , purchaseRequestId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, updatePurchaseRequestLine(context, purchaseRequestId, lineId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'DELETE' && url.pathname.match(/^\/api\/procurement\/purchase-requests\/[^/]+\/lines\/[^/]+$/)) {
      const [,, , , purchaseRequestId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, deletePurchaseRequestLine(context, purchaseRequestId, lineId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-orders\/from-purchase-request\/[^/]+$/)) {
      const purchaseRequestId = url.pathname.split('/')[5];
      return handleJson(req, res, () => sendJson(res, 200, createPurchaseOrderFromPurchaseRequest(context, purchaseRequestId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/procurement/purchase-orders') {
      return sendJson(res, 200, { purchaseOrders: listPurchaseOrders(context) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+$/)) {
      const purchaseOrderId = url.pathname.split('/')[4];
      return sendJson(res, 200, getPurchaseOrderDetail(context, purchaseOrderId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+$/)) {
      const purchaseOrderId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updatePurchaseOrder(context, purchaseOrderId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+\/approve$/)) {
      const purchaseOrderId = url.pathname.split('/')[4];
      return sendJson(res, 200, approvePurchaseOrder(context, purchaseOrderId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+\/issue$/)) {
      const purchaseOrderId = url.pathname.split('/')[4];
      return sendJson(res, 200, issuePurchaseOrder(context, purchaseOrderId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procurement\/purchase-orders\/[^/]+\/cancel$/)) {
      const purchaseOrderId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelPurchaseOrder(context, purchaseOrderId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/receiving/summary') {
      return sendJson(res, 200, getReceivingSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/receiving/purchase-orders') {
      return sendJson(res, 200, { purchaseOrders: listReceivingPurchaseOrders(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/receiving/sessions') {
      return sendJson(res, 200, { sessions: listReceivingSessions(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/receiving/movements') {
      return sendJson(res, 200, { movements: listReceivingMovements(context) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/receiving\/sessions\/from-purchase-order\/[^/]+$/)) {
      const purchaseOrderId = url.pathname.split('/')[5];
      return handleJson(req, res, () => sendJson(res, 200, createReceiveSessionFromPurchaseOrder(context, purchaseOrderId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/receiving\/sessions\/[^/]+$/)) {
      const sessionId = url.pathname.split('/')[4];
      return sendJson(res, 200, getReceiveSessionDetail(context, sessionId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/start$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, startReceiveSession(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/receive-line$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, recordReceiveLine(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/exception$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, recordReceiveException(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/post$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, postReceiveSession(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/receiving\/sessions\/[^/]+\/cancel$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelReceiveSession(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/items') {
      return sendJson(res, 200, { items: listItems(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/requests/available-items') {
      return sendJson(res, 200, listAvailableRequestItems(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/requests') {
      return sendJson(res, 200, { requests: listInternalRequests(context) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/requests\/[^/]+$/)) {
      const requestId = url.pathname.split('/')[3];
      return sendJson(res, 200, getRequestDetail(context, requestId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/requests\/[^/]+$/)) {
      const requestId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, updateInternalRequest(context, requestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/requests\/[^/]+\/lines$/)) {
      const requestId = url.pathname.split('/')[3];
      return sendJson(res, 200, { lines: listRequestLines(context, requestId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/requests\/[^/]+\/lines$/)) {
      const requestId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, createRequestLine(context, requestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/requests\/[^/]+\/lines\/[^/]+$/)) {
      const [,, , requestId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, updateRequestLine(context, requestId, lineId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'DELETE' && url.pathname.match(/^\/api\/requests\/[^/]+\/lines\/[^/]+$/)) {
      const [,, , requestId, , lineId] = url.pathname.split('/');
      return handleJson(req, res, () => sendJson(res, 200, deleteRequestLine(context, requestId, lineId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/requests') {
      return handleJson(req, res, () => createInternalRequest(context, parseJsonBody(req.body)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/requests\/[^/]+\/submit$/)) {
      const requestId = url.pathname.split('/')[3];
      return sendJson(res, 200, submitInternalRequest(context, requestId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/requests\/[^/]+\/cancel$/)) {
      const requestId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, cancelInternalRequest(context, requestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/requests\/[^/]+\/approve$/)) {
      const requestId = url.pathname.split('/')[3];
      return sendJson(res, 200, approveInternalRequest(context, requestId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/requests\/[^/]+\/reject$/)) {
      const requestId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, rejectInternalRequest(context, requestId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/requests\/[^/]+\/issue$/)) {
      const requestId = url.pathname.split('/')[3];
      return sendJson(res, 200, issueInternalRequest(context, requestId));
    }
    if (req.method === 'GET' && url.pathname === '/api/purchase-requests') {
      return sendJson(res, 200, { purchaseRequests: listPurchaseRequests(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/purchase-requests') {
      return handleJson(req, res, () => createPurchaseRequest(context, parseJsonBody(req.body)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/purchase-requests\/[^/]+\/approve$/)) {
      const purchaseRequestId = url.pathname.split('/')[3];
      return sendJson(res, 200, approvePurchaseRequest(context, purchaseRequestId));
    }
    if (req.method === 'GET' && url.pathname === '/api/sync-batches') {
      return sendJson(res, 200, { syncBatches: listSyncBatches(context) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/sync-batches\/[^/]+\/review$/)) {
      const batchId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, reviewSyncBatch(context, batchId, req.body)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/labels') {
      return sendJson(res, 200, { labelJobs: listLabelJobs(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/labels') {
      return handleJson(req, res, () => sendJson(res, 200, createLabelJob(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/exports') {
      return sendJson(res, 200, listExports(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/exports/summary') {
      return sendJson(res, 200, listExportSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/exports/candidates') {
      return sendJson(res, 200, listExportCandidates(context, Object.fromEntries(url.searchParams.entries())));
    }
    if (req.method === 'GET' && url.pathname === '/api/exports/batches') {
      return sendJson(res, 200, listExportBatches(context, Object.fromEntries(url.searchParams.entries())));
    }
    if (req.method === 'POST' && url.pathname === '/api/exports/batches') {
      return handleJson(req, res, () => sendJson(res, 200, createExportBatch(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+$/)) {
      const batchId = url.pathname.split('/')[4];
      return sendJson(res, 200, getExportBatchDetail(context, batchId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+\/validate$/)) {
      const batchId = url.pathname.split('/')[4];
      return sendJson(res, 200, validateExportBatch(context, batchId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+\/approve$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveExportBatch(context, batchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+\/generate$/)) {
      const batchId = url.pathname.split('/')[4];
      return sendJson(res, 200, generateExportBatch(context, batchId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+\/cancel$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelExportBatch(context, batchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+\/errors$/)) {
      const batchId = url.pathname.split('/')[4];
      return sendJson(res, 200, listExportBatchErrors(context, batchId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/batches\/[^/]+\/dispatch$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, dispatchExportBatch(context, batchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/exports/movements') {
      return sendJson(res, 200, { movements: listExportCandidates(context, Object.fromEntries(url.searchParams.entries())).movements });
    }
    if (req.method === 'GET' && url.pathname === '/api/exports/purchase-orders') {
      return sendJson(res, 200, { purchaseOrders: listExportCandidates(context, Object.fromEntries(url.searchParams.entries())).purchaseOrders });
    }
    if (req.method === 'GET' && url.pathname === '/api/exports/receipts') {
      return sendJson(res, 200, { receipts: listExportCandidates(context, Object.fromEntries(url.searchParams.entries())).receipts });
    }
    if (req.method === 'POST' && url.pathname === '/api/exports/validate') {
      return sendJson(res, 200, validateFinanceExport(context));
    }
    if (req.method === 'POST' && url.pathname === '/api/exports/generate') {
      return sendJson(res, 200, generateFinanceExportAction(context));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/[^/]+\/dispatch$/)) {
      const exportBatchId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, dispatchExport(context, exportBatchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/integrations/summary') {
      return sendJson(res, 200, listIntegrationSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/integrations/connections') {
      return sendJson(res, 200, listIntegrationConnections(context));
    }
    if (req.method === 'POST' && url.pathname === '/api/integrations/connections') {
      return handleJson(req, res, () => sendJson(res, 200, createIntegrationConnection(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/integrations\/connections\/[^/]+$/)) {
      const connectionId = url.pathname.split('/')[4];
      return sendJson(res, 200, getIntegrationConnectionDetail(context, connectionId));
    }
    if (req.method === 'GET' && url.pathname === '/api/integrations/jobs') {
      return sendJson(res, 200, listIntegrationJobs(context, Object.fromEntries(url.searchParams.entries())));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/integrations\/jobs\/[^/]+$/)) {
      const jobId = url.pathname.split('/')[4];
      return sendJson(res, 200, getIntegrationJobDetail(context, jobId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/integrations\/jobs\/[^/]+\/retry$/)) {
      const jobId = url.pathname.split('/')[4];
      return sendJson(res, 200, retryIntegrationJob(context, jobId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/integrations\/jobs\/[^/]+\/cancel$/)) {
      const jobId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelIntegrationJob(context, jobId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/audit') {
      return sendJson(res, 200, { audit: listAuditLogs(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/audit/summary') {
      return sendJson(res, 200, getAuditSummary(context));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/audit\/[^/]+\/[^/]+$/)) {
      const [,, , entityType, entityId] = url.pathname.split('/');
      return sendJson(res, 200, { audit: getEntityAudit(context, entityType, entityId) });
    }
    if (req.method === 'GET' && url.pathname === '/api/documents') {
      return sendJson(res, 200, { documents: listDocuments(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/evidence') {
      return sendJson(res, 200, { documents: listDocuments(context) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/evidence\/[^/]+$/)) {
      const evidenceId = url.pathname.split('/')[3];
      return sendJson(res, 200, getEvidenceDetail(context, evidenceId));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/evidence\/[^/]+\/content$/)) {
      const evidenceId = url.pathname.split('/')[3];
      const token = url.searchParams.get('token') || '';
      const result = downloadEvidenceContent(context, evidenceId, token);
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${String(result.fileName || 'evidence').replaceAll('"', '')}"`,
        'X-Request-Id': requestId
      });
      return res.end(result.content);
    }
    if (req.method === 'POST' && url.pathname === '/api/documents') {
      return handleJson(req, res, () => sendJson(res, 200, uploadDocument(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/evidence') {
      return handleJson(req, res, () => sendJson(res, 200, uploadDocument(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/evidence\/[^/]+\/link$/)) {
      const evidenceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, linkEvidence(context, evidenceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/evidence\/[^/]+\/verify$/)) {
      const evidenceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, verifyEvidence(context, evidenceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/evidence\/[^/]+\/archive$/)) {
      const evidenceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, archiveEvidence(context, evidenceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/evidence\/links\/[^/]+\/[^/]+$/)) {
      const [, , , entityType, entityId] = url.pathname.split('/');
      return sendJson(res, 200, { links: listEvidenceLinks(context, entityType, entityId) });
    }
    if (req.method === 'GET' && url.pathname === '/api/offline-conflicts') {
      return sendJson(res, 200, { conflicts: listSyncConflicts(context) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline-conflicts\/[^/]+\/resolve$/)) {
      const conflictId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, resolveSyncConflict(context, conflictId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/admin') {
      return sendJson(res, 200, getAdminSnapshot(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance') {
      return sendJson(res, 200, listCompliance(context));
    }
    // ── Phase 2G: Compliance & Trust Center ────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/compliance/controls') {
      return sendJson(res, 200, listComplianceControls(context));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/compliance\/controls\/[^/]+$/)) {
      const controlId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateComplianceControl(context, controlId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/evidence') {
      return sendJson(res, 200, listComplianceEvidence(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/access-reviews') {
      return sendJson(res, 200, listAccessReviews(context));
    }
    if (req.method === 'POST' && url.pathname === '/api/compliance/access-reviews') {
      return handleJson(req, res, () => sendJson(res, 201, createAccessReview(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/compliance\/access-reviews\/[^/]+\/entries\/[^/]+$/)) {
      const parts = url.pathname.split('/');
      const reviewId = parts[4];
      const entryId = parts[6];
      return handleJson(req, res, () => sendJson(res, 200, reviewAccessEntry(context, reviewId, entryId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/risk-register') {
      return sendJson(res, 200, listRiskRegister(context));
    }
    if (req.method === 'POST' && url.pathname === '/api/compliance/risk-register') {
      return handleJson(req, res, () => sendJson(res, 201, createRiskEntry(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/compliance\/risk-register\/[^/]+$/)) {
      const riskId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateRiskEntry(context, riskId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/incidents') {
      return sendJson(res, 200, listIncidentRegister(context));
    }
    if (req.method === 'POST' && url.pathname === '/api/compliance/incidents') {
      return handleJson(req, res, () => sendJson(res, 201, createIncident(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/compliance\/incidents\/[^/]+$/)) {
      const incidentId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateIncident(context, incidentId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/vendor-register') {
      return sendJson(res, 200, listVendorIntegrationRegister(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/auth-config') {
      return sendJson(res, 200, listSsoConfigurations(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/backup-records') {
      return sendJson(res, 200, listBackupRecords(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/restore-tests') {
      return sendJson(res, 200, listRestoreTests(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/ai-governance') {
      return sendJson(res, 200, listAiGovernanceLogs(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/security-posture') {
      return sendJson(res, 200, getSecurityPosture(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/compliance/availability-posture') {
      return sendJson(res, 200, getAvailabilityPosture(context));
    }
    // ── End Phase 2G ────────────────────────────────────────────────────────────
    if (req.method === 'POST' && url.pathname.match(/^\/api\/exports\/[^/]+\/dispatch$/)) {
      const exportBatchId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, dispatchExport(context, exportBatchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/command-center') {
      return sendJson(res, 200, { bootstrap: listBootstrap(context), compliance: listCompliance(context) });
    }
    // ── Phase 1H: DeviceOps + Offline Sync ──────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/deviceops/summary') {
      return sendJson(res, 200, listDeviceOpsSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/devices') {
      return sendJson(res, 200, { devices: listDevices(context) });
    }
    if (req.method === 'POST' && url.pathname === '/api/devices') {
      return handleJson(req, res, () => sendJson(res, 201, createDevice(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/devices\/[^/]+$/) && !url.pathname.match(/\/(events|scan-events|trust|suspend|revoke)$/)) {
      const deviceId = url.pathname.split('/')[3];
      return sendJson(res, 200, getDeviceDetail(context, deviceId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/devices\/[^/]+$/)) {
      const deviceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, updateDevice(context, deviceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/devices\/[^/]+\/trust$/)) {
      const deviceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, trustDevice(context, deviceId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/devices\/[^/]+\/suspend$/)) {
      const deviceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, suspendDevice(context, deviceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/devices\/[^/]+\/revoke$/)) {
      const deviceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, revokeDevice(context, deviceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/devices\/[^/]+\/events$/)) {
      const deviceId = url.pathname.split('/')[3];
      return sendJson(res, 200, { events: listDeviceEvents(context, deviceId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/devices\/[^/]+\/scan-events$/)) {
      const deviceId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, recordScanEvent(context, deviceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname === '/api/deviceops/validate-scan') {
      return handleJson(req, res, () => sendJson(res, 200, validateScan(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/offline/summary') {
      return sendJson(res, 200, listOfflineSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/offline/batches') {
      return sendJson(res, 200, { batches: listOfflineBatches(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'POST' && url.pathname === '/api/offline/batches') {
      return handleJson(req, res, () => sendJson(res, 201, createOfflineBatch(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/offline\/batches\/[^/]+$/) && !url.pathname.match(/\/(upload|validate|replay|approve|reject)$/)) {
      const batchId = url.pathname.split('/')[4];
      return sendJson(res, 200, getOfflineBatchDetail(context, batchId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/batches\/[^/]+\/upload$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, uploadOfflineBatch(context, batchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/batches\/[^/]+\/validate$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, validateOfflineBatch(context, batchId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/batches\/[^/]+\/replay$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, replayOfflineBatch(context, batchId)), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/batches\/[^/]+\/approve$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveOfflineBatch(context, batchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/batches\/[^/]+\/reject$/)) {
      const batchId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectOfflineBatch(context, batchId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/offline/conflicts') {
      return sendJson(res, 200, { conflicts: listSyncConflictsNew(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/offline\/conflicts\/[^/]+$/) && !url.pathname.match(/\/(approve|reject)$/)) {
      const conflictId = url.pathname.split('/')[4];
      return sendJson(res, 200, getSyncConflictDetail(context, conflictId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/conflicts\/[^/]+\/approve$/)) {
      const conflictId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveSyncConflict(context, conflictId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/offline\/conflicts\/[^/]+\/reject$/)) {
      const conflictId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectSyncConflict(context, conflictId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method, requestId });
    }
    if (req.method === 'GET' && url.pathname === '/api/offline/tasks') {
      return sendJson(res, 200, { tasks: listOfflineTasks(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/offline\/tasks\/[^/]+$/)) {
      const taskId = url.pathname.split('/')[4];
      return sendJson(res, 200, getOfflineTaskDetail(context, taskId));
    }
    // ── AI Governance + Read-Only Intelligence ─────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/ai/summary') {
      return sendJson(res, 200, listAiSummary(context));
    }
    if (req.method === 'GET' && url.pathname === '/api/ai/agents') {
      return sendJson(res, 200, listAiAgents());
    }
    if (req.method === 'GET' && url.pathname === '/api/ai/recommendations') {
      return sendJson(res, 200, listAiRecommendations(context, Object.fromEntries(url.searchParams.entries())));
    }
    if (req.method === 'POST' && url.pathname === '/api/ai/recommendations/generate') {
      return handleJson(req, res, () => generateAiRecommendations(context, req.body || {}), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/ai\/recommendations\/[^/]+$/) && !url.pathname.endsWith('/dismiss') && !url.pathname.endsWith('/approve-placeholder')) {
      const recId = url.pathname.split('/')[4];
      return sendJson(res, 200, getAiRecommendationDetail(context, recId));
    }
    if ((req.method === 'PATCH' || req.method === 'POST') && url.pathname.match(/^\/api\/ai\/recommendations\/[^/]+\/dismiss$/)) {
      const recId = url.pathname.split('/')[4];
      return handleJson(req, res, () => dismissAiRecommendation(context, recId, req.body || {}), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/ai\/recommendations\/[^/]+\/approve-placeholder$/)) {
      const recId = url.pathname.split('/')[4];
      return handleJson(req, res, () => approveAiRecommendationPlaceholder(context, recId, req.body || {}), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname === '/api/ai/runs') {
      return sendJson(res, 200, listAiRuns(context, Object.fromEntries(url.searchParams.entries())));
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/ai\/runs\/[^/]+$/)) {
      const runId = url.pathname.split('/')[4];
      return sendJson(res, 200, getAiRunDetail(context, runId));
    }
    if (req.method === 'POST' && url.pathname === '/api/ai/copilot/query') {
      return handleJson(req, res, () => queryOpsCopilot(context, req.body || {}), { context, route: url.pathname, method: req.method });
    }
    // ── Phase 3I: Inventory Optimization Center ──────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/inventory-optimization/summary') {
      return sendJson(res, 200, { summary: getInventoryOptimizationSummary(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory-optimization/cycle-count-plans') {
      return sendJson(res, 200, { plans: listInventoryCycleCountPlans(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'POST' && url.pathname === '/api/inventory-optimization/cycle-count-plans') {
      return handleJson(req, res, () => sendJson(res, 201, createInventoryCycleCountPlan(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+$/) && !url.pathname.match(/\/(lines|sessions|schedule|start|cancel)$/)) {
      const planId = url.pathname.split('/')[4];
      return sendJson(res, 200, getInventoryCycleCountPlanDetail(context, planId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+$/)) {
      const planId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, updateInventoryCycleCountPlan(context, planId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+\/schedule$/)) {
      const planId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, scheduleInventoryCycleCountPlan(context, planId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+\/start$/)) {
      const planId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, startInventoryCycleCountPlan(context, planId)), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+\/cancel$/)) {
      const planId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, cancelInventoryCycleCountPlan(context, planId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+\/lines$/) && !url.pathname.match(/\/lines\/[^/]+$/)) {
      const planId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 201, addInventoryCycleCountPlanLine(context, planId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+\/lines\/[^/]+$/)) {
      const parts = url.pathname.split('/');
      const planId = parts[4];
      const lineId = parts[6];
      return handleJson(req, res, () => sendJson(res, 200, updateInventoryCycleCountPlanLine(context, planId, lineId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-plans\/[^/]+\/sessions$/)) {
      const planId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 201, createInventoryCountSession(context, planId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-sessions\/[^/]+$/) && !url.pathname.match(/\/(count-line|submit-review|approve|post)$/)) {
      const sessionId = url.pathname.split('/')[4];
      return sendJson(res, 200, getInventoryCountSessionDetail(context, sessionId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-sessions\/[^/]+\/count-line$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, recordCountSessionLine(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-sessions\/[^/]+\/submit-review$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, submitCountSessionForReview(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-sessions\/[^/]+\/approve$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveInventoryCountSession(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/cycle-count-sessions\/[^/]+\/post$/)) {
      const sessionId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, postInventoryCountSession(context, sessionId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory-optimization/variances') {
      return sendJson(res, 200, { variances: listInventoryVariances(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/inventory-optimization\/variances\/[^/]+$/) && !url.pathname.match(/\/(approve|reject|waive)$/)) {
      const varianceId = url.pathname.split('/')[4];
      return sendJson(res, 200, getInventoryVarianceDetail(context, varianceId));
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/variances\/[^/]+\/approve$/)) {
      const varianceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveInventoryVariance(context, varianceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/variances\/[^/]+\/reject$/)) {
      const varianceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectInventoryVariance(context, varianceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/variances\/[^/]+\/waive$/)) {
      const varianceId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, waiveInventoryVariance(context, varianceId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory-optimization/recommendations') {
      return sendJson(res, 200, { recommendations: listInventoryReplenishmentRecommendations(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'POST' && url.pathname === '/api/inventory-optimization/recommendations/generate') {
      return handleJson(req, res, () => sendJson(res, 200, generateInventoryReplenishmentRecommendations(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/recommendations\/[^/]+\/approve$/)) {
      const recId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveInventoryRecommendation(context, recId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/recommendations\/[^/]+\/dismiss$/)) {
      const recId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, dismissInventoryRecommendation(context, recId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/inventory-optimization\/recommendations\/[^/]+\/convert-to-request$/)) {
      const recId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, convertInventoryRecommendationToRequest(context, recId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory-optimization/classifications') {
      return sendJson(res, 200, { classifications: listInventoryClassifications(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'POST' && url.pathname === '/api/inventory-optimization/classifications/recalculate') {
      return handleJson(req, res, () => sendJson(res, 200, recalculateInventoryClassifications(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    // ── Phase 3J: Asset & Custody Center ─────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/assets/summary') {
      return sendJson(res, 200, { summary: getAssetCustodySummary(context) });
    }
    if (req.method === 'GET' && url.pathname === '/api/assets/maintenance') {
      return sendJson(res, 200, { cases: listAssetMaintenanceCases(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'GET' && url.pathname === '/api/assets/disposal-requests') {
      return sendJson(res, 200, { disposalRequests: listAssetDisposalRequests(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/disposal-requests\/[^/]+\/approve$/)) {
      const disposalId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, approveAssetDisposalRequest(context, disposalId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/disposal-requests\/[^/]+\/reject$/)) {
      const disposalId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, rejectAssetDisposalRequest(context, disposalId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/disposal-requests\/[^/]+\/post-disposal$/)) {
      const disposalId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, postAssetDisposal(context, disposalId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname === '/api/assets') {
      return sendJson(res, 200, { assets: listAssets(context, Object.fromEntries(url.searchParams.entries())) });
    }
    if (req.method === 'POST' && url.pathname === '/api/assets') {
      return handleJson(req, res, () => sendJson(res, 201, createAsset(context, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/assets\/[^/]+$/) && !url.pathname.match(/\/(timeline|assign|transfer-request|transfer-approve|return-request|return-accept|condition-report|report-damage|report-loss|quarantine|release-quarantine|maintenance|disposal-request|evidence)$/)) {
      const assetId = url.pathname.split('/')[3];
      return sendJson(res, 200, getAssetDetail(context, assetId));
    }
    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/assets\/[^/]+$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, updateAsset(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/assets\/[^/]+\/timeline$/)) {
      const assetId = url.pathname.split('/')[3];
      return sendJson(res, 200, { timeline: getAssetTimeline(context, assetId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/assign$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, assignAsset(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/transfer-request$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, createAssetTransferRequest(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/transfer-approve$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, approveAssetTransferRequest(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/return-request$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, createAssetReturnRequest(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/return-accept$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, acceptAssetReturn(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/condition-report$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, createAssetConditionReport(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/report-damage$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, reportAssetDamage(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/report-loss$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, reportAssetLoss(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/quarantine$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, quarantineAsset(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/release-quarantine$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 200, releaseAssetQuarantine(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/maintenance\/open$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, openAssetMaintenance(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/maintenance\/[^/]+\/close$/)) {
      const caseId = url.pathname.split('/')[4];
      return handleJson(req, res, () => sendJson(res, 200, closeAssetMaintenance(context, caseId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/disposal-request$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, createAssetDisposalRequest(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/assets\/[^/]+\/evidence$/)) {
      const assetId = url.pathname.split('/')[3];
      return sendJson(res, 200, { evidence: getAssetEvidence(context, assetId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/assets\/[^/]+\/evidence$/)) {
      const assetId = url.pathname.split('/')[3];
      return handleJson(req, res, () => sendJson(res, 201, addAssetEvidence(context, assetId, parseJsonBody(req.body))), { context, route: url.pathname, method: req.method });
    }
    // ── End Phase 3J ─────────────────────────────────────────────────────────

    // ── Phase 3K: OCR Provider + Review ──────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/ocr/status') {
      return sendJson(res, 200, { ocrStatus: getOcrProviderStatus(context) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/extraction-runs$/)) {
      const invoiceId = url.pathname.split('/')[4];
      return sendJson(res, 200, { runs: listOcrExtractionRuns(context, invoiceId) });
    }
    if (req.method === 'GET' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/extraction-runs\/[^/]+$/)) {
      const runId = url.pathname.split('/')[6];
      return sendJson(res, 200, { run: getOcrExtractionRunDetail(context, runId) });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/extraction-runs\/[^/]+\/accept$/)) {
      const runId = url.pathname.split('/')[6];
      return handleJson(req, res, () => sendJson(res, 200, { run: acceptOcrProposedFields(context, runId, parseJsonBody(req.body)) }), { context, route: url.pathname, method: req.method });
    }
    if (req.method === 'POST' && url.pathname.match(/^\/api\/procure-to-pay\/vendor-invoices\/[^/]+\/extraction-runs\/[^/]+\/reject$/)) {
      const runId = url.pathname.split('/')[6];
      return handleJson(req, res, () => sendJson(res, 200, { run: rejectOcrExtraction(context, runId, parseJsonBody(req.body)) }), { context, route: url.pathname, method: req.method });
    }
    // ── End Phase 3K ─────────────────────────────────────────────────────────
    // ── End Phase 3I ─────────────────────────────────────────────────────────
    if (serveStatic(req, res, url.pathname)) return;
    if (req.method === 'GET') return serveStatic(req, res, '/index.html');
    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendError(res, error, { context, route: url.pathname, method: req.method, requestId });
  }
}

async function handleJson(req, res, handler, { context, route, method, requestId } = {}) {
  const effectiveRequestId = requestId || res.getHeader('X-Request-Id') || randomUUID();
  try {
    req.body = await readBody(req);
    const result = handler();
    if (result && typeof result.then === 'function') {
      return result.then((value) => sendJson(res, 200, value)).catch((error) => sendError(res, error, { context, route, method, requestId: effectiveRequestId }));
    }
    if (!res.writableEnded) sendJson(res, 200, result);
  } catch (error) {
    sendError(res, error, { context, route, method, requestId: effectiveRequestId });
  }
}

export const server = createServer((req, res) => {
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    req.body = null;
  }
  const allowedOrigin = resolveAllowedOrigin(req.headers.origin);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id, X-CSRF-Token, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.writeHead(204);
      res.end();
      return;
    }
  }
  route(req, res);
});

export function start(port = Number(process.env.PORT || 9899)) {
  return new Promise((resolveServer) => {
    server.listen(port, () => resolveServer(server));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runStartupChecks();
  connectRedis().then((r) => {
    if (r) console.log('[redis] connected');
  });
  start().then(() => {
    console.log(`Opstrax SupplyOps running at http://localhost:${server.address().port}`);
  });
}
