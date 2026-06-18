import { createHash, createHmac } from 'node:crypto';
import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';
import { asBool, asJson, requireArray, requireEnum, requirePositiveInt, requireString, optionalString, fail } from './validation.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authMode, getAuthBootstrap, isLocalDemoEnabled, readSession } from './auth.js';
import {
  cancelReportRun as cancelReportRunAction,
  exportReportCsv as exportReportCsvAction,
  exportReportPdf as exportReportPdfAction,
  getReportRun as getReportRunAction,
  listReportDefinitions as listReportDefinitionsAction,
  listReportRuns as listReportRunsAction,
  listReportSummary as listReportSummaryAction,
  runReport as runReportAction
} from './reporting.js';
import {
  getInvOptSummary as getInvOptSummaryAction,
  listCycleCountPlans as listCycleCountPlansAction,
  createCycleCountPlan as createCycleCountPlanAction,
  getCycleCountPlanDetail as getCycleCountPlanDetailAction,
  updateCycleCountPlan as updateCycleCountPlanAction,
  scheduleCycleCountPlan as scheduleCycleCountPlanAction,
  startCycleCountPlan as startCycleCountPlanAction,
  cancelCycleCountPlan as cancelCycleCountPlanAction,
  addPlanLine as addPlanLineAction,
  updatePlanLine as updatePlanLineAction,
  createCountSession as createCountSessionAction,
  getCountSessionDetail as getCountSessionDetailAction,
  countSessionLine as countSessionLineAction,
  submitSessionForReview as submitSessionForReviewAction,
  approveCountSession as approveCountSessionAction,
  postCountSession as postCountSessionAction,
  listVariances as listVariancesAction,
  getVarianceDetail as getVarianceDetailAction,
  approveVariance as approveVarianceAction,
  rejectVariance as rejectVarianceAction,
  waiveVariance as waiveVarianceAction,
  listRecommendations as listRecommendationsAction,
  generateRecommendations as generateRecommendationsAction,
  approveRecommendation as approveRecommendationAction,
  dismissRecommendation as dismissRecommendationAction,
  convertRecommendationToRequest as convertRecommendationToRequestAction,
  listClassifications as listClassificationsAction,
  recalculateClassifications as recalculateClassificationsAction,
  buildAccuracySnapshot as buildAccuracySnapshotAction
} from './inventory-optimization.js';
import {
  getAssetCustodySummary as getAssetCustodySummaryAction,
  listAssets as listAssetsAction,
  createAsset as createAssetAction,
  getAssetDetail as getAssetDetailAction,
  updateAsset as updateAssetAction,
  getAssetTimeline as getAssetTimelineAction,
  assignAsset as assignAssetAction,
  createTransferRequest as createTransferRequestAction,
  approveTransferRequest as approveTransferRequestAction,
  createReturnRequest as createReturnRequestAction,
  acceptReturn as acceptReturnAction,
  createConditionReport as createConditionReportAction,
  reportDamage as reportDamageAction,
  reportLoss as reportLossAction,
  quarantineAsset as quarantineAssetAction,
  releaseQuarantine as releaseQuarantineAction,
  openMaintenance as openMaintenanceAction,
  closeMaintenance as closeMaintenanceAction,
  listMaintenanceCases as listMaintenanceCasesAction,
  listDisposalRequests as listDisposalRequestsAction,
  createDisposalRequest as createDisposalRequestAction,
  approveDisposalRequest as approveDisposalRequestAction,
  rejectDisposalRequest as rejectDisposalRequestAction,
  postDisposal as postDisposalAction,
  addAssetEvidence as addAssetEvidenceAction,
  getAssetEvidence as getAssetEvidenceAction
} from './asset-custody.js';
import {
  getPlatformOidcRuntimeSelection,
  getSessionRuntimeSelection,
  getTenantOidcRuntimeSelection
} from './runtime-config.js';
import { evidenceStorageStatus, getEvidenceStorageInfo, readEvidenceBinary, writeEvidenceBinary } from './evidence-storage.js';
import { extractWithLocal, extractWithProvider, getOcrProviderStatus as getOcrProviderStatusFromModule, getOcrRuntimeConfig } from './ocr-provider.js';

const evidenceAccessTtlSeconds = () => Math.max(60, Number(process.env.EVIDENCE_SIGNED_URL_TTL || process.env.OPSTRAX_EVIDENCE_SIGNED_URL_TTL || 900) || 900);
const evidenceSigningSecret = () => process.env.EVIDENCE_SIGNING_SECRET || process.env.OPSTRAX_EVIDENCE_SIGNING_SECRET || 'opstrax-local-evidence-signing-secret';

const roleCapabilities = {
  admin: ['view_dashboard', 'view_inventory', 'manage_inventory', 'manage_items', 'adjust_stock', 'view_stock_movements', 'view_restricted_items', 'manage_restricted_items', 'view_requests', 'create_request', 'submit_request', 'cancel_request', 'approve_request', 'reject_request', 'issue_request', 'view_warehouse_tasks', 'manage_warehouse_tasks', 'execute_warehouse_tasks', 'view_purchasing', 'view_purchase_orders', 'view_vendors', 'create_purchase_request', 'update_purchase_request', 'submit_purchase_request', 'approve_purchase_request', 'reject_purchase_request', 'cancel_purchase_request', 'create_purchase_order', 'update_purchase_order', 'approve_purchase_order', 'issue_purchase_order', 'cancel_purchase_order', 'manage_vendors', 'review_sync', 'manage_labels', 'manage_exports', 'view_audit', 'manage_admin'],
  supervisor: ['view_dashboard', 'view_inventory', 'manage_inventory', 'manage_items', 'adjust_stock', 'view_stock_movements', 'view_restricted_items', 'manage_restricted_items', 'view_requests', 'create_request', 'submit_request', 'cancel_request', 'approve_request', 'reject_request', 'issue_request', 'view_warehouse_tasks', 'manage_warehouse_tasks', 'execute_warehouse_tasks', 'view_purchasing', 'view_purchase_orders', 'view_vendors', 'create_purchase_request', 'update_purchase_request', 'submit_purchase_request', 'approve_purchase_request', 'reject_purchase_request', 'cancel_purchase_request', 'create_purchase_order', 'update_purchase_order', 'approve_purchase_order', 'issue_purchase_order', 'cancel_purchase_order', 'manage_vendors', 'review_sync', 'manage_labels', 'manage_exports', 'view_audit'],
  requester: ['view_dashboard', 'view_inventory', 'view_requests', 'create_request', 'submit_request', 'cancel_request', 'view_purchasing', 'view_purchase_orders', 'view_vendors', 'create_purchase_request', 'update_purchase_request', 'submit_purchase_request', 'cancel_purchase_request', 'view_audit'],
  worker: ['view_dashboard', 'view_inventory', 'view_requests', 'view_stock_movements', 'view_warehouse_tasks', 'execute_warehouse_tasks', 'manage_labels'],
  finance: ['view_dashboard', 'view_inventory', 'view_requests', 'view_stock_movements', 'view_warehouse_tasks', 'view_purchasing', 'view_purchase_orders', 'view_vendors', 'create_purchase_request', 'update_purchase_request', 'submit_purchase_request', 'approve_purchase_request', 'reject_purchase_request', 'cancel_purchase_request', 'create_purchase_order', 'update_purchase_order', 'approve_purchase_order', 'issue_purchase_order', 'cancel_purchase_order', 'manage_exports', 'view_audit']
};

roleCapabilities.supervisor.push('view_procure_to_pay', 'view_vendor_invoices', 'create_vendor_invoice', 'update_vendor_invoice', 'extract_vendor_invoice', 'match_vendor_invoice', 'waive_invoice_exception', 'approve_vendor_invoice', 'reject_vendor_invoice', 'mark_invoice_export_ready', 'export_vendor_invoice', 'view_rfq_requests', 'create_rfq_request', 'update_rfq_request', 'send_rfq_request', 'evaluate_rfq_request', 'award_rfq_request', 'cancel_rfq_request', 'view_vendor_quotes', 'create_vendor_quote', 'update_vendor_quote', 'submit_vendor_quote', 'shortlist_vendor_quote', 'award_vendor_quote', 'reject_vendor_quote', 'expire_vendor_quote', 'view_vendor_scorecards');
roleCapabilities.finance.push('view_procure_to_pay', 'view_vendor_invoices', 'create_vendor_invoice', 'update_vendor_invoice', 'extract_vendor_invoice', 'match_vendor_invoice', 'waive_invoice_exception', 'approve_vendor_invoice', 'reject_vendor_invoice', 'mark_invoice_export_ready', 'export_vendor_invoice', 'view_rfq_requests', 'view_vendor_quotes', 'view_vendor_scorecards');
roleCapabilities.admin.push('view_reports', 'run_reports');
roleCapabilities.supervisor.push('view_reports', 'run_reports');
roleCapabilities.finance.push('view_reports', 'run_reports');
roleCapabilities.requester.push('view_reports');
roleCapabilities.worker.push('view_reports');

roleCapabilities.admin.push('view_inventory_optimization', 'manage_cycle_counts', 'approve_variances', 'manage_replenishment', 'manage_classifications');
roleCapabilities.supervisor.push('view_inventory_optimization', 'manage_cycle_counts', 'approve_variances', 'manage_replenishment', 'manage_classifications');
roleCapabilities.requester.push('view_inventory_optimization');
roleCapabilities.worker.push('view_inventory_optimization', 'manage_cycle_counts');
roleCapabilities.finance.push('view_inventory_optimization');

roleCapabilities.admin.push('view_asset_custody', 'manage_asset_registry', 'manage_asset_custody', 'approve_asset_disposal', 'manage_asset_maintenance');
roleCapabilities.supervisor.push('view_asset_custody', 'manage_asset_registry', 'manage_asset_custody', 'approve_asset_disposal', 'manage_asset_maintenance');
roleCapabilities.requester.push('view_asset_custody');
roleCapabilities.worker.push('view_asset_custody', 'manage_asset_custody');
roleCapabilities.finance.push('view_asset_custody');

function rolePermissionRows(roleKey) {
  return selectAll(
    `SELECT p.key
     FROM role_permissions rp
     JOIN permissions p ON p.key = rp.permission_key
     WHERE rp.role_key = ? AND rp.enabled = 1 AND p.active = 1
     ORDER BY p.key`,
    [roleKey]
  ).map((row) => row.key);
}

function capabilitySet(roleKey) {
  const persisted = rolePermissionRows(roleKey);
  if (persisted.length > 0) return new Set(persisted);
  return new Set(roleCapabilities[roleKey] ?? []);
}

function featureSet(tenantId) {
  return new Set(
    selectAll('SELECT feature_key FROM tenant_features WHERE tenant_id = ? AND enabled = 1 ORDER BY feature_key', [tenantId]).map((row) => row.feature_key)
  );
}

function requireFeature(context, featureKey) {
  if (!featureSet(context.tenant.id).has(featureKey)) {
    throw fail(`Feature disabled: ${featureKey}`, 403);
  }
}

function requireInventoryRead(context) {
  requireFeature(context, 'inventory_control');
  requireCapability(context, 'view_inventory');
}

function requireInventoryWrite(context) {
  requireFeature(context, 'inventory_control');
  requireFeature(context, 'inventory_core_write');
}

function inventoryItemSelectSql({ includeRestricted = false, itemId = null, movementLimit = 100, adjustmentLimit = 50, auditLimit = 50 } = {}) {
  const restrictedClause = includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0';
  const itemFilterClause = itemId ? ' AND i.id = ?' : '';
  return {
    itemSql: `
      SELECT
        i.id,
        i.tenant_id,
        i.sku,
        i.name,
        COALESCE(ic.name, i.category) AS category,
        i.item_category_id,
        i.description,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        i.uom,
        i.barcode,
        i.item_type,
        i.status,
        COALESCE(i.controlled, i.restricted, 0) AS controlled,
        i.restricted,
        i.min_stock,
        i.max_stock,
        i.reorder_point,
        i.lot_required,
        i.serial_required,
        i.expiry_required,
        i.supplier,
        i.active,
        i.created_at,
        i.created_by_user_id,
        i.updated_at,
        i.updated_by_user_id,
        COALESCE(SUM(sb.on_hand), 0) AS on_hand,
        COALESCE(SUM(sb.reserved), 0) AS reserved,
        COALESCE(SUM(sb.available), 0) AS available,
        COUNT(DISTINCT sb.bin_id) AS bin_count,
        CASE WHEN COALESCE(SUM(sb.on_hand), 0) < COALESCE(NULLIF(i.min_stock, 0), i.min_qty) THEN 1 ELSE 0 END AS low_stock
      FROM items i
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
      WHERE i.tenant_id = ?${restrictedClause}${itemFilterClause}
      GROUP BY i.id
      ORDER BY low_stock DESC, i.name ASC
    `,
    itemParams: itemId ? [itemId] : [],
    movementSql: `
      SELECT
        sm.*,
        i.name AS item_name,
        i.sku,
        i.barcode,
        i.restricted AS item_restricted,
        i.controlled AS item_controlled,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf,
        u.name AS actor_name
      FROM stock_movements sm
      JOIN items i ON i.id = sm.item_id
      LEFT JOIN bins b ON b.id = sm.bin_id
      JOIN users u ON u.id = sm.performed_by_user_id
      WHERE sm.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}${itemId ? ' AND sm.item_id = ?' : ''}
      ORDER BY sm.created_at DESC, sm.id DESC
      LIMIT ${movementLimit}
    `,
    movementParams: itemId ? [itemId] : [],
    adjustmentSql: `
      SELECT
        sa.*,
        i.name AS item_name,
        i.sku,
        i.barcode,
        i.restricted AS item_restricted,
        i.controlled AS item_controlled,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf,
        u.name AS requester_name,
        rev.name AS reviewer_name,
        appr.name AS approver_name,
        post.name AS posted_by_name
      FROM stock_adjustments sa
      JOIN items i ON i.id = sa.item_id
      LEFT JOIN bins b ON b.id = sa.bin_id
      JOIN users u ON u.id = sa.requested_by_user_id
      LEFT JOIN users rev ON rev.id = sa.reviewed_by_user_id
      LEFT JOIN users appr ON appr.id = sa.approved_by_user_id
      LEFT JOIN users post ON post.id = sa.posted_by_user_id
      WHERE sa.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}${itemId ? ' AND sa.item_id = ?' : ''}
      ORDER BY sa.created_at DESC, sa.id DESC
      LIMIT ${adjustmentLimit}
    `,
    adjustmentParams: itemId ? [itemId] : [],
    auditSql: `
      SELECT a.*, u.name AS actor_name
      FROM audit_logs a
      JOIN users u ON u.id = a.actor_user_id
      WHERE a.tenant_id = ?${itemId ? " AND (a.entity_id = ? OR a.entity_type IN ('item', 'stock_adjustment', 'stock_movement'))" : ''}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ${auditLimit}
    `,
    auditParams: itemId ? [itemId] : []
  };
}

function safeFileName(name) {
  return String(name || 'document').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
}

function evidenceStorageMode() {
  return getEvidenceStorageInfo().mode;
}

function signEvidenceAccessToken(context, evidenceId, expiresAt) {
  const payload = `${context.tenant.id}:${evidenceId}:${expiresAt}`;
  const signature = createHmac('sha256', evidenceSigningSecret()).update(payload).digest('base64url');
  return Buffer.from(JSON.stringify({ tenantId: context.tenant.id, evidenceId, expiresAt, signature })).toString('base64url');
}

function verifyEvidenceAccessToken(token, tenantId, evidenceId) {
  if (!token) return { valid: false, reason: 'Missing signed access token' };
  try {
    const decoded = JSON.parse(Buffer.from(String(token), 'base64url').toString('utf8'));
    if (decoded.tenantId !== tenantId || decoded.evidenceId !== evidenceId) return { valid: false, reason: 'Token scope mismatch' };
    if (!decoded.expiresAt || Date.parse(decoded.expiresAt) < Date.now()) return { valid: false, reason: 'Token expired' };
    const payload = `${decoded.tenantId}:${decoded.evidenceId}:${decoded.expiresAt}`;
    const expected = createHmac('sha256', evidenceSigningSecret()).update(payload).digest('base64url');
    if (decoded.signature !== expected) return { valid: false, reason: 'Invalid signed access token' };
    return { valid: true, decoded };
  } catch {
    return { valid: false, reason: 'Invalid signed access token' };
  }
}

function buildEvidenceAccessUrl(context, evidenceId, expiresInSeconds = evidenceAccessTtlSeconds()) {
  const expiresAt = new Date(Date.now() + Math.max(60, expiresInSeconds) * 1000).toISOString();
  const token = signEvidenceAccessToken(context, evidenceId, expiresAt);
  return `/api/evidence/${evidenceId}/content?token=${encodeURIComponent(token)}`;
}

function headerValue(headers, key) {
  if (!headers) return '';
  if (typeof headers.get === 'function') return headers.get(key) || '';
  const lowered = key.toLowerCase();
  return headers[key] || headers[lowered] || headers[key.toUpperCase()] || '';
}

function ensureTenantUser(context, tenantId) {
  if (context.tenant.id !== tenantId) throw fail('Cross-tenant access denied', 403);
}

function assertDepartmentBelongsToTenant(tenantId, departmentId) {
  const department = selectOne('SELECT * FROM departments WHERE tenant_id = ? AND id = ?', [tenantId, departmentId]);
  if (!department) throw fail('Department not found for tenant', 404);
  return department;
}

function assertFacilityBelongsToTenant(tenantId, facilityId) {
  const facility = selectOne('SELECT * FROM facilities WHERE tenant_id = ? AND id = ?', [tenantId, facilityId]);
  if (!facility) throw fail('Facility not found for tenant', 404);
  return facility;
}

function requireCapability(context, capability) {
  if (!capabilitySet(context.user.role_key).has(capability)) {
    throw fail(`Missing capability: ${capability}`, 403);
  }
}

function requestScopeClause(context, alias = 'r') {
  if (context.user.role_key === 'admin' || context.user.role_key === 'supervisor' || context.user.role_key === 'finance') {
    return { sql: '', params: [] };
  }
  return { sql: ` AND ${alias}.department_id = ?`, params: [context.user.department_id] };
}

function privilegedRequestRoles(context) {
  return context.user.role_key === 'admin' || context.user.role_key === 'supervisor';
}

function loadRequestLine(context, requestId, lineId) {
  const request = loadRequest(context, requestId);
  const line = selectOne(
    'SELECT * FROM request_lines WHERE tenant_id = ? AND request_id = ? AND id = ?',
    [context.tenant.id, requestId, lineId]
  );
  if (!line) throw fail('Request line not found', 404);
  return { request, line };
}

function loadRequest(context, requestId) {
  requireFeature(context, 'internal_storefront');
  ensureTenantUser(context, context.tenant.id);
  const request = selectOne('SELECT * FROM internal_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, requestId]);
  if (!request) throw fail('Internal request not found', 404);
  const isPrivileged = context.user.role_key === 'admin' || context.user.role_key === 'supervisor';
  if (!isPrivileged && context.user.department_id !== request.department_id) {
    throw fail('Request not visible to this department', 403);
  }
  return request;
}

function insertAudit(context, payload) {
  insert('audit_logs', {
    id: newId('audit'),
    tenant_id: context.tenant.id,
    actor_user_id: context.user.id,
    actor_role: context.user.role_key,
    department_id: context.user.department_id,
    facility_id: context.user.facility_id,
    device_id: context.device?.id ?? null,
    action: payload.action,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    summary: payload.summary,
    before_json: JSON.stringify(payload.before ?? {}),
    after_json: JSON.stringify(payload.after ?? {}),
    request_id: payload.requestId ?? context.requestId ?? ''
  });
}

function userScopes(context, userId = context.user.id) {
  const rows = selectAll(
    `SELECT us.*, f.name AS facility_name, f.code AS facility_code, d.name AS department_name, d.code AS department_code
     FROM user_scopes us
     LEFT JOIN facilities f ON f.id = us.facility_id
     LEFT JOIN departments d ON d.id = us.department_id
     WHERE us.tenant_id = ? AND us.user_id = ? AND us.revoked_at IS NULL
     ORDER BY us.scope_type, us.created_at`,
    [context.tenant.id, userId]
  );
  if (rows.length > 0) {
    return rows;
  }
  return [
    {
      id: '',
      tenant_id: context.tenant.id,
      user_id: userId,
      facility_id: context.user.facility_id,
      facility_name: null,
      facility_code: null,
      department_id: context.user.department_id,
      department_name: null,
      department_code: null,
      scope_type: 'PRIMARY'
    }
  ];
}

function scopeSnapshot(context) {
  const scopes = userScopes(context);
  return {
    facilityScopes: scopes
      .filter((scope) => scope.facility_id)
      .map((scope) => ({
        id: scope.id,
        facility_id: scope.facility_id,
        facility_name: scope.facility_name,
        facility_code: scope.facility_code,
        scope_type: scope.scope_type
      })),
    departmentScopes: scopes
      .filter((scope) => scope.department_id)
      .map((scope) => ({
        id: scope.id,
        department_id: scope.department_id,
        department_name: scope.department_name,
        department_code: scope.department_code,
        scope_type: scope.scope_type
      }))
  };
}

function auditDenied(context, payload) {
  if (!context?.tenant?.id || !context?.user?.id) return;
  insertAudit(context, {
    action: 'DENIED_ROUTE_ACCESS',
    entityType: 'api_route',
    entityId: payload.route,
    summary: `${payload.method} ${payload.route} denied for ${payload.action || 'unknown action'}: ${payload.reason}`,
    after: {
      route: payload.route,
      method: payload.method,
      action: payload.action || '',
      reason: payload.reason,
      target: payload.target ?? ''
    },
    requestId: payload.requestId ?? context.requestId ?? ''
  });
}

function itemAvailabilitySql(context) {
  return `
    SELECT
      i.*,
      COALESCE(SUM(sb.on_hand), 0) AS on_hand,
      COALESCE(SUM(sb.reserved), 0) AS reserved,
      COALESCE(SUM(sb.available), 0) AS available,
      CASE WHEN COALESCE(SUM(sb.on_hand), 0) < i.min_qty THEN 1 ELSE 0 END AS low_stock
    FROM items i
    LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
    WHERE i.tenant_id = ?
    GROUP BY i.id
    ORDER BY low_stock DESC, i.name ASC
  `;
}

export function loadBootstrap(context) {
  ensureTenantUser(context, context.tenant.id);
  const capabilities = [...capabilitySet(context.user.role_key)];
  const features = [...featureSet(context.tenant.id)];
  const scopes = scopeSnapshot(context);
  const summary = getDashboardSummary(context);
  return {
    auth: getAuthBootstrap(),
    tenant: context.tenant,
    user: context.user,
    session: context.session ? {
      id: context.session.id,
      csrf_token: context.session.csrf_token,
      expires_at: context.session.expires_at,
      email: context.session.email,
      display_name: context.session.display_name
    } : null,
    capabilities,
    lookups: {
      tenants: selectAll('SELECT id, name, slug, industry FROM tenants ORDER BY name'),
      departments: selectAll('SELECT id, tenant_id, name, code FROM departments WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
      facilities: selectAll('SELECT id, tenant_id, name, code, city, state FROM facilities WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
      devices: selectAll('SELECT id, tenant_id, facility_id, name, device_type, trusted, last_seen_at FROM devices WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
      users: selectAll('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? AND active = 1 ORDER BY name', [context.tenant.id]),
      roles: selectAll('SELECT key, name, description FROM roles ORDER BY name'),
      permissions: selectAll('SELECT key, name, description FROM permissions WHERE active = 1 ORDER BY key')
    },
    features,
    scopes,
    summary
  };
}

export { loadBootstrap as listBootstrap };

export function getMe(context) {
  ensureTenantUser(context, context.tenant.id);
  const capabilities = [...capabilitySet(context.user.role_key)];
  const features = [...featureSet(context.tenant.id)];
  const scopes = scopeSnapshot(context);
  return {
    auth: {
      ...getAuthBootstrap(),
      mode: authMode(),
      authenticated: true
    },
    user: {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
      role_key: context.user.role_key,
      active: context.user.active
    },
    tenant: {
      id: context.tenant.id,
      name: context.tenant.name,
      slug: context.tenant.slug,
      status: context.tenant.status,
      tier: context.tenant.tier ?? 'full'
    },
    role: {
      key: context.user.role_key,
      capabilities
    },
    capabilities,
    permissions: [...capabilities],
    features,
    scopes,
    session: context.session ? {
      authenticated: true,
      provider: context.session.provider,
      expires_at: context.session.expires_at,
      mode: authMode()
    } : {
      authenticated: true,
      provider: 'dev-context',
      mode: authMode()
    }
  };
}

export function listUsers(context) {
  requireFeature(context, 'admin');
  requireCapability(context, 'manage_admin');
  ensureTenantUser(context, context.tenant.id);
  return selectAll('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? ORDER BY name', [context.tenant.id]);
}

export function listRoles(context) {
  ensureTenantUser(context, context.tenant.id);
  return selectAll('SELECT key, name, description FROM roles ORDER BY name');
}

export function listPermissions(context) {
  ensureTenantUser(context, context.tenant.id);
  return {
    permissions: selectAll('SELECT key, name, description, active FROM permissions WHERE active = 1 ORDER BY key'),
    rolePermissions: selectAll('SELECT role_key, permission_key, enabled FROM role_permissions WHERE enabled = 1 ORDER BY role_key, permission_key')
  };
}

export function listFacilities(context) {
  requireFeature(context, 'admin');
  requireCapability(context, 'manage_admin');
  ensureTenantUser(context, context.tenant.id);
  return selectAll('SELECT id, tenant_id, name, code, city, state FROM facilities WHERE tenant_id = ? ORDER BY name', [context.tenant.id]);
}

export function listDepartments(context) {
  requireFeature(context, 'admin');
  requireCapability(context, 'manage_admin');
  ensureTenantUser(context, context.tenant.id);
  return selectAll('SELECT id, tenant_id, name, code FROM departments WHERE tenant_id = ? ORDER BY name', [context.tenant.id]);
}

export function listDevices(context) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'view_devices');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `SELECT d.*, f.name AS facility_name, f.code AS facility_code, u.name AS assigned_user_name
     FROM devices d
     LEFT JOIN facilities f ON f.id = d.facility_id
     LEFT JOIN users u ON u.id = d.assigned_to_user_id
     WHERE d.tenant_id = ? ORDER BY d.name`,
    [context.tenant.id]
  );
}

export function listFeatureFlags(context) {
  ensureTenantUser(context, context.tenant.id);
  return {
    tenant: context.tenant,
    features: selectAll('SELECT feature_key, enabled, created_at FROM tenant_features WHERE tenant_id = ? ORDER BY feature_key', [context.tenant.id])
  };
}

export { auditDenied };

export function getDashboardSummary(context) {
  const tenantId = context.tenant.id;
  const [inventory, requests, purchases, sync, exports, audit, docs] = [
    selectAll('SELECT COUNT(*) AS value FROM items WHERE tenant_id = ?', [tenantId])[0].value,
    selectAll('SELECT COUNT(*) AS value FROM internal_requests WHERE tenant_id = ? AND status IN (\'SUBMITTED\', \'APPROVED\', \'PICKING\')', [tenantId])[0].value,
    selectAll('SELECT COUNT(*) AS value FROM purchase_requests WHERE tenant_id = ? AND status IN (\'DRAFT\', \'PENDING_APPROVAL\')', [tenantId])[0].value,
    selectAll('SELECT COUNT(*) AS value FROM sync_batches WHERE tenant_id = ? AND status = \'NEEDS_SUPERVISOR_REVIEW\'', [tenantId])[0].value,
    selectAll('SELECT COUNT(*) AS value FROM export_validation_errors WHERE tenant_id = ? AND resolved_at IS NULL', [tenantId])[0].value,
    selectAll('SELECT COUNT(*) AS value FROM audit_logs WHERE tenant_id = ? AND created_at >= datetime(\'now\', \'-7 days\')', [tenantId])[0].value,
    selectAll('SELECT COUNT(*) AS value FROM documents WHERE tenant_id = ?', [tenantId])[0].value
  ];
  const lowStock = selectAll('SELECT COUNT(*) AS value FROM (' + itemAvailabilitySql(context) + ') WHERE low_stock = 1', [tenantId])[0].value;
  return {
    kpis: {
      activeItems: inventory,
      lowStock,
      openRequests: requests,
      purchaseQueue: purchases,
      offlineBatches: sync,
      validationErrors: exports,
      auditEvents: audit,
      evidenceDocs: docs
    },
    compliance: {
      auditCoverage: audit > 0 ? 100 : 0,
      exportReady: exports === 0 ? 100 : Math.max(0, 100 - exports * 25),
      evidenceAttached: docs > 0 ? 100 : 0,
      offlineReviewQueue: sync
    }
  };
}

function inventoryAccessScope(context) {
  const includeRestricted = capabilitySet(context.user.role_key).has('view_restricted_items');
  return { includeRestricted };
}

function loadInventoryItem(context, itemId, { includeRestricted = false } = {}) {
  ensureTenantUser(context, context.tenant.id);
  const row = selectOne(
    `
      SELECT i.*, COALESCE(ic.name, i.category) AS category_name
      FROM items i
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      WHERE i.id = ?
    `,
    [itemId]
  );
  if (!row) throw fail('Item not found', 404);
  if (row.tenant_id !== context.tenant.id) throw fail('Cross-tenant access denied', 403);
  if (!includeRestricted && Number(row.controlled ?? row.restricted ?? 0) === 1) {
    throw fail('Restricted item not visible to this role', 403);
  }
  return row;
}

function itemWritePayload(body) {
  return {
    sku: requireString(body.sku, 'sku', { max: 80 }),
    name: requireString(body.name, 'name', { max: 140 }),
    categoryId: requireString(body.categoryId, 'categoryId', { max: 80 }),
    description: optionalString(body.description, 'description', { max: 240 }),
    unitOfMeasure: requireString(body.unitOfMeasure || body.uom, 'unitOfMeasure', { max: 30 }),
    itemType: requireEnum(body.itemType || 'SUPPLY', 'itemType', ['SUPPLY', 'CONSUMABLE', 'CONTROLLED', 'EQUIPMENT', 'SPARE', 'CHEMICAL', 'PPE']),
    status: requireEnum(body.status || 'ACTIVE', 'status', ['ACTIVE', 'HOLD', 'INACTIVE']),
    controlled: asBool(body.controlled),
    minStock: requirePositiveInt(body.minStock ?? body.minQty ?? 1, 'minStock', { max: 1000000 }),
    maxStock: requirePositiveInt(body.maxStock ?? body.maxQty ?? body.minStock ?? body.minQty ?? 1, 'maxStock', { max: 1000000 }),
    reorderPoint: requirePositiveInt(body.reorderPoint ?? body.minStock ?? body.minQty ?? 1, 'reorderPoint', { max: 1000000 }),
    lotRequired: asBool(body.lotRequired),
    serialRequired: asBool(body.serialRequired),
    expiryRequired: asBool(body.expiryRequired),
    supplier: requireString(body.supplier, 'supplier', { max: 160 })
  };
}

function attachAuditDiffs(context, auditId, before, after) {
  const fields = [
    'sku', 'name', 'category', 'description', 'unit_of_measure', 'item_type', 'status', 'controlled', 'min_stock', 'max_stock', 'reorder_point', 'lot_required', 'serial_required', 'expiry_required', 'supplier'
  ];
  for (const field of fields) {
    const beforeValue = before?.[field];
    const afterValue = after?.[field];
    if (String(beforeValue ?? '') === String(afterValue ?? '')) continue;
    insert('audit_event_diffs', {
      id: newId('audit_diff'),
      tenant_id: context.tenant.id,
      audit_event_id: auditId,
      field_name: field,
      before_value: beforeValue === undefined || beforeValue === null ? null : String(beforeValue),
      after_value: afterValue === undefined || afterValue === null ? null : String(afterValue)
    });
  }
}

function listInventoryItemRows(context, { includeRestricted = false } = {}) {
  const params = [context.tenant.id];
  const restrictedClause = includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0';
  return selectAll(
    `
      SELECT
        i.id,
        i.tenant_id,
        i.sku,
        i.name,
        COALESCE(ic.name, i.category) AS category,
        i.item_category_id,
        i.description,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        i.uom,
        i.barcode,
        i.item_type,
        i.status,
        COALESCE(i.controlled, i.restricted, 0) AS controlled,
        i.restricted,
        i.min_stock,
        i.max_stock,
        i.reorder_point,
        i.lot_required,
        i.serial_required,
        i.expiry_required,
        i.supplier,
        i.active,
        i.created_at,
        i.created_by_user_id,
        i.updated_at,
        i.updated_by_user_id,
        COALESCE(SUM(sb.on_hand), 0) AS on_hand,
        COALESCE(SUM(sb.reserved), 0) AS reserved,
        COALESCE(SUM(sb.available), 0) AS available,
        COUNT(DISTINCT sb.bin_id) AS bin_count,
        CASE WHEN COALESCE(SUM(sb.on_hand), 0) < COALESCE(NULLIF(i.min_stock, 0), i.min_qty) THEN 1 ELSE 0 END AS low_stock
      FROM items i
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
      WHERE i.tenant_id = ?${restrictedClause}
      GROUP BY i.id
      ORDER BY low_stock DESC, i.name ASC
    `,
    params
  );
}

export function listInventorySummary(context) {
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  const items = listInventoryItemRows(context, { includeRestricted });
  const balances = selectAll(
    `SELECT COUNT(*) AS count FROM stock_balances sb JOIN items i ON i.id = sb.item_id WHERE sb.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}`,
    [context.tenant.id]
  )[0].count;
  const categories = selectAll(
    `SELECT COUNT(*) AS count FROM item_categories WHERE tenant_id = ?`,
    [context.tenant.id]
  )[0].count;
  const movements = selectAll(
    `SELECT COUNT(*) AS count FROM stock_movements sm JOIN items i ON i.id = sm.item_id WHERE sm.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}`,
    [context.tenant.id]
  )[0].count;
  const adjustments = selectAll(
    `SELECT COUNT(*) AS count FROM stock_adjustments sa JOIN items i ON i.id = sa.item_id WHERE sa.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}`,
    [context.tenant.id]
  )[0].count;
  const bins = selectAll(
    `SELECT COUNT(*) AS count FROM bins WHERE tenant_id = ?`,
    [context.tenant.id]
  )[0].count;
  return {
    items: {
      total: items.length,
      lowStock: items.filter((item) => Number(item.low_stock) === 1).length,
      restricted: includeRestricted ? items.filter((item) => Number(item.controlled) === 1).length : 0,
      categories,
      bins,
      balances,
      movements,
      adjustments
    },
    readOnly: !featureSet(context.tenant.id).has('inventory_core_write')
  };
}

export function listItemCategories(context) {
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return selectAll(
    `
      SELECT
        ic.id,
        ic.tenant_id,
        ic.name,
        ic.code,
        ic.active,
        ic.created_at,
        ic.updated_at,
        SUM(CASE WHEN ${includeRestricted ? '1=1' : 'COALESCE(i.controlled, i.restricted, 0) = 0'} THEN 1 ELSE 0 END) AS item_count,
        SUM(CASE WHEN COALESCE(i.controlled, i.restricted, 0) = 1 THEN 1 ELSE 0 END) AS restricted_item_count
      FROM item_categories ic
      LEFT JOIN items i ON i.item_category_id = ic.id AND i.tenant_id = ic.tenant_id
      WHERE ic.tenant_id = ?
      GROUP BY ic.id
      ORDER BY ic.name
    `,
    [context.tenant.id]
  ).map((row) => ({
    ...row,
    restricted_item_count: includeRestricted ? Number(row.restricted_item_count || 0) : null
  }));
}

export function listInventoryItems(context) {
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return listInventoryItemRows(context, { includeRestricted });
}

export function getInventoryItemDetail(context, itemId) {
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  const item = loadInventoryItem(context, itemId, { includeRestricted });
  const balances = selectAll(
    `
      SELECT sb.*, b.code AS bin_code, b.zone AS bin_zone, b.shelf AS bin_shelf
      FROM stock_balances sb
      LEFT JOIN bins b ON b.id = sb.bin_id
      WHERE sb.tenant_id = ? AND sb.item_id = ?
      ORDER BY sb.available DESC, b.code ASC
    `,
    [context.tenant.id, itemId]
  );
  const movements = selectAll(
    `
      SELECT sm.*, b.code AS bin_code, b.zone AS bin_zone, b.shelf AS bin_shelf, u.name AS actor_name
      FROM stock_movements sm
      LEFT JOIN bins b ON b.id = sm.bin_id
      JOIN users u ON u.id = sm.performed_by_user_id
      WHERE sm.tenant_id = ? AND sm.item_id = ?
      ORDER BY sm.created_at DESC, sm.id DESC
      LIMIT 50
    `,
    [context.tenant.id, itemId]
  );
  const adjustments = selectAll(
    `
      SELECT sa.*, b.code AS bin_code, b.zone AS bin_zone, b.shelf AS bin_shelf, u.name AS requester_name, rev.name AS reviewer_name, appr.name AS approver_name, post.name AS posted_by_name
      FROM stock_adjustments sa
      LEFT JOIN bins b ON b.id = sa.bin_id
      JOIN users u ON u.id = sa.requested_by_user_id
      LEFT JOIN users rev ON rev.id = sa.reviewed_by_user_id
      LEFT JOIN users appr ON appr.id = sa.approved_by_user_id
      LEFT JOIN users post ON post.id = sa.posted_by_user_id
      WHERE sa.tenant_id = ? AND sa.item_id = ?
      ORDER BY sa.created_at DESC, sa.id DESC
      LIMIT 20
    `,
    [context.tenant.id, itemId]
  );
  const audit = selectAll(
    `
      SELECT a.*, u.name AS actor_name
      FROM audit_logs a
      JOIN users u ON u.id = a.actor_user_id
      WHERE a.tenant_id = ? AND ((a.entity_type = 'item' AND a.entity_id = ?) OR (a.entity_type IN ('stock_adjustment', 'stock_movement') AND (a.before_json LIKE ? OR a.after_json LIKE ? OR a.summary LIKE ?)))
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT 30
    `,
    [context.tenant.id, itemId, `%${itemId}%`, `%${itemId}%`, `%${itemId}%`]
  );
  const evidenceLinks = selectAll(
    `
      SELECT el.*, d.file_name, d.doc_type, d.visibility, u.name AS creator_name
      FROM evidence_links el
      JOIN documents d ON d.id = el.document_id
      LEFT JOIN users u ON u.id = el.created_by_user_id
      WHERE el.tenant_id = ? AND el.entity_type IN ('item', 'stock_adjustment') AND el.entity_id = ?
      ORDER BY el.created_at DESC
    `,
    [context.tenant.id, itemId]
  );
  return { item, balances, movements, adjustments, audit, evidenceLinks };
}

export function listInventoryBalances(context) {
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return selectAll(
    `
      SELECT
        sb.*,
        i.sku,
        i.name AS item_name,
        COALESCE(ic.name, i.category) AS category,
        i.item_category_id,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        i.barcode,
        i.restricted,
        i.controlled,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf
      FROM stock_balances sb
      JOIN items i ON i.id = sb.item_id
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN bins b ON b.id = sb.bin_id
      WHERE sb.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}
      ORDER BY i.name, b.code
    `,
    [context.tenant.id]
  );
}

export function listStockMovements(context) {
  requireCapability(context, 'view_stock_movements');
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return selectAll(
    `
      SELECT
        sm.*,
        i.sku,
        i.name AS item_name,
        COALESCE(ic.name, i.category) AS category,
        i.barcode,
        i.restricted,
        i.controlled,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf,
        u.name AS actor_name
      FROM stock_movements sm
      JOIN items i ON i.id = sm.item_id
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN bins b ON b.id = sm.bin_id
      JOIN users u ON u.id = sm.performed_by_user_id
      WHERE sm.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}
      ORDER BY sm.created_at DESC, sm.id DESC
      LIMIT 200
    `,
    [context.tenant.id]
  );
}

export function listStockAdjustments(context) {
  requireCapability(context, 'view_stock_movements');
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return selectAll(
    `
      SELECT
        sa.*,
        i.sku,
        i.name AS item_name,
        COALESCE(ic.name, i.category) AS category,
        i.barcode,
        i.restricted,
        i.controlled,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf,
        req.name AS requester_name,
        rev.name AS reviewer_name,
        appr.name AS approver_name,
        post.name AS posted_by_name
      FROM stock_adjustments sa
      JOIN items i ON i.id = sa.item_id
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN bins b ON b.id = sa.bin_id
      JOIN users req ON req.id = sa.requested_by_user_id
      LEFT JOIN users rev ON rev.id = sa.reviewed_by_user_id
      LEFT JOIN users appr ON appr.id = sa.approved_by_user_id
      LEFT JOIN users post ON post.id = sa.posted_by_user_id
      WHERE sa.tenant_id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}
      ORDER BY sa.created_at DESC, sa.id DESC
      LIMIT 200
    `,
    [context.tenant.id]
  );
}

export function listInventoryBins(context) {
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return selectAll(
    `
      SELECT
        b.*,
        f.name AS facility_name,
        COUNT(sb.id) AS stocked_item_count,
        COALESCE(SUM(sb.on_hand), 0) AS on_hand,
        COALESCE(SUM(sb.available), 0) AS available
      FROM bins b
      LEFT JOIN facilities f ON f.id = b.facility_id
      LEFT JOIN stock_balances sb ON sb.bin_id = b.id
      LEFT JOIN items i ON i.id = sb.item_id
      WHERE b.tenant_id = ?${includeRestricted ? '' : ' AND (i.id IS NULL OR COALESCE(i.controlled, i.restricted, 0) = 0)'}
      GROUP BY b.id
      ORDER BY f.name, b.code
    `,
    [context.tenant.id]
  );
}

export function listItems(context) {
  return listInventoryItems(context);
}

export function getItemDetail(context, itemId) {
  return getInventoryItemDetail(context, itemId);
}

export function createItem(context, body) {
  requireInventoryWrite(context);
  requireCapability(context, 'manage_items');
  const payload = itemWritePayload(body);
  const includeRestricted = payload.controlled || payload.itemType === 'CONTROLLED';
  if (includeRestricted && !capabilitySet(context.user.role_key).has('manage_restricted_items')) {
    throw fail('Missing capability: manage_restricted_items', 403);
  }
  if (payload.maxStock < payload.minStock) throw fail('maxStock must be greater than or equal to minStock');
  if (payload.reorderPoint > payload.maxStock) throw fail('reorderPoint cannot exceed maxStock');
  const category = selectOne('SELECT * FROM item_categories WHERE tenant_id = ? AND id = ?', [context.tenant.id, payload.categoryId]);
  if (!category) throw fail('Category not found', 404);
  const existing = selectOne('SELECT id FROM items WHERE tenant_id = ? AND sku = ?', [context.tenant.id, payload.sku]);
  if (existing) throw fail('SKU already exists for this tenant', 409);
  return transaction(() => {
    const item = {
      id: newId('item'),
      tenant_id: context.tenant.id,
      sku: payload.sku,
      name: payload.name,
      category: category.name,
      item_category_id: category.id,
      description: payload.description,
      uom: payload.unitOfMeasure,
      unit_of_measure: payload.unitOfMeasure,
      barcode: `${context.tenant.slug.toUpperCase()}-${payload.sku}`.slice(0, 80),
      item_type: payload.itemType,
      status: payload.status,
      controlled: payload.controlled ? 1 : 0,
      restricted: payload.controlled ? 1 : 0,
      min_qty: payload.minStock,
      max_qty: payload.maxStock,
      min_stock: payload.minStock,
      max_stock: payload.maxStock,
      reorder_point: payload.reorderPoint,
      lot_required: payload.lotRequired ? 1 : 0,
      serial_required: payload.serialRequired ? 1 : 0,
      expiry_required: payload.expiryRequired ? 1 : 0,
      supplier: payload.supplier,
      active: payload.status === 'INACTIVE' ? 0 : 1,
      created_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('items', item);
    const auditId = newId('audit');
    insert('audit_logs', {
      id: auditId,
      tenant_id: context.tenant.id,
      actor_user_id: context.user.id,
      actor_role: context.user.role_key,
      department_id: context.user.department_id,
      facility_id: context.user.facility_id,
      device_id: context.device?.id ?? null,
      action: 'CREATE_ITEM',
      entity_type: 'item',
      entity_id: item.id,
      summary: `${item.sku} created in ${category.name}`,
      before_json: JSON.stringify({}),
      after_json: JSON.stringify(item),
      request_id: context.requestId ?? ''
    });
    attachAuditDiffs(context, auditId, {}, item);
    return getInventoryItemDetail(context, item.id);
  });
}

export function updateItem(context, itemId, body) {
  requireInventoryWrite(context);
  requireCapability(context, 'manage_items');
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return transaction(() => {
    const current = loadInventoryItem(context, itemId, { includeRestricted });
    if (Number(current.controlled ?? current.restricted ?? 0) === 1 && !capabilitySet(context.user.role_key).has('manage_restricted_items')) {
      throw fail('Missing capability: manage_restricted_items', 403);
    }
    const next = {
      sku: optionalString(body.sku, 'sku', { max: 80 }) || current.sku,
      name: optionalString(body.name, 'name', { max: 140 }) || current.name,
      categoryId: optionalString(body.categoryId, 'categoryId', { max: 80 }) || current.item_category_id,
      description: body.description === undefined ? current.description : optionalString(body.description, 'description', { max: 240 }),
      unitOfMeasure: body.unitOfMeasure === undefined && body.uom === undefined ? (current.unit_of_measure || current.uom) : requireString(body.unitOfMeasure || body.uom, 'unitOfMeasure', { max: 30 }),
      itemType: body.itemType ? requireEnum(body.itemType, 'itemType', ['SUPPLY', 'CONSUMABLE', 'CONTROLLED', 'EQUIPMENT', 'SPARE', 'CHEMICAL', 'PPE']) : current.item_type,
      status: body.status ? requireEnum(body.status, 'status', ['ACTIVE', 'HOLD', 'INACTIVE']) : current.status,
      controlled: body.controlled === undefined ? Number(current.controlled ?? current.restricted ?? 0) === 1 : asBool(body.controlled),
      minStock: body.minStock === undefined && body.minQty === undefined ? Number(current.min_stock ?? current.min_qty ?? 0) : requirePositiveInt(body.minStock ?? body.minQty, 'minStock', { max: 1000000 }),
      maxStock: body.maxStock === undefined && body.maxQty === undefined ? Number(current.max_stock ?? current.max_qty ?? 0) : requirePositiveInt(body.maxStock ?? body.maxQty, 'maxStock', { max: 1000000 }),
      reorderPoint: body.reorderPoint === undefined ? Number(current.reorder_point ?? current.min_stock ?? current.min_qty ?? 0) : requirePositiveInt(body.reorderPoint, 'reorderPoint', { max: 1000000 }),
      lotRequired: body.lotRequired === undefined ? Number(current.lot_required ?? 0) === 1 : asBool(body.lotRequired),
      serialRequired: body.serialRequired === undefined ? Number(current.serial_required ?? 0) === 1 : asBool(body.serialRequired),
      expiryRequired: body.expiryRequired === undefined ? Number(current.expiry_required ?? 0) === 1 : asBool(body.expiryRequired),
      supplier: body.supplier === undefined ? current.supplier : requireString(body.supplier, 'supplier', { max: 160 })
    };
    if (next.maxStock < next.minStock) throw fail('maxStock must be greater than or equal to minStock');
    if (next.reorderPoint > next.maxStock) throw fail('reorderPoint cannot exceed maxStock');
    const category = selectOne('SELECT * FROM item_categories WHERE tenant_id = ? AND id = ?', [context.tenant.id, next.categoryId]);
    if (!category) throw fail('Category not found', 404);
    if (next.controlled && !capabilitySet(context.user.role_key).has('manage_restricted_items')) {
      throw fail('Missing capability: manage_restricted_items', 403);
    }
    const duplicate = selectOne('SELECT id FROM items WHERE tenant_id = ? AND sku = ? AND id != ?', [context.tenant.id, next.sku, itemId]);
    if (duplicate) throw fail('SKU already exists for this tenant', 409);
    const updatedAt = nowIso();
    execute(
      `
        UPDATE items
        SET sku = ?, name = ?, category = ?, item_category_id = ?, description = ?, uom = ?, unit_of_measure = ?, item_type = ?, status = ?, controlled = ?, restricted = ?, min_qty = ?, max_qty = ?, min_stock = ?, max_stock = ?, reorder_point = ?, lot_required = ?, serial_required = ?, expiry_required = ?, supplier = ?, active = ?, updated_at = ?, updated_by_user_id = ?
        WHERE tenant_id = ? AND id = ?
      `,
      [
        next.sku,
        next.name,
        category.name,
        category.id,
        next.description,
        next.unitOfMeasure,
        next.unitOfMeasure,
        next.itemType,
        next.status,
        next.controlled ? 1 : 0,
        next.controlled ? 1 : 0,
        next.minStock,
        next.maxStock,
        next.minStock,
        next.maxStock,
        next.reorderPoint,
        next.lotRequired ? 1 : 0,
        next.serialRequired ? 1 : 0,
        next.expiryRequired ? 1 : 0,
        next.supplier,
        next.status === 'INACTIVE' ? 0 : 1,
        updatedAt,
        context.user.id,
        context.tenant.id,
        itemId
      ]
    );
    const after = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, itemId]);
    const auditId = newId('audit');
    insert('audit_logs', {
      id: auditId,
      tenant_id: context.tenant.id,
      actor_user_id: context.user.id,
      actor_role: context.user.role_key,
      department_id: context.user.department_id,
      facility_id: context.user.facility_id,
      device_id: context.device?.id ?? null,
      action: current.status !== after.status ? 'UPDATE_ITEM_STATUS' : 'UPDATE_ITEM',
      entity_type: 'item',
      entity_id: itemId,
      summary: `${after.sku} updated${current.status !== after.status ? ` (${current.status} → ${after.status})` : ''}`,
      before_json: JSON.stringify(current),
      after_json: JSON.stringify(after),
      request_id: context.requestId ?? ''
    });
    attachAuditDiffs(context, auditId, current, after);
    return getInventoryItemDetail(context, itemId);
  });
}

export function createStockAdjustment(context, body) {
  requireInventoryWrite(context);
  requireCapability(context, 'adjust_stock');
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  return transaction(() => {
    const item = loadInventoryItem(context, requireString(body.itemId, 'itemId', { max: 80 }), { includeRestricted });
    if (Number(item.controlled ?? item.restricted ?? 0) === 1 && !capabilitySet(context.user.role_key).has('manage_restricted_items')) {
      throw fail('Missing capability: manage_restricted_items', 403);
    }
    const delta = Number(body.quantityDelta);
    if (!Number.isInteger(delta) || delta === 0) throw fail('quantityDelta must be a non-zero integer');
    const reason = requireString(body.reason, 'reason', { max: 240 });
    const binId = body.binId ? requireString(body.binId, 'binId', { max: 80 }) : '';
    const evidenceDocumentId = body.evidenceDocumentId ? requireString(body.evidenceDocumentId, 'evidenceDocumentId', { max: 80 }) : '';
    const lotNo = optionalString(body.lotNo, 'lotNo', { max: 80 });
    const serialNo = optionalString(body.serialNo, 'serialNo', { max: 80 });
    const expiryDate = optionalString(body.expiryDate, 'expiryDate', { max: 40 });
    const referenceType = optionalString(body.referenceType, 'referenceType', { max: 80 }) || 'manual_adjustment';
    const referenceId = optionalString(body.referenceId, 'referenceId', { max: 80 }) || '';
    let balance = null;
    let createBalance = false;
    if (binId) {
      const bin = selectOne('SELECT * FROM bins WHERE tenant_id = ? AND id = ?', [context.tenant.id, binId]);
      if (!bin) throw fail('Bin not found', 404);
      balance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, item.id, binId]);
      if (!balance) {
        balance = { tenant_id: context.tenant.id, item_id: item.id, facility_id: bin.facility_id, bin_id: bin.id, on_hand: 0, reserved: 0, available: 0, id: null };
        createBalance = true;
      }
    } else {
      balance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, item.id]);
      if (!balance) {
        const fallbackBin = selectOne('SELECT * FROM bins WHERE tenant_id = ? AND facility_id = ? ORDER BY code LIMIT 1', [context.tenant.id, context.user.facility_id]);
        if (!fallbackBin) throw fail('No eligible bin available for stock adjustment', 409);
        balance = { tenant_id: context.tenant.id, item_id: item.id, facility_id: fallbackBin.facility_id, bin_id: fallbackBin.id, on_hand: 0, reserved: 0, available: 0, id: null };
        createBalance = true;
      }
    }
    const beforeQuantity = Number(balance.on_hand || 0);
    const afterQuantity = beforeQuantity + delta;
    if (afterQuantity < 0) throw fail('Stock adjustment would drive on-hand below zero', 409);
    const facilityId = balance.facility_id || context.user.facility_id;
    if (afterQuantity > 0 && createBalance) {
      insert('stock_balances', {
        id: newId('stock'),
        tenant_id: context.tenant.id,
        item_id: item.id,
        facility_id: facilityId,
        bin_id: balance.bin_id,
        on_hand: afterQuantity,
        reserved: 0,
        available: afterQuantity,
        updated_at: nowIso()
      });
    } else if (balance.id) {
      execute(
        'UPDATE stock_balances SET on_hand = ?, available = ?, updated_at = ? WHERE id = ?',
        [afterQuantity, Math.max(0, afterQuantity - Number(balance.reserved || 0)), nowIso(), balance.id]
      );
    }
    const adjustmentId = newId('adjustment');
    const status = 'POSTED';
    const postedAt = nowIso();
    const adjustment = {
      id: adjustmentId,
      tenant_id: context.tenant.id,
      item_id: item.id,
      facility_id: facilityId,
      bin_id: balance.bin_id,
      reason,
      quantity_delta: delta,
      status,
      requested_by_user_id: context.user.id,
      reviewed_by_user_id: null,
      approved_by_user_id: null,
      evidence_document_id: evidenceDocumentId || null,
      before_quantity: beforeQuantity,
      after_quantity: afterQuantity,
      lot_no: lotNo,
      serial_no: serialNo,
      expiry_date: expiryDate || null,
      posted_at: postedAt,
      posted_by_user_id: context.user.id,
      movement_id: null,
      status_note: body.statusNote ? requireString(body.statusNote, 'statusNote', { max: 160 }) : ''
    };
    insert('stock_adjustments', adjustment);
    const movementId = newId('movement');
    insert('stock_movements', {
      id: movementId,
      tenant_id: context.tenant.id,
      item_id: item.id,
      facility_id: facilityId,
      bin_id: balance.bin_id,
      movement_type: 'ADJUSTMENT',
      quantity: delta,
      reason,
      before_quantity: beforeQuantity,
      after_quantity: afterQuantity,
      reference_type: referenceType,
      reference_id: referenceId || adjustmentId,
      performed_by_user_id: context.user.id,
      department_id: context.user.department_id,
      note: reason,
      status,
      lot_no: lotNo,
      serial_no: serialNo,
      expiry_date: expiryDate || null,
      evidence_document_id: evidenceDocumentId || null,
      adjustment_id: adjustmentId,
      posted_by_user_id: context.user.id,
      posted_at: postedAt
    });
    execute('UPDATE stock_adjustments SET movement_id = ? WHERE id = ? AND tenant_id = ?', [movementId, adjustmentId, context.tenant.id]);
    if (evidenceDocumentId) {
      const document = selectOne('SELECT * FROM documents WHERE tenant_id = ? AND id = ?', [context.tenant.id, evidenceDocumentId]);
      if (!document) throw fail('Evidence document not found', 404);
      execute('UPDATE warehouse_tasks SET evidence_document_id = COALESCE(evidence_document_id, ?), last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [evidenceDocumentId, context.user.id, now, context.user.id, context.tenant.id, taskId]);
      insert('evidence_links', {
        id: newId('evidence_link'),
        tenant_id: context.tenant.id,
        document_id: evidenceDocumentId,
        entity_type: 'stock_adjustment',
        entity_id: adjustmentId,
        link_type: 'ADJUSTMENT_EVIDENCE',
        created_at: nowIso(),
        created_by_user_id: context.user.id
      });
    }
    const auditId = newId('audit');
    insert('audit_logs', {
      id: auditId,
      tenant_id: context.tenant.id,
      actor_user_id: context.user.id,
      actor_role: context.user.role_key,
      department_id: context.user.department_id,
      facility_id: context.user.facility_id,
      device_id: context.device?.id ?? null,
      action: 'POST_STOCK_ADJUSTMENT',
      entity_type: 'stock_adjustment',
      entity_id: adjustmentId,
      summary: `${item.sku} adjusted by ${delta > 0 ? '+' : ''}${delta} (${beforeQuantity} → ${afterQuantity})`,
      before_json: JSON.stringify({ before_quantity: beforeQuantity, after_quantity: beforeQuantity, item_id: item.id }),
      after_json: JSON.stringify({ ...adjustment, movement_id: movementId }),
      request_id: context.requestId ?? ''
    });
    insert('audit_event_diffs', {
      id: newId('audit_diff'),
      tenant_id: context.tenant.id,
      audit_event_id: auditId,
      field_name: 'quantity_delta',
      before_value: String(beforeQuantity),
      after_value: String(afterQuantity),
      created_at: nowIso()
    });
    return getInventoryAdjustmentDetail(context, adjustmentId);
  });
}

export function getInventoryAdjustmentDetail(context, adjustmentId) {
  requireCapability(context, 'view_stock_movements');
  requireInventoryRead(context);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  const adjustment = selectOne(
    `
      SELECT
        sa.*,
        i.sku,
        i.name AS item_name,
        COALESCE(ic.name, i.category) AS category,
        i.barcode,
        i.restricted,
        i.controlled,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf,
        req.name AS requester_name,
        rev.name AS reviewer_name,
        appr.name AS approver_name,
        post.name AS posted_by_name
      FROM stock_adjustments sa
      JOIN items i ON i.id = sa.item_id
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN bins b ON b.id = sa.bin_id
      JOIN users req ON req.id = sa.requested_by_user_id
      LEFT JOIN users rev ON rev.id = sa.reviewed_by_user_id
      LEFT JOIN users appr ON appr.id = sa.approved_by_user_id
      LEFT JOIN users post ON post.id = sa.posted_by_user_id
      WHERE sa.tenant_id = ? AND sa.id = ?${includeRestricted ? '' : ' AND COALESCE(i.controlled, i.restricted, 0) = 0'}
    `,
    [context.tenant.id, adjustmentId]
  );
  if (!adjustment) throw fail('Stock adjustment not found', 404);
  return adjustment;
}

export function listInternalRequests(context) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'view_requests');
  ensureTenantUser(context, context.tenant.id);
  const scope = requestScopeClause(context, 'r');
  return selectAll(
    `
      SELECT
        r.*,
        d.name AS department_name,
        u.name AS requester_name,
        f.name AS facility_name,
        COUNT(rl.id) AS line_count,
        COALESCE(SUM(CASE WHEN rl.status = 'ISSUED' THEN 1 ELSE 0 END), 0) AS issued_line_count
      FROM internal_requests r
      JOIN departments d ON d.id = r.department_id
      JOIN users u ON u.id = r.requested_by_user_id
      JOIN facilities f ON f.id = r.facility_id
      LEFT JOIN request_lines rl ON rl.request_id = r.id AND rl.tenant_id = r.tenant_id
      WHERE r.tenant_id = ? ${scope.sql}
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function getRequestDetail(context, requestId) {
  requireCapability(context, 'view_requests');
  const request = selectOne(
    `
      SELECT
        r.*,
        d.name AS department_name,
        d.code AS department_code,
        u.name AS requester_name,
        u.email AS requester_email,
        f.name AS facility_name,
        f.code AS facility_code
      FROM internal_requests r
      JOIN departments d ON d.id = r.department_id
      JOIN users u ON u.id = r.requested_by_user_id
      JOIN facilities f ON f.id = r.facility_id
      WHERE r.tenant_id = ? AND r.id = ?
    `,
    [context.tenant.id, requestId]
  );
  if (!request) throw fail('Internal request not found', 404);
  const scoped = loadRequest(context, requestId);
  const lines = selectAll(
    `SELECT rl.*, i.name AS item_name, i.barcode, i.category
     FROM request_lines rl
     JOIN items i ON i.id = rl.item_id
     WHERE rl.tenant_id = ? AND rl.request_id = ?
     ORDER BY rl.id`,
    [context.tenant.id, requestId]
  );
  return { request: { ...scoped, ...request }, lines };
}

export function createInternalRequest(context, body) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'create_request');
  const payload = body;
  const reason = requireString(payload.reason ?? payload.purpose, 'reason', { max: 220 });
  const priority = requireEnum(payload.priority ?? 'NORMAL', 'priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']);
  const neededByDate = optionalString(payload.neededByDate, 'neededByDate', { max: 40 });
  const lines = requireArray(payload.lines, 'lines').map((line, index) => ({
    itemId: requireString(line.itemId, `lines[${index}].itemId`, { max: 80 }),
    qty: requirePositiveInt(line.qty, `lines[${index}].qty`, { max: 100000 })
  }));
  const departmentId = requireString(payload.departmentId ?? context.user.department_id, 'departmentId', { max: 80 });
  const facilityId = requireString(payload.facilityId ?? context.user.facility_id, 'facilityId', { max: 80 });
  ensureTenantUser(context, context.tenant.id);
  assertDepartmentBelongsToTenant(context.tenant.id, departmentId);
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);
  const isPrivileged = context.user.role_key === 'admin' || context.user.role_key === 'supervisor';
  if (!isPrivileged && (departmentId !== context.user.department_id || facilityId !== context.user.facility_id)) {
    throw fail('Request scope must match the current user scope', 403);
  }

  return transaction(() => {
    const request = {
      id: newId('request'),
      tenant_id: context.tenant.id,
      request_no: `REQ-${Math.floor(Date.now() / 1000).toString().slice(-4)}`,
      department_id: departmentId,
      facility_id: facilityId,
      requested_by_user_id: context.user.id,
      purpose: reason,
      reason,
      priority,
      needed_by_date: neededByDate || null,
      status: 'DRAFT',
      approved_at: null,
      approved_by_user_id: null,
      issued_at: null,
      issued_by_user_id: null,
      submitted_at: null,
      submitted_by_user_id: null,
      canceled_at: null,
      canceled_by_user_id: null,
      cancel_reason: '',
      issue_ready_at: null,
      issue_ready_by_user_id: null,
      rejected_at: null,
      rejected_by_user_id: null,
      rejection_reason: '',
      closed_at: null,
      closed_by_user_id: null,
      audit_ref: ''
    };
    insert('internal_requests', request);
    for (const [lineIndex, line] of lines.entries()) {
      const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, line.itemId]);
      if (!item) throw fail(`Item not found: ${line.itemId}`, 404);
      if (Number(item.controlled ?? item.restricted ?? 0) === 1 && !capabilitySet(context.user.role_key).has('view_restricted_items')) {
        throw fail('Restricted item not visible to this requester', 403);
      }
      insert('request_lines', {
        id: newId('request_line'),
        tenant_id: context.tenant.id,
        request_id: request.id,
        item_id: item.id,
        qty_requested: line.qty,
        qty_issued: 0,
        status: 'DRAFT'
      });
    }
    insertAudit(context, {
      action: 'CREATE_INTERNAL_REQUEST',
      entityType: 'internal_request',
      entityId: request.id,
      summary: `${request.request_no} created for ${reason}`,
      after: request
    });
    return getRequestDetail(context, request.id);
  });
}

export function listAvailableRequestItems(context) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'create_request');
  ensureTenantUser(context, context.tenant.id);
  const includeRestricted = inventoryAccessScope(context).includeRestricted;
  const privileged = privilegedRequestRoles(context);
  const facilityId = privileged
    ? requireString((context.query?.facilityId ?? context.user.facility_id), 'facilityId', { max: 80 })
    : context.user.facility_id;
  if (!privileged && facilityId !== context.user.facility_id) {
    throw fail('Request items are scoped to the current facility', 403);
  }
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);
  const rows = selectAll(
    `
      SELECT
        i.id,
        i.sku,
        i.barcode,
        i.name,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        COALESCE(ic.name, i.category) AS category,
        i.item_category_id,
        COALESCE(i.controlled, i.restricted, 0) AS controlled,
        i.restricted,
        i.min_stock,
        i.max_stock,
        i.reorder_point,
        i.status,
        COALESCE(SUM(sb.on_hand), 0) AS on_hand,
        COALESCE(SUM(sb.reserved), 0) AS reserved,
        COALESCE(SUM(sb.available), 0) AS available_balance,
        CASE
          WHEN COALESCE(SUM(sb.available), 0) <= COALESCE(NULLIF(i.reorder_point, 0), NULLIF(i.min_stock, 0), i.min_qty) THEN 1
          ELSE 0
        END AS low_stock
      FROM items i
      LEFT JOIN item_categories ic ON ic.id = i.item_category_id
      LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id AND sb.facility_id = ?
      WHERE i.tenant_id = ?
        AND i.active = 1
        AND i.status != 'INACTIVE'
        AND (${includeRestricted ? '1=1' : 'COALESCE(i.controlled, i.restricted, 0) = 0'})
      GROUP BY i.id
      ORDER BY low_stock DESC, i.name ASC
    `,
    [facilityId, context.tenant.id]
  );
  return { facility_id: facilityId, items: rows };
}

export function updateInternalRequest(context, requestId, body) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'create_request');
  return transaction(() => {
    const request = loadRequest(context, requestId);
    if (request.status !== 'DRAFT') throw fail('Request can only be edited while it is a draft', 409);
    const privileged = privilegedRequestRoles(context);
    if (!privileged && request.requested_by_user_id !== context.user.id) {
      throw fail('Only the request owner can edit this draft', 403);
    }
    const nextPriority = body.priority === undefined ? request.priority : requireEnum(body.priority, 'priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']);
    const nextReason = body.reason === undefined && body.purpose === undefined ? request.reason || request.purpose : requireString(body.reason ?? body.purpose, 'reason', { max: 220 });
    const nextNeededByDate = body.neededByDate === undefined ? request.needed_by_date : optionalString(body.neededByDate, 'neededByDate', { max: 40 }) || null;
    const nextDepartmentId = body.departmentId === undefined ? request.department_id : requireString(body.departmentId, 'departmentId', { max: 80 });
    const nextFacilityId = body.facilityId === undefined ? request.facility_id : requireString(body.facilityId, 'facilityId', { max: 80 });
    assertDepartmentBelongsToTenant(context.tenant.id, nextDepartmentId);
    assertFacilityBelongsToTenant(context.tenant.id, nextFacilityId);
    if (!privileged && (nextDepartmentId !== context.user.department_id || nextFacilityId !== context.user.facility_id)) {
      throw fail('Request scope must match the current user scope', 403);
    }
    execute(
      `
        UPDATE internal_requests
        SET priority = ?, reason = ?, purpose = ?, needed_by_date = ?, department_id = ?, facility_id = ?
        WHERE tenant_id = ? AND id = ? AND status = 'DRAFT'
      `,
      [nextPriority, nextReason, nextReason, nextNeededByDate, nextDepartmentId, nextFacilityId, context.tenant.id, requestId]
    );
    const updated = loadRequest(context, requestId);
    insertAudit(context, {
      action: 'UPDATE_INTERNAL_REQUEST',
      entityType: 'internal_request',
      entityId: requestId,
      summary: `${request.request_no} updated`,
      before: request,
      after: updated
    });
    return getRequestDetail(context, requestId);
  });
}

export function listRequestLines(context, requestId) {
  requireCapability(context, 'view_requests');
  const request = loadRequest(context, requestId);
  return selectAll(
    `
      SELECT rl.*, i.sku, i.name AS item_name, i.category, COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure, i.restricted, i.controlled
      FROM request_lines rl
      JOIN items i ON i.id = rl.item_id
      WHERE rl.tenant_id = ? AND rl.request_id = ?
      ORDER BY rl.id
    `,
    [context.tenant.id, request.id]
  );
}

function assertDraftRequestEditable(context, request) {
  if (request.status !== 'DRAFT') throw fail('Request lines can only be edited while the request is a draft', 409);
  if (!privilegedRequestRoles(context) && request.requested_by_user_id !== context.user.id) {
    throw fail('Only the request owner can edit this draft', 403);
  }
}

export function createRequestLine(context, requestId, body) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'create_request');
  return transaction(() => {
    const request = loadRequest(context, requestId);
    assertDraftRequestEditable(context, request);
    const itemId = requireString(body.itemId, 'itemId', { max: 80 });
    const qty = requirePositiveInt(body.qty, 'qty', { max: 100000 });
    const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, itemId]);
    if (!item) throw fail('Item not found', 404);
    if (Number(item.controlled ?? item.restricted ?? 0) === 1 && !capabilitySet(context.user.role_key).has('view_restricted_items')) {
      throw fail('Restricted item not visible to this requester', 403);
    }
    const line = {
      id: newId('request_line'),
      tenant_id: context.tenant.id,
      request_id: request.id,
      item_id: item.id,
      qty_requested: qty,
      qty_issued: 0,
      status: 'DRAFT'
    };
    insert('request_lines', line);
    insertAudit(context, {
      action: 'CREATE_REQUEST_LINE',
      entityType: 'request_line',
      entityId: line.id,
      summary: `${request.request_no} line added: ${item.sku} x ${qty}`,
      before: {},
      after: line
    });
    return listRequestLines(context, request.id);
  });
}

export function updateRequestLine(context, requestId, lineId, body) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'create_request');
  return transaction(() => {
    const { request, line } = loadRequestLine(context, requestId, lineId);
    assertDraftRequestEditable(context, request);
    const nextItemId = body.itemId === undefined ? line.item_id : requireString(body.itemId, 'itemId', { max: 80 });
    const nextQty = body.qty === undefined ? Number(line.qty_requested) : requirePositiveInt(body.qty, 'qty', { max: 100000 });
    const nextItem = nextItemId === line.item_id ? selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, line.item_id]) : selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, nextItemId]);
    if (!nextItem) throw fail('Item not found', 404);
    if (Number(nextItem.controlled ?? nextItem.restricted ?? 0) === 1 && !capabilitySet(context.user.role_key).has('view_restricted_items')) {
      throw fail('Restricted item not visible to this requester', 403);
    }
    execute(
      'UPDATE request_lines SET item_id = ?, qty_requested = ?, status = ? WHERE tenant_id = ? AND id = ?',
      [nextItem.id, nextQty, 'DRAFT', context.tenant.id, lineId]
    );
    const updated = selectOne('SELECT * FROM request_lines WHERE tenant_id = ? AND id = ?', [context.tenant.id, lineId]);
    insertAudit(context, {
      action: 'UPDATE_REQUEST_LINE',
      entityType: 'request_line',
      entityId: lineId,
      summary: `${request.request_no} line updated`,
      before: line,
      after: updated
    });
    return listRequestLines(context, request.id);
  });
}

export function deleteRequestLine(context, requestId, lineId) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'create_request');
  return transaction(() => {
    const { request, line } = loadRequestLine(context, requestId, lineId);
    assertDraftRequestEditable(context, request);
    execute('DELETE FROM request_lines WHERE tenant_id = ? AND id = ?', [context.tenant.id, lineId]);
    insertAudit(context, {
      action: 'DELETE_REQUEST_LINE',
      entityType: 'request_line',
      entityId: lineId,
      summary: `${request.request_no} line deleted`,
      before: line,
      after: {}
    });
    return listRequestLines(context, request.id);
  });
}

export function submitInternalRequest(context, requestId) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'submit_request');
  return transaction(() => {
    const request = loadRequest(context, requestId);
    if (request.status !== 'DRAFT') throw fail('Request can only be submitted from draft', 409);
    const privileged = context.user.role_key === 'admin' || context.user.role_key === 'supervisor';
    if (!privileged && request.requested_by_user_id !== context.user.id) {
      throw fail('Only the request owner can submit this draft', 403);
    }
    const lines = selectAll('SELECT * FROM request_lines WHERE tenant_id = ? AND request_id = ?', [context.tenant.id, requestId]);
    if (lines.length === 0) throw fail('Request must include at least one line', 409);
    execute(
      'UPDATE internal_requests SET status = ?, submitted_at = ?, submitted_by_user_id = ? WHERE id = ? AND tenant_id = ?',
      ['SUBMITTED', nowIso(), context.user.id, requestId, context.tenant.id]
    );
    execute(
      'UPDATE request_lines SET status = ? WHERE tenant_id = ? AND request_id = ?',
      ['REQUESTED', context.tenant.id, requestId]
    );
    insertAudit(context, {
      action: 'SUBMIT_INTERNAL_REQUEST',
      entityType: 'internal_request',
      entityId: requestId,
      summary: `${request.request_no} submitted`,
      before: request,
      after: { ...request, status: 'SUBMITTED', submitted_by_user_id: context.user.id, submitted_at: nowIso() }
    });
    return getRequestDetail(context, requestId);
  });
}

export function cancelInternalRequest(context, requestId, body = {}) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'cancel_request');
  const reason = optionalString(body.reason ?? body.cancelReason ?? '', 'reason', { max: 220 });
  return transaction(() => {
    const request = loadRequest(context, requestId);
    const privileged = context.user.role_key === 'admin' || context.user.role_key === 'supervisor';
    const requesterOwned = request.requested_by_user_id === context.user.id;
    const cancellable = privileged || (requesterOwned && (request.status === 'DRAFT' || request.status === 'SUBMITTED'));
    if (!cancellable) throw fail('Request cannot be cancelled in its current state', 409);
    if (request.status === 'ISSUED' || request.status === 'CANCELLED') throw fail('Request cannot be cancelled in its current state', 409);
    execute(
      'UPDATE internal_requests SET status = ?, canceled_at = ?, canceled_by_user_id = ?, cancel_reason = ? WHERE id = ? AND tenant_id = ?',
      ['CANCELLED', nowIso(), context.user.id, reason || 'Cancelled by request lifecycle action', requestId, context.tenant.id]
    );
    execute(
      'UPDATE request_lines SET status = ? WHERE tenant_id = ? AND request_id = ?',
      ['CANCELLED', context.tenant.id, requestId]
    );
    insertAudit(context, {
      action: 'CANCEL_INTERNAL_REQUEST',
      entityType: 'internal_request',
      entityId: requestId,
      summary: `${request.request_no} cancelled${reason ? `: ${reason}` : ''}`,
      before: request,
      after: { ...request, status: 'CANCELLED', canceled_by_user_id: context.user.id, canceled_at: nowIso(), cancel_reason: reason || 'Cancelled by request lifecycle action' }
    });
    return getRequestDetail(context, requestId);
  });
}

export function approveInternalRequest(context, requestId) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'approve_request');
  return transaction(() => {
    const request = loadRequest(context, requestId);
    if (request.status !== 'SUBMITTED') throw fail('Request cannot be approved in its current state', 409);
    const now = nowIso();
    execute(
      'UPDATE internal_requests SET status = ?, approved_at = ?, approved_by_user_id = ?, issue_ready_at = ?, issue_ready_by_user_id = ? WHERE id = ? AND tenant_id = ?',
      ['APPROVED', now, context.user.id, now, context.user.id, requestId, context.tenant.id]
    );
    execute(
      'UPDATE request_lines SET status = ? WHERE tenant_id = ? AND request_id = ?',
      ['ISSUE_READY', context.tenant.id, requestId]
    );
    insertAudit(context, {
      action: 'APPROVE_INTERNAL_REQUEST',
      entityType: 'internal_request',
      entityId: requestId,
      summary: `${request.request_no} approved`,
      before: request,
      after: { ...request, status: 'APPROVED', approved_by_user_id: context.user.id, approved_at: now, issue_ready_at: now, issue_ready_by_user_id: context.user.id }
    });
    return getRequestDetail(context, requestId);
  });
}

export function rejectInternalRequest(context, requestId, body = {}) {
  requireFeature(context, 'internal_storefront');
  requireCapability(context, 'reject_request');
  const rejectionReason = requireString(body.reason ?? body.rejectionReason ?? body.rejectReason, 'reason', { max: 220 });
  return transaction(() => {
    const request = loadRequest(context, requestId);
    const privileged = privilegedRequestRoles(context);
    if (request.status !== 'SUBMITTED') throw fail('Request cannot be rejected in its current state', 409);
    if (!privileged && request.requested_by_user_id !== context.user.id) {
      throw fail('Only the request owner can reject this request', 403);
    }
    const now = nowIso();
    execute(
      'UPDATE internal_requests SET status = ?, rejected_at = ?, rejected_by_user_id = ?, rejection_reason = ?, closed_at = ?, closed_by_user_id = ? WHERE id = ? AND tenant_id = ?',
      ['REJECTED', now, context.user.id, rejectionReason, now, context.user.id, requestId, context.tenant.id]
    );
    execute(
      'UPDATE request_lines SET status = ? WHERE tenant_id = ? AND request_id = ?',
      ['REJECTED', context.tenant.id, requestId]
    );
    insertAudit(context, {
      action: 'REJECT_INTERNAL_REQUEST',
      entityType: 'internal_request',
      entityId: requestId,
      summary: `${request.request_no} rejected: ${rejectionReason}`,
      before: request,
      after: { ...request, status: 'REJECTED', rejected_at: now, rejected_by_user_id: context.user.id, rejection_reason: rejectionReason, closed_at: now, closed_by_user_id: context.user.id }
    });
    return getRequestDetail(context, requestId);
  });
}

function privilegedWarehouseRoles(context) {
  return context.user.role_key === 'admin' || context.user.role_key === 'supervisor';
}

function warehouseTaskListScope(context, alias = 'wt') {
  if (privilegedWarehouseRoles(context)) return { sql: '', params: [] };
  return {
    sql: ` AND (${alias}.assigned_to_user_id = ? OR ${alias}.department_id = ? OR ${alias}.facility_id = ?)`,
    params: [context.user.id, context.user.department_id, context.user.facility_id]
  };
}

function loadWarehouseTaskRecord(context, taskId) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'view_warehouse_tasks');
  ensureTenantUser(context, context.tenant.id);
  const task = selectOne(
    `
      SELECT
        wt.*,
        r.request_no,
        r.status AS request_status,
        r.reason AS request_reason,
        r.purpose AS request_purpose,
        r.priority AS request_priority,
        r.department_id AS request_department_id,
        d.name AS department_name,
        d.code AS department_code,
        req.name AS requester_name,
        req.email AS requester_email,
        f.name AS facility_name,
        f.code AS facility_code,
        assignee.name AS assignee_name,
        creator.name AS creator_name
      FROM warehouse_tasks wt
      LEFT JOIN internal_requests r ON r.id = wt.request_id AND r.tenant_id = wt.tenant_id
      LEFT JOIN departments d ON d.id = wt.department_id
      LEFT JOIN users req ON req.id = r.requested_by_user_id
      LEFT JOIN users fcreator ON fcreator.id = wt.created_by_user_id
      LEFT JOIN users assignee ON assignee.id = wt.assigned_to_user_id
      LEFT JOIN users creator ON creator.id = wt.created_by_user_id
      LEFT JOIN facilities f ON f.id = wt.facility_id
      WHERE wt.tenant_id = ? AND wt.id = ?
    `,
    [context.tenant.id, taskId]
  );
  if (!task) throw fail('Warehouse task not found', 404);
  if (!privilegedWarehouseRoles(context)) {
    const allowed = task.assigned_to_user_id === context.user.id || task.department_id === context.user.department_id || task.facility_id === context.user.facility_id;
    if (!allowed) throw fail('Warehouse task not visible to this scope', 403);
  }
  return task;
}

function loadWarehouseTaskLines(context, taskId) {
  return selectAll(
    `
      SELECT
        wtl.*,
        i.sku,
        i.name AS item_name,
        i.barcode,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        i.controlled,
        i.restricted,
        b.code AS bin_code,
        b.zone AS bin_zone,
        b.shelf AS bin_shelf,
        rl.qty_requested AS request_qty_requested,
        rl.qty_issued AS request_qty_issued,
        rl.status AS request_line_status
      FROM warehouse_task_lines wtl
      JOIN items i ON i.id = wtl.item_id
      LEFT JOIN bins b ON b.id = wtl.bin_id
      LEFT JOIN request_lines rl ON rl.id = wtl.request_line_id AND rl.tenant_id = wtl.tenant_id
      WHERE wtl.tenant_id = ? AND wtl.warehouse_task_id = ?
      ORDER BY wtl.created_at, wtl.id
    `,
    [context.tenant.id, taskId]
  );
}

export function getWarehouseTaskDetail(context, taskId) {
  const task = loadWarehouseTaskRecord(context, taskId);
  const lines = loadWarehouseTaskLines(context, taskId);
  const totals = lines.reduce((acc, line) => {
    acc.requested += Number(line.requested_quantity || 0);
    acc.picked += Number(line.picked_quantity || 0);
    acc.issued += Number(line.issued_quantity || 0);
    acc.short += Number(line.short_quantity || 0);
    return acc;
  }, { requested: 0, picked: 0, issued: 0, short: 0 });
  const audit = selectAll(
    `
      SELECT a.*, u.name AS actor_name
      FROM audit_logs a
      JOIN users u ON u.id = a.actor_user_id
      WHERE a.tenant_id = ? AND (a.entity_type IN ('warehouse_task', 'warehouse_task_line', 'stock_movement') AND (a.entity_id = ? OR a.summary LIKE ? OR a.after_json LIKE ? OR a.before_json LIKE ?))
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT 30
    `,
    [context.tenant.id, taskId, `%${taskId}%`, `%${taskId}%`, `%${taskId}%`]
  );
  const evidenceLinks = task.evidence_document_id ? selectAll(
    `
      SELECT el.*, d.file_name, d.doc_type, d.visibility
      FROM evidence_links el
      JOIN documents d ON d.id = el.document_id
      WHERE el.tenant_id = ? AND el.entity_type = 'warehouse_task' AND el.entity_id = ?
      ORDER BY el.created_at DESC
    `,
    [context.tenant.id, taskId]
  ) : [];
  return {
    task: {
      ...task,
      line_count: lines.length,
      requested_quantity: totals.requested,
      picked_quantity: totals.picked,
      issued_quantity: totals.issued,
      short_quantity: totals.short
    },
    lines,
    audit,
    evidenceLinks
  };
}

function selectWarehouseBalance(context, itemId, facilityId, binId = '') {
  const params = [context.tenant.id, itemId, facilityId];
  const binClause = binId ? ' AND sb.bin_id = ?' : '';
  if (binId) params.push(binId);
  return selectOne(
    `
      SELECT sb.*, b.code AS bin_code, b.zone AS bin_zone, b.shelf AS bin_shelf
      FROM stock_balances sb
      JOIN bins b ON b.id = sb.bin_id
      WHERE sb.tenant_id = ? AND sb.item_id = ? AND sb.facility_id = ?${binClause}
      ORDER BY sb.available DESC, sb.on_hand DESC, b.code ASC
      LIMIT 1
    `,
    params
  );
}

function preferredWarehouseBin(context, itemId, facilityId) {
  const balance = selectWarehouseBalance(context, itemId, facilityId);
  if (balance) return balance;
  return selectOne(
    'SELECT id, code, zone, shelf, facility_id FROM bins WHERE tenant_id = ? AND facility_id = ? ORDER BY code ASC LIMIT 1',
    [context.tenant.id, facilityId]
  );
}

function warehouseTaskRequestStatus(lines, taskStatus = '') {
  if (lines.length === 0) return taskStatus || 'CREATED';
  const statuses = lines.map((line) => line.status);
  if (statuses.every((status) => status === 'ISSUED')) return 'ISSUED';
  if (statuses.every((status) => status === 'CANCELLED')) return 'CANCELLED';
  if (statuses.some((status) => status === 'PARTIALLY_ISSUED')) return 'PARTIALLY_ISSUED';
  if (statuses.some((status) => status === 'SHORTED')) return 'EXCEPTION';
  if (statuses.some((status) => status === 'PICKED')) return 'PICKED';
  if (statuses.some((status) => status === 'PICK_PENDING')) return taskStatus || 'IN_PROGRESS';
  return taskStatus || 'IN_PROGRESS';
}

function warehouseRequestLineStatus(requested, issued, shorted, picked) {
  if (issued >= requested && shorted === 0) return 'ISSUED';
  if (issued > 0 && issued < requested) return 'PARTIALLY_ISSUED';
  if (shorted > 0 && issued === 0) return 'SHORTED';
  if (picked >= requested) return 'PICKED';
  return 'PICK_PENDING';
}

function syncWarehouseRequest(context, requestId, { statusOverride = null } = {}) {
  const request = selectOne('SELECT * FROM internal_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, requestId]);
  if (!request) throw fail('Internal request not found', 404);
  const lines = selectAll('SELECT * FROM request_lines WHERE tenant_id = ? AND request_id = ?', [context.tenant.id, requestId]);
  const totals = lines.reduce((acc, line) => {
    acc.requested += Number(line.qty_requested || 0);
    acc.issued += Number(line.qty_issued || 0);
    return acc;
  }, { requested: 0, issued: 0 });
  const now = nowIso();
  let nextStatus = statusOverride || request.status;
  if (!statusOverride) {
    if (totals.issued <= 0) {
      nextStatus = 'PICKING';
    } else if (totals.issued >= totals.requested && lines.every((line) => Number(line.qty_issued || 0) >= Number(line.qty_requested || 0))) {
      nextStatus = 'ISSUED';
    } else {
      nextStatus = 'PARTIALLY_ISSUED';
    }
  }
  execute(
    `
      UPDATE internal_requests
      SET status = ?, issued_at = CASE WHEN ? IN ('PARTIALLY_ISSUED', 'ISSUED') THEN COALESCE(issued_at, ?) ELSE issued_at END,
          closed_at = CASE WHEN ? IN ('PARTIALLY_ISSUED', 'ISSUED', 'CANCELLED') THEN COALESCE(closed_at, ?) ELSE closed_at END,
          closed_by_user_id = CASE WHEN ? IN ('PARTIALLY_ISSUED', 'ISSUED', 'CANCELLED') THEN COALESCE(closed_by_user_id, ?) ELSE closed_by_user_id END
      WHERE tenant_id = ? AND id = ?
    `,
    [nextStatus, nextStatus, now, nextStatus, now, nextStatus, context.user.id, context.tenant.id, requestId]
  );
  return nextStatus;
}

function syncWarehouseTaskStatus(context, taskId) {
  const task = selectOne('SELECT * FROM warehouse_tasks WHERE tenant_id = ? AND id = ?', [context.tenant.id, taskId]);
  if (!task) throw fail('Warehouse task not found', 404);
  const lines = loadWarehouseTaskLines(context, taskId);
  const nextStatus = task.status === 'CANCELLED'
    ? 'CANCELLED'
    : task.status === 'CLOSED'
      ? 'CLOSED'
      : warehouseTaskRequestStatus(lines, task.status);
  execute(
    'UPDATE warehouse_tasks SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
    [nextStatus, nowIso(), context.user.id, context.tenant.id, taskId]
  );
  if (task.request_id) {
    syncWarehouseRequest(context, task.request_id, { statusOverride: nextStatus === 'CANCELLED' ? 'CANCELLED' : null });
  }
  return nextStatus;
}

export function listWarehouseSummary(context) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'view_warehouse_tasks');
  ensureTenantUser(context, context.tenant.id);
  const openTasks = selectAll(
    `SELECT COUNT(*) AS count FROM warehouse_tasks wt WHERE wt.tenant_id = ? AND wt.status IN ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PICKED', 'PARTIALLY_ISSUED', 'EXCEPTION')`,
    [context.tenant.id]
  )[0].count;
  const issueReadyRequests = selectAll(
    `SELECT COUNT(*) AS count FROM internal_requests r WHERE r.tenant_id = ? AND r.status IN ('APPROVED', 'ISSUE_READY')`,
    [context.tenant.id]
  )[0].count;
  const partialTasks = selectAll(
    `SELECT COUNT(*) AS count FROM warehouse_tasks wt WHERE wt.tenant_id = ? AND wt.status = 'PARTIALLY_ISSUED'`,
    [context.tenant.id]
  )[0].count;
  const exceptions = selectAll(
    `SELECT COUNT(*) AS count FROM warehouse_tasks wt WHERE wt.tenant_id = ? AND (wt.status = 'EXCEPTION' OR (wt.exception_reason IS NOT NULL AND wt.exception_reason != ''))`,
    [context.tenant.id]
  )[0].count;
  const assignedToMe = selectAll(
    `SELECT COUNT(*) AS count FROM warehouse_tasks wt WHERE wt.tenant_id = ? AND wt.assigned_to_user_id = ? AND wt.status IN ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PICKED', 'PARTIALLY_ISSUED', 'EXCEPTION')`,
    [context.tenant.id, context.user.id]
  )[0].count;
  return {
    summary: {
      openTasks,
      issueReadyRequests,
      partialTasks,
      exceptions,
      assignedToMe,
      openWorkflows: Number(openTasks) + Number(issueReadyRequests)
    }
  };
}

export function listIssueReadyRequests(context) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'view_requests');
  ensureTenantUser(context, context.tenant.id);
  const scope = privilegedWarehouseRoles(context) ? { sql: '', params: [] } : { sql: ' AND r.department_id = ?', params: [context.user.department_id] };
  return selectAll(
    `
      SELECT
        r.*,
        d.name AS department_name,
        u.name AS requester_name,
        f.name AS facility_name,
        COUNT(rl.id) AS line_count,
        COALESCE(SUM(rl.qty_requested), 0) AS requested_quantity,
        COALESCE(SUM(rl.qty_issued), 0) AS issued_quantity,
        wt.id AS warehouse_task_id,
        wt.status AS warehouse_task_status,
        wt.task_no AS warehouse_task_no,
        wt.assigned_to_user_id AS warehouse_task_assignee_id
      FROM internal_requests r
      JOIN departments d ON d.id = r.department_id
      JOIN users u ON u.id = r.requested_by_user_id
      JOIN facilities f ON f.id = r.facility_id
      LEFT JOIN request_lines rl ON rl.request_id = r.id AND rl.tenant_id = r.tenant_id
      LEFT JOIN warehouse_tasks wt ON wt.request_id = r.id AND wt.tenant_id = r.tenant_id AND wt.status != 'CANCELLED'
      WHERE r.tenant_id = ? AND r.status IN ('APPROVED', 'ISSUE_READY', 'PICKING', 'PARTIALLY_ISSUED') AND wt.id IS NULL${scope.sql}
      GROUP BY r.id
      ORDER BY r.issue_ready_at DESC, r.created_at DESC
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function listWarehouseBins(context) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'view_inventory');
  const includeRestricted = capabilitySet(context.user.role_key).has('view_restricted_items');
  return selectAll(
    `
      SELECT
        b.*,
        f.name AS facility_name,
        COALESCE(SUM(sb.on_hand), 0) AS on_hand,
        COALESCE(SUM(sb.available), 0) AS available,
        COUNT(DISTINCT sb.item_id) AS stocked_item_count
      FROM bins b
      JOIN facilities f ON f.id = b.facility_id
      LEFT JOIN stock_balances sb ON sb.bin_id = b.id
      LEFT JOIN items i ON i.id = sb.item_id
      WHERE b.tenant_id = ?${includeRestricted ? '' : ' AND (i.id IS NULL OR COALESCE(i.controlled, i.restricted, 0) = 0)'}
      GROUP BY b.id
      ORDER BY f.name, b.code
    `,
    [context.tenant.id]
  );
}

export function listWarehouseTasks(context) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'view_warehouse_tasks');
  ensureTenantUser(context, context.tenant.id);
  const scope = warehouseTaskListScope(context, 'wt');
  return selectAll(
    `
      SELECT
        wt.*,
        r.request_no,
        r.status AS request_status,
        d.name AS department_name,
        u.name AS requester_name,
        f.name AS facility_name,
        assignee.name AS assignee_name,
        COUNT(wtl.id) AS line_count,
        COALESCE(SUM(wtl.requested_quantity), 0) AS requested_quantity,
        COALESCE(SUM(wtl.picked_quantity), 0) AS picked_quantity,
        COALESCE(SUM(wtl.issued_quantity), 0) AS issued_quantity,
        COALESCE(SUM(wtl.short_quantity), 0) AS short_quantity,
        COALESCE(SUM(CASE WHEN wtl.status = 'ISSUED' THEN 1 ELSE 0 END), 0) AS issued_line_count,
        COALESCE(SUM(CASE WHEN wtl.status = 'PARTIALLY_ISSUED' THEN 1 ELSE 0 END), 0) AS partial_line_count,
        COALESCE(SUM(CASE WHEN wtl.status = 'SHORTED' THEN 1 ELSE 0 END), 0) AS short_line_count
      FROM warehouse_tasks wt
      LEFT JOIN internal_requests r ON r.id = wt.request_id AND r.tenant_id = wt.tenant_id
      LEFT JOIN departments d ON d.id = wt.department_id
      LEFT JOIN users u ON u.id = r.requested_by_user_id
      LEFT JOIN users assignee ON assignee.id = wt.assigned_to_user_id
      LEFT JOIN facilities f ON f.id = wt.facility_id
      LEFT JOIN warehouse_task_lines wtl ON wtl.warehouse_task_id = wt.id AND wtl.tenant_id = wt.tenant_id
      WHERE wt.tenant_id = ?${scope.sql}
      GROUP BY wt.id
      ORDER BY wt.created_at DESC, wt.id DESC
      LIMIT 100
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function createWarehouseTaskFromRequest(context, requestId, body = {}) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'manage_warehouse_tasks');
  ensureTenantUser(context, context.tenant.id);
  const assignedToUserId = body.assignedToUserId ? requireString(body.assignedToUserId, 'assignedToUserId', { max: 80 }) : context.user.id;
  const taskNote = optionalString(body.note, 'note', { max: 240 });
  return transaction(() => {
    const request = loadRequest(context, requestId);
    if (!['APPROVED', 'ISSUE_READY', 'PICKING', 'PARTIALLY_ISSUED'].includes(request.status)) {
      throw fail('Request is not ready for warehouse execution', 409);
    }
    const existingTask = selectOne(
      'SELECT * FROM warehouse_tasks WHERE tenant_id = ? AND request_id = ? AND status NOT IN (\'CANCELLED\', \'CLOSED\')',
      [context.tenant.id, requestId]
    );
    if (existingTask) {
      return getWarehouseTaskDetail(context, existingTask.id);
    }
    if (assignedToUserId) {
      const assignee = selectOne('SELECT * FROM users WHERE tenant_id = ? AND id = ?', [context.tenant.id, assignedToUserId]);
      if (!assignee) throw fail('Assigned user not found for tenant', 404);
    }
    const lines = selectAll('SELECT rl.*, i.name AS item_name, i.restricted, i.controlled, i.unit_of_measure, COALESCE(NULLIF(i.unit_of_measure, \'\'), i.uom) AS display_uom FROM request_lines rl JOIN items i ON i.id = rl.item_id WHERE rl.tenant_id = ? AND rl.request_id = ? ORDER BY rl.id', [context.tenant.id, requestId]);
    if (!lines.length) throw fail('Request must contain at least one line', 409);
    const now = nowIso();
    const task = {
      id: newId('warehouse_task'),
      tenant_id: context.tenant.id,
      task_no: request.request_no.replace(/^REQ-/, 'WT-'),
      request_id: request.id,
      department_id: request.department_id,
      facility_id: request.facility_id,
      task_type: 'REQUEST_ISSUE',
      status: assignedToUserId ? 'ASSIGNED' : 'CREATED',
      priority: request.priority || 'NORMAL',
      assigned_to_user_id: assignedToUserId || null,
      source_type: 'internal_request',
      source_id: request.id,
      evidence_document_id: null,
      started_at: null,
      picked_at: null,
      issued_at: null,
      closed_at: null,
      cancelled_at: null,
      exception_reason: '',
      last_action_by_user_id: context.user.id,
      created_at: now,
      updated_at: now,
      created_by_user_id: context.user.id
    };
    insert('warehouse_tasks', task);
    for (const line of lines) {
      if (Number(line.restricted ?? line.controlled ?? 0) === 1 && !capabilitySet(context.user.role_key).has('view_restricted_items')) {
        throw fail('Restricted line cannot be moved into a warehouse task for this role', 403);
      }
      const preferredBin = preferredWarehouseBin(context, line.item_id, request.facility_id);
      insert('warehouse_task_lines', {
        id: newId('warehouse_task_line'),
        tenant_id: context.tenant.id,
        warehouse_task_id: task.id,
        request_line_id: line.id,
        item_id: line.item_id,
        bin_id: preferredBin?.bin_id || preferredBin?.id || null,
        requested_quantity: Number(line.qty_requested || 0),
        picked_quantity: 0,
        issued_quantity: 0,
        short_quantity: 0,
        unit_of_measure: line.display_uom || line.uom || '',
        status: 'PICK_PENDING',
        lot_no: '',
        serial_no: '',
        expiry_date: null,
        exception_reason: '',
        evidence_document_id: null,
        created_at: now,
        created_by_user_id: context.user.id,
        updated_at: now,
        updated_by_user_id: context.user.id
      });
      execute('UPDATE request_lines SET status = ? WHERE tenant_id = ? AND id = ?', ['PICK_PENDING', context.tenant.id, line.id]);
    }
    execute(
      'UPDATE internal_requests SET status = ?, issue_ready_at = COALESCE(issue_ready_at, ?), issue_ready_by_user_id = COALESCE(issue_ready_by_user_id, ?) WHERE tenant_id = ? AND id = ?',
      ['PICKING', now, context.user.id, context.tenant.id, request.id]
    );
    insertAudit(context, {
      action: 'CREATE_WAREHOUSE_TASK',
      entityType: 'warehouse_task',
      entityId: task.id,
      summary: `${task.task_no} created from ${request.request_no}${taskNote ? ` · ${taskNote}` : ''}`,
      before: {},
      after: task,
      requestId: request.id
    });
    return getWarehouseTaskDetail(context, task.id);
  });
}

export function startWarehouseTask(context, taskId, body = {}) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'execute_warehouse_tasks');
  return transaction(() => {
    const task = loadWarehouseTaskRecord(context, taskId);
    if (!['CREATED', 'ASSIGNED'].includes(task.status)) throw fail('Warehouse task cannot be started in its current state', 409);
    if (!privilegedWarehouseRoles(context) && task.assigned_to_user_id && task.assigned_to_user_id !== context.user.id) {
      throw fail('Task is assigned to another user', 403);
    }
    const now = nowIso();
    execute(
      'UPDATE warehouse_tasks SET status = ?, started_at = COALESCE(started_at, ?), last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['IN_PROGRESS', now, context.user.id, now, context.user.id, context.tenant.id, taskId]
    );
    insertAudit(context, {
      action: 'START_WAREHOUSE_TASK',
      entityType: 'warehouse_task',
      entityId: taskId,
      summary: `${task.task_no} started`,
      before: task,
      after: { ...task, status: 'IN_PROGRESS', started_at: task.started_at || now },
      requestId: task.request_id || undefined
    });
    return getWarehouseTaskDetail(context, taskId);
  });
}

export function pickWarehouseTaskLine(context, taskId, body = {}) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'execute_warehouse_tasks');
  const lineId = requireString(body.lineId, 'lineId', { max: 80 });
  const pickedQuantity = requirePositiveInt(body.qty ?? body.pickedQuantity ?? body.quantity ?? 0, 'qty', { max: 100000 });
  const binId = body.binId ? requireString(body.binId, 'binId', { max: 80 }) : '';
  const lotNo = optionalString(body.lotNo, 'lotNo', { max: 80 });
  const serialNo = optionalString(body.serialNo, 'serialNo', { max: 80 });
  const expiryDate = optionalString(body.expiryDate, 'expiryDate', { max: 40 });
  const exceptionReason = optionalString(body.exceptionReason ?? body.reason, 'exceptionReason', { max: 220 });
  return transaction(() => {
    const task = loadWarehouseTaskRecord(context, taskId);
    const line = selectOne('SELECT * FROM warehouse_task_lines WHERE tenant_id = ? AND warehouse_task_id = ? AND id = ?', [context.tenant.id, taskId, lineId]);
    if (!line) throw fail('Warehouse task line not found', 404);
    if (!privilegedWarehouseRoles(context) && task.assigned_to_user_id && task.assigned_to_user_id !== context.user.id) {
      throw fail('Task is assigned to another user', 403);
    }
    if (!['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PICK_PENDING'].includes(task.status)) throw fail('Warehouse task cannot be picked in its current state', 409);
    if (line.status === 'ISSUED') throw fail('Warehouse task line already issued', 409);
    const nextBin = binId ? selectOne('SELECT * FROM bins WHERE tenant_id = ? AND id = ?', [context.tenant.id, binId]) : selectWarehouseBalance(context, line.item_id, task.facility_id, line.bin_id) || preferredWarehouseBin(context, line.item_id, task.facility_id);
    if (binId && !nextBin) throw fail('Bin not found', 404);
    if (binId && nextBin && nextBin.facility_id !== task.facility_id) throw fail('Bin is not in the task facility', 403);
    const actualPicked = Math.min(pickedQuantity, Number(line.requested_quantity || 0));
    const shortQuantity = Math.max(0, Number(line.requested_quantity || 0) - actualPicked);
    const lineStatus = warehouseRequestLineStatus(Number(line.requested_quantity || 0), 0, shortQuantity, actualPicked);
    const now = nowIso();
    execute(
      `
        UPDATE warehouse_task_lines
        SET bin_id = ?, picked_quantity = ?, short_quantity = ?, status = ?, lot_no = ?, serial_no = ?, expiry_date = ?, exception_reason = ?, updated_at = ?, updated_by_user_id = ?
        WHERE tenant_id = ? AND id = ?
      `,
      [nextBin?.bin_id || nextBin?.id || line.bin_id || null, actualPicked, shortQuantity, lineStatus, lotNo || line.lot_no || '', serialNo || line.serial_no || '', expiryDate || line.expiry_date || null, exceptionReason || (shortQuantity > 0 ? `Short by ${shortQuantity}` : line.exception_reason || ''), now, context.user.id, context.tenant.id, lineId]
    );
    execute('UPDATE request_lines SET status = ? WHERE tenant_id = ? AND id = ?', [lineStatus, context.tenant.id, line.request_line_id]);
    const updatedLine = selectOne('SELECT * FROM warehouse_task_lines WHERE tenant_id = ? AND id = ?', [context.tenant.id, lineId]);
    execute(
      'UPDATE warehouse_tasks SET picked_at = COALESCE(picked_at, ?), last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [now, context.user.id, now, context.user.id, context.tenant.id, taskId]
    );
    const taskStatus = syncWarehouseTaskStatus(context, taskId);
    if (exceptionReason) {
      execute('UPDATE warehouse_tasks SET exception_reason = ?, last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [exceptionReason, context.user.id, now, context.user.id, context.tenant.id, taskId]);
    }
    insertAudit(context, {
      action: 'PICK_WAREHOUSE_TASK_LINE',
      entityType: 'warehouse_task_line',
      entityId: lineId,
      summary: `${task.task_no} picked ${actualPicked}/${line.requested_quantity}${shortQuantity ? ` with short ${shortQuantity}` : ''}`,
      before: line,
      after: { ...updatedLine, task_status: taskStatus },
      requestId: task.request_id || undefined
    });
    return getWarehouseTaskDetail(context, taskId);
  });
}

export function issueWarehouseTaskLine(context, taskId, body = {}) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'execute_warehouse_tasks');
  const lineId = requireString(body.lineId, 'lineId', { max: 80 });
  const requestedQty = body.qty === undefined ? null : requirePositiveInt(body.qty, 'qty', { max: 100000 });
  const binId = body.binId ? requireString(body.binId, 'binId', { max: 80 }) : '';
  const lotNo = optionalString(body.lotNo, 'lotNo', { max: 80 });
  const serialNo = optionalString(body.serialNo, 'serialNo', { max: 80 });
  const expiryDate = optionalString(body.expiryDate, 'expiryDate', { max: 40 });
  const reason = optionalString(body.reason, 'reason', { max: 220 }) || 'Warehouse issue';
  const evidenceDocumentId = body.evidenceDocumentId ? requireString(body.evidenceDocumentId, 'evidenceDocumentId', { max: 80 }) : '';
  return transaction(() => {
    const task = loadWarehouseTaskRecord(context, taskId);
    const line = selectOne('SELECT * FROM warehouse_task_lines WHERE tenant_id = ? AND warehouse_task_id = ? AND id = ?', [context.tenant.id, taskId, lineId]);
    if (!line) throw fail('Warehouse task line not found', 404);
    if (!privilegedWarehouseRoles(context) && task.assigned_to_user_id && task.assigned_to_user_id !== context.user.id) {
      throw fail('Task is assigned to another user', 403);
    }
    if (!['IN_PROGRESS', 'PICKED', 'PARTIALLY_ISSUED', 'EXCEPTION'].includes(task.status)) throw fail('Warehouse task cannot be issued in its current state', 409);
    const remainingToIssue = Math.max(0, Number(line.requested_quantity || 0) - Number(line.issued_quantity || 0));
    const targetQty = requestedQty === null ? remainingToIssue : Math.min(requestedQty, remainingToIssue);
    if (targetQty <= 0) throw fail('No quantity remains to be issued for this line', 409);
    const selectedBin = binId ? selectOne('SELECT * FROM bins WHERE tenant_id = ? AND id = ?', [context.tenant.id, binId]) : selectWarehouseBalance(context, line.item_id, task.facility_id, line.bin_id) || preferredWarehouseBin(context, line.item_id, task.facility_id);
    if (!selectedBin) throw fail('No bin available for issue', 409);
    if (binId && selectedBin && selectedBin.facility_id !== task.facility_id) throw fail('Bin is not in the task facility', 403);
    const balance = selectWarehouseBalance(context, line.item_id, task.facility_id, selectedBin.bin_id || selectedBin.id || line.bin_id);
    if (!balance) throw fail('No stock balance available for the selected bin', 409);
    const actualIssued = Math.min(targetQty, Number(balance.available || 0));
    const shortage = Math.max(0, targetQty - actualIssued);
    const nextIssued = Number(line.issued_quantity || 0) + actualIssued;
    const nextShort = Number(line.short_quantity || 0) + shortage;
    const nextPicked = Math.max(Number(line.picked_quantity || 0), nextIssued + nextShort);
    const lineStatus = warehouseRequestLineStatus(Number(line.requested_quantity || 0), actualIssued, nextShort, nextPicked);
    const beforeQuantity = Number(balance.on_hand || 0);
    const afterQuantity = beforeQuantity - actualIssued;
    if (actualIssued > 0) {
      execute(
        'UPDATE stock_balances SET on_hand = ?, available = ?, updated_at = ? WHERE id = ? AND tenant_id = ?',
        [afterQuantity, Math.max(0, afterQuantity - Number(balance.reserved || 0)), nowIso(), balance.id, context.tenant.id]
      );
      insert('stock_movements', {
        id: newId('movement'),
        tenant_id: context.tenant.id,
        item_id: line.item_id,
        facility_id: task.facility_id,
        bin_id: balance.bin_id || selectedBin.bin_id || selectedBin.id || line.bin_id || null,
        movement_type: 'ISSUE',
        quantity: actualIssued,
        reason,
        before_quantity: beforeQuantity,
        after_quantity: afterQuantity,
        reference_type: 'warehouse_task',
        reference_id: task.id,
        performed_by_user_id: context.user.id,
        department_id: task.department_id,
        note: `Issued for ${task.task_no}`,
        status: shortage > 0 ? 'PARTIAL' : 'POSTED',
        lot_no: lotNo || line.lot_no || '',
        serial_no: serialNo || line.serial_no || '',
        expiry_date: expiryDate || line.expiry_date || null,
        evidence_document_id: evidenceDocumentId || line.evidence_document_id || null,
        posted_by_user_id: context.user.id,
        posted_at: nowIso()
      });
    }
    const now = nowIso();
    execute(
      'UPDATE warehouse_tasks SET issued_at = COALESCE(issued_at, ?), last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [now, context.user.id, now, context.user.id, context.tenant.id, taskId]
    );
    execute(
      `
        UPDATE warehouse_task_lines
        SET bin_id = ?, picked_quantity = ?, issued_quantity = ?, short_quantity = ?, status = ?, lot_no = ?, serial_no = ?, expiry_date = ?, exception_reason = ?, evidence_document_id = COALESCE(?, evidence_document_id), updated_at = ?, updated_by_user_id = ?
        WHERE tenant_id = ? AND id = ?
      `,
      [selectedBin.bin_id || selectedBin.id || line.bin_id || null, nextPicked, nextIssued, nextShort, lineStatus, lotNo || line.lot_no || '', serialNo || line.serial_no || '', expiryDate || line.expiry_date || null, shortage > 0 ? `Short by ${shortage}` : (line.exception_reason || ''), evidenceDocumentId || null, now, context.user.id, context.tenant.id, lineId]
    );
    execute(
      'UPDATE request_lines SET qty_issued = qty_issued + ?, status = ? WHERE tenant_id = ? AND id = ?',
      [actualIssued, lineStatus, context.tenant.id, line.request_line_id]
    );
    if (evidenceDocumentId) {
      const document = selectOne('SELECT * FROM documents WHERE tenant_id = ? AND id = ?', [context.tenant.id, evidenceDocumentId]);
      if (!document) throw fail('Evidence document not found', 404);
      insert('evidence_links', {
        id: newId('evidence_link'),
        tenant_id: context.tenant.id,
        document_id: evidenceDocumentId,
        entity_type: 'warehouse_task',
        entity_id: task.id,
        link_type: 'WAREHOUSE_ISSUE_EVIDENCE',
        created_at: now,
        created_by_user_id: context.user.id
      });
    }
    const taskStatus = syncWarehouseTaskStatus(context, taskId);
    if (shortage > 0) {
      execute('UPDATE warehouse_tasks SET exception_reason = ?, last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [shortage > 0 ? `Short by ${shortage} on line ${lineId}` : task.exception_reason || '', context.user.id, now, context.user.id, context.tenant.id, taskId]);
    }
    insertAudit(context, {
      action: 'ISSUE_WAREHOUSE_TASK_LINE',
      entityType: 'warehouse_task_line',
      entityId: lineId,
      summary: `${task.task_no} issued ${actualIssued}/${targetQty}${shortage ? ` with short ${shortage}` : ''}`,
      before: line,
      after: { ...selectOne('SELECT * FROM warehouse_task_lines WHERE tenant_id = ? AND id = ?', [context.tenant.id, lineId]), task_status: taskStatus, stock_before: beforeQuantity, stock_after: afterQuantity },
      requestId: task.request_id || undefined
    });
    return getWarehouseTaskDetail(context, taskId);
  });
}

export function closeWarehouseTask(context, taskId, body = {}) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'manage_warehouse_tasks');
  const note = optionalString(body.reason ?? body.note, 'reason', { max: 240 });
  return transaction(() => {
    const task = loadWarehouseTaskRecord(context, taskId);
    const lines = loadWarehouseTaskLines(context, taskId);
    if (lines.some((line) => line.status === 'PICK_PENDING' || line.status === 'PICKED')) {
      throw fail('Warehouse task still has pending lines', 409);
    }
    const now = nowIso();
    const nextStatus = lines.some((line) => line.status === 'PARTIALLY_ISSUED' || line.status === 'SHORTED') ? 'CLOSED' : 'CLOSED';
    execute(
      'UPDATE warehouse_tasks SET status = ?, closed_at = ?, last_action_by_user_id = ?, exception_reason = COALESCE(?, exception_reason), updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [nextStatus, now, context.user.id, note || null, now, context.user.id, context.tenant.id, taskId]
    );
    const finalStatus = syncWarehouseTaskStatus(context, taskId);
    insertAudit(context, {
      action: 'CLOSE_WAREHOUSE_TASK',
      entityType: 'warehouse_task',
      entityId: taskId,
      summary: `${task.task_no} closed${note ? ` · ${note}` : ''}`,
      before: task,
      after: { ...task, status: finalStatus, closed_at: now, exception_reason: note || task.exception_reason || '' },
      requestId: task.request_id || undefined
    });
    return getWarehouseTaskDetail(context, taskId);
  });
}

export function cancelWarehouseTask(context, taskId, body = {}) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'manage_warehouse_tasks');
  const reason = requireString(body.reason ?? body.cancelReason ?? 'Cancelled by warehouse action', 'reason', { max: 240 });
  return transaction(() => {
    const task = loadWarehouseTaskRecord(context, taskId);
    const lines = loadWarehouseTaskLines(context, taskId);
    if (lines.some((line) => Number(line.issued_quantity || 0) > 0)) {
      throw fail('Issued warehouse tasks cannot be cancelled; close it as partial issue instead', 409);
    }
    const now = nowIso();
    execute(
      'UPDATE warehouse_tasks SET status = ?, cancelled_at = ?, exception_reason = ?, last_action_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['CANCELLED', now, reason, context.user.id, now, context.user.id, context.tenant.id, taskId]
    );
    execute(
      'UPDATE warehouse_task_lines SET status = ?, short_quantity = requested_quantity, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND warehouse_task_id = ?',
      ['CANCELLED', now, context.user.id, context.tenant.id, taskId]
    );
    execute(
      'UPDATE request_lines SET status = ? WHERE tenant_id = ? AND request_id = ?',
      ['ISSUE_READY', context.tenant.id, task.request_id]
    );
    syncWarehouseRequest(context, task.request_id, { statusOverride: 'APPROVED' });
    insertAudit(context, {
      action: 'CANCEL_WAREHOUSE_TASK',
      entityType: 'warehouse_task',
      entityId: taskId,
      summary: `${task.task_no} cancelled: ${reason}`,
      before: task,
      after: { ...task, status: 'CANCELLED', cancelled_at: now, exception_reason: reason },
      requestId: task.request_id || undefined
    });
    return getWarehouseTaskDetail(context, taskId);
  });
}

export function issueInternalRequest(context, requestId) {
  requireFeature(context, 'warehouse_workflows');
  requireCapability(context, 'issue_request');
  const task = createWarehouseTaskFromRequest(context, requestId);
  startWarehouseTask(context, task.task.id);
  const lines = loadWarehouseTaskLines(context, task.task.id);
  for (const line of lines) {
    const remaining = Math.max(0, Number(line.requested_quantity || 0) - Number(line.issued_quantity || 0));
    if (remaining <= 0) continue;
    issueWarehouseTaskLine(context, task.task.id, {
      lineId: line.id,
      qty: remaining,
      binId: line.bin_id || '',
      reason: `Legacy issue request for ${task.task.request_no}`
    });
  }
  closeWarehouseTask(context, task.task.id, { reason: 'Legacy issue route completed' });
  return getWarehouseTaskDetail(context, task.task.id);
}

function procurementScopeClause(context, alias = 'pr') {
  if (['admin', 'supervisor', 'finance'].includes(context.user.role_key)) {
    return { sql: '', params: [] };
  }
  return { sql: ` AND ${alias}.department_id = ?`, params: [context.user.department_id] };
}

function loadVendorRecord(context, vendorId) {
  requireFeature(context, 'procurement_purchasing');
  ensureTenantUser(context, context.tenant.id);
  const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, vendorId]);
  if (!vendor) throw fail('Vendor not found', 404);
  return vendor;
}

function loadPurchaseRequestRecord(context, purchaseRequestId) {
  requireFeature(context, 'procurement_purchasing');
  ensureTenantUser(context, context.tenant.id);
  const request = selectOne('SELECT * FROM purchase_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseRequestId]);
  if (!request) throw fail('Purchase request not found', 404);
  const scope = procurementScopeClause(context, 'pr');
  if (scope.sql && request.department_id !== context.user.department_id) {
    throw fail('Purchase request not visible to this department', 403);
  }
  return request;
}

function loadPurchaseOrderRecord(context, purchaseOrderId) {
  requireFeature(context, 'procurement_purchasing');
  ensureTenantUser(context, context.tenant.id);
  const order = selectOne('SELECT * FROM purchase_orders WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseOrderId]);
  if (!order) throw fail('Purchase order not found', 404);
  const scope = procurementScopeClause(context, 'po');
  if (scope.sql && order.department_id !== context.user.department_id) {
    throw fail('Purchase order not visible to this department', 403);
  }
  return order;
}

function loadPurchaseRequestLines(context, purchaseRequestId) {
  return selectAll(
    `SELECT prl.*, prl.qty AS qty_requested, prl.unit_price AS unit_price, prl.line_total AS line_total, i.name AS item_name, i.sku, i.barcode, i.category
     FROM purchase_request_lines prl
     LEFT JOIN items i ON i.id = prl.item_id
     WHERE prl.tenant_id = ? AND prl.purchase_request_id = ?
     ORDER BY prl.created_at ASC, prl.id ASC`,
    [context.tenant.id, purchaseRequestId]
  );
}

function loadPurchaseOrderLines(context, purchaseOrderId) {
  return selectAll(
    `SELECT pol.*, i.name AS item_name, i.sku, i.barcode, i.category
     FROM purchase_order_lines pol
     LEFT JOIN items i ON i.id = pol.item_id
     WHERE pol.tenant_id = ? AND pol.purchase_order_id = ?
     ORDER BY pol.created_at ASC, pol.id ASC`,
    [context.tenant.id, purchaseOrderId]
  );
}

function resolveVendorReference(context, payload = {}) {
  const vendorId = payload.vendorId ? requireString(payload.vendorId, 'vendorId', { max: 80 }) : '';
  const vendorName = optionalString(payload.vendorName, 'vendorName', { max: 160 });
  if (vendorId) {
    return loadVendorRecord(context, vendorId);
  }
  if (!vendorName) throw fail('vendorId or vendorName is required', 400);
  const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND lower(name) = lower(?)', [context.tenant.id, vendorName]);
  if (!vendor) throw fail('Vendor not found', 404);
  return vendor;
}

function requestLinesRequireDraft(lines, label = 'Purchase request') {
  if (!lines.length) throw fail(`${label} must contain at least one line`, 409);
}

function procurementVendorSummary(context, vendorId) {
  const scoreRows = selectAll(
    `SELECT score_type, score_value, scored_at, source
     FROM vendor_scores
     WHERE tenant_id = ? AND vendor_id = ?
     ORDER BY scored_at DESC`,
    [context.tenant.id, vendorId]
  );
  const average = scoreRows.length ? scoreRows.reduce((sum, row) => sum + Number(row.score_value || 0), 0) / scoreRows.length : 0;
  return {
    scoreRows,
    averageScore: Number(average.toFixed(1)),
    latestScore: scoreRows[0] || null
  };
}

function currentFiscalYear() {
  return new Date().getUTCFullYear();
}

function loadCostCenterRecord(context, costCenterId) {
  const record = selectOne('SELECT * FROM cost_centers WHERE tenant_id = ? AND id = ?', [context.tenant.id, costCenterId]);
  if (!record) throw fail('Cost center not found', 404);
  return record;
}

function resolveCostCenterReference(context, body = {}, fallbackDepartmentId = '') {
  const costCenterId = body.costCenterId || body.cost_center_id || '';
  if (costCenterId) return loadCostCenterRecord(context, requireString(costCenterId, 'costCenterId', { max: 80 }));
  const departmentId = body.departmentId || body.department_id || fallbackDepartmentId;
  if (!departmentId) throw fail('costCenterId or departmentId is required');
  const costCenter = selectOne('SELECT * FROM cost_centers WHERE tenant_id = ? AND department_id = ? AND status = ? LIMIT 1', [context.tenant.id, departmentId, 'ACTIVE']);
  if (!costCenter) throw fail('Cost center not found for department', 404);
  return costCenter;
}

function getVendorComplianceDocuments(context, vendorId) {
  return selectAll(
    'SELECT * FROM supplier_compliance_documents WHERE tenant_id = ? AND vendor_id = ? ORDER BY expires_at ASC, created_at DESC',
    [context.tenant.id, vendorId]
  );
}

function getVendorContracts(context, vendorId) {
  return selectAll(
    'SELECT * FROM supplier_contracts WHERE tenant_id = ? AND vendor_id = ? ORDER BY expiry_date ASC, created_at DESC',
    [context.tenant.id, vendorId]
  );
}

function getVendorWaivers(context, vendorId) {
  return selectAll(
    `SELECT * FROM procurement_waivers
     WHERE tenant_id = ? AND entity_type = 'vendor' AND entity_id = ?
     ORDER BY approved_at DESC`,
    [context.tenant.id, vendorId]
  );
}

function getActiveWaiver(context, waiverType, entityType, entityId) {
  const now = nowIso();
  return selectOne(
    `SELECT * FROM procurement_waivers
     WHERE tenant_id = ? AND waiver_type = ? AND entity_type = ? AND entity_id = ? AND status = 'APPROVED'
       AND (expires_at IS NULL OR expires_at = '' OR expires_at > ?)
     ORDER BY approved_at DESC
     LIMIT 1`,
    [context.tenant.id, waiverType, entityType, entityId, now]
  );
}

function getDepartmentBudgetRecord(context, { departmentId, costCenterId, fiscalYear = currentFiscalYear() }) {
  return selectOne(
    `SELECT db.*, cc.code AS cost_center_code, cc.name AS cost_center_name, d.name AS department_name, d.code AS department_code
     FROM department_budgets db
     JOIN cost_centers cc ON cc.id = db.cost_center_id
     JOIN departments d ON d.id = db.department_id
     WHERE db.tenant_id = ? AND db.cost_center_id = ? AND db.fiscal_year = ?`,
    [context.tenant.id, costCenterId || '', fiscalYear]
  ) || (departmentId ? selectOne(
    `SELECT db.*, cc.code AS cost_center_code, cc.name AS cost_center_name, d.name AS department_name, d.code AS department_code
     FROM department_budgets db
     JOIN cost_centers cc ON cc.id = db.cost_center_id
     JOIN departments d ON d.id = db.department_id
     WHERE db.tenant_id = ? AND db.department_id = ? AND db.fiscal_year = ?
     ORDER BY db.created_at DESC`,
    [context.tenant.id, departmentId, fiscalYear]
  ) : null);
}

function getBudgetLedgerEntries(context, departmentBudgetId) {
  return selectAll(
    'SELECT * FROM budget_ledger_entries WHERE tenant_id = ? AND department_budget_id = ? ORDER BY created_at DESC',
    [context.tenant.id, departmentBudgetId]
  );
}

function budgetSnapshotFromRecord(context, budget) {
  if (!budget) return null;
  const entries = getBudgetLedgerEntries(context, budget.id);
  const reservations = entries.filter((entry) => entry.entry_type === 'RESERVATION' && entry.status === 'ACTIVE');
  const consumptions = entries.filter((entry) => entry.entry_type === 'CONSUMPTION' && entry.status === 'ACTIVE');
  const reservedAmount = Number(reservations.reduce((sum, entry) => sum + Number(entry.amount || 0), 0).toFixed(2));
  const consumedAmount = Number(consumptions.reduce((sum, entry) => sum + Number(entry.amount || 0), 0).toFixed(2));
  const availableAmount = Number((Number(budget.budget_amount || 0) - reservedAmount - consumedAmount).toFixed(2));
  const alertThreshold = Number((Number(budget.budget_amount || 0) * Number(budget.alert_threshold_pct || 0.85)).toFixed(2));
  return {
    ...budget,
    entries,
    reservedAmount,
    consumedAmount,
    availableAmount,
    alertThreshold,
    utilizationPct: Number(budget.budget_amount ? (((reservedAmount + consumedAmount) / Number(budget.budget_amount || 0)) * 100).toFixed(1) : 0),
    isOverThreshold: Number(reservedAmount + consumedAmount) >= alertThreshold
  };
}

function getVendorGovernanceSummary(context, vendorId) {
  const vendor = loadVendorRecord(context, vendorId);
  const complianceDocuments = getVendorComplianceDocuments(context, vendorId);
  const contracts = getVendorContracts(context, vendorId);
  const waivers = getVendorWaivers(context, vendorId);
  const now = nowIso();
  const expiredDocs = complianceDocuments.filter((doc) => {
    const expiry = doc.expires_at || '';
    return doc.required && (doc.status === 'EXPIRED' || (expiry && expiry <= now));
  });
  const missingDocs = complianceDocuments.filter((doc) => doc.required && !doc.file_name);
  const activeContracts = contracts.filter((contract) => contract.status === 'ACTIVE' && contract.effective_date <= now && contract.expiry_date >= now);
  const renewalAlerts = contracts.filter((contract) => contract.renewal_alert_status === 'ACTIVE' || (contract.expiry_date && contract.expiry_date <= now));
  const scoreSummary = procurementVendorSummary(context, vendorId);
  const lateDeliveryScore = scoreSummary.scoreRows.find((row) => row.score_type === 'LATE_DELIVERY');
  const exceptionHistoryScore = scoreSummary.scoreRows.find((row) => row.score_type === 'EXCEPTION_HISTORY');
  const invoiceExceptions = selectAll(
    `SELECT COUNT(*) AS count
     FROM invoice_match_exceptions ime
     JOIN vendor_invoices vi ON vi.id = ime.vendor_invoice_id
     WHERE ime.tenant_id = ? AND vi.vendor_id = ?`,
    [context.tenant.id, vendorId]
  )[0]?.count ?? 0;
  const blocked = ['BLOCKED', 'SUSPENDED', 'ARCHIVED'].includes(vendor.status);
  const riskSignals = {
    compliance: expiredDocs.length || missingDocs.length ? 'HIGH' : 'LOW',
    delivery: Number(lateDeliveryScore?.score_value ?? 100) < 80 ? 'ELEVATED' : 'LOW',
    exceptions: Number(invoiceExceptions || 0) > 0 || Number(exceptionHistoryScore?.score_value ?? 100) < 80 ? 'ELEVATED' : 'LOW'
  };
  const riskPosture = blocked
    ? 'BLOCKED'
    : expiredDocs.length || missingDocs.length
      ? 'COMPLIANCE_RISK'
      : renewalAlerts.length
        ? 'RENEWAL_WATCH'
        : riskSignals.delivery === 'ELEVATED' || riskSignals.exceptions === 'ELEVATED'
          ? 'WATCH'
          : 'GREEN';
  return {
    vendor,
    scoreSummary,
    complianceDocuments,
    contracts,
    waivers,
    expiredDocs,
    missingDocs,
    activeContracts,
    renewalAlerts,
    invoiceExceptions,
    lateDeliveryScore,
    exceptionHistoryScore,
    blocked,
    riskSignals,
    riskPosture,
    complianceStatus: expiredDocs.length || missingDocs.length ? 'ATTENTION_REQUIRED' : 'CLEAR',
    contractStatus: activeContracts.length ? 'COVERED' : (contracts.length ? 'INSUFFICIENT_CONTRACT_DATA' : 'NO_CONTRACT_DATA'),
    complianceDocumentCount: complianceDocuments.length,
    expiredComplianceDocumentCount: expiredDocs.length,
    activeContractCount: activeContracts.length,
    waiverCount: waivers.length
  };
}

function getContractSignals(context, { vendorId = '', itemId = '', itemCategory = '', amount = 0 } = {}) {
  const now = nowIso();
  const activeContracts = selectAll(
    `SELECT sc.*, v.name AS vendor_name, v.code AS vendor_code
     FROM supplier_contracts sc
     JOIN vendors v ON v.id = sc.vendor_id
     WHERE sc.tenant_id = ? AND sc.status = 'ACTIVE' AND sc.effective_date <= ? AND sc.expiry_date >= ?
     ORDER BY sc.expiry_date ASC, sc.created_at DESC`,
    [context.tenant.id, now, now]
  );
  const directMatches = activeContracts.filter((contract) => (itemId && contract.item_id === itemId) || (itemCategory && contract.item_category && contract.item_category.toLowerCase() === itemCategory.toLowerCase()));
  const vendorMatches = directMatches.filter((contract) => !vendorId || contract.vendor_id === vendorId);
  const otherVendorMatches = directMatches.filter((contract) => vendorId && contract.vendor_id !== vendorId);
  const activeBestMatch = vendorMatches[0] || directMatches[0] || null;
  const evidence = activeBestMatch
    ? selectAll('SELECT * FROM supplier_compliance_documents WHERE tenant_id = ? AND vendor_id = ? ORDER BY expires_at ASC, created_at DESC', [context.tenant.id, activeBestMatch.vendor_id])
    : [];
  const status = !activeContracts.length
    ? 'INSUFFICIENT_CONTRACT_DATA'
    : vendorId && activeBestMatch && activeBestMatch.vendor_id === vendorId
      ? 'COVERED'
      : otherVendorMatches.length
        ? 'NON_CONTRACT_SPEND'
        : directMatches.length
          ? 'REVIEW_REQUIRED'
          : 'INSUFFICIENT_CONTRACT_DATA';
  const alertStatus = activeContracts.some((contract) => contract.renewal_alert_status === 'ACTIVE' || (contract.renewal_alert_at && contract.renewal_alert_at <= now))
    ? 'RENEWAL_ALERT'
    : 'CLEAR';
  return {
    status,
    alertStatus,
    activeContracts,
    directMatches,
    vendorMatches,
    otherVendorMatches,
    sourceEvidence: evidence,
    amount: Number(amount || 0)
  };
}

function getBudgetSignals(context, { departmentId = '', costCenterId = '', fiscalYear = currentFiscalYear() } = {}) {
  const budget = getDepartmentBudgetRecord(context, { departmentId, costCenterId, fiscalYear });
  return budgetSnapshotFromRecord(context, budget);
}

function reserveBudgetForEntity(context, { departmentId, costCenterId, entityType, entityId, amount, reason }) {
  const budget = getDepartmentBudgetRecord(context, { departmentId, costCenterId });
  if (!budget) throw fail('Budget not configured', 409);
  const snapshot = budgetSnapshotFromRecord(context, budget);
  if (!snapshot) throw fail('Budget not configured', 409);
  const existing = selectOne(
    'SELECT * FROM budget_ledger_entries WHERE tenant_id = ? AND department_budget_id = ? AND entry_type = ? AND entity_type = ? AND entity_id = ?',
    [context.tenant.id, budget.id, 'RESERVATION', entityType, entityId]
  );
  if (existing) return snapshot;
  const reserveAmount = Number(amount || 0);
  if (snapshot.availableAmount < reserveAmount) {
    throw fail('Budget exceeded');
  }
  const now = nowIso();
  insert('budget_ledger_entries', {
    id: newId('budget_entry'),
    tenant_id: context.tenant.id,
    department_budget_id: budget.id,
    entry_type: 'RESERVATION',
    entity_type: entityType,
    entity_id: entityId,
    amount: reserveAmount,
    status: 'ACTIVE',
    reason: reason || '',
    created_at: now,
    updated_at: now,
    created_by_user_id: context.user.id,
    updated_by_user_id: context.user.id
  });
  execute(
    'UPDATE department_budgets SET reserved_amount = COALESCE(reserved_amount, 0) + ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
    [reserveAmount, now, context.user.id, context.tenant.id, budget.id]
  );
  return budgetSnapshotFromRecord(context, budget);
}

function consumeBudgetForEntity(context, { departmentId, costCenterId, entityType, entityId, amount, reason }) {
  const budget = getDepartmentBudgetRecord(context, { departmentId, costCenterId });
  if (!budget) throw fail('Budget not configured', 409);
  const snapshot = budgetSnapshotFromRecord(context, budget);
  if (!snapshot) throw fail('Budget not configured', 409);
  const existing = selectOne(
    'SELECT * FROM budget_ledger_entries WHERE tenant_id = ? AND department_budget_id = ? AND entry_type = ? AND entity_type = ? AND entity_id = ?',
    [context.tenant.id, budget.id, 'CONSUMPTION', entityType, entityId]
  );
  if (existing) return snapshot;
  const consumeAmount = Number(amount || 0);
  if (snapshot.availableAmount + snapshot.reservedAmount < consumeAmount && snapshot.availableAmount < consumeAmount) {
    throw fail('Budget exceeded');
  }
  const now = nowIso();
  insert('budget_ledger_entries', {
    id: newId('budget_entry'),
    tenant_id: context.tenant.id,
    department_budget_id: budget.id,
    entry_type: 'CONSUMPTION',
    entity_type: entityType,
    entity_id: entityId,
    amount: consumeAmount,
    status: 'ACTIVE',
    reason: reason || '',
    created_at: now,
    updated_at: now,
    created_by_user_id: context.user.id,
    updated_by_user_id: context.user.id
  });
  execute(
    'UPDATE department_budgets SET consumed_amount = COALESCE(consumed_amount, 0) + ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
    [consumeAmount, now, context.user.id, context.tenant.id, budget.id]
  );
  return budgetSnapshotFromRecord(context, budget);
}

function assertSupplierEligibleForAction(context, vendor, { entityType, entityId, itemId = '', itemCategory = '', amount = 0, waiverType = 'SUPPLIER_EXCEPTION' } = {}) {
  const summary = getVendorGovernanceSummary(context, vendor.id);
  const complianceWaiver = getActiveWaiver(context, waiverType, 'vendor', vendor.id);
  const entityWaiver = entityId ? getActiveWaiver(context, waiverType, entityType, entityId) : null;
  const vendorWaiver = getActiveWaiver(context, waiverType, 'vendor', vendor.id);
  const contractSignals = getContractSignals(context, { vendorId: vendor.id, itemId, itemCategory, amount });
  const supplierBlocked = summary.blocked || vendor.status === 'BLOCKED' || vendor.status === 'ARCHIVED';
  const docsExpired = summary.expiredDocs.length > 0 || summary.missingDocs.length > 0;
  const waiverGranted = Boolean(complianceWaiver || entityWaiver || vendorWaiver);
  if ((supplierBlocked || docsExpired) && !waiverGranted) {
    throw fail(supplierBlocked ? 'Supplier is blocked' : 'Supplier compliance documents are expired');
  }
  if (contractSignals.status === 'NON_CONTRACT_SPEND' && !waiverGranted) {
    throw fail('Non-contract spend detected');
  }
  return {
    summary,
    complianceWaiver,
    entityWaiver,
    vendorWaiver,
    contractSignals
  };
}

function procurementApprovalGate(context, {
  vendor,
  departmentId,
  costCenterId,
  entityType,
  entityId,
  amount,
  itemIds = [],
  itemCategories = [],
  waiverType = 'PROCUREMENT_EXCEPTION'
} = {}) {
  const vendorGuard = assertSupplierEligibleForAction(context, vendor, {
    entityType,
    entityId,
    itemId: itemIds[0] || '',
    itemCategory: itemCategories[0] || '',
    amount,
    waiverType: 'SUPPLIER_EXCEPTION'
  });
  const supplierWaiver = Boolean(vendorGuard.complianceWaiver || vendorGuard.entityWaiver || vendorGuard.vendorWaiver);
  const budget = getBudgetSignals(context, { departmentId, costCenterId });
  const budgetWaiver = getActiveWaiver(context, 'BUDGET_EXCEPTION', entityType, entityId);
  const contractSignals = getContractSignals(context, { vendorId: vendor.id, itemId: itemIds[0] || '', itemCategory: itemCategories[0] || '', amount });
  const blockedReasons = [];
  const warnings = [];
  const totalAmount = Number(amount || 0);
  if (budget && budget.availableAmount < totalAmount && !budgetWaiver) blockedReasons.push(`Budget exceeded by ${Math.abs(budget.availableAmount - totalAmount).toFixed(2)}`);
  if (budget && budget.isOverThreshold) warnings.push('Budget is approaching its alert threshold.');
  if (contractSignals.status === 'INSUFFICIENT_CONTRACT_DATA') warnings.push('Insufficient contract data for a strong contract posture.');
  if (contractSignals.status === 'NON_CONTRACT_SPEND' && !budgetWaiver && !supplierWaiver) blockedReasons.push('Non-contract spend detected.');
  const itemRows = itemIds.length
    ? selectAll(
        `SELECT id, name, category, restricted, status
         FROM items
         WHERE tenant_id = ? AND id IN (${itemIds.map(() => '?').join(',')})`,
        [context.tenant.id, ...itemIds]
      )
    : [];
  if (itemRows.some((item) => Number(item.restricted))) {
    warnings.push('Restricted items require controlled review.');
    if (!['admin', 'supervisor'].includes(context.user.role_key)) {
      blockedReasons.push('Restricted item requires supervisor approval.');
    }
  }
  if (itemRows.some((item) => String(item.status || '').toUpperCase() !== 'ACTIVE')) {
    blockedReasons.push('One or more request items are not active.');
  }
  if ((vendorGuard.summary.blocked || vendorGuard.summary.expiredDocs.length > 0 || vendorGuard.summary.missingDocs.length > 0) && !vendorGuard.complianceWaiver && !vendorGuard.entityWaiver) {
    blockedReasons.push('Supplier governance controls are not satisfied.');
  }
  if (vendorGuard.summary.riskPosture === 'WATCH' || vendorGuard.summary.riskPosture === 'RENEWAL_WATCH') {
    warnings.push(`Supplier risk posture is ${vendorGuard.summary.riskPosture}.`);
  }
  if (Number(vendorGuard.summary.invoiceExceptions || 0) > 0) {
    warnings.push('Supplier has open invoice exception history.');
  }
  if (totalAmount >= 10000) warnings.push('High-value approval requires finance review.');
  return {
    blockedReasons,
    warnings,
    budget,
    budgetWaiver,
    contractSignals,
    supplierSummary: vendorGuard.summary
  };
}

function procurementAdvisoryReadOnly(context, payload = {}) {
  const entityType = payload.entityType || '';
  const entityId = payload.entityId || '';
  const vendorId = payload.vendorId || '';
  const itemCategory = payload.itemCategory || '';
  const itemId = payload.itemId || '';
  const amount = Number(payload.amount || 0);
  const vendor = vendorId ? loadVendorRecord(context, vendorId) : null;
  const contractSignals = vendor ? getContractSignals(context, { vendorId: vendor.id, itemId, itemCategory, amount }) : null;
  const budgetSignals = (payload.departmentId || payload.costCenterId) ? getBudgetSignals(context, { departmentId: payload.departmentId || '', costCenterId: payload.costCenterId || '' }) : null;
  return {
    providerStatus: 'AI_PROVIDER_NOT_CONFIGURED',
    advisory: [],
    sourceEvidence: contractSignals?.sourceEvidence || [],
    contractSignals,
    budgetSignals,
    entityType,
    entityId,
    note: 'AI_PROVIDER_NOT_CONFIGURED'
  };
}

function procureToPayScopeClause(context, alias = 'vi') {
  if (['admin', 'supervisor', 'finance'].includes(context.user.role_key)) {
    return { sql: '', params: [] };
  }
  return { sql: ` AND ${alias}.department_id = ?`, params: [context.user.department_id] };
}

function invoiceEditableStatuses() {
  return new Set(['DRAFT', 'UPLOADED', 'EXTRACTION_PENDING', 'EXTRACTED', 'MATCHING_PENDING', 'MATCHED', 'EXCEPTION', 'APPROVAL_PENDING', 'EXPORT_READY']);
}

function invoiceStatusLabel(status) {
  return String(status || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w|\s\w/g, (ch) => ch.toUpperCase());
}

function lineTotal(qty, unitPrice) {
  return Number((Number(qty || 0) * Number(unitPrice || 0)).toFixed(2));
}

function loadVendorInvoiceExceptions(context, vendorInvoiceId) {
  return selectAll(
    `SELECT e.*, vil.description AS line_description, vil.qty AS line_qty, vil.unit_price AS line_unit_price, vil.purchase_order_line_id, v.name AS vendor_name
     FROM invoice_match_exceptions e
     LEFT JOIN vendor_invoice_lines vil ON vil.id = e.vendor_invoice_line_id
     LEFT JOIN vendor_invoices vi ON vi.id = e.vendor_invoice_id
     LEFT JOIN vendors v ON v.id = vi.vendor_id
     WHERE e.tenant_id = ? AND e.vendor_invoice_id = ?
     ORDER BY e.waived_at IS NOT NULL, e.severity DESC, e.created_at DESC`,
    [context.tenant.id, vendorInvoiceId]
  );
}

function loadVendorInvoiceException(context, vendorInvoiceId, exceptionId) {
  const exception = selectOne(
    `SELECT e.*, vil.description AS line_description, vil.qty AS line_qty, vil.unit_price AS line_unit_price, vil.purchase_order_line_id
     FROM invoice_match_exceptions e
     LEFT JOIN vendor_invoice_lines vil ON vil.id = e.vendor_invoice_line_id
     WHERE e.tenant_id = ? AND e.vendor_invoice_id = ? AND e.id = ?`,
    [context.tenant.id, vendorInvoiceId, exceptionId]
  );
  if (!exception) throw fail('Invoice exception not found', 404);
  return exception;
}

function invoiceConfidenceFromFindings(findings = []) {
  return Number(Math.max(0.45, 1 - findings.length * 0.16).toFixed(2));
}

function clearOpenInvoiceExceptions(context, vendorInvoiceId) {
  execute('DELETE FROM invoice_match_exceptions WHERE tenant_id = ? AND vendor_invoice_id = ? AND waived_at IS NULL', [context.tenant.id, vendorInvoiceId]);
}

function recalculateVendorInvoiceTotals(context, vendorInvoiceId) {
  const lineTotals = selectAll(
    'SELECT COALESCE(SUM(line_total), 0) AS subtotal FROM vendor_invoice_lines WHERE tenant_id = ? AND vendor_invoice_id = ?',
    [context.tenant.id, vendorInvoiceId]
  )[0]?.subtotal ?? 0;
  const invoice = selectOne('SELECT tax_amount, freight_amount, discount_amount FROM vendor_invoices WHERE tenant_id = ? AND id = ?', [context.tenant.id, vendorInvoiceId]);
  if (!invoice) return lineTotals;
  const total = Number((Number(lineTotals) + Number(invoice.tax_amount || 0) + Number(invoice.freight_amount || 0) - Number(invoice.discount_amount || 0)).toFixed(2));
  execute('UPDATE vendor_invoices SET subtotal_amount = ?, total_amount = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [Number(lineTotals), total, nowIso(), context.user.id, context.tenant.id, vendorInvoiceId]);
  return Number(lineTotals);
}

function currentReceiveSessionStatus(context, sessionId) {
  if (!sessionId) return null;
  return selectOne('SELECT status FROM receive_sessions WHERE tenant_id = ? AND id = ?', [context.tenant.id, sessionId]);
}

function evaluateInvoiceMatch(context, invoice, lines) {
  const findings = [];
  const purchaseOrder = invoice.purchase_order_id
    ? selectOne(
        'SELECT id, vendor_id, po_no, status, department_id, facility_id FROM purchase_orders WHERE tenant_id = ? AND id = ?',
        [context.tenant.id, invoice.purchase_order_id]
      )
    : null;
  const receivingSession = invoice.receiving_session_id
    ? selectOne(
        'SELECT id, status, purchase_order_id FROM receive_sessions WHERE tenant_id = ? AND id = ?',
        [context.tenant.id, invoice.receiving_session_id]
      )
    : null;
  const poLines = purchaseOrder
    ? selectAll(
        'SELECT id, item_id, description, qty_ordered, unit_price, line_total FROM purchase_order_lines WHERE tenant_id = ? AND purchase_order_id = ? ORDER BY created_at ASC, id ASC',
        [context.tenant.id, purchaseOrder.id]
      )
    : [];
  const receiptLines = receivingSession
    ? selectAll(
        'SELECT id, item_id, purchase_order_line_id, qty_received, qty_damaged, qty_short, status FROM receive_session_lines WHERE tenant_id = ? AND receive_session_id = ? ORDER BY created_at ASC, id ASC',
        [context.tenant.id, receivingSession.id]
      )
    : [];

  if (!purchaseOrder) {
    findings.push({
      severity: 'HIGH',
      code: 'MISSING_PURCHASE_ORDER',
      message: 'Invoice is missing a linked purchase order.',
      expected: 'Purchase order required',
      actual: 'Not linked',
      vendorInvoiceLineId: null
    });
  } else {
    if (purchaseOrder.vendor_id !== invoice.vendor_id) {
      findings.push({
        severity: 'HIGH',
        code: 'VENDOR_MISMATCH',
        message: 'Invoice vendor does not match the linked purchase order.',
        expected: purchaseOrder.vendor_id,
        actual: invoice.vendor_id,
        vendorInvoiceLineId: null
      });
    }
    if (invoice.match_mode === '3WAY' && !receivingSession) {
      findings.push({
        severity: 'HIGH',
        code: 'MISSING_RECEIPT',
        message: '3-way matching requires a linked receiving session.',
        expected: 'Posted receiving session',
        actual: 'Not linked',
        vendorInvoiceLineId: null
      });
    }
    if (invoice.match_mode === '3WAY' && receivingSession && !['POSTED', 'RECEIVED'].includes(receivingSession.status)) {
      findings.push({
        severity: 'HIGH',
        code: 'RECEIPT_NOT_POSTED',
        message: 'Receiving session must be posted before invoice approval.',
        expected: 'POSTED',
        actual: receivingSession.status,
        vendorInvoiceLineId: null
      });
    }
    for (const line of lines) {
      const poLine = line.purchase_order_line_id
        ? poLines.find((candidate) => candidate.id === line.purchase_order_line_id)
        : poLines.find((candidate) => candidate.item_id === line.item_id) || null;
      if (!poLine) {
        findings.push({
          severity: 'MEDIUM',
          code: 'PO_LINE_MISSING',
          message: 'Invoice line could not be reconciled to a purchase order line.',
          expected: 'Matching purchase order line',
          actual: line.purchase_order_line_id || line.item_id || line.description,
          vendorInvoiceLineId: line.id
        });
        continue;
      }
      if (Number(line.qty) !== Number(poLine.qty_ordered)) {
        findings.push({
          severity: 'HIGH',
          code: 'QUANTITY_VARIANCE',
          message: 'Invoice quantity does not match purchase order quantity.',
          expected: String(poLine.qty_ordered),
          actual: String(line.qty),
          vendorInvoiceLineId: line.id
        });
      }
      if (Math.abs(Number(line.unit_price) - Number(poLine.unit_price)) > 0.01) {
        findings.push({
          severity: 'HIGH',
          code: 'PRICE_VARIANCE',
          message: 'Invoice unit price does not match purchase order unit price.',
          expected: String(poLine.unit_price),
          actual: String(line.unit_price),
          vendorInvoiceLineId: line.id
        });
      }
      if (invoice.match_mode === '3WAY') {
        const receiptLine = receiptLines.find((candidate) => candidate.purchase_order_line_id === poLine.id);
        if (!receiptLine) {
          findings.push({
            severity: 'HIGH',
            code: 'MISSING_RECEIPT_LINE',
            message: 'Purchase order line has no linked receiving line.',
            expected: 'Received line',
            actual: poLine.id,
            vendorInvoiceLineId: line.id
          });
        } else {
          const receivedQuantity = Number(receiptLine.qty_received || 0) - Number(receiptLine.qty_damaged || 0) - Number(receiptLine.qty_short || 0);
          if (receivedQuantity < Number(line.qty)) {
            findings.push({
              severity: 'HIGH',
              code: 'RECEIPT_VARIANCE',
              message: 'Receiving quantity does not cover the invoice quantity.',
              expected: String(receivedQuantity),
              actual: String(line.qty),
              vendorInvoiceLineId: line.id
            });
          }
        }
      }
    }
    for (const poLine of poLines) {
      const matchingLine = lines.find((candidate) => candidate.purchase_order_line_id === poLine.id || candidate.item_id === poLine.item_id || candidate.description === poLine.description);
      if (!matchingLine) {
        findings.push({
          severity: 'MEDIUM',
          code: 'MISSING_PO_LINE',
          message: 'Purchase order line was not represented on the invoice.',
          expected: poLine.description,
          actual: 'Missing',
          vendorInvoiceLineId: null
        });
      }
    }
  }

  return {
    purchaseOrder,
    receivingSession,
    findings,
    matchConfidence: invoiceConfidenceFromFindings(findings)
  };
}

function loadVendorInvoiceRecord(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  ensureTenantUser(context, context.tenant.id);
  const invoice = selectOne('SELECT * FROM vendor_invoices WHERE tenant_id = ? AND id = ?', [context.tenant.id, vendorInvoiceId]);
  if (!invoice) throw fail('Vendor invoice not found', 404);
  const scope = procureToPayScopeClause(context, 'vi');
  if (scope.sql && invoice.department_id !== context.user.department_id) {
    throw fail('Vendor invoice not visible to this department', 403);
  }
  return invoice;
}

function loadRfqRecord(context, rfqRequestId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  ensureTenantUser(context, context.tenant.id);
  const rfq = selectOne('SELECT * FROM rfq_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, rfqRequestId]);
  if (!rfq) throw fail('RFQ request not found', 404);
  const scope = procureToPayScopeClause(context, 'r');
  if (scope.sql && rfq.department_id !== context.user.department_id) {
    throw fail('RFQ request not visible to this department', 403);
  }
  return rfq;
}

function loadVendorQuoteRecord(context, vendorQuoteId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  ensureTenantUser(context, context.tenant.id);
  const quote = selectOne('SELECT * FROM vendor_quotes WHERE tenant_id = ? AND id = ?', [context.tenant.id, vendorQuoteId]);
  if (!quote) throw fail('Vendor quote not found', 404);
  const rfq = selectOne('SELECT id, department_id FROM rfq_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, quote.rfq_request_id]);
  const scope = procureToPayScopeClause(context, 'q');
  if (scope.sql && rfq && rfq.department_id !== context.user.department_id) {
    throw fail('Vendor quote not visible to this department', 403);
  }
  return quote;
}

function loadVendorInvoiceLines(context, vendorInvoiceId) {
  return selectAll(
    `SELECT vil.*, i.name AS item_name, po.po_no AS purchase_order_no, pol.description AS purchase_order_line_description
     FROM vendor_invoice_lines vil
     LEFT JOIN items i ON i.id = vil.item_id
     LEFT JOIN purchase_order_lines pol ON pol.id = vil.purchase_order_line_id
     LEFT JOIN purchase_orders po ON po.id = pol.purchase_order_id
     WHERE vil.tenant_id = ? AND vil.vendor_invoice_id = ?
     ORDER BY vil.created_at ASC, vil.id ASC`,
    [context.tenant.id, vendorInvoiceId]
  );
}

function loadRfqLines(context, rfqRequestId) {
  return selectAll(
    `SELECT rl.*, i.name AS item_name, i.sku
     FROM rfq_lines rl
     LEFT JOIN items i ON i.id = rl.item_id
     WHERE rl.tenant_id = ? AND rl.rfq_request_id = ?
     ORDER BY rl.created_at ASC, rl.id ASC`,
    [context.tenant.id, rfqRequestId]
  );
}

function loadVendorQuoteLines(context, vendorQuoteId) {
  return selectAll(
    `SELECT vql.*, i.name AS item_name, rl.description AS rfq_line_description
     FROM vendor_quote_lines vql
     LEFT JOIN items i ON i.id = vql.item_id
     LEFT JOIN rfq_lines rl ON rl.id = vql.rfq_line_id
     WHERE vql.tenant_id = ? AND vql.vendor_quote_id = ?
     ORDER BY vql.created_at ASC, vql.id ASC`,
    [context.tenant.id, vendorQuoteId]
  );
}

export function getProcurementSummary(context) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_purchasing');
  ensureTenantUser(context, context.tenant.id);
  const vendors = selectAll('SELECT COUNT(*) AS count FROM vendors WHERE tenant_id = ?', [context.tenant.id])[0].count;
  const activeVendors = selectAll('SELECT COUNT(*) AS count FROM vendors WHERE tenant_id = ? AND active = 1', [context.tenant.id])[0].count;
  const pendingRequests = selectAll('SELECT COUNT(*) AS count FROM purchase_requests WHERE tenant_id = ? AND status = ?', [context.tenant.id, 'PENDING_APPROVAL'])[0].count;
  const approvedRequests = selectAll('SELECT COUNT(*) AS count FROM purchase_requests WHERE tenant_id = ? AND status = ?', [context.tenant.id, 'APPROVED'])[0].count;
  const approvedOrders = selectAll('SELECT COUNT(*) AS count FROM purchase_orders WHERE tenant_id = ? AND status = ?', [context.tenant.id, 'APPROVED'])[0].count;
  const issuedOrders = selectAll('SELECT COUNT(*) AS count FROM purchase_orders WHERE tenant_id = ? AND status = ?', [context.tenant.id, 'ISSUED'])[0].count;
  const blockedVendors = selectAll('SELECT COUNT(*) AS count FROM vendors WHERE tenant_id = ? AND status IN (\'BLOCKED\', \'SUSPENDED\', \'ARCHIVED\')', [context.tenant.id])[0].count;
  const expiringContracts = selectAll('SELECT COUNT(*) AS count FROM supplier_contracts WHERE tenant_id = ? AND status = \'ACTIVE\' AND renewal_alert_status = \'ACTIVE\'', [context.tenant.id])[0].count;
  const overBudget = selectAll('SELECT COUNT(*) AS count FROM department_budgets WHERE tenant_id = ? AND (reserved_amount + consumed_amount) >= (budget_amount * alert_threshold_pct)', [context.tenant.id])[0].count;
  const waivers = selectAll('SELECT COUNT(*) AS count FROM procurement_waivers WHERE tenant_id = ? AND status = \'APPROVED\'', [context.tenant.id])[0].count;
  return {
    summary: {
      vendors,
      activeVendors,
      pendingRequests,
      approvedRequests,
      approvedOrders,
      issuedOrders,
      blockedVendors,
      expiringContracts,
      overBudget,
      waivers
    }
  };
}

export function listSupplierContracts(context) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'view_contract_repository');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `SELECT sc.*, v.name AS vendor_name, v.code AS vendor_code, v.status AS vendor_status, i.name AS item_name
     FROM supplier_contracts sc
     JOIN vendors v ON v.id = sc.vendor_id
     LEFT JOIN items i ON i.id = sc.item_id
     WHERE sc.tenant_id = ?
     ORDER BY sc.expiry_date ASC, sc.created_at DESC`,
    [context.tenant.id]
  ).map((contract) => ({
    ...contract,
    renewal_status: contract.renewal_alert_status === 'ACTIVE' || (contract.expiry_date && contract.expiry_date <= nowIso()) ? 'RENEWAL_ALERT' : 'CLEAR',
    contract_status: contract.status === 'ACTIVE' && contract.expiry_date >= nowIso() ? 'ACTIVE' : contract.status
  }));
}

export function getSupplierContractDetail(context, contractId) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'view_contract_repository');
  const contract = selectOne(
    `SELECT sc.*, v.name AS vendor_name, v.code AS vendor_code, v.status AS vendor_status, i.name AS item_name
     FROM supplier_contracts sc
     JOIN vendors v ON v.id = sc.vendor_id
     LEFT JOIN items i ON i.id = sc.item_id
     WHERE sc.tenant_id = ? AND sc.id = ?`,
    [context.tenant.id, contractId]
  );
  if (!contract) throw fail('Contract not found', 404);
  return {
    contract: {
      ...contract,
      renewal_status: contract.renewal_alert_status === 'ACTIVE' || (contract.expiry_date && contract.expiry_date <= nowIso()) ? 'RENEWAL_ALERT' : 'CLEAR',
      contract_status: contract.status === 'ACTIVE' && contract.expiry_date >= nowIso() ? 'ACTIVE' : contract.status
    },
    vendor: selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, contract.vendor_id]),
    sourceEvidence: selectAll('SELECT * FROM documents WHERE tenant_id = ? AND entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [context.tenant.id, 'supplier_contract', contract.id]),
    relatedPurchaseRequests: selectAll('SELECT * FROM purchase_requests WHERE tenant_id = ? AND vendor_id = ? ORDER BY created_at DESC LIMIT 10', [context.tenant.id, contract.vendor_id])
  };
}

export function createSupplierContract(context, body = {}) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'manage_contract_repository');
  return transaction(() => {
    const vendor = resolveVendorReference(context, body);
    const contract = {
      id: newId('contract'),
      tenant_id: context.tenant.id,
      vendor_id: vendor.id,
      contract_no: requireString(body.contractNo || body.contract_no, 'contractNo', { max: 80 }),
      title: requireString(body.title, 'title', { max: 180 }),
      effective_date: requireString(body.effectiveDate || body.effective_date, 'effectiveDate', { max: 40 }),
      expiry_date: requireString(body.expiryDate || body.expiry_date, 'expiryDate', { max: 40 }),
      status: ['ACTIVE', 'DRAFT', 'EXPIRED', 'SUSPENDED', 'ARCHIVED'].includes(String(body.status || 'ACTIVE')) ? String(body.status || 'ACTIVE') : 'ACTIVE',
      document_reference: optionalString(body.documentReference || body.document_reference, 'documentReference', { max: 120 }),
      item_id: body.itemId || body.item_id ? requireString(body.itemId || body.item_id, 'itemId', { max: 80 }) : null,
      item_category: optionalString(body.itemCategory || body.item_category, 'itemCategory', { max: 120 }),
      pricing_reference: optionalString(body.pricingReference || body.pricing_reference, 'pricingReference', { max: 160 }),
      renewal_alert_at: body.renewalAlertAt || body.renewal_alert_at || null,
      renewal_alert_status: String(body.renewalAlertStatus || body.renewal_alert_status || 'ACTIVE'),
      notes: optionalString(body.notes, 'notes', { max: 240 }),
      created_at: nowIso(),
      updated_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_by_user_id: context.user.id
    };
    if (!contract.contract_no) throw fail('contractNo is required', 400);
    if (!contract.title) throw fail('title is required', 400);
    insert('supplier_contracts', contract);
    insertAudit(context, {
      action: 'CREATE_SUPPLIER_CONTRACT',
      entityType: 'supplier_contract',
      entityId: contract.id,
      summary: `${contract.contract_no} created for ${vendor.name}`,
      after: contract
    });
    return getSupplierContractDetail(context, contract.id);
  });
}

export function updateSupplierContract(context, contractId, body = {}) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'manage_contract_repository');
  return transaction(() => {
    const contract = selectOne('SELECT * FROM supplier_contracts WHERE tenant_id = ? AND id = ?', [context.tenant.id, contractId]);
    if (!contract) throw fail('Contract not found', 404);
    const updated = {
      ...contract,
      contract_no: body.contractNo === undefined && body.contract_no === undefined ? contract.contract_no : requireString(body.contractNo || body.contract_no, 'contractNo', { max: 80 }),
      title: body.title === undefined ? contract.title : requireString(body.title, 'title', { max: 180 }),
      effective_date: body.effectiveDate === undefined && body.effective_date === undefined ? contract.effective_date : requireString(body.effectiveDate || body.effective_date, 'effectiveDate', { max: 40 }),
      expiry_date: body.expiryDate === undefined && body.expiry_date === undefined ? contract.expiry_date : requireString(body.expiryDate || body.expiry_date, 'expiryDate', { max: 40 }),
      status: body.status === undefined ? contract.status : String(body.status),
      document_reference: body.documentReference === undefined && body.document_reference === undefined ? contract.document_reference : optionalString(body.documentReference || body.document_reference, 'documentReference', { max: 120 }),
      item_id: body.itemId === undefined && body.item_id === undefined ? contract.item_id : (body.itemId || body.item_id ? requireString(body.itemId || body.item_id, 'itemId', { max: 80 }) : null),
      item_category: body.itemCategory === undefined && body.item_category === undefined ? contract.item_category : optionalString(body.itemCategory || body.item_category, 'itemCategory', { max: 120 }),
      pricing_reference: body.pricingReference === undefined && body.pricing_reference === undefined ? contract.pricing_reference : optionalString(body.pricingReference || body.pricing_reference, 'pricingReference', { max: 160 }),
      renewal_alert_at: body.renewalAlertAt === undefined && body.renewal_alert_at === undefined ? contract.renewal_alert_at : (body.renewalAlertAt || body.renewal_alert_at || null),
      renewal_alert_status: body.renewalAlertStatus === undefined && body.renewal_alert_status === undefined ? contract.renewal_alert_status : String(body.renewalAlertStatus || body.renewal_alert_status),
      notes: body.notes === undefined ? contract.notes : optionalString(body.notes, 'notes', { max: 240 }),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute(
      `UPDATE supplier_contracts
       SET contract_no = ?, title = ?, effective_date = ?, expiry_date = ?, status = ?, document_reference = ?, item_id = ?, item_category = ?, pricing_reference = ?, renewal_alert_at = ?, renewal_alert_status = ?, notes = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [updated.contract_no, updated.title, updated.effective_date, updated.expiry_date, updated.status, updated.document_reference, updated.item_id, updated.item_category, updated.pricing_reference, updated.renewal_alert_at, updated.renewal_alert_status, updated.notes, updated.updated_at, updated.updated_by_user_id, context.tenant.id, contractId]
    );
    insertAudit(context, {
      action: 'UPDATE_SUPPLIER_CONTRACT',
      entityType: 'supplier_contract',
      entityId: contractId,
      summary: `${updated.contract_no} updated`,
      before: contract,
      after: updated
    });
    return getSupplierContractDetail(context, contractId);
  });
}

export function listDepartmentBudgets(context) {
  requireFeature(context, 'budget_controls');
  requireCapability(context, 'view_budget_controls');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `SELECT db.*, cc.code AS cost_center_code, cc.name AS cost_center_name, d.name AS department_name, d.code AS department_code
     FROM department_budgets db
     JOIN cost_centers cc ON cc.id = db.cost_center_id
     JOIN departments d ON d.id = db.department_id
     WHERE db.tenant_id = ?
     ORDER BY d.name ASC, cc.code ASC`,
    [context.tenant.id]
  ).map((budget) => budgetSnapshotFromRecord(context, budget));
}

export function getDepartmentBudgetDetail(context, budgetId) {
  requireFeature(context, 'budget_controls');
  requireCapability(context, 'view_budget_controls');
  const budget = selectOne(
    `SELECT db.*, cc.code AS cost_center_code, cc.name AS cost_center_name, d.name AS department_name, d.code AS department_code
     FROM department_budgets db
     JOIN cost_centers cc ON cc.id = db.cost_center_id
     JOIN departments d ON d.id = db.department_id
     WHERE db.tenant_id = ? AND db.id = ?`,
    [context.tenant.id, budgetId]
  );
  if (!budget) throw fail('Budget not found', 404);
  return {
    budget: budgetSnapshotFromRecord(context, budget),
    ledgerEntries: getBudgetLedgerEntries(context, budget.id),
    waivers: selectAll('SELECT * FROM procurement_waivers WHERE tenant_id = ? AND entity_type = ? AND entity_id = ? ORDER BY approved_at DESC', [context.tenant.id, 'department_budget', budget.id])
  };
}

export function updateDepartmentBudget(context, budgetId, body = {}) {
  requireFeature(context, 'budget_controls');
  requireCapability(context, 'manage_budget_controls');
  return transaction(() => {
    const budget = selectOne('SELECT * FROM department_budgets WHERE tenant_id = ? AND id = ?', [context.tenant.id, budgetId]);
    if (!budget) throw fail('Budget not found', 404);
    const updated = {
      ...budget,
      budget_amount: body.budgetAmount === undefined && body.budget_amount === undefined ? Number(budget.budget_amount || 0) : Number(body.budgetAmount ?? body.budget_amount),
      alert_threshold_pct: body.alertThresholdPct === undefined && body.alert_threshold_pct === undefined ? Number(budget.alert_threshold_pct || 0.85) : Number(body.alertThresholdPct ?? body.alert_threshold_pct),
      status: body.status === undefined ? budget.status : String(body.status),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    if (!Number.isFinite(updated.budget_amount) || updated.budget_amount < 0) throw fail('budgetAmount must be a non-negative number');
    if (!Number.isFinite(updated.alert_threshold_pct) || updated.alert_threshold_pct <= 0 || updated.alert_threshold_pct > 1) throw fail('alertThresholdPct must be between 0 and 1');
    execute(
      'UPDATE department_budgets SET budget_amount = ?, alert_threshold_pct = ?, status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [updated.budget_amount, updated.alert_threshold_pct, updated.status, updated.updated_at, updated.updated_by_user_id, context.tenant.id, budgetId]
    );
    insertAudit(context, {
      action: 'UPDATE_DEPARTMENT_BUDGET',
      entityType: 'department_budget',
      entityId: budgetId,
      summary: `${budget.department_id} budget updated`,
      before: budget,
      after: updated
    });
    return getDepartmentBudgetDetail(context, budgetId);
  });
}

export function listProcurementWaivers(context) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'manage_procurement_waivers');
  ensureTenantUser(context, context.tenant.id);
  return selectAll('SELECT * FROM procurement_waivers WHERE tenant_id = ? ORDER BY approved_at DESC', [context.tenant.id]);
}

export function createProcurementWaiver(context, body = {}) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'manage_procurement_waivers');
  return transaction(() => {
    const waiverType = String(body.waiverType || body.waiver_type || '').trim();
    const entityType = String(body.entityType || body.entity_type || '').trim();
    const entityId = requireString(body.entityId || body.entity_id, 'entityId', { max: 80 });
    const reason = requireString(body.reason, 'reason', { max: 240 });
    if (!waiverType) throw fail('waiverType is required', 400);
    if (!entityType) throw fail('entityType is required', 400);
    if (waiverType === 'BUDGET_EXCEPTION') requireCapability(context, 'approve_budget_exception');
    const now = nowIso();
    const waiver = {
      id: newId('waiver'),
      tenant_id: context.tenant.id,
      waiver_type: waiverType,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      status: 'APPROVED',
      expires_at: body.expiresAt || body.expires_at || null,
      approved_by_user_id: context.user.id,
      approved_at: now,
      created_at: now,
      updated_at: now,
      created_by_user_id: context.user.id,
      updated_by_user_id: context.user.id
    };
    insert('procurement_waivers', waiver);
    insertAudit(context, {
      action: 'CREATE_PROCUREMENT_WAIVER',
      entityType: 'procurement_waiver',
      entityId: waiver.id,
      summary: `${waiver.waiver_type} waiver approved for ${waiver.entity_type}:${waiver.entity_id}`,
      after: waiver
    });
    return waiver;
  });
}

export function getProcurementAdvisory(context, body = {}) {
  requireFeature(context, 'supplier_governance');
  requireCapability(context, 'view_procurement_advisory');
  ensureTenantUser(context, context.tenant.id);
  const advisory = procurementAdvisoryReadOnly(context, body);
  insertAudit(context, {
    action: 'VIEW_PROCUREMENT_ADVISORY',
    entityType: 'procurement_advisory',
    entityId: body.entityId || body.entity_id || body.vendorId || body.vendor_id || 'current',
    summary: 'Read-only procurement advisory viewed',
    after: advisory
  });
  return advisory;
}

export function listVendors(context) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_vendors');
  ensureTenantUser(context, context.tenant.id);
  const vendors = selectAll(
    `
      SELECT
        v.*,
        COUNT(DISTINCT pr.id) AS purchase_request_count,
        COUNT(DISTINCT po.id) AS purchase_order_count,
        COALESCE(AVG(vs.score_value), 0) AS average_score
      FROM vendors v
      LEFT JOIN purchase_requests pr ON pr.vendor_id = v.id AND pr.tenant_id = v.tenant_id
      LEFT JOIN purchase_orders po ON po.vendor_id = v.id AND po.tenant_id = v.tenant_id
      LEFT JOIN vendor_scores vs ON vs.vendor_id = v.id AND vs.tenant_id = v.tenant_id
      WHERE v.tenant_id = ?
      GROUP BY v.id
      ORDER BY v.active DESC, v.status ASC, v.name ASC
    `,
    [context.tenant.id]
  );
  return vendors.map((vendor) => {
    const governance = getVendorGovernanceSummary(context, vendor.id);
    return {
      ...vendor,
      blocked_reason: vendor.blocked_reason || (governance.blocked ? 'Supplier governance controls failed.' : ''),
      compliance_status: governance.complianceStatus,
      risk_posture: governance.riskPosture,
      contract_status: governance.contractStatus,
      compliance_document_count: governance.complianceDocuments.length,
      expired_compliance_document_count: governance.expiredDocs.length,
      active_contract_count: governance.activeContracts.length,
      waiver_count: governance.waivers.length
    };
  });
}

export function getVendorDetail(context, vendorId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_vendors');
  const vendor = loadVendorRecord(context, vendorId);
  const governance = getVendorGovernanceSummary(context, vendorId);
  const { scoreRows, averageScore, latestScore } = governance.scoreSummary;
  const purchaseRequests = selectAll(
    `SELECT pr.*, u.name AS requester_name
     FROM purchase_requests pr
     JOIN users u ON u.id = pr.requested_by_user_id
     WHERE pr.tenant_id = ? AND pr.vendor_id = ?
     ORDER BY pr.created_at DESC`,
    [context.tenant.id, vendorId]
  );
  const purchaseOrders = selectAll(
    `SELECT po.*, u.name AS creator_name
     FROM purchase_orders po
     JOIN users u ON u.id = po.created_by_user_id
     WHERE po.tenant_id = ? AND po.vendor_id = ?
     ORDER BY po.created_at DESC`,
    [context.tenant.id, vendorId]
  );
  return {
    vendor,
    governance,
    scoreRows,
    averageScore,
    latestScore,
    purchaseRequests,
    purchaseOrders,
    complianceDocuments: governance.complianceDocuments,
    contracts: governance.contracts,
    waivers: governance.waivers
  };
}

export function createVendor(context, body) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'manage_vendors');
  const name = requireString(body.name, 'name', { max: 160 });
  const code = requireString(body.code, 'code', { max: 40 });
  const status = requireEnum(body.status ?? 'ACTIVE', 'status', ['DRAFT', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'ARCHIVED']);
  const contactName = optionalString(body.contactName ?? body.contact_name, 'contactName', { max: 120 });
  const email = optionalString(body.email, 'email', { max: 120 });
  const phone = optionalString(body.phone, 'phone', { max: 40 });
  return transaction(() => {
    if (selectOne('SELECT 1 FROM vendors WHERE tenant_id = ? AND (lower(name) = lower(?) OR lower(code) = lower(?))', [context.tenant.id, name, code])) {
      throw fail('Vendor already exists for this tenant', 409);
    }
    const vendor = {
      id: newId('vendor'),
      tenant_id: context.tenant.id,
      name,
      code,
      status,
      risk_score: requirePositiveInt(body.riskScore ?? body.risk_score ?? 0, 'riskScore', { max: 100 }),
      active: ['BLOCKED', 'SUSPENDED', 'ARCHIVED'].includes(status) ? 0 : 1,
      blocked_reason: optionalString(body.blockedReason ?? body.blocked_reason, 'blockedReason', { max: 220 }),
      last_compliance_review_at: body.lastComplianceReviewAt === undefined ? nowIso() : (body.lastComplianceReviewAt || null),
      last_contract_review_at: body.lastContractReviewAt === undefined ? nowIso() : (body.lastContractReviewAt || null),
      contact_name: contactName,
      email,
      phone,
      last_reviewed_at: body.lastReviewedAt || null,
      created_at: nowIso(),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('vendors', vendor);
    insertAudit(context, {
      action: 'CREATE_VENDOR',
      entityType: 'vendor',
      entityId: vendor.id,
      summary: `${vendor.name} created`,
      after: vendor
    });
    return getVendorDetail(context, vendor.id);
  });
}

export function updateVendor(context, vendorId, body) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'manage_vendors');
  return transaction(() => {
    const vendor = loadVendorRecord(context, vendorId);
    const updated = {
      ...vendor,
      name: body.name ? requireString(body.name, 'name', { max: 160 }) : vendor.name,
      code: body.code ? requireString(body.code, 'code', { max: 40 }) : vendor.code,
      status: body.status ? requireEnum(body.status, 'status', ['DRAFT', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'ARCHIVED']) : vendor.status,
      risk_score: body.riskScore === undefined && body.risk_score === undefined ? vendor.risk_score : requirePositiveInt(body.riskScore ?? body.risk_score, 'riskScore', { max: 100 }),
      contact_name: body.contactName !== undefined ? optionalString(body.contactName, 'contactName', { max: 120 }) : vendor.contact_name,
      email: body.email !== undefined ? optionalString(body.email, 'email', { max: 120 }) : vendor.email,
      phone: body.phone !== undefined ? optionalString(body.phone, 'phone', { max: 40 }) : vendor.phone,
      last_reviewed_at: body.lastReviewedAt === undefined ? vendor.last_reviewed_at : (body.lastReviewedAt || null),
      active: body.active === undefined ? vendor.active : asBool(body.active) ? 1 : 0,
      blocked_reason: body.blockedReason === undefined && body.blocked_reason === undefined ? vendor.blocked_reason : optionalString(body.blockedReason ?? body.blocked_reason, 'blockedReason', { max: 220 }),
      last_compliance_review_at: body.lastComplianceReviewAt === undefined ? vendor.last_compliance_review_at : (body.lastComplianceReviewAt || null),
      last_contract_review_at: body.lastContractReviewAt === undefined ? vendor.last_contract_review_at : (body.lastContractReviewAt || null),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute(
      `UPDATE vendors
       SET name = ?, code = ?, status = ?, risk_score = ?, active = ?, blocked_reason = ?, last_compliance_review_at = ?, last_contract_review_at = ?, contact_name = ?, email = ?, phone = ?, last_reviewed_at = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [updated.name, updated.code, updated.status, updated.risk_score, updated.active, updated.blocked_reason, updated.last_compliance_review_at, updated.last_contract_review_at, updated.contact_name, updated.email, updated.phone, updated.last_reviewed_at, updated.updated_at, updated.updated_by_user_id, context.tenant.id, vendorId]
    );
    insertAudit(context, {
      action: 'UPDATE_VENDOR',
      entityType: 'vendor',
      entityId: vendor.id,
      summary: `${vendor.name} updated`,
      before: vendor,
      after: updated
    });
    return getVendorDetail(context, vendor.id);
  });
}

export function listPurchaseRequests(context) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_purchasing');
  ensureTenantUser(context, context.tenant.id);
  const scope = procurementScopeClause(context, 'pr');
  return selectAll(
    `
      SELECT pr.*, d.name AS department_name, u.name AS requester_name, v.name AS vendor_name, v.code AS vendor_code, cc.code AS cost_center_code, cc.name AS cost_center_name
      FROM purchase_requests pr
      JOIN departments d ON d.id = pr.department_id
      JOIN users u ON u.id = pr.requested_by_user_id
      LEFT JOIN vendors v ON v.id = pr.vendor_id
      LEFT JOIN cost_centers cc ON cc.id = pr.cost_center_id
      WHERE pr.tenant_id = ? ${scope.sql}
      ORDER BY pr.created_at DESC
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function getPurchaseDetail(context, purchaseRequestId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_purchasing');
  const purchaseRequest = loadPurchaseRequestRecord(context, purchaseRequestId);
  const lines = loadPurchaseRequestLines(context, purchaseRequestId);
  const vendor = purchaseRequest.vendor_id ? selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseRequest.vendor_id]) : null;
  const costCenter = purchaseRequest.cost_center_id ? selectOne('SELECT * FROM cost_centers WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseRequest.cost_center_id]) : null;
  const requestOrders = selectAll(
    `SELECT po.*, v.name AS vendor_name
     FROM purchase_orders po
     JOIN vendors v ON v.id = po.vendor_id
     WHERE po.tenant_id = ? AND po.source_purchase_request_id = ?
     ORDER BY po.created_at DESC`,
    [context.tenant.id, purchaseRequestId]
  );
  const vendorScores = vendor ? procurementVendorSummary(context, vendor.id) : { scoreRows: [], averageScore: 0, latestScore: null };
  const budget = purchaseRequest.cost_center_id ? getBudgetSignals(context, { costCenterId: purchaseRequest.cost_center_id, departmentId: purchaseRequest.department_id }) : null;
  const contractSignals = vendor ? getContractSignals(context, { vendorId: vendor.id, amount: Number(purchaseRequest.total_amount || 0), itemIds: lines.map((line) => line.item_id).filter(Boolean), itemCategories: lines.map((line) => line.category || line.item_name || '').filter(Boolean) }) : null;
  return { purchaseRequest, vendor, costCenter, budget, contractSignals, vendorScores, lines, purchaseOrders: requestOrders };
}

export function createPurchaseRequest(context, body) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'create_purchase_request');
  const payload = body;
  const vendor = resolveVendorReference(context, payload);
  const accountingCode = optionalAccountingCode(payload.accountingCode);
  const lines = requireArray(payload.lines, 'lines').map((line, index) => ({
    itemId: line.itemId ? requireString(line.itemId, `lines[${index}].itemId`, { max: 80 }) : null,
    description: requireString(line.description, `lines[${index}].description`, { max: 220 }),
    qty: requirePositiveInt(line.qty, `lines[${index}].qty`, { max: 100000 }),
    unitPrice: Number(line.unitPrice ?? 0)
  }));
  if (lines.some((line) => !Number.isFinite(line.unitPrice) || line.unitPrice < 0)) throw fail('Each line unitPrice must be a non-negative number');
  const privileged = ['admin', 'supervisor', 'finance'].includes(context.user.role_key);
  const departmentId = privileged && payload.departmentId ? requireString(payload.departmentId, 'departmentId', { max: 80 }) : context.user.department_id;
  const facilityId = privileged && payload.facilityId ? requireString(payload.facilityId, 'facilityId', { max: 80 }) : context.user.facility_id;
  const costCenter = resolveCostCenterReference(context, payload, departmentId);
  assertDepartmentBelongsToTenant(context.tenant.id, departmentId);
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);

  return transaction(() => {
    const totalAmount = Number(lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0).toFixed(2));
    const purchaseRequest = {
      id: newId('purchase'),
      tenant_id: context.tenant.id,
      pr_no: `PR-${Math.floor(Date.now() / 1000).toString().slice(-4)}`,
      vendor_name: vendor.name,
      vendor_id: vendor.id,
      department_id: departmentId,
      cost_center_id: costCenter.id,
      facility_id: facilityId,
      requested_by_user_id: context.user.id,
      accounting_code: accountingCode,
      status: 'DRAFT',
      total_amount: totalAmount,
      approved_at: null,
      approved_by_user_id: null,
      submitted_at: null,
      submitted_by_user_id: null,
      rejected_at: null,
      rejected_by_user_id: null,
      rejection_reason: '',
      cancelled_at: null,
      cancelled_by_user_id: null,
      cancel_reason: '',
      closed_at: null,
      closed_by_user_id: null,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id,
      invoice_status: 'NOT_RECEIVED'
    };
    insert('purchase_requests', purchaseRequest);
    for (const [lineIndex, line] of lines.entries()) {
      insert('purchase_request_lines', {
        id: newId('purchase_line'),
        tenant_id: context.tenant.id,
        purchase_request_id: purchaseRequest.id,
        item_id: line.itemId,
        description: line.description,
        qty: line.qty,
        unit_price: line.unitPrice,
        line_total: Number((line.qty * line.unitPrice).toFixed(2)),
        status: 'DRAFT',
        created_at: nowIso(),
        updated_at: nowIso(),
        created_by_user_id: context.user.id,
        updated_by_user_id: context.user.id
      });
    }
    insertAudit(context, {
      action: 'CREATE_PURCHASE_REQUEST',
      entityType: 'purchase_request',
      entityId: purchaseRequest.id,
      summary: `${purchaseRequest.pr_no} drafted for ${vendor.name}`,
      after: purchaseRequest
    });
    return getPurchaseDetail(context, purchaseRequest.id);
  });
}

function optionalAccountingCode(value) {
  if (value === undefined || value === null) return '';
  const text = String(value).trim();
  if (text.length === 0) return '';
  if (text.length > 80) throw fail('accountingCode is too long');
  return text;
}

export function approvePurchaseRequest(context, purchaseRequestId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'approve_purchase_request');
  return transaction(() => {
    const purchaseRequest = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (!purchaseRequest) throw fail('Purchase request not found', 404);
    if (purchaseRequest.status !== 'PENDING_APPROVAL') throw fail('Purchase request cannot be approved in its current state', 409);
    const lines = loadPurchaseRequestLines(context, purchaseRequestId);
    const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseRequest.vendor_id]);
    if (!vendor) throw fail('Vendor not found', 404);
    const costCenterId = purchaseRequest.cost_center_id || resolveCostCenterReference(context, { departmentId: purchaseRequest.department_id }, purchaseRequest.department_id).id;
    const approvalGate = procurementApprovalGate(context, {
      vendor,
      departmentId: purchaseRequest.department_id,
      costCenterId,
      entityType: 'purchase_request',
      entityId: purchaseRequest.id,
      amount: Number(purchaseRequest.total_amount || 0),
      itemIds: lines.map((line) => line.item_id).filter(Boolean),
      itemCategories: lines.map((line) => line.category || line.item_name || '').filter(Boolean)
    });
    if (approvalGate.blockedReasons.length) {
      throw fail(approvalGate.blockedReasons.join('; '), 409);
    }
    reserveBudgetForEntity(context, {
      departmentId: purchaseRequest.department_id,
      costCenterId,
      entityType: 'purchase_request',
      entityId: purchaseRequest.id,
      amount: Number(purchaseRequest.total_amount || 0),
      reason: `Purchase request ${purchaseRequest.pr_no} approved`
    });
    execute(
      'UPDATE purchase_requests SET status = ?, approved_at = ?, approved_by_user_id = ? WHERE id = ? AND tenant_id = ?',
      ['APPROVED', nowIso(), context.user.id, purchaseRequestId, context.tenant.id]
    );
    execute(
      'UPDATE purchase_request_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_request_id = ?',
      ['APPROVED', nowIso(), context.user.id, context.tenant.id, purchaseRequestId]
    );
    insertAudit(context, {
      action: 'APPROVE_PURCHASE_REQUEST',
      entityType: 'purchase_request',
      entityId: purchaseRequestId,
      summary: `${purchaseRequest.pr_no} approved`,
      before: purchaseRequest,
      after: { ...purchaseRequest, status: 'APPROVED', approved_by_user_id: context.user.id, budget_status: approvalGate.budget?.availableAmount ?? null }
    });
    return getPurchaseDetail(context, purchaseRequestId);
  });
}

export function updatePurchaseRequest(context, purchaseRequestId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'update_purchase_request');
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'DRAFT') throw fail('Purchase request can only be updated while draft', 409);
    const vendor = body.vendorId || body.vendorName ? resolveVendorReference(context, body) : selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, request.vendor_id]);
    const privileged = ['admin', 'supervisor', 'finance'].includes(context.user.role_key);
    const departmentId = privileged && body.departmentId ? requireString(body.departmentId, 'departmentId', { max: 80 }) : request.department_id;
    const facilityId = privileged && body.facilityId ? requireString(body.facilityId, 'facilityId', { max: 80 }) : request.facility_id;
    const costCenter = body.costCenterId || body.cost_center_id || body.departmentId || body.department_id ? resolveCostCenterReference(context, body, departmentId) : loadCostCenterRecord(context, request.cost_center_id);
    assertDepartmentBelongsToTenant(context.tenant.id, departmentId);
    assertFacilityBelongsToTenant(context.tenant.id, facilityId);
    const accountingCode = body.accountingCode !== undefined ? optionalAccountingCode(body.accountingCode) : request.accounting_code;
    const updated = {
      ...request,
      vendor_id: vendor?.id || request.vendor_id,
      vendor_name: vendor?.name || request.vendor_name,
      department_id: departmentId,
      cost_center_id: costCenter.id,
      facility_id: facilityId,
      accounting_code: accountingCode,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute(
      'UPDATE purchase_requests SET vendor_id = ?, vendor_name = ?, department_id = ?, cost_center_id = ?, facility_id = ?, accounting_code = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [updated.vendor_id, updated.vendor_name, updated.department_id, updated.cost_center_id, updated.facility_id, updated.accounting_code, updated.updated_at, updated.updated_by_user_id, context.tenant.id, purchaseRequestId]
    );
    insertAudit(context, {
      action: 'UPDATE_PURCHASE_REQUEST',
      entityType: 'purchase_request',
      entityId: purchaseRequestId,
      summary: `${request.pr_no} updated`,
      before: request,
      after: updated
    });
    return getPurchaseDetail(context, purchaseRequestId);
  });
}

export function submitPurchaseRequest(context, purchaseRequestId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'submit_purchase_request');
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'DRAFT') throw fail('Purchase request can only be submitted from draft', 409);
    const lines = loadPurchaseRequestLines(context, purchaseRequestId);
    requestLinesRequireDraft(lines, 'Purchase request');
    if (!request.vendor_id) throw fail('Purchase request requires a vendor before submission', 409);
    if (!request.accounting_code) throw fail('Purchase request requires an accounting code before submission', 409);
    const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, request.vendor_id]);
    if (!vendor) throw fail('Vendor not found', 404);
    const itemIds = lines.map((line) => line.item_id).filter(Boolean);
    const itemCategories = lines.map((line) => line.category || line.item_name || '').filter(Boolean);
    const approvalGate = procurementApprovalGate(context, {
      vendor,
      departmentId: request.department_id,
      costCenterId: request.cost_center_id,
      entityType: 'purchase_request',
      entityId: request.id,
      amount: Number(request.total_amount || 0),
      itemIds,
      itemCategories
    });
    if (approvalGate.blockedReasons.length) {
      throw fail(approvalGate.blockedReasons.join('; '), 409);
    }
    const now = nowIso();
    execute(
      'UPDATE purchase_requests SET status = ?, submitted_at = ?, submitted_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['PENDING_APPROVAL', now, context.user.id, now, context.user.id, context.tenant.id, purchaseRequestId]
    );
    execute(
      'UPDATE purchase_request_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_request_id = ?',
      ['PENDING_APPROVAL', now, context.user.id, context.tenant.id, purchaseRequestId]
    );
    insertAudit(context, {
      action: 'SUBMIT_PURCHASE_REQUEST',
      entityType: 'purchase_request',
      entityId: purchaseRequestId,
      summary: `${request.pr_no} submitted for approval`,
      before: request,
      after: { ...request, status: 'PENDING_APPROVAL', submitted_at: now, submitted_by_user_id: context.user.id }
    });
    return getPurchaseDetail(context, purchaseRequestId);
  });
}

export function rejectPurchaseRequest(context, purchaseRequestId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'reject_purchase_request');
  const reason = requireString(body.reason, 'reason', { max: 240 });
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'PENDING_APPROVAL') throw fail('Purchase request can only be rejected while pending approval', 409);
    const now = nowIso();
    execute(
      'UPDATE purchase_requests SET status = ?, rejected_at = ?, rejected_by_user_id = ?, rejection_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['REJECTED', now, context.user.id, reason, now, context.user.id, context.tenant.id, purchaseRequestId]
    );
    execute(
      'UPDATE purchase_request_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_request_id = ?',
      ['REJECTED', now, context.user.id, context.tenant.id, purchaseRequestId]
    );
    insertAudit(context, {
      action: 'REJECT_PURCHASE_REQUEST',
      entityType: 'purchase_request',
      entityId: purchaseRequestId,
      summary: `${request.pr_no} rejected: ${reason}`,
      before: request,
      after: { ...request, status: 'REJECTED', rejected_at: now, rejected_by_user_id: context.user.id, rejection_reason: reason }
    });
    return getPurchaseDetail(context, purchaseRequestId);
  });
}

export function cancelPurchaseRequest(context, purchaseRequestId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'cancel_purchase_request');
  const reason = optionalString(body.reason ?? body.cancelReason, 'reason', { max: 240 }) || 'Cancelled by request owner';
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(request.status)) throw fail('Purchase request cannot be cancelled in its current state', 409);
    const now = nowIso();
    execute(
      'UPDATE purchase_requests SET status = ?, cancelled_at = ?, cancelled_by_user_id = ?, cancel_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['CANCELLED', now, context.user.id, reason, now, context.user.id, context.tenant.id, purchaseRequestId]
    );
    execute(
      'UPDATE purchase_request_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_request_id = ?',
      ['CANCELLED', now, context.user.id, context.tenant.id, purchaseRequestId]
    );
    insertAudit(context, {
      action: 'CANCEL_PURCHASE_REQUEST',
      entityType: 'purchase_request',
      entityId: purchaseRequestId,
      summary: `${request.pr_no} cancelled: ${reason}`,
      before: request,
      after: { ...request, status: 'CANCELLED', cancelled_at: now, cancelled_by_user_id: context.user.id, cancel_reason: reason }
    });
    return getPurchaseDetail(context, purchaseRequestId);
  });
}

export function listPurchaseRequestLines(context, purchaseRequestId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_purchasing');
  loadPurchaseRequestRecord(context, purchaseRequestId);
  return loadPurchaseRequestLines(context, purchaseRequestId);
}

export function createPurchaseRequestLine(context, purchaseRequestId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'update_purchase_request');
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'DRAFT') throw fail('Purchase request line can only be added while draft', 409);
    const itemId = body.itemId ? requireString(body.itemId, 'itemId', { max: 80 }) : '';
    const description = requireString(body.description, 'description', { max: 220 });
    const qty = requirePositiveInt(body.qty, 'qty', { max: 100000 });
    const unitPrice = Number(body.unitPrice ?? 0);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw fail('unitPrice must be a non-negative number');
    const line = {
      id: newId('purchase_line'),
      tenant_id: context.tenant.id,
      purchase_request_id: purchaseRequestId,
      item_id: itemId || null,
      description,
      qty,
      unit_price: unitPrice,
      line_total: Number((qty * unitPrice).toFixed(2)),
      status: 'DRAFT',
      created_at: nowIso(),
      updated_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_by_user_id: context.user.id
    };
    insert('purchase_request_lines', line);
    insertAudit(context, {
      action: 'CREATE_PURCHASE_REQUEST_LINE',
      entityType: 'purchase_request_line',
      entityId: line.id,
      summary: `${request.pr_no} line added`,
      after: line,
      requestId: purchaseRequestId
    });
    return loadPurchaseRequestLines(context, purchaseRequestId);
  });
}

export function updatePurchaseRequestLine(context, purchaseRequestId, lineId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'update_purchase_request');
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'DRAFT') throw fail('Purchase request line can only be updated while draft', 409);
    const line = selectOne('SELECT * FROM purchase_request_lines WHERE tenant_id = ? AND purchase_request_id = ? AND id = ?', [context.tenant.id, purchaseRequestId, lineId]);
    if (!line) throw fail('Purchase request line not found', 404);
    const itemId = body.itemId ? requireString(body.itemId, 'itemId', { max: 80 }) : line.item_id;
    const description = body.description !== undefined ? requireString(body.description, 'description', { max: 220 }) : line.description;
    const qty = body.qty === undefined ? Number(line.qty || 0) : requirePositiveInt(body.qty, 'qty', { max: 100000 });
    const unitPrice = body.unitPrice === undefined ? Number(line.unit_price || 0) : Number(body.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw fail('unitPrice must be a non-negative number');
    const updated = {
      ...line,
      item_id: itemId || null,
      description,
      qty,
      unit_price: unitPrice,
      line_total: Number((qty * unitPrice).toFixed(2)),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute(
      'UPDATE purchase_request_lines SET item_id = ?, description = ?, qty = ?, unit_price = ?, line_total = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [updated.item_id, updated.description, updated.qty, updated.unit_price, updated.line_total, updated.updated_at, updated.updated_by_user_id, context.tenant.id, lineId]
    );
    insertAudit(context, {
      action: 'UPDATE_PURCHASE_REQUEST_LINE',
      entityType: 'purchase_request_line',
      entityId: lineId,
      summary: `${request.pr_no} line updated`,
      before: line,
      after: updated,
      requestId: purchaseRequestId
    });
    return loadPurchaseRequestLines(context, purchaseRequestId);
  });
}

export function deletePurchaseRequestLine(context, purchaseRequestId, lineId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'update_purchase_request');
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'DRAFT') throw fail('Purchase request line can only be deleted while draft', 409);
    const line = selectOne('SELECT * FROM purchase_request_lines WHERE tenant_id = ? AND purchase_request_id = ? AND id = ?', [context.tenant.id, purchaseRequestId, lineId]);
    if (!line) throw fail('Purchase request line not found', 404);
    execute('DELETE FROM purchase_request_lines WHERE tenant_id = ? AND id = ?', [context.tenant.id, lineId]);
    insertAudit(context, {
      action: 'DELETE_PURCHASE_REQUEST_LINE',
      entityType: 'purchase_request_line',
      entityId: lineId,
      summary: `${request.pr_no} line removed`,
      before: line,
      after: {},
      requestId: purchaseRequestId
    });
    return loadPurchaseRequestLines(context, purchaseRequestId);
  });
}

export function listPurchaseOrders(context) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_purchase_orders');
  ensureTenantUser(context, context.tenant.id);
  const scope = procurementScopeClause(context, 'po');
  return selectAll(
    `
      SELECT po.*, v.name AS vendor_name, v.code AS vendor_code, pr.pr_no AS request_no, cc.code AS cost_center_code, cc.name AS cost_center_name
      FROM purchase_orders po
      JOIN vendors v ON v.id = po.vendor_id
      LEFT JOIN purchase_requests pr ON pr.id = po.source_purchase_request_id
      LEFT JOIN cost_centers cc ON cc.id = po.cost_center_id
      WHERE po.tenant_id = ? ${scope.sql}
      ORDER BY po.created_at DESC, po.id DESC
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function getPurchaseOrderDetail(context, purchaseOrderId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'view_purchase_orders');
  const order = loadPurchaseOrderRecord(context, purchaseOrderId);
  const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, order.vendor_id]);
  const costCenter = order.cost_center_id ? selectOne('SELECT * FROM cost_centers WHERE tenant_id = ? AND id = ?', [context.tenant.id, order.cost_center_id]) : null;
  const request = order.source_purchase_request_id ? loadPurchaseRequestRecord(context, order.source_purchase_request_id) : null;
  const lines = loadPurchaseOrderLines(context, purchaseOrderId);
  const budget = order.cost_center_id ? getBudgetSignals(context, { costCenterId: order.cost_center_id, departmentId: order.department_id }) : null;
  const contractSignals = vendor ? getContractSignals(context, { vendorId: vendor.id, amount: Number(order.total_amount || 0), itemIds: lines.map((line) => line.item_id).filter(Boolean), itemCategories: lines.map((line) => line.category || line.item_name || '').filter(Boolean) }) : null;
  return { purchaseOrder: order, vendor, costCenter, sourceRequest: request, budget, contractSignals, lines };
}

export function createPurchaseOrderFromPurchaseRequest(context, purchaseRequestId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'create_purchase_order');
  return transaction(() => {
    const request = loadPurchaseRequestRecord(context, purchaseRequestId);
    if (request.status !== 'APPROVED') throw fail('Purchase order can only be created from an approved purchase request', 409);
    if (!request.vendor_id) throw fail('Approved purchase request requires a vendor before purchase order creation', 409);
    const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, request.vendor_id]);
    if (!vendor) throw fail('Vendor not found', 404);
    const existing = selectOne('SELECT * FROM purchase_orders WHERE tenant_id = ? AND source_purchase_request_id = ? AND status NOT IN (\'CANCELLED\')', [context.tenant.id, purchaseRequestId]);
    if (existing) return getPurchaseOrderDetail(context, existing.id);
    const requestLines = loadPurchaseRequestLines(context, purchaseRequestId);
    requestLinesRequireDraft(requestLines, 'Purchase request');
    const costCenterId = request.cost_center_id || resolveCostCenterReference(context, { departmentId: request.department_id }, request.department_id).id;
    const approvalGate = procurementApprovalGate(context, {
      vendor,
      departmentId: request.department_id,
      costCenterId,
      entityType: 'purchase_request',
      entityId: request.id,
      amount: Number(request.total_amount || 0),
      itemIds: requestLines.map((line) => line.item_id).filter(Boolean),
      itemCategories: requestLines.map((line) => line.category || line.item_name || '').filter(Boolean)
    });
    if (approvalGate.blockedReasons.length) {
      throw fail(approvalGate.blockedReasons.join('; '), 409);
    }
    reserveBudgetForEntity(context, {
      departmentId: request.department_id,
      costCenterId,
      entityType: 'purchase_request',
      entityId: request.id,
      amount: Number(request.total_amount || 0),
      reason: `Purchase order created from ${request.pr_no}`
    });
    const now = nowIso();
    const po = {
      id: newId('po'),
      tenant_id: context.tenant.id,
      po_no: `PO-${String(Date.now()).slice(-4)}`,
      vendor_id: request.vendor_id,
      department_id: request.department_id,
      cost_center_id: costCenterId,
      facility_id: request.facility_id,
      status: 'DRAFT',
      total_amount: Number(request.total_amount || 0),
      created_by_user_id: context.user.id,
      source_purchase_request_id: request.id,
      approved_at: null,
      approved_by_user_id: null,
      issued_at: null,
      issued_by_user_id: null,
      cancelled_at: null,
      cancelled_by_user_id: null,
      closed_at: null,
      closed_by_user_id: null,
      notes: `Created from ${request.pr_no}`,
      created_at: now,
      updated_at: now,
      updated_by_user_id: context.user.id
    };
    insert('purchase_orders', po);
    for (const line of requestLines) {
      insert('purchase_order_lines', {
        id: newId('po_line'),
        tenant_id: context.tenant.id,
        purchase_order_id: po.id,
        purchase_request_line_id: line.id,
        item_id: line.item_id,
        description: line.description,
        qty_ordered: Number(line.qty || 0),
        unit_price: Number(line.unit_price || 0),
        line_total: Number((Number(line.qty || 0) * Number(line.unit_price || 0)).toFixed(2)),
        status: 'DRAFT',
        created_at: now,
        updated_at: now,
        created_by_user_id: context.user.id,
        updated_by_user_id: context.user.id
      });
    }
    insertAudit(context, {
      action: 'CREATE_PURCHASE_ORDER',
      entityType: 'purchase_order',
      entityId: po.id,
      summary: `${po.po_no} created from ${request.pr_no}`,
      after: po,
      requestId: purchaseRequestId
    });
    return getPurchaseOrderDetail(context, po.id);
  });
}

export function updatePurchaseOrder(context, purchaseOrderId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'update_purchase_order');
  return transaction(() => {
    const order = loadPurchaseOrderRecord(context, purchaseOrderId);
    if (order.status !== 'DRAFT') throw fail('Purchase order can only be updated while draft', 409);
    const updated = {
      ...order,
      notes: body.notes !== undefined ? optionalString(body.notes, 'notes', { max: 240 }) : order.notes,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute('UPDATE purchase_orders SET notes = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [updated.notes, updated.updated_at, updated.updated_by_user_id, context.tenant.id, purchaseOrderId]);
    insertAudit(context, {
      action: 'UPDATE_PURCHASE_ORDER',
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      summary: `${order.po_no} updated`,
      before: order,
      after: updated
    });
    return getPurchaseOrderDetail(context, purchaseOrderId);
  });
}

export function approvePurchaseOrder(context, purchaseOrderId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'approve_purchase_order');
  return transaction(() => {
    const order = loadPurchaseOrderRecord(context, purchaseOrderId);
    if (order.status !== 'DRAFT') throw fail('Purchase order can only be approved from draft', 409);
    const request = order.source_purchase_request_id ? loadPurchaseRequestRecord(context, order.source_purchase_request_id) : null;
    const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, order.vendor_id]);
    if (!vendor) throw fail('Vendor not found', 404);
    const orderLines = loadPurchaseOrderLines(context, purchaseOrderId);
    const costCenterId = order.cost_center_id || request?.cost_center_id || resolveCostCenterReference(context, { departmentId: order.department_id }, order.department_id).id;
    const approvalGate = procurementApprovalGate(context, {
      vendor,
      departmentId: order.department_id,
      costCenterId,
      entityType: 'purchase_order',
      entityId: order.id,
      amount: Number(order.total_amount || 0),
      itemIds: orderLines.map((line) => line.item_id).filter(Boolean),
      itemCategories: orderLines.map((line) => line.category || line.item_name || '').filter(Boolean)
    });
    if (approvalGate.blockedReasons.length) {
      throw fail(approvalGate.blockedReasons.join('; '), 409);
    }
    const now = nowIso();
    execute('UPDATE purchase_orders SET status = ?, approved_at = ?, approved_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['APPROVED', now, context.user.id, now, context.user.id, context.tenant.id, purchaseOrderId]);
    execute('UPDATE purchase_order_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_order_id = ?', ['APPROVED', now, context.user.id, context.tenant.id, purchaseOrderId]);
    insertAudit(context, {
      action: 'APPROVE_PURCHASE_ORDER',
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      summary: `${order.po_no} approved`,
      before: order,
      after: { ...order, status: 'APPROVED', approved_at: now, approved_by_user_id: context.user.id }
    });
    return getPurchaseOrderDetail(context, purchaseOrderId);
  });
}

export function issuePurchaseOrder(context, purchaseOrderId) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'issue_purchase_order');
  return transaction(() => {
    const order = loadPurchaseOrderRecord(context, purchaseOrderId);
    if (order.status !== 'APPROVED') throw fail('Purchase order can only be issued after approval', 409);
    const request = order.source_purchase_request_id ? loadPurchaseRequestRecord(context, order.source_purchase_request_id) : null;
    const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, order.vendor_id]);
    if (!vendor) throw fail('Vendor not found', 404);
    const orderLines = loadPurchaseOrderLines(context, purchaseOrderId);
    const costCenterId = order.cost_center_id || request?.cost_center_id || resolveCostCenterReference(context, { departmentId: order.department_id }, order.department_id).id;
    const approvalGate = procurementApprovalGate(context, {
      vendor,
      departmentId: order.department_id,
      costCenterId,
      entityType: 'purchase_order',
      entityId: order.id,
      amount: Number(order.total_amount || 0),
      itemIds: orderLines.map((line) => line.item_id).filter(Boolean),
      itemCategories: orderLines.map((line) => line.category || line.item_name || '').filter(Boolean)
    });
    if (approvalGate.blockedReasons.length) {
      throw fail(approvalGate.blockedReasons.join('; '), 409);
    }
    reserveBudgetForEntity(context, {
      departmentId: order.department_id,
      costCenterId,
      entityType: 'purchase_request',
      entityId: order.source_purchase_request_id || order.id,
      amount: Number(order.total_amount || 0),
      reason: `Purchase order ${order.po_no} issued`
    });
    const now = nowIso();
    execute('UPDATE purchase_orders SET status = ?, issued_at = ?, issued_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['ISSUED', now, context.user.id, now, context.user.id, context.tenant.id, purchaseOrderId]);
    execute('UPDATE purchase_order_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_order_id = ?', ['ISSUED', now, context.user.id, context.tenant.id, purchaseOrderId]);
    insertAudit(context, {
      action: 'ISSUE_PURCHASE_ORDER',
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      summary: `${order.po_no} issued without receiving inventory`,
      before: order,
      after: { ...order, status: 'ISSUED', issued_at: now, issued_by_user_id: context.user.id }
    });
    return getPurchaseOrderDetail(context, purchaseOrderId);
  });
}

export function cancelPurchaseOrder(context, purchaseOrderId, body = {}) {
  requireFeature(context, 'procurement_purchasing');
  requireCapability(context, 'cancel_purchase_order');
  const reason = optionalString(body.reason ?? body.cancelReason, 'reason', { max: 240 }) || 'Cancelled by procurement';
  return transaction(() => {
    const order = loadPurchaseOrderRecord(context, purchaseOrderId);
    if (!['DRAFT', 'APPROVED'].includes(order.status)) throw fail('Purchase order cannot be cancelled in its current state', 409);
    const now = nowIso();
    execute('UPDATE purchase_orders SET status = ?, cancelled_at = ?, cancelled_by_user_id = ?, notes = COALESCE(NULLIF(notes, \'\'), ?), updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['CANCELLED', now, context.user.id, reason, now, context.user.id, context.tenant.id, purchaseOrderId]);
    execute('UPDATE purchase_order_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND purchase_order_id = ?', ['CANCELLED', now, context.user.id, context.tenant.id, purchaseOrderId]);
    insertAudit(context, {
      action: 'CANCEL_PURCHASE_ORDER',
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      summary: `${order.po_no} cancelled: ${reason}`,
      before: order,
      after: { ...order, status: 'CANCELLED', cancelled_at: now, cancelled_by_user_id: context.user.id, notes: reason }
    });
    return getPurchaseOrderDetail(context, purchaseOrderId);
  });
}

export function getProcureToPaySummary(context) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_procure_to_pay');
  ensureTenantUser(context, context.tenant.id);
  const invoiceRows = selectAll('SELECT status, COUNT(*) AS count FROM vendor_invoices WHERE tenant_id = ? GROUP BY status', [context.tenant.id]);
  const rfqRows = selectAll('SELECT status, COUNT(*) AS count FROM rfq_requests WHERE tenant_id = ? GROUP BY status', [context.tenant.id]);
  const quoteRows = selectAll('SELECT status, COUNT(*) AS count FROM vendor_quotes WHERE tenant_id = ? GROUP BY status', [context.tenant.id]);
  const invoiceMap = Object.fromEntries(invoiceRows.map((row) => [row.status, Number(row.count || 0)]));
  const rfqMap = Object.fromEntries(rfqRows.map((row) => [row.status, Number(row.count || 0)]));
  const quoteMap = Object.fromEntries(quoteRows.map((row) => [row.status, Number(row.count || 0)]));
  return {
    summary: {
      invoices: selectAll('SELECT COUNT(*) AS count FROM vendor_invoices WHERE tenant_id = ?', [context.tenant.id])[0].count,
      exportReady: selectAll('SELECT COUNT(*) AS count FROM vendor_invoices WHERE tenant_id = ? AND status IN (\'EXPORT_READY\', \'EXPORTED\')', [context.tenant.id])[0].count,
      exceptions: selectAll('SELECT COUNT(*) AS count FROM invoice_match_exceptions WHERE tenant_id = ? AND waived_at IS NULL', [context.tenant.id])[0].count,
      rfqs: selectAll('SELECT COUNT(*) AS count FROM rfq_requests WHERE tenant_id = ?', [context.tenant.id])[0].count,
      quotes: selectAll('SELECT COUNT(*) AS count FROM vendor_quotes WHERE tenant_id = ?', [context.tenant.id])[0].count,
      scorecards: selectAll('SELECT COUNT(*) AS count FROM vendor_scorecards WHERE tenant_id = ?', [context.tenant.id])[0].count,
      invoiceStatus: invoiceMap,
      rfqStatus: rfqMap,
      quoteStatus: quoteMap
    }
  };
}

export function listVendorInvoices(context) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_invoices');
  ensureTenantUser(context, context.tenant.id);
  const scope = procureToPayScopeClause(context, 'vi');
  return selectAll(
    `SELECT vi.*, v.name AS vendor_name, v.code AS vendor_code, po.po_no AS purchase_order_no, rs.id AS receiving_session_code
     FROM vendor_invoices vi
     JOIN vendors v ON v.id = vi.vendor_id
     LEFT JOIN purchase_orders po ON po.id = vi.purchase_order_id
     LEFT JOIN receive_sessions rs ON rs.id = vi.receiving_session_id
     WHERE vi.tenant_id = ? ${scope.sql}
     ORDER BY vi.created_at DESC, vi.id DESC`,
    [context.tenant.id, ...scope.params]
  );
}

export function getVendorInvoiceDetail(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_invoices');
  const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
  const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, invoice.vendor_id]);
  const purchaseOrder = invoice.purchase_order_id ? selectOne('SELECT * FROM purchase_orders WHERE tenant_id = ? AND id = ?', [context.tenant.id, invoice.purchase_order_id]) : null;
  const receivingSession = invoice.receiving_session_id ? selectOne('SELECT * FROM receive_sessions WHERE tenant_id = ? AND id = ?', [context.tenant.id, invoice.receiving_session_id]) : null;
  return {
    vendorInvoice: invoice,
    vendor,
    purchaseOrder,
    purchaseOrderLines: purchaseOrder ? selectAll('SELECT * FROM purchase_order_lines WHERE tenant_id = ? AND purchase_order_id = ? ORDER BY created_at ASC, id ASC', [context.tenant.id, purchaseOrder.id]) : [],
    receivingSession,
    lines: loadVendorInvoiceLines(context, vendorInvoiceId),
    extractionRuns: selectAll('SELECT * FROM invoice_extraction_runs WHERE tenant_id = ? AND vendor_invoice_id = ? ORDER BY created_at DESC', [context.tenant.id, vendorInvoiceId]),
    matchResults: selectAll('SELECT * FROM invoice_match_results WHERE tenant_id = ? AND vendor_invoice_id = ? ORDER BY created_at DESC', [context.tenant.id, vendorInvoiceId]),
    exceptions: loadVendorInvoiceExceptions(context, vendorInvoiceId),
    approvalEvents: selectAll('SELECT * FROM invoice_approval_events WHERE tenant_id = ? AND vendor_invoice_id = ? ORDER BY created_at DESC', [context.tenant.id, vendorInvoiceId]),
    evidence: selectAll('SELECT * FROM documents WHERE tenant_id = ? AND entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [context.tenant.id, 'vendor_invoice', vendorInvoiceId])
  };
}

export function listVendorInvoiceLines(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_invoices');
  loadVendorInvoiceRecord(context, vendorInvoiceId);
  return { lines: loadVendorInvoiceLines(context, vendorInvoiceId) };
}

export function listVendorInvoiceExceptions(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_invoices');
  loadVendorInvoiceRecord(context, vendorInvoiceId);
  return { exceptions: loadVendorInvoiceExceptions(context, vendorInvoiceId) };
}

export function getVendorInvoiceExceptionDetail(context, vendorInvoiceId, exceptionId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_invoices');
  const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
  return {
    vendorInvoice: invoice,
    exception: loadVendorInvoiceException(context, vendorInvoiceId, exceptionId),
    lines: loadVendorInvoiceLines(context, vendorInvoiceId)
  };
}

export function createVendorInvoice(context, body) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'create_vendor_invoice');
  const vendor = resolveVendorReference(context, body);
  const invoiceNumber = requireString(body.invoiceNumber, 'invoiceNumber', { max: 60 });
  const departmentId = requireString(body.departmentId ?? context.user.department_id, 'departmentId', { max: 80 });
  const facilityId = requireString(body.facilityId ?? context.user.facility_id, 'facilityId', { max: 80 });
  const budgetRecord = getDepartmentBudgetRecord(context, { departmentId }) || null;
  const costCenter = body.costCenterId || body.cost_center_id || body.departmentId || body.department_id
    ? resolveCostCenterReference(context, body, departmentId)
    : (budgetRecord ? loadCostCenterRecord(context, budgetRecord.cost_center_id) : resolveCostCenterReference(context, { departmentId }, departmentId));
  assertDepartmentBelongsToTenant(context.tenant.id, departmentId);
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);
  const lines = requireArray(body.lines, 'lines').map((line, index) => ({
    description: requireString(line.description, `lines[${index}].description`, { max: 220 }),
    qty: requirePositiveInt(line.qty, `lines[${index}].qty`, { max: 100000 }),
    unitPrice: Number(line.unitPrice ?? 0),
    itemId: line.itemId ? requireString(line.itemId, `lines[${index}].itemId`, { max: 80 }) : null,
    purchaseOrderLineId: line.purchaseOrderLineId ? requireString(line.purchaseOrderLineId, `lines[${index}].purchaseOrderLineId`, { max: 80 }) : null
  }));
  if (lines.some((line) => !Number.isFinite(line.unitPrice) || line.unitPrice < 0)) throw fail('Each invoice line unitPrice must be a non-negative number');
  return transaction(() => {
    if (selectOne('SELECT 1 FROM vendor_invoices WHERE tenant_id = ? AND invoice_number = ?', [context.tenant.id, invoiceNumber])) {
      throw fail('Invoice number already exists for this tenant', 409);
    }
    const subtotal = Number(lines.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0).toFixed(2));
    const invoice = {
      id: newId('vendor_invoice'),
      tenant_id: context.tenant.id,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      invoice_number: invoiceNumber,
      purchase_order_id: body.purchaseOrderId ? requireString(body.purchaseOrderId, 'purchaseOrderId', { max: 80 }) : null,
      receiving_session_id: body.receivingSessionId ? requireString(body.receivingSessionId, 'receivingSessionId', { max: 80 }) : null,
      department_id: departmentId,
      cost_center_id: costCenter.id,
      facility_id: facilityId,
      currency: requireString(body.currency || 'USD', 'currency', { max: 8 }),
      status: 'DRAFT',
      invoice_date: body.invoiceDate ? requireString(body.invoiceDate, 'invoiceDate', { max: 40 }) : nowIso(),
      due_date: body.dueDate ? requireString(body.dueDate, 'dueDate', { max: 40 }) : null,
      subtotal_amount: subtotal,
      tax_amount: Number(body.taxAmount ?? 0),
      freight_amount: Number(body.freightAmount ?? 0),
      discount_amount: Number(body.discountAmount ?? 0),
      total_amount: Number((subtotal + Number(body.taxAmount ?? 0) + Number(body.freightAmount ?? 0) - Number(body.discountAmount ?? 0)).toFixed(2)),
      extraction_provider: 'DETERMINISTIC_DEMO',
      extraction_status: 'NOT_STARTED',
      extraction_notes: '',
      extraction_requested_at: null,
      extracted_at: null,
      match_mode: requireEnum(body.matchMode ?? '3WAY', 'matchMode', ['2WAY', '3WAY']),
      match_status: 'NOT_STARTED',
      match_summary: '',
      submitted_at: null,
      submitted_by_user_id: null,
      approved_at: null,
      approved_by_user_id: null,
      rejected_at: null,
      rejected_by_user_id: null,
      rejection_reason: '',
      export_ready_at: null,
      exported_at: null,
      cancelled_at: null,
      cancelled_by_user_id: null,
      cancel_reason: '',
      extraction_confidence: 0,
      match_confidence: 0,
      export_delivery_status: 'NOT_REQUESTED',
      export_delivery_notes: '',
      notes: optionalString(body.notes, 'notes', { max: 280 }) || '',
      created_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('vendor_invoices', invoice);
    for (const line of lines) {
      insert('vendor_invoice_lines', {
        id: newId('vendor_invoice_line'),
        tenant_id: context.tenant.id,
        vendor_invoice_id: invoice.id,
        purchase_order_line_id: line.purchaseOrderLineId || null,
        item_id: line.itemId || null,
        description: line.description,
        qty: line.qty,
        unit_price: line.unitPrice,
        line_total: Number((line.qty * line.unitPrice).toFixed(2)),
        match_status: 'PENDING',
        note: '',
        created_at: nowIso(),
        created_by_user_id: context.user.id,
        updated_at: nowIso(),
        updated_by_user_id: context.user.id
      });
    }
    recalculateVendorInvoiceTotals(context, invoice.id);
    insertAudit(context, { action: 'CREATE_VENDOR_INVOICE', entityType: 'vendor_invoice', entityId: invoice.id, summary: `${invoice.invoice_number} drafted for ${vendor.name}`, after: invoice });
    return getVendorInvoiceDetail(context, invoice.id);
  });
}

export function uploadVendorInvoice(context, vendorInvoiceId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!invoiceEditableStatuses().has(invoice.status) && invoice.status !== 'REJECTED') throw fail('Invoice cannot be uploaded in its current state', 409);
    const now = nowIso();
    const nextStatus = 'UPLOADED';
    execute(
      `UPDATE vendor_invoices
       SET status = ?, extraction_status = ?, extraction_requested_at = COALESCE(extraction_requested_at, ?), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [nextStatus, 'EXTRACTION_PENDING', now, now, context.user.id, context.tenant.id, vendorInvoiceId]
    );
    insert('invoice_approval_events', {
      id: newId('invoice_event'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      event_type: 'UPLOADED',
      reason: requireString(body.reason || 'Local document staged for review', 'reason', { max: 240 }),
      created_at: now,
      created_by_user_id: context.user.id
    });
    insertAudit(context, {
      action: 'UPLOAD_VENDOR_INVOICE',
      entityType: 'vendor_invoice',
      entityId: vendorInvoiceId,
      summary: `${invoice.invoice_number} staged for extraction`,
      before: invoice,
      after: { ...invoice, status: nextStatus, extraction_status: 'EXTRACTION_PENDING', extraction_requested_at: now }
    });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function updateVendorInvoice(context, vendorInvoiceId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!invoiceEditableStatuses().has(invoice.status)) throw fail('Invoice can only be updated before approval', 409);
    const vendor = body.vendorId || body.vendorName ? resolveVendorReference(context, body) : selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, invoice.vendor_id]);
    const updated = {
      ...invoice,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      invoice_number: body.invoiceNumber ? requireString(body.invoiceNumber, 'invoiceNumber', { max: 60 }) : invoice.invoice_number,
      department_id: body.departmentId ? requireString(body.departmentId, 'departmentId', { max: 80 }) : invoice.department_id,
      cost_center_id: body.costCenterId || body.cost_center_id ? resolveCostCenterReference(context, body, body.departmentId ? requireString(body.departmentId, 'departmentId', { max: 80 }) : invoice.department_id).id : invoice.cost_center_id,
      facility_id: body.facilityId ? requireString(body.facilityId, 'facilityId', { max: 80 }) : invoice.facility_id,
      notes: body.notes === undefined ? invoice.notes : optionalString(body.notes, 'notes', { max: 280 }),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute(
      `UPDATE vendor_invoices
       SET vendor_id = ?, vendor_name = ?, invoice_number = ?, department_id = ?, cost_center_id = ?, facility_id = ?, notes = ?,
           status = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN status ELSE ? END,
           extraction_status = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN extraction_status ELSE 'EXTRACTION_PENDING' END,
           match_status = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN match_status ELSE 'NOT_STARTED' END,
           extraction_confidence = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN extraction_confidence ELSE 0 END,
           match_confidence = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN match_confidence ELSE 0 END,
           export_delivery_status = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN export_delivery_status ELSE 'NOT_REQUESTED' END,
           export_delivery_notes = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN export_delivery_notes ELSE '' END,
           export_ready_at = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN export_ready_at ELSE NULL END,
           exported_at = CASE WHEN status IN ('APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED') THEN exported_at ELSE NULL END,
           cancelled_at = CASE WHEN status = 'CANCELLED' THEN cancelled_at ELSE NULL END,
           cancelled_by_user_id = CASE WHEN status = 'CANCELLED' THEN cancelled_by_user_id ELSE NULL END,
           cancel_reason = CASE WHEN status = 'CANCELLED' THEN cancel_reason ELSE '' END,
           updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [updated.vendor_id, updated.vendor_name, updated.invoice_number, updated.department_id, updated.cost_center_id, updated.facility_id, updated.notes, invoice.status, updated.updated_at, updated.updated_by_user_id, context.tenant.id, vendorInvoiceId]
    );
    if (!['APPROVED', 'EXPORT_READY', 'EXPORTED', 'REJECTED', 'CANCELLED'].includes(invoice.status)) {
      clearOpenInvoiceExceptions(context, vendorInvoiceId);
    }
    recalculateVendorInvoiceTotals(context, vendorInvoiceId);
    insertAudit(context, { action: 'UPDATE_VENDOR_INVOICE', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${updated.invoice_number} updated`, before: invoice, after: updated });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function createVendorInvoiceLine(context, vendorInvoiceId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'create_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!invoiceEditableStatuses().has(invoice.status)) throw fail('Invoice lines can only be edited while the invoice is still in review', 409);
    const description = requireString(body.description, 'description', { max: 220 });
    const qty = requirePositiveInt(body.qty, 'qty', { max: 100000 });
    const unitPrice = Number(body.unitPrice ?? 0);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw fail('unitPrice must be a non-negative number');
    const line = {
      id: newId('vendor_invoice_line'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      purchase_order_line_id: body.purchaseOrderLineId ? requireString(body.purchaseOrderLineId, 'purchaseOrderLineId', { max: 80 }) : null,
      item_id: body.itemId ? requireString(body.itemId, 'itemId', { max: 80 }) : null,
      description,
      qty,
      unit_price: unitPrice,
      line_total: lineTotal(qty, unitPrice),
      match_status: 'PENDING',
      note: optionalString(body.note, 'note', { max: 240 }) || '',
      created_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('vendor_invoice_lines', line);
    if (invoice.status !== 'DRAFT') {
      execute(
        'UPDATE vendor_invoices SET status = ?, extraction_status = ?, match_status = ?, extraction_confidence = 0, match_confidence = 0, export_ready_at = NULL, exported_at = NULL, export_delivery_status = ?, export_delivery_notes = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
        ['UPLOADED', 'EXTRACTION_PENDING', 'NOT_STARTED', 'NOT_REQUESTED', '', nowIso(), context.user.id, context.tenant.id, vendorInvoiceId]
      );
    }
    recalculateVendorInvoiceTotals(context, vendorInvoiceId);
    insertAudit(context, {
      action: 'CREATE_VENDOR_INVOICE_LINE',
      entityType: 'vendor_invoice',
      entityId: vendorInvoiceId,
      summary: `${invoice.invoice_number} line added`,
      after: { ...line, line_total: line.line_total }
    });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function updateVendorInvoiceLine(context, vendorInvoiceId, lineId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!invoiceEditableStatuses().has(invoice.status)) throw fail('Invoice lines can only be edited while the invoice is still in review', 409);
    const line = selectOne('SELECT * FROM vendor_invoice_lines WHERE tenant_id = ? AND vendor_invoice_id = ? AND id = ?', [context.tenant.id, vendorInvoiceId, lineId]);
    if (!line) throw fail('Invoice line not found', 404);
    const updated = {
      ...line,
      purchase_order_line_id: body.purchaseOrderLineId === undefined ? line.purchase_order_line_id : (body.purchaseOrderLineId ? requireString(body.purchaseOrderLineId, 'purchaseOrderLineId', { max: 80 }) : null),
      item_id: body.itemId === undefined ? line.item_id : (body.itemId ? requireString(body.itemId, 'itemId', { max: 80 }) : null),
      description: body.description === undefined ? line.description : requireString(body.description, 'description', { max: 220 }),
      qty: body.qty === undefined ? Number(line.qty) : requirePositiveInt(body.qty, 'qty', { max: 100000 }),
      unit_price: body.unitPrice === undefined ? Number(line.unit_price) : Number(body.unitPrice),
      note: body.note === undefined ? line.note : optionalString(body.note, 'note', { max: 240 }),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    if (!Number.isFinite(updated.unit_price) || updated.unit_price < 0) throw fail('unitPrice must be a non-negative number');
    updated.line_total = lineTotal(updated.qty, updated.unit_price);
    execute(
      `UPDATE vendor_invoice_lines
       SET purchase_order_line_id = ?, item_id = ?, description = ?, qty = ?, unit_price = ?, line_total = ?, note = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND vendor_invoice_id = ? AND id = ?`,
      [updated.purchase_order_line_id, updated.item_id, updated.description, updated.qty, updated.unit_price, updated.line_total, updated.note, updated.updated_at, updated.updated_by_user_id, context.tenant.id, vendorInvoiceId, lineId]
    );
    execute(
      'UPDATE vendor_invoices SET status = ?, extraction_status = ?, match_status = ?, extraction_confidence = 0, match_confidence = 0, export_ready_at = NULL, exported_at = NULL, export_delivery_status = ?, export_delivery_notes = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [invoice.status === 'DRAFT' ? 'DRAFT' : 'UPLOADED', invoice.status === 'DRAFT' ? 'NOT_STARTED' : 'EXTRACTION_PENDING', 'NOT_STARTED', 'NOT_REQUESTED', '', nowIso(), context.user.id, context.tenant.id, vendorInvoiceId]
    );
    clearOpenInvoiceExceptions(context, vendorInvoiceId);
    recalculateVendorInvoiceTotals(context, vendorInvoiceId);
    insertAudit(context, { action: 'UPDATE_VENDOR_INVOICE_LINE', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${invoice.invoice_number} line updated`, before: line, after: updated });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function deleteVendorInvoiceLine(context, vendorInvoiceId, lineId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!invoiceEditableStatuses().has(invoice.status)) throw fail('Invoice lines can only be edited while the invoice is still in review', 409);
    const line = selectOne('SELECT * FROM vendor_invoice_lines WHERE tenant_id = ? AND vendor_invoice_id = ? AND id = ?', [context.tenant.id, vendorInvoiceId, lineId]);
    if (!line) throw fail('Invoice line not found', 404);
    execute('DELETE FROM vendor_invoice_lines WHERE tenant_id = ? AND vendor_invoice_id = ? AND id = ?', [context.tenant.id, vendorInvoiceId, lineId]);
    execute(
      'UPDATE vendor_invoices SET status = ?, extraction_status = ?, match_status = ?, extraction_confidence = 0, match_confidence = 0, export_ready_at = NULL, exported_at = NULL, export_delivery_status = ?, export_delivery_notes = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [invoice.status === 'DRAFT' ? 'DRAFT' : 'UPLOADED', invoice.status === 'DRAFT' ? 'NOT_STARTED' : 'EXTRACTION_PENDING', 'NOT_STARTED', 'NOT_REQUESTED', '', nowIso(), context.user.id, context.tenant.id, vendorInvoiceId]
    );
    clearOpenInvoiceExceptions(context, vendorInvoiceId);
    recalculateVendorInvoiceTotals(context, vendorInvoiceId);
    insertAudit(context, { action: 'DELETE_VENDOR_INVOICE_LINE', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${invoice.invoice_number} line deleted`, before: line, after: null });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function extractVendorInvoice(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'extract_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!['DRAFT', 'UPLOADED', 'EXTRACTION_PENDING', 'EXTRACTED', 'EXCEPTION'].includes(invoice.status)) throw fail('Invoice cannot be extracted in its current state', 409);
    const now = nowIso();
    const lines = loadVendorInvoiceLines(context, vendorInvoiceId);
    const ocrConfig = getOcrRuntimeConfig(process.env);
    const providerStatus = getOcrProviderStatusFromModule(process.env);

    // Local deterministic extractor — always synchronous and always available
    const localResult = extractWithLocal(invoice, lines);
    const extractionConfidence = ocrConfig.provider === 'local'
      ? localResult.overall_confidence
      : invoiceConfidenceFromFindings([]);

    // Determine run status based on provider availability
    let runStatus = 'COMPLETED';
    let runErrorMessage = '';
    let runProviderStatus = providerStatus.status;
    let runProposedFields = localResult.proposed_fields;
    let runProviderRunId = localResult.provider_run_id;
    let runOverallConfidence = localResult.overall_confidence;

    if (ocrConfig.provider !== 'local') {
      // External provider selected — cannot call async from sync transaction
      // Record the intent; production integration would queue a background job
      if (!providerStatus.ready) {
        runStatus = 'FAILED';
        runErrorMessage = providerStatus.message;
        runProviderStatus = 'NOT_CONFIGURED';
        runProposedFields = {};
        runProviderRunId = '';
        runOverallConfidence = 0;
      } else {
        // Provider is CONFIGURED but we cannot make async API calls from a sync transaction.
        // Record as PENDING — a background worker or webhook would complete it.
        runStatus = 'PENDING';
        runErrorMessage = '';
        runProviderStatus = 'CONFIGURED';
        runProposedFields = {};
        runProviderRunId = '';
        runOverallConfidence = 0;
      }
    }

    const extractionStatus = runStatus === 'COMPLETED' ? 'EXTRACTED' : 'EXTRACTION_PENDING';
    const reviewStatus = runStatus === 'COMPLETED' ? 'PENDING_REVIEW' : 'PENDING_REVIEW';
    const invoiceNextStatus = runStatus === 'COMPLETED' ? 'EXTRACTED' : 'EXTRACTION_PENDING';

    execute(
      `UPDATE vendor_invoices
       SET status = ?, extraction_status = ?, extraction_requested_at = ?, extracted_at = COALESCE(extracted_at, ?), extraction_confidence = ?, match_status = ?, match_confidence = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      ['EXTRACTION_PENDING', 'EXTRACTION_PENDING', now, now, extractionConfidence, 'NOT_STARTED', 0, now, context.user.id, context.tenant.id, vendorInvoiceId]
    );

    insert('invoice_extraction_runs', {
      id: newId('invoice_extract'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      provider_name: ocrConfig.provider === 'local' ? 'Local Deterministic Extractor' : providerStatus.label,
      provider_status: runProviderStatus,
      provider_run_id: runProviderRunId,
      overall_confidence: runOverallConfidence,
      status: runStatus,
      request_payload_json: JSON.stringify({ invoice_number: invoice.invoice_number, line_count: lines.length, provider: ocrConfig.provider }),
      response_payload_json: JSON.stringify({ provider: ocrConfig.provider, status: runStatus }),
      normalized_payload_json: JSON.stringify({
        invoice_number: invoice.invoice_number,
        vendor_name: invoice.vendor_name,
        line_count: lines.length,
        total_amount: invoice.total_amount,
        confidence: runOverallConfidence
      }),
      proposed_fields_json: JSON.stringify(runProposedFields),
      review_status: reviewStatus,
      error_message: runErrorMessage,
      requested_at: now,
      started_at: now,
      completed_at: runStatus === 'COMPLETED' ? now : null,
      created_at: now,
      created_by_user_id: context.user.id
    });

    if (runStatus === 'COMPLETED') {
      execute(
        `UPDATE vendor_invoices
         SET status = ?, extraction_status = ?, extraction_confidence = ?, match_status = ?, updated_at = ?, updated_by_user_id = ?
         WHERE tenant_id = ? AND id = ?`,
        [invoiceNextStatus, extractionStatus, extractionConfidence, 'NOT_STARTED', nowIso(), context.user.id, context.tenant.id, vendorInvoiceId]
      );
    }

    insertAudit(context, {
      action: 'EXTRACT_VENDOR_INVOICE',
      entityType: 'vendor_invoice',
      entityId: vendorInvoiceId,
      summary: `${invoice.invoice_number} extracted via ${ocrConfig.provider} — run status: ${runStatus}`,
      before: invoice,
      after: { ...invoice, status: invoiceNextStatus, extraction_status: extractionStatus, extraction_confidence: extractionConfidence, ocr_provider: ocrConfig.provider, run_status: runStatus }
    });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function getOcrProviderStatus(context) {
  requireFeature(context, 'procure_to_pay_intelligence');
  const status = getOcrProviderStatusFromModule(process.env);
  return {
    provider: status.provider,
    label: status.label,
    status: status.status,
    ready: status.ready,
    message: status.message,
    required: status.required
  };
}

export function acceptOcrProposedFields(context, extractionRunId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'extract_vendor_invoice');
  return transaction(() => {
    const run = selectOne(
      `SELECT * FROM invoice_extraction_runs WHERE tenant_id = ? AND id = ?`,
      [context.tenant.id, extractionRunId]
    );
    if (!run) throw fail('Extraction run not found', 404);
    if (run.review_status === 'ACCEPTED') throw fail('Extraction run has already been accepted', 409);
    if (run.review_status === 'REJECTED') throw fail('Extraction run was rejected — cannot accept', 409);
    if (run.status !== 'COMPLETED') throw fail('Extraction run is not complete — cannot accept proposed values', 409);

    const acceptedFields = body.accepted_fields || {};
    const notes = String(body.notes || '').trim().substring(0, 500);
    const now = nowIso();
    execute(
      `UPDATE invoice_extraction_runs
       SET review_status = 'ACCEPTED', reviewed_at = ?, reviewed_by_user_id = ?, review_notes = ?
       WHERE tenant_id = ? AND id = ?`,
      [now, context.user.id, notes, context.tenant.id, extractionRunId]
    );
    insertAudit(context, {
      action: 'ACCEPT_OCR_PROPOSED_FIELDS',
      entityType: 'invoice_extraction_run',
      entityId: extractionRunId,
      summary: `OCR proposed values accepted for invoice extraction run ${extractionRunId}`,
      before: { review_status: run.review_status },
      after: { review_status: 'ACCEPTED', accepted_fields: Object.keys(acceptedFields) }
    });
    return selectOne('SELECT * FROM invoice_extraction_runs WHERE tenant_id = ? AND id = ?', [context.tenant.id, extractionRunId]);
  });
}

export function rejectOcrExtraction(context, extractionRunId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'extract_vendor_invoice');
  return transaction(() => {
    const run = selectOne(
      `SELECT * FROM invoice_extraction_runs WHERE tenant_id = ? AND id = ?`,
      [context.tenant.id, extractionRunId]
    );
    if (!run) throw fail('Extraction run not found', 404);
    if (run.review_status === 'REJECTED') throw fail('Extraction run was already rejected', 409);
    if (run.review_status === 'ACCEPTED') throw fail('Extraction run was already accepted — cannot reject', 409);
    const reason = requireString(body.reason, 'reason', { max: 500 });
    const now = nowIso();
    execute(
      `UPDATE invoice_extraction_runs
       SET review_status = 'REJECTED', reviewed_at = ?, reviewed_by_user_id = ?, review_notes = ?
       WHERE tenant_id = ? AND id = ?`,
      [now, context.user.id, reason, context.tenant.id, extractionRunId]
    );
    insertAudit(context, {
      action: 'REJECT_OCR_EXTRACTION',
      entityType: 'invoice_extraction_run',
      entityId: extractionRunId,
      summary: `OCR extraction rejected for run ${extractionRunId}: ${reason}`,
      before: { review_status: run.review_status },
      after: { review_status: 'REJECTED', reason }
    });
    return selectOne('SELECT * FROM invoice_extraction_runs WHERE tenant_id = ? AND id = ?', [context.tenant.id, extractionRunId]);
  });
}

export function listOcrExtractionRuns(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'extract_vendor_invoice');
  return selectAll(
    `SELECT id, tenant_id, vendor_invoice_id, provider_name, provider_status, provider_run_id,
            overall_confidence, proposed_fields_json, status, review_status, reviewed_at, reviewed_by_user_id, review_notes,
            error_message, requested_at, started_at, completed_at, created_at, created_by_user_id
     FROM invoice_extraction_runs
     WHERE tenant_id = ? AND vendor_invoice_id = ?
     ORDER BY created_at DESC`,
    [context.tenant.id, vendorInvoiceId]
  );
}

export function getOcrExtractionRunDetail(context, extractionRunId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'extract_vendor_invoice');
  const run = selectOne(
    `SELECT * FROM invoice_extraction_runs WHERE tenant_id = ? AND id = ?`,
    [context.tenant.id, extractionRunId]
  );
  if (!run) throw fail('Extraction run not found', 404);
  let proposedFields = {};
  try { proposedFields = JSON.parse(run.proposed_fields_json || '{}'); } catch { /* noop */ }
  return { ...run, proposed_fields: proposedFields };
}

export function matchVendorInvoice(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'match_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    const lines = loadVendorInvoiceLines(context, vendorInvoiceId);
    const now = nowIso();
    execute(
      'UPDATE vendor_invoices SET status = ?, match_status = ?, match_summary = ?, match_confidence = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['MATCHING_PENDING', 'MATCHING_PENDING', 'Deterministic match review started.', 0, now, context.user.id, context.tenant.id, vendorInvoiceId]
    );
    const evaluation = evaluateInvoiceMatch(context, invoice, lines);
    clearOpenInvoiceExceptions(context, vendorInvoiceId);
    for (const finding of evaluation.findings) {
      insert('invoice_match_exceptions', {
        id: newId('invoice_exception'),
        tenant_id: context.tenant.id,
        vendor_invoice_id: vendorInvoiceId,
        vendor_invoice_line_id: finding.vendorInvoiceLineId || null,
        severity: finding.severity,
        code: finding.code,
        message: finding.message,
        expected_value: finding.expected,
        actual_value: finding.actual,
        created_at: now,
        created_by_user_id: context.user.id,
        updated_at: now,
        updated_by_user_id: context.user.id
      });
    }
    const status = evaluation.findings.length ? 'EXCEPTION' : 'MATCHED';
    execute(
      'UPDATE vendor_invoices SET status = ?, match_status = ?, match_summary = ?, match_confidence = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [status, status, evaluation.findings.length ? `${evaluation.findings.length} issue(s) require review.` : 'Invoice matched successfully.', evaluation.matchConfidence, nowIso(), context.user.id, context.tenant.id, vendorInvoiceId]
    );
    insert('invoice_match_results', {
      id: newId('invoice_match'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      match_mode: invoice.match_mode || '3WAY',
      status,
      blocker_count: evaluation.findings.length,
      warning_count: evaluation.findings.filter((row) => row.severity !== 'HIGH').length,
      info_count: lines.length,
      summary: evaluation.findings.length ? 'Exception present' : 'Match clean',
      details_json: JSON.stringify({
        lineCount: lines.length,
        findings: evaluation.findings,
        purchaseOrderId: evaluation.purchaseOrder?.id || null,
        receivingSessionId: evaluation.receivingSession?.id || null
      }),
      matched_at: now,
      created_at: now,
      created_by_user_id: context.user.id
    });
    insertAudit(context, {
      action: 'MATCH_VENDOR_INVOICE',
      entityType: 'vendor_invoice',
      entityId: vendorInvoiceId,
      summary: `${invoice.invoice_number} ${status.toLowerCase()}`,
      before: invoice,
      after: { ...invoice, status, match_status: status, match_confidence: evaluation.matchConfidence }
    });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function waiveInvoiceException(context, vendorInvoiceId, exceptionId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'waive_invoice_exception');
  const reason = requireString(body.reason, 'reason', { max: 240 });
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    const exception = selectOne('SELECT * FROM invoice_match_exceptions WHERE tenant_id = ? AND vendor_invoice_id = ? AND id = ?', [context.tenant.id, vendorInvoiceId, exceptionId]);
    if (!exception) throw fail('Invoice exception not found', 404);
    execute('UPDATE invoice_match_exceptions SET waived_at = ?, waived_by_user_id = ?, waiver_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [nowIso(), context.user.id, reason, nowIso(), context.user.id, context.tenant.id, exceptionId]);
    insertAudit(context, { action: 'WAIVE_INVOICE_EXCEPTION', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${invoice.invoice_number} exception waived`, before: exception, after: { ...exception, waived_at: nowIso(), waiver_reason: reason } });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function approveVendorInvoice(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'approve_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (!['MATCHED', 'EXCEPTION'].includes(invoice.status)) throw fail('Invoice cannot be approved in its current state', 409);
    const blockers = selectAll('SELECT * FROM invoice_match_exceptions WHERE tenant_id = ? AND vendor_invoice_id = ? AND waived_at IS NULL', [context.tenant.id, vendorInvoiceId]);
    if (blockers.length > 0) throw fail('Invoice has unresolved matching exceptions', 409);
    const now = nowIso();
    execute('UPDATE vendor_invoices SET status = ?, approved_at = ?, approved_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['APPROVAL_PENDING', now, context.user.id, now, context.user.id, context.tenant.id, vendorInvoiceId]);
    insert('invoice_approval_events', {
      id: newId('invoice_event'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      event_type: 'APPROVAL_PENDING',
      reason: 'Approval review passed backend checks',
      created_at: now,
      created_by_user_id: context.user.id
    });
    execute('UPDATE vendor_invoices SET status = ?, approved_at = ?, approved_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['APPROVED', now, context.user.id, now, context.user.id, context.tenant.id, vendorInvoiceId]);
    const invoiceCostCenterId = invoice.cost_center_id || resolveCostCenterReference(context, { departmentId: invoice.department_id }, invoice.department_id).id;
    const budgetCostCenterId = invoice.cost_center_id || getDepartmentBudgetRecord(context, { departmentId: invoice.department_id })?.cost_center_id || '';
    consumeBudgetForEntity(context, {
      departmentId: invoice.department_id,
      costCenterId: invoiceCostCenterId || budgetCostCenterId,
      entityType: 'vendor_invoice',
      entityId: invoice.id,
      amount: Number(invoice.total_amount || 0),
      reason: `Invoice ${invoice.invoice_number} approved`
    });
    insert('invoice_approval_events', {
      id: newId('invoice_event'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      event_type: 'APPROVED',
      reason: 'Approved after match review',
      created_at: now,
      created_by_user_id: context.user.id
    });
    insertAudit(context, { action: 'APPROVE_VENDOR_INVOICE', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${invoice.invoice_number} approved`, before: invoice, after: { ...invoice, status: 'APPROVED', approved_at: now } });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function rejectVendorInvoice(context, vendorInvoiceId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'reject_vendor_invoice');
  const reason = requireString(body.reason, 'reason', { max: 240 });
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    const now = nowIso();
    execute('UPDATE vendor_invoices SET status = ?, rejected_at = ?, rejected_by_user_id = ?, rejection_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['REJECTED', now, context.user.id, reason, now, context.user.id, context.tenant.id, vendorInvoiceId]);
    insert('invoice_approval_events', { id: newId('invoice_event'), tenant_id: context.tenant.id, vendor_invoice_id: vendorInvoiceId, event_type: 'REJECTED', reason, created_at: now, created_by_user_id: context.user.id });
    insertAudit(context, { action: 'REJECT_VENDOR_INVOICE', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${invoice.invoice_number} rejected`, before: invoice, after: { ...invoice, status: 'REJECTED', rejection_reason: reason } });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function cancelVendorInvoice(context, vendorInvoiceId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_vendor_invoice');
  const reason = requireString(body.reason || 'Cancelled from workflow review', 'reason', { max: 240 });
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (['EXPORTED'].includes(invoice.status)) throw fail('Exported invoices cannot be cancelled', 409);
    const now = nowIso();
    execute(
      'UPDATE vendor_invoices SET status = ?, cancelled_at = ?, cancelled_by_user_id = ?, cancel_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['CANCELLED', now, context.user.id, reason, now, context.user.id, context.tenant.id, vendorInvoiceId]
    );
    insert('invoice_approval_events', {
      id: newId('invoice_event'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      event_type: 'CANCELLED',
      reason,
      created_at: now,
      created_by_user_id: context.user.id
    });
    insertAudit(context, {
      action: 'CANCEL_VENDOR_INVOICE',
      entityType: 'vendor_invoice',
      entityId: vendorInvoiceId,
      summary: `${invoice.invoice_number} cancelled`,
      before: invoice,
      after: { ...invoice, status: 'CANCELLED', cancel_reason: reason }
    });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function markVendorInvoiceExportReady(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'mark_invoice_export_ready');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (invoice.status !== 'APPROVED') throw fail('Invoice must be approved before export readiness', 409);
    const budgetCostCenterId = invoice.cost_center_id || resolveCostCenterReference(context, { departmentId: invoice.department_id }, invoice.department_id).id;
    consumeBudgetForEntity(context, {
      departmentId: invoice.department_id,
      costCenterId: budgetCostCenterId,
      entityType: 'vendor_invoice',
      entityId: invoice.id,
      amount: Number(invoice.total_amount || 0),
      reason: `Invoice ${invoice.invoice_number} export-ready`
    });
    const now = nowIso();
    execute('UPDATE vendor_invoices SET status = ?, export_ready_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['EXPORT_READY', now, now, context.user.id, context.tenant.id, vendorInvoiceId]);
    insertAudit(context, { action: 'MARK_INVOICE_EXPORT_READY', entityType: 'vendor_invoice', entityId: vendorInvoiceId, summary: `${invoice.invoice_number} export-ready`, before: invoice, after: { ...invoice, status: 'EXPORT_READY', export_ready_at: now } });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function exportVendorInvoice(context, vendorInvoiceId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'export_vendor_invoice');
  return transaction(() => {
    const invoice = loadVendorInvoiceRecord(context, vendorInvoiceId);
    if (invoice.status !== 'EXPORT_READY') throw fail('Invoice must be export-ready before export', 409);
    const now = nowIso();
    execute(
      `UPDATE vendor_invoices
       SET status = ?, exported_at = ?, export_delivery_status = ?, export_delivery_notes = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      ['EXPORTED', now, 'CONNECTOR_REQUIRED', 'Local export generated. No live ERP connector is configured, so external delivery remains queued.', now, context.user.id, context.tenant.id, vendorInvoiceId]
    );
    insert('invoice_approval_events', {
      id: newId('invoice_event'),
      tenant_id: context.tenant.id,
      vendor_invoice_id: vendorInvoiceId,
      event_type: 'EXPORTED',
      reason: 'Local export snapshot generated',
      created_at: now,
      created_by_user_id: context.user.id
    });
    insertAudit(context, {
      action: 'EXPORT_VENDOR_INVOICE',
      entityType: 'vendor_invoice',
      entityId: vendorInvoiceId,
      summary: `${invoice.invoice_number} export snapshot generated`,
      before: invoice,
      after: { ...invoice, status: 'EXPORTED', exported_at: now, export_delivery_status: 'CONNECTOR_REQUIRED' }
    });
    return getVendorInvoiceDetail(context, vendorInvoiceId);
  });
}

export function listRfqRequests(context) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_rfq_requests');
  ensureTenantUser(context, context.tenant.id);
  const scope = procureToPayScopeClause(context, 'r');
  return selectAll(
    `SELECT r.*, d.name AS department_name, f.name AS facility_name, u.name AS requester_name, COUNT(rl.id) AS line_count
     FROM rfq_requests r
     JOIN departments d ON d.id = r.department_id
     JOIN facilities f ON f.id = r.facility_id
     JOIN users u ON u.id = r.requested_by_user_id
     LEFT JOIN rfq_lines rl ON rl.rfq_request_id = r.id AND rl.tenant_id = r.tenant_id
     WHERE r.tenant_id = ? ${scope.sql}
     GROUP BY r.id
     ORDER BY r.created_at DESC`,
    [context.tenant.id, ...scope.params]
  );
}

export function getRfqRequestDetail(context, rfqRequestId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_rfq_requests');
  const rfq = loadRfqRecord(context, rfqRequestId);
  return {
    rfqRequest: rfq,
    lines: loadRfqLines(context, rfqRequestId),
    awardedQuote: rfq.awarded_quote_id ? selectOne('SELECT * FROM vendor_quotes WHERE tenant_id = ? AND id = ?', [context.tenant.id, rfq.awarded_quote_id]) : null,
    quotes: selectAll('SELECT vq.*, v.name AS vendor_name, v.code AS vendor_code FROM vendor_quotes vq JOIN vendors v ON v.id = vq.vendor_id WHERE vq.tenant_id = ? AND vq.rfq_request_id = ? ORDER BY vq.total_amount ASC', [context.tenant.id, rfqRequestId]),
    evidence: selectAll('SELECT * FROM documents WHERE tenant_id = ? AND entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [context.tenant.id, 'rfq_request', rfqRequestId])
  };
}

export function createRfqRequest(context, body) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'create_rfq_request');
  const subject = requireString(body.subject, 'subject', { max: 180 });
  const departmentId = requireString(body.departmentId ?? context.user.department_id, 'departmentId', { max: 80 });
  const facilityId = requireString(body.facilityId ?? context.user.facility_id, 'facilityId', { max: 80 });
  assertDepartmentBelongsToTenant(context.tenant.id, departmentId);
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);
  const lines = requireArray(body.lines, 'lines').map((line, index) => ({
    description: requireString(line.description, `lines[${index}].description`, { max: 220 }),
    qty: requirePositiveInt(line.qty, `lines[${index}].qty`, { max: 100000 }),
    itemId: line.itemId ? requireString(line.itemId, `lines[${index}].itemId`, { max: 80 }) : null,
    targetUnitPrice: Number(line.targetUnitPrice ?? 0)
  }));
  return transaction(() => {
    const rfq = {
      id: newId('rfq'),
      tenant_id: context.tenant.id,
      rfq_no: `RFQ-${String(Date.now()).slice(-4)}`,
      subject,
      status: 'DRAFT',
      department_id: departmentId,
      facility_id: facilityId,
      requested_by_user_id: context.user.id,
      due_at: body.dueAt ? requireString(body.dueAt, 'dueAt', { max: 40 }) : null,
      sent_at: null,
      evaluated_at: null,
      awarded_at: null,
      awarded_quote_id: null,
      cancelled_at: null,
      cancel_reason: '',
      notes: optionalString(body.notes, 'notes', { max: 280 }) || '',
      created_at: nowIso(),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('rfq_requests', rfq);
    for (const line of lines) {
      insert('rfq_lines', {
        id: newId('rfq_line'),
        tenant_id: context.tenant.id,
        rfq_request_id: rfq.id,
        item_id: line.itemId,
        description: line.description,
        qty: line.qty,
        target_unit_price: line.targetUnitPrice,
        status: 'DRAFT',
        created_at: nowIso(),
        created_by_user_id: context.user.id,
        updated_at: nowIso(),
        updated_by_user_id: context.user.id
      });
    }
    insertAudit(context, { action: 'CREATE_RFQ_REQUEST', entityType: 'rfq_request', entityId: rfq.id, summary: `${rfq.rfq_no} created`, after: rfq });
    return getRfqRequestDetail(context, rfq.id);
  });
}

export function updateRfqRequest(context, rfqRequestId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_rfq_request');
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    if (!['DRAFT', 'SENT'].includes(rfq.status)) throw fail('RFQ can only be updated before evaluation completes', 409);
    const updated = {
      ...rfq,
      subject: body.subject === undefined ? rfq.subject : requireString(body.subject, 'subject', { max: 180 }),
      due_at: body.dueAt === undefined ? rfq.due_at : (body.dueAt ? requireString(body.dueAt, 'dueAt', { max: 40 }) : null),
      notes: body.notes === undefined ? rfq.notes : optionalString(body.notes, 'notes', { max: 280 }),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute('UPDATE rfq_requests SET subject = ?, due_at = ?, notes = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [updated.subject, updated.due_at, updated.notes, updated.updated_at, updated.updated_by_user_id, context.tenant.id, rfqRequestId]);
    insertAudit(context, { action: 'UPDATE_RFQ_REQUEST', entityType: 'rfq_request', entityId: rfqRequestId, summary: `${updated.rfq_no} updated`, before: rfq, after: updated });
    return getRfqRequestDetail(context, rfqRequestId);
  });
}

export function sendRfqRequest(context, rfqRequestId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'send_rfq_request');
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    if (rfq.status !== 'DRAFT') throw fail('RFQ can only be sent from draft', 409);
    const now = nowIso();
    execute('UPDATE rfq_requests SET status = ?, sent_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['SENT', now, now, context.user.id, context.tenant.id, rfqRequestId]);
    insertAudit(context, { action: 'SEND_RFQ_REQUEST', entityType: 'rfq_request', entityId: rfqRequestId, summary: `${rfq.rfq_no} sent to vendors`, before: rfq, after: { ...rfq, status: 'SENT', sent_at: now } });
    return getRfqRequestDetail(context, rfqRequestId);
  });
}

export function evaluateRfqRequest(context, rfqRequestId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'evaluate_rfq_request');
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    const quotes = selectAll('SELECT * FROM vendor_quotes WHERE tenant_id = ? AND rfq_request_id = ? ORDER BY total_amount ASC', [context.tenant.id, rfqRequestId]);
    if (!quotes.length) throw fail('RFQ has no quotes to evaluate', 409);
    const now = nowIso();
    execute('UPDATE rfq_requests SET status = ?, evaluated_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['EVALUATED', now, now, context.user.id, context.tenant.id, rfqRequestId]);
    insertAudit(context, { action: 'EVALUATE_RFQ_REQUEST', entityType: 'rfq_request', entityId: rfqRequestId, summary: `${rfq.rfq_no} evaluated`, before: rfq, after: { ...rfq, status: 'EVALUATED', evaluated_at: now } });
    return getRfqRequestDetail(context, rfqRequestId);
  });
}

export function awardRfqRequest(context, rfqRequestId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'award_rfq_request');
  const quoteId = requireString(body.quoteId, 'quoteId', { max: 80 });
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    const quote = selectOne('SELECT * FROM vendor_quotes WHERE tenant_id = ? AND id = ? AND rfq_request_id = ?', [context.tenant.id, quoteId, rfqRequestId]);
    if (!quote) throw fail('Vendor quote not found', 404);
    const now = nowIso();
    execute('UPDATE rfq_requests SET status = ?, awarded_at = ?, awarded_quote_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['AWARDED', now, quoteId, now, context.user.id, context.tenant.id, rfqRequestId]);
    execute('UPDATE vendor_quotes SET status = ?, awarded_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['AWARDED', now, now, context.user.id, context.tenant.id, quoteId]);
    insertAudit(context, { action: 'AWARD_RFQ_REQUEST', entityType: 'rfq_request', entityId: rfqRequestId, summary: `${rfq.rfq_no} awarded to ${quote.quote_no}`, before: rfq, after: { ...rfq, status: 'AWARDED', awarded_quote_id: quoteId, awarded_at: now } });
    return getRfqRequestDetail(context, rfqRequestId);
  });
}

export function cancelRfqRequest(context, rfqRequestId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'cancel_rfq_request');
  const reason = optionalString(body.reason ?? body.cancelReason, 'reason', { max: 240 }) || 'Cancelled by sourcing';
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    if (!['DRAFT', 'SENT'].includes(rfq.status)) throw fail('RFQ cannot be cancelled in its current state', 409);
    const now = nowIso();
    execute('UPDATE rfq_requests SET status = ?, cancelled_at = ?, cancel_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['CANCELLED', now, reason, now, context.user.id, context.tenant.id, rfqRequestId]);
    insertAudit(context, { action: 'CANCEL_RFQ_REQUEST', entityType: 'rfq_request', entityId: rfqRequestId, summary: `${rfq.rfq_no} cancelled`, before: rfq, after: { ...rfq, status: 'CANCELLED', cancelled_at: now, cancel_reason: reason } });
    return getRfqRequestDetail(context, rfqRequestId);
  });
}

export function listRfqLines(context, rfqRequestId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_rfq_requests');
  loadRfqRecord(context, rfqRequestId);
  return loadRfqLines(context, rfqRequestId);
}

export function createRfqLine(context, rfqRequestId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_rfq_request');
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    if (rfq.status !== 'DRAFT') throw fail('RFQ line can only be added while draft', 409);
    const line = {
      id: newId('rfq_line'),
      tenant_id: context.tenant.id,
      rfq_request_id: rfqRequestId,
      item_id: body.itemId ? requireString(body.itemId, 'itemId', { max: 80 }) : null,
      description: requireString(body.description, 'description', { max: 220 }),
      qty: requirePositiveInt(body.qty, 'qty', { max: 100000 }),
      target_unit_price: Number(body.targetUnitPrice ?? 0),
      status: 'DRAFT',
      created_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('rfq_lines', line);
    insertAudit(context, { action: 'CREATE_RFQ_LINE', entityType: 'rfq_line', entityId: line.id, summary: `${rfq.rfq_no} line added`, after: line });
    return loadRfqLines(context, rfqRequestId);
  });
}

export function updateRfqLine(context, rfqRequestId, lineId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_rfq_request');
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    const line = selectOne('SELECT * FROM rfq_lines WHERE tenant_id = ? AND rfq_request_id = ? AND id = ?', [context.tenant.id, rfqRequestId, lineId]);
    if (!line) throw fail('RFQ line not found', 404);
    const updated = {
      ...line,
      item_id: body.itemId === undefined ? line.item_id : (body.itemId ? requireString(body.itemId, 'itemId', { max: 80 }) : null),
      description: body.description === undefined ? line.description : requireString(body.description, 'description', { max: 220 }),
      qty: body.qty === undefined ? Number(line.qty || 0) : requirePositiveInt(body.qty, 'qty', { max: 100000 }),
      target_unit_price: body.targetUnitPrice === undefined ? Number(line.target_unit_price || 0) : Number(body.targetUnitPrice),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute('UPDATE rfq_lines SET item_id = ?, description = ?, qty = ?, target_unit_price = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [updated.item_id, updated.description, updated.qty, updated.target_unit_price, updated.updated_at, updated.updated_by_user_id, context.tenant.id, lineId]);
    insertAudit(context, { action: 'UPDATE_RFQ_LINE', entityType: 'rfq_line', entityId: lineId, summary: `${rfq.rfq_no} line updated`, before: line, after: updated });
    return loadRfqLines(context, rfqRequestId);
  });
}

export function deleteRfqLine(context, rfqRequestId, lineId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_rfq_request');
  return transaction(() => {
    const rfq = loadRfqRecord(context, rfqRequestId);
    const line = selectOne('SELECT * FROM rfq_lines WHERE tenant_id = ? AND rfq_request_id = ? AND id = ?', [context.tenant.id, rfqRequestId, lineId]);
    if (!line) throw fail('RFQ line not found', 404);
    if (rfq.status !== 'DRAFT') throw fail('RFQ line can only be deleted while draft', 409);
    execute('DELETE FROM rfq_lines WHERE tenant_id = ? AND id = ?', [context.tenant.id, lineId]);
    insertAudit(context, { action: 'DELETE_RFQ_LINE', entityType: 'rfq_line', entityId: lineId, summary: `${rfq.rfq_no} line deleted`, before: line, after: {} });
    return loadRfqLines(context, rfqRequestId);
  });
}

export function listVendorQuotes(context) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_quotes');
  ensureTenantUser(context, context.tenant.id);
  const scope = procureToPayScopeClause(context, 'vq');
  return selectAll(
    `SELECT vq.*, v.name AS vendor_name, v.code AS vendor_code, r.rfq_no
     FROM vendor_quotes vq
     JOIN vendors v ON v.id = vq.vendor_id
     JOIN rfq_requests r ON r.id = vq.rfq_request_id
     WHERE vq.tenant_id = ? ${scope.sql}
     ORDER BY vq.created_at DESC, vq.id DESC`,
    [context.tenant.id, ...scope.params]
  );
}

export function getVendorQuoteDetail(context, vendorQuoteId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_quotes');
  const quote = loadVendorQuoteRecord(context, vendorQuoteId);
  return {
    vendorQuote: quote,
    vendor: selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, quote.vendor_id]),
    rfqRequest: selectOne('SELECT * FROM rfq_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, quote.rfq_request_id]),
    lines: loadVendorQuoteLines(context, vendorQuoteId),
    evidence: selectAll('SELECT * FROM documents WHERE tenant_id = ? AND entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [context.tenant.id, 'vendor_quote', vendorQuoteId])
  };
}

export function createVendorQuote(context, body) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'create_vendor_quote');
  const rfq = loadRfqRecord(context, requireString(body.rfqRequestId, 'rfqRequestId', { max: 80 }));
  const vendor = resolveVendorReference(context, body);
  const quoteNo = requireString(body.quoteNo, 'quoteNo', { max: 60 });
  const lines = requireArray(body.lines, 'lines').map((line, index) => ({
    description: requireString(line.description, `lines[${index}].description`, { max: 220 }),
    qty: requirePositiveInt(line.qty, `lines[${index}].qty`, { max: 100000 }),
    unitPrice: Number(line.unitPrice ?? 0),
    rfqLineId: line.rfqLineId ? requireString(line.rfqLineId, `lines[${index}].rfqLineId`, { max: 80 }) : null
  }));
  if (lines.some((line) => !Number.isFinite(line.unitPrice) || line.unitPrice < 0)) throw fail('Each quote line unitPrice must be a non-negative number');
  return transaction(() => {
    if (selectOne('SELECT 1 FROM vendor_quotes WHERE tenant_id = ? AND quote_no = ?', [context.tenant.id, quoteNo])) {
      throw fail('Quote number already exists for this tenant', 409);
    }
    const total = Number(lines.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0).toFixed(2));
    const quote = {
      id: newId('quote'),
      tenant_id: context.tenant.id,
      rfq_request_id: rfq.id,
      vendor_id: vendor.id,
      quote_no: quoteNo,
      status: 'DRAFT',
      subtotal_amount: total,
      freight_amount: Number(body.freightAmount ?? 0),
      tax_amount: Number(body.taxAmount ?? 0),
      total_amount: Number((total + Number(body.freightAmount ?? 0) + Number(body.taxAmount ?? 0)).toFixed(2)),
      notes: optionalString(body.notes, 'notes', { max: 280 }) || '',
      submitted_at: null,
      shortlisted_at: null,
      awarded_at: null,
      rejected_at: null,
      expired_at: null,
      created_at: nowIso(),
      created_by_user_id: context.user.id,
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    insert('vendor_quotes', quote);
    for (const line of lines) {
      insert('vendor_quote_lines', {
        id: newId('quote_line'),
        tenant_id: context.tenant.id,
        vendor_quote_id: quote.id,
        rfq_line_id: line.rfqLineId,
        item_id: null,
        description: line.description,
        qty: line.qty,
        unit_price: line.unitPrice,
        line_total: Number((line.qty * line.unitPrice).toFixed(2)),
        lead_time_days: 0,
        status: 'DRAFT',
        created_at: nowIso(),
        created_by_user_id: context.user.id,
        updated_at: nowIso(),
        updated_by_user_id: context.user.id
      });
    }
    insertAudit(context, { action: 'CREATE_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: quote.id, summary: `${quote.quote_no} created`, after: quote });
    return getVendorQuoteDetail(context, quote.id);
  });
}

export function updateVendorQuote(context, vendorQuoteId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'update_vendor_quote');
  return transaction(() => {
    const quote = loadVendorQuoteRecord(context, vendorQuoteId);
    if (!['DRAFT', 'SUBMITTED'].includes(quote.status)) throw fail('Quote can only be updated before award', 409);
    const updated = {
      ...quote,
      notes: body.notes === undefined ? quote.notes : optionalString(body.notes, 'notes', { max: 280 }),
      freight_amount: body.freightAmount === undefined ? quote.freight_amount : Number(body.freightAmount),
      tax_amount: body.taxAmount === undefined ? quote.tax_amount : Number(body.taxAmount),
      total_amount: body.totalAmount === undefined ? quote.total_amount : Number(body.totalAmount),
      updated_at: nowIso(),
      updated_by_user_id: context.user.id
    };
    execute('UPDATE vendor_quotes SET notes = ?, freight_amount = ?, tax_amount = ?, total_amount = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [updated.notes, updated.freight_amount, updated.tax_amount, updated.total_amount, updated.updated_at, updated.updated_by_user_id, context.tenant.id, vendorQuoteId]);
    insertAudit(context, { action: 'UPDATE_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: vendorQuoteId, summary: `${updated.quote_no} updated`, before: quote, after: updated });
    return getVendorQuoteDetail(context, vendorQuoteId);
  });
}

export function submitVendorQuote(context, vendorQuoteId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'submit_vendor_quote');
  return transaction(() => {
    const quote = loadVendorQuoteRecord(context, vendorQuoteId);
    if (quote.status !== 'DRAFT') throw fail('Quote can only be submitted from draft', 409);
    const now = nowIso();
    execute('UPDATE vendor_quotes SET status = ?, submitted_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['SUBMITTED', now, now, context.user.id, context.tenant.id, vendorQuoteId]);
    insertAudit(context, { action: 'SUBMIT_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: vendorQuoteId, summary: `${quote.quote_no} submitted`, before: quote, after: { ...quote, status: 'SUBMITTED', submitted_at: now } });
    return getVendorQuoteDetail(context, vendorQuoteId);
  });
}

export function shortlistVendorQuote(context, vendorQuoteId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'shortlist_vendor_quote');
  return transaction(() => {
    const quote = loadVendorQuoteRecord(context, vendorQuoteId);
    if (!['SUBMITTED', 'SHORTLISTED'].includes(quote.status)) throw fail('Quote can only be shortlisted after submission', 409);
    const now = nowIso();
    execute('UPDATE vendor_quotes SET status = ?, shortlisted_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['SHORTLISTED', now, now, context.user.id, context.tenant.id, vendorQuoteId]);
    insertAudit(context, { action: 'SHORTLIST_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: vendorQuoteId, summary: `${quote.quote_no} shortlisted`, before: quote, after: { ...quote, status: 'SHORTLISTED', shortlisted_at: now } });
    return getVendorQuoteDetail(context, vendorQuoteId);
  });
}

export function awardVendorQuote(context, vendorQuoteId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'award_vendor_quote');
  return transaction(() => {
    const quote = loadVendorQuoteRecord(context, vendorQuoteId);
    const rfq = selectOne('SELECT * FROM rfq_requests WHERE tenant_id = ? AND id = ?', [context.tenant.id, quote.rfq_request_id]);
    if (!rfq) throw fail('RFQ request not found', 404);
    const now = nowIso();
    execute('UPDATE vendor_quotes SET status = ?, awarded_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['AWARDED', now, now, context.user.id, context.tenant.id, vendorQuoteId]);
    execute('UPDATE rfq_requests SET status = ?, awarded_at = ?, awarded_quote_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['AWARDED', now, vendorQuoteId, now, context.user.id, context.tenant.id, rfq.id]);
    insertAudit(context, { action: 'AWARD_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: vendorQuoteId, summary: `${quote.quote_no} awarded`, before: quote, after: { ...quote, status: 'AWARDED', awarded_at: now } });
    return getVendorQuoteDetail(context, vendorQuoteId);
  });
}

export function rejectVendorQuote(context, vendorQuoteId, body = {}) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'reject_vendor_quote');
  const reason = requireString(body.reason, 'reason', { max: 240 });
  return transaction(() => {
    const quote = loadVendorQuoteRecord(context, vendorQuoteId);
    const now = nowIso();
    execute('UPDATE vendor_quotes SET status = ?, rejected_at = ?, notes = COALESCE(NULLIF(notes, \'\'), ?), updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['REJECTED', now, reason, now, context.user.id, context.tenant.id, vendorQuoteId]);
    insertAudit(context, { action: 'REJECT_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: vendorQuoteId, summary: `${quote.quote_no} rejected`, before: quote, after: { ...quote, status: 'REJECTED', rejected_at: now, notes: reason } });
    return getVendorQuoteDetail(context, vendorQuoteId);
  });
}

export function expireVendorQuote(context, vendorQuoteId) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'expire_vendor_quote');
  return transaction(() => {
    const quote = loadVendorQuoteRecord(context, vendorQuoteId);
    const now = nowIso();
    execute('UPDATE vendor_quotes SET status = ?, expired_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['EXPIRED', now, now, context.user.id, context.tenant.id, vendorQuoteId]);
    insertAudit(context, { action: 'EXPIRE_VENDOR_QUOTE', entityType: 'vendor_quote', entityId: vendorQuoteId, summary: `${quote.quote_no} expired`, before: quote, after: { ...quote, status: 'EXPIRED', expired_at: now } });
    return getVendorQuoteDetail(context, vendorQuoteId);
  });
}

export function listVendorScorecards(context) {
  requireFeature(context, 'procure_to_pay_intelligence');
  requireCapability(context, 'view_vendor_scorecards');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `SELECT vs.*, v.name AS vendor_name, v.code AS vendor_code
     FROM vendor_scorecards vs
     JOIN vendors v ON v.id = vs.vendor_id
     WHERE vs.tenant_id = ?
     ORDER BY vs.score_date DESC, vs.created_at DESC`,
    [context.tenant.id]
  );
}

function receivingScopeClause(context, alias = 'po') {
  if (['admin', 'supervisor', 'finance'].includes(context.user.role_key)) {
    return { sql: '', params: [] };
  }
  return { sql: ` AND ${alias}.department_id = ?`, params: [context.user.department_id] };
}

function loadReceivingPurchaseOrder(context, purchaseOrderId) {
  requireFeature(context, 'receiving_core');
  ensureTenantUser(context, context.tenant.id);
  const order = selectOne('SELECT * FROM purchase_orders WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseOrderId]);
  if (!order) throw fail('Purchase order not found', 404);
  const scope = receivingScopeClause(context, 'po');
  if (scope.sql && order.department_id !== context.user.department_id) {
    throw fail('Purchase order not visible to this department', 403);
  }
  return order;
}

function loadReceivingSessionRecord(context, sessionId) {
  requireFeature(context, 'receiving_core');
  ensureTenantUser(context, context.tenant.id);
  const session = selectOne('SELECT * FROM receive_sessions WHERE tenant_id = ? AND id = ?', [context.tenant.id, sessionId]);
  if (!session) throw fail('Receive session not found', 404);
  const scope = receivingScopeClause(context, 'po');
  if (scope.sql) {
    const order = selectOne('SELECT id, department_id FROM purchase_orders po WHERE po.tenant_id = ? AND po.id = ?', [context.tenant.id, session.purchase_order_id]);
    if (order && order.department_id !== context.user.department_id) {
      throw fail('Receive session not visible to this department', 403);
    }
  }
  return session;
}

function loadReceivingSessionLines(context, sessionId) {
  return selectAll(
    `SELECT rsl.*, pol.description, pol.unit_price, i.name AS item_name, i.sku, i.barcode, b.code AS bin_code
     FROM receive_session_lines rsl
     JOIN purchase_order_lines pol ON pol.id = rsl.purchase_order_line_id
     JOIN items i ON i.id = rsl.item_id
     LEFT JOIN bins b ON b.id = rsl.bin_id
     WHERE rsl.tenant_id = ? AND rsl.receive_session_id = ?
     ORDER BY rsl.created_at ASC, rsl.id ASC`,
    [context.tenant.id, sessionId]
  );
}

function receivingLineStatus(orderQty, receivedQty, damagedQty, shortQty) {
  const ordered = Number(orderQty || 0);
  const received = Number(receivedQty || 0);
  const damaged = Number(damagedQty || 0);
  const short = Number(shortQty || 0);
  const processed = received + damaged + short;
  if (processed > ordered) return 'OVER_RECEIVED';
  if (damaged > 0 || short > 0) return processed >= ordered ? 'EXCEPTION' : 'PARTIAL_EXCEPTION';
  if (received >= ordered) return 'RECEIVED';
  if (processed > 0) return 'PARTIAL';
  return 'NOT_RECEIVED';
}

function chooseReceivingBin(context, facilityId, itemId) {
  const preferred = selectOne(
    `SELECT b.*
     FROM stock_balances sb
     JOIN bins b ON b.id = sb.bin_id
     WHERE sb.tenant_id = ? AND sb.facility_id = ? AND sb.item_id = ?
     ORDER BY sb.available DESC, sb.on_hand DESC
     LIMIT 1`,
    [context.tenant.id, facilityId, itemId]
  );
  if (preferred) return preferred;
  const fallback = selectOne('SELECT * FROM bins WHERE tenant_id = ? AND facility_id = ? ORDER BY code ASC LIMIT 1', [context.tenant.id, facilityId]);
  if (fallback) return fallback;
  throw fail('No receiving bin is available for this facility', 409);
}

function receivingReceiptTotals(context, purchaseOrderId) {
  const rows = selectAll(
    `SELECT
       rsl.purchase_order_line_id,
       COALESCE(SUM(rsl.qty_received), 0) AS qty_received,
       COALESCE(SUM(rsl.qty_damaged), 0) AS qty_damaged,
       COALESCE(SUM(rsl.qty_short), 0) AS qty_short
     FROM receive_session_lines rsl
     JOIN receive_sessions rs ON rs.id = rsl.receive_session_id
     WHERE rsl.tenant_id = ? AND rs.tenant_id = ? AND rs.purchase_order_id = ? AND rs.status = 'POSTED'
     GROUP BY rsl.purchase_order_line_id`,
    [context.tenant.id, context.tenant.id, purchaseOrderId]
  );
  const totals = new Map();
  for (const row of rows) {
    totals.set(row.purchase_order_line_id, {
      qty_received: Number(row.qty_received || 0),
      qty_damaged: Number(row.qty_damaged || 0),
      qty_short: Number(row.qty_short || 0)
    });
  }
  return totals;
}

function receivingOrderStatusFromTotals(totals, orderLines) {
  const orderedTotal = orderLines.reduce((sum, line) => sum + Number(line.qty_ordered || 0), 0);
  const receivedTotal = Array.from(totals.values()).reduce((sum, row) => sum + Number(row.qty_received || 0), 0);
  const damagedTotal = Array.from(totals.values()).reduce((sum, row) => sum + Number(row.qty_damaged || 0), 0);
  const shortTotal = Array.from(totals.values()).reduce((sum, row) => sum + Number(row.qty_short || 0), 0);
  const processed = receivedTotal + damagedTotal + shortTotal;
  if (processed === 0) return 'ISSUED';
  if (processed < orderedTotal) return 'PARTIALLY_RECEIVED';
  if (receivedTotal >= orderedTotal && damagedTotal === 0 && shortTotal === 0) return 'RECEIVED';
  return 'RECEIVED_WITH_EXCEPTIONS';
}

export function getReceivingSummary(context) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'view_receiving');
  ensureTenantUser(context, context.tenant.id);
  const openSessions = selectOne(`SELECT COUNT(*) AS count FROM receive_sessions WHERE tenant_id = ? AND status IN ('DRAFT', 'IN_PROGRESS')`, [context.tenant.id]).count;
  const postedSessions = selectOne(`SELECT COUNT(*) AS count FROM receive_sessions WHERE tenant_id = ? AND status = 'POSTED'`, [context.tenant.id]).count;
  const blockedSessions = selectOne(`SELECT COUNT(*) AS count FROM receive_sessions WHERE tenant_id = ? AND status = 'CANCELLED'`, [context.tenant.id]).count;
  const purchaseOrders = selectOne(`SELECT COUNT(*) AS count FROM purchase_orders WHERE tenant_id = ? AND status IN ('ISSUED', 'RECEIVING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'RECEIVED_WITH_EXCEPTIONS')`, [context.tenant.id]).count;
  const pendingReceipts = selectOne(
    `SELECT COUNT(*) AS count
     FROM purchase_orders po
     WHERE po.tenant_id = ? AND po.status IN ('ISSUED', 'RECEIVING', 'PARTIALLY_RECEIVED')
       AND EXISTS (SELECT 1 FROM purchase_order_lines pol WHERE pol.tenant_id = po.tenant_id AND pol.purchase_order_id = po.id)`,
    [context.tenant.id]
  ).count;
  return { summary: { purchaseOrders, openSessions, postedSessions, blockedSessions, pendingReceipts } };
}

export function listReceivingPurchaseOrders(context) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'view_receiving');
  ensureTenantUser(context, context.tenant.id);
  const scope = receivingScopeClause(context, 'po');
  const orders = selectAll(
    `
      SELECT
        po.*,
        v.name AS vendor_name,
        v.code AS vendor_code,
        pr.pr_no AS request_no,
        COALESCE(SUM(pol.qty_ordered), 0) AS qty_ordered,
        COALESCE(SUM(pol.qty_received), 0) AS qty_received,
        COALESCE(SUM(pol.qty_damaged), 0) AS qty_damaged,
        COALESCE(SUM(pol.qty_short), 0) AS qty_short
      FROM purchase_orders po
      JOIN vendors v ON v.id = po.vendor_id
      LEFT JOIN purchase_requests pr ON pr.id = po.source_purchase_request_id
      LEFT JOIN purchase_order_lines pol ON pol.purchase_order_id = po.id AND pol.tenant_id = po.tenant_id
      WHERE po.tenant_id = ? ${scope.sql} AND po.status IN ('ISSUED', 'RECEIVING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'RECEIVED_WITH_EXCEPTIONS')
      GROUP BY po.id
      ORDER BY po.created_at DESC, po.id DESC
    `,
    [context.tenant.id, ...scope.params]
  );
  return orders.map((order) => {
    const lines = selectAll(
      `SELECT pol.*, i.name AS item_name, i.sku, i.barcode
       FROM purchase_order_lines pol
       LEFT JOIN items i ON i.id = pol.item_id
       WHERE pol.tenant_id = ? AND pol.purchase_order_id = ?
       ORDER BY pol.created_at ASC, pol.id ASC`,
      [context.tenant.id, order.id]
    );
    const receiptTotals = receivingReceiptTotals(context, order.id);
    return {
      ...order,
      line_count: lines.length,
      lines,
      receipt_totals: lines.map((line) => {
        const totals = receiptTotals.get(line.id) || { qty_received: 0, qty_damaged: 0, qty_short: 0 };
        return {
          purchase_order_line_id: line.id,
          qty_ordered: Number(line.qty_ordered || 0),
          qty_received: totals.qty_received,
          qty_damaged: totals.qty_damaged,
          qty_short: totals.qty_short,
          remaining: Math.max(0, Number(line.qty_ordered || 0) - (totals.qty_received + totals.qty_damaged + totals.qty_short))
        };
      })
    };
  });
}

export function listReceivingSessions(context) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'view_receiving');
  ensureTenantUser(context, context.tenant.id);
  const scope = receivingScopeClause(context, 'po');
  return selectAll(
    `
      SELECT rs.*, po.po_no, po.status AS purchase_order_status, v.name AS vendor_name, v.code AS vendor_code, u.name AS starter_name
      FROM receive_sessions rs
      JOIN purchase_orders po ON po.id = rs.purchase_order_id
      JOIN vendors v ON v.id = po.vendor_id
      JOIN users u ON u.id = rs.started_by_user_id
      WHERE rs.tenant_id = ? ${scope.sql}
      ORDER BY rs.created_at DESC, rs.id DESC
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function getReceiveSessionDetail(context, sessionId) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'view_receiving');
  const session = loadReceivingSessionRecord(context, sessionId);
  const purchaseOrder = loadReceivingPurchaseOrder(context, session.purchase_order_id);
  const vendor = selectOne('SELECT * FROM vendors WHERE tenant_id = ? AND id = ?', [context.tenant.id, purchaseOrder.vendor_id]);
  const lines = loadReceivingSessionLines(context, sessionId);
  const audit = capabilitySet(context.user.role_key).has('view_audit')
    ? listAuditLogs(context, { entityType: 'receive_session', entityId: sessionId, limit: 50 })
    : [];
  const evidence = capabilitySet(context.user.role_key).has('view_evidence')
    ? listEvidenceLinks(context, 'receive_session', sessionId)
    : [];
  const movements = selectAll(
    `SELECT sm.*, i.name AS item_name, b.code AS bin_code, u.name AS actor_name
     FROM stock_movements sm
     JOIN items i ON i.id = sm.item_id
     LEFT JOIN bins b ON b.id = sm.bin_id
     JOIN users u ON u.id = sm.performed_by_user_id
     WHERE sm.tenant_id = ? AND sm.reference_type = 'receive_session' AND sm.reference_id = ?
     ORDER BY sm.created_at DESC, sm.id DESC`,
    [context.tenant.id, sessionId]
  );
  return { session, purchaseOrder, vendor, lines, audit, evidence, movements };
}

export function createReceiveSessionFromPurchaseOrder(context, purchaseOrderId) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'create_receive_session');
  return transaction(() => {
    const purchaseOrder = loadReceivingPurchaseOrder(context, purchaseOrderId);
    if (!['ISSUED', 'RECEIVING', 'PARTIALLY_RECEIVED'].includes(purchaseOrder.status)) {
      throw fail('Receive session can only be created from an issued purchase order', 409);
    }
    const orderLines = loadPurchaseOrderLines(context, purchaseOrderId);
    const receiptTotals = receivingReceiptTotals(context, purchaseOrderId);
    const pendingLines = orderLines
      .map((line) => {
        const totals = receiptTotals.get(line.id) || { qty_received: 0, qty_damaged: 0, qty_short: 0 };
        const processed = totals.qty_received + totals.qty_damaged + totals.qty_short;
        return { line, remaining: Math.max(0, Number(line.qty_ordered || 0) - processed) };
      })
      .filter((entry) => entry.remaining > 0);
    if (!pendingLines.length) throw fail('Purchase order has no remaining quantity to receive', 409);
    const now = nowIso();
    const session = {
      id: newId('receive'),
      tenant_id: context.tenant.id,
      facility_id: purchaseOrder.facility_id,
      vendor_id: purchaseOrder.vendor_id,
      purchase_order_id: purchaseOrder.id,
      status: 'DRAFT',
      started_by_user_id: context.user.id,
      completed_by_user_id: null,
      evidence_document_id: null,
      started_at: null,
      posted_at: null,
      cancelled_at: null,
      cancelled_by_user_id: null,
      cancel_reason: '',
      exception_reason: '',
      notes: `Receiving session created from ${purchaseOrder.po_no}`,
      created_at: now,
      updated_at: now,
      updated_by_user_id: context.user.id
    };
    insert('receive_sessions', session);
    for (const entry of pendingLines) {
      insert('receive_session_lines', {
        id: newId('receive_line'),
        tenant_id: context.tenant.id,
        receive_session_id: session.id,
        purchase_order_line_id: entry.line.id,
        item_id: entry.line.item_id,
        bin_id: null,
        qty_ordered: entry.remaining,
        qty_received: 0,
        qty_damaged: 0,
        qty_short: 0,
        lot_no: '',
        serial_no: '',
        expiry_date: null,
        status: 'NOT_RECEIVED',
        exception_reason: '',
        evidence_document_id: null,
        created_at: now,
        created_by_user_id: context.user.id,
        updated_at: now,
        updated_by_user_id: context.user.id
      });
    }
    insertAudit(context, {
      action: 'CREATE_RECEIVE_SESSION',
      entityType: 'receive_session',
      entityId: session.id,
      summary: `${purchaseOrder.po_no} staged for receiving`,
      after: session
    });
    return getReceiveSessionDetail(context, session.id);
  });
}

export function startReceiveSession(context, sessionId, body = {}) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'start_receive_session');
  const note = optionalString(body.note ?? body.notes, 'note', { max: 240 });
  return transaction(() => {
    const session = loadReceivingSessionRecord(context, sessionId);
    if (session.status !== 'DRAFT') throw fail('Receive session can only be started from draft', 409);
    const now = nowIso();
    const next = { ...session, status: 'IN_PROGRESS', started_at: now, updated_at: now, updated_by_user_id: context.user.id, notes: note ? `${session.notes}${session.notes ? ' | ' : ''}${note}` : session.notes };
    execute(
      'UPDATE receive_sessions SET status = ?, started_at = ?, updated_at = ?, updated_by_user_id = ?, notes = ? WHERE tenant_id = ? AND id = ?',
      ['IN_PROGRESS', now, now, context.user.id, next.notes, context.tenant.id, sessionId]
    );
    insertAudit(context, {
      action: 'START_RECEIVE_SESSION',
      entityType: 'receive_session',
      entityId: sessionId,
      summary: `Receiving started for ${sessionId}`,
      before: session,
      after: next
    });
    return getReceiveSessionDetail(context, sessionId);
  });
}

export function recordReceiveLine(context, sessionId, body = {}) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'receive_stock');
  const session = loadReceivingSessionRecord(context, sessionId);
  if (session.status !== 'IN_PROGRESS') throw fail('Receive session must be in progress before receiving lines', 409);
  const purchaseOrderLineId = requireString(body.purchaseOrderLineId ?? body.lineId, 'purchaseOrderLineId', { max: 80 });
  const qtyReceived = Number(body.qtyReceived ?? body.receivedQuantity ?? 0);
  const qtyDamaged = Number(body.qtyDamaged ?? body.damagedQuantity ?? 0);
  const qtyShort = Number(body.qtyShort ?? body.shortQuantity ?? 0);
  const lotNo = optionalString(body.lotNo, 'lotNo', { max: 80 });
  const serialNo = optionalString(body.serialNo, 'serialNo', { max: 80 });
  const expiryDate = optionalString(body.expiryDate, 'expiryDate', { max: 40 });
  const note = optionalString(body.note ?? body.reason, 'note', { max: 240 });
  const evidenceDocumentId = optionalString(body.evidenceDocumentId, 'evidenceDocumentId', { max: 80 });
  const binId = optionalString(body.binId, 'binId', { max: 80 });
  if (![qtyReceived, qtyDamaged, qtyShort].every((value) => Number.isInteger(value) && value >= 0)) {
    throw fail('Received, damaged, and short quantities must be non-negative integers', 400);
  }
  if (qtyReceived === 0 && qtyDamaged === 0 && qtyShort === 0) {
    throw fail('At least one receiving quantity must be provided', 400);
  }
  return transaction(() => {
    const order = loadReceivingPurchaseOrder(context, session.purchase_order_id);
    const line = selectOne('SELECT * FROM purchase_order_lines WHERE tenant_id = ? AND purchase_order_id = ? AND id = ?', [context.tenant.id, order.id, purchaseOrderLineId]);
    if (!line) throw fail('Purchase order line not found', 404);
    const sessionLine = selectOne(
      'SELECT * FROM receive_session_lines WHERE tenant_id = ? AND receive_session_id = ? AND purchase_order_line_id = ?',
      [context.tenant.id, sessionId, purchaseOrderLineId]
    );
    if (!sessionLine) throw fail('Receive session line not found', 404);
    const existingReceived = Number(sessionLine.qty_received || 0);
    const existingDamaged = Number(sessionLine.qty_damaged || 0);
    const existingShort = Number(sessionLine.qty_short || 0);
    const nextReceived = existingReceived + qtyReceived;
    const nextDamaged = existingDamaged + qtyDamaged;
    const nextShort = existingShort + qtyShort;
    const processed = nextReceived + nextDamaged + nextShort;
    if (processed > Number(sessionLine.qty_ordered || 0) && !capabilitySet(context.user.role_key).has('over_receive_stock')) {
      throw fail('Over-receiving is not permitted for this role', 409);
    }
    const nextStatus = receivingLineStatus(sessionLine.qty_ordered, nextReceived, nextDamaged, nextShort);
    const now = nowIso();
    const resolvedBin = binId ? selectOne('SELECT * FROM bins WHERE tenant_id = ? AND id = ?', [context.tenant.id, binId]) : chooseReceivingBin(context, order.facility_id, line.item_id);
    if (binId && !resolvedBin) throw fail('Receiving bin not found', 404);
    const updatedLine = {
      ...sessionLine,
      bin_id: resolvedBin?.id || sessionLine.bin_id || null,
      qty_received: nextReceived,
      qty_damaged: nextDamaged,
      qty_short: nextShort,
      lot_no: lotNo || sessionLine.lot_no || '',
      serial_no: serialNo || sessionLine.serial_no || '',
      expiry_date: expiryDate || sessionLine.expiry_date || null,
      status: nextStatus,
      exception_reason: note || sessionLine.exception_reason || '',
      evidence_document_id: evidenceDocumentId || sessionLine.evidence_document_id || null,
      updated_at: now,
      updated_by_user_id: context.user.id
    };
    if (updatedLine.evidence_document_id) {
      evidenceEntityExists(context, 'document', updatedLine.evidence_document_id);
    }
    execute(
      `UPDATE receive_session_lines
       SET bin_id = ?, qty_received = ?, qty_damaged = ?, qty_short = ?, lot_no = ?, serial_no = ?, expiry_date = ?, status = ?, exception_reason = ?, evidence_document_id = COALESCE(?, evidence_document_id), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND receive_session_id = ? AND purchase_order_line_id = ?`,
      [updatedLine.bin_id, updatedLine.qty_received, updatedLine.qty_damaged, updatedLine.qty_short, updatedLine.lot_no, updatedLine.serial_no, updatedLine.expiry_date, updatedLine.status, updatedLine.exception_reason, updatedLine.evidence_document_id, now, context.user.id, context.tenant.id, sessionId, purchaseOrderLineId]
    );
    insertAudit(context, {
      action: 'RECEIVE_STOCK',
      entityType: 'receive_session_line',
      entityId: sessionLine.id,
      summary: `${line.description} received for ${order.po_no}`,
      before: sessionLine,
      after: updatedLine,
      requestId: sessionId
    });
    if (updatedLine.evidence_document_id) {
      insert('chain_of_custody_events', {
        id: newId('custody'),
        tenant_id: context.tenant.id,
        evidence_document_id: updatedLine.evidence_document_id,
        actor_user_id: context.user.id,
        action: 'LINKED',
        note: `Receiving line ${sessionLine.id}`,
        created_at: now
      });
    }
    return getReceiveSessionDetail(context, sessionId);
  });
}

export function recordReceiveException(context, sessionId, body = {}) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'record_receive_exception');
  const note = requireString(body.reason ?? body.note ?? body.exceptionReason, 'reason', { max: 240 });
  const lineId = optionalString(body.lineId, 'lineId', { max: 80 });
  return transaction(() => {
    const session = loadReceivingSessionRecord(context, sessionId);
    const now = nowIso();
    const next = { ...session, exception_reason: note, updated_at: now, updated_by_user_id: context.user.id };
    execute('UPDATE receive_sessions SET exception_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [note, now, context.user.id, context.tenant.id, sessionId]);
    if (lineId) {
      const sessionLine = selectOne('SELECT * FROM receive_session_lines WHERE tenant_id = ? AND receive_session_id = ? AND id = ?', [context.tenant.id, sessionId, lineId]);
      if (!sessionLine) throw fail('Receive session line not found', 404);
      execute('UPDATE receive_session_lines SET exception_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', [note, now, context.user.id, context.tenant.id, lineId]);
    }
    insertAudit(context, {
      action: 'RECORD_RECEIVE_EXCEPTION',
      entityType: 'receive_session',
      entityId: sessionId,
      summary: note,
      before: session,
      after: next
    });
    return getReceiveSessionDetail(context, sessionId);
  });
}

export function postReceiveSession(context, sessionId, body = {}) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'post_receipt');
  const note = optionalString(body.note ?? body.notes, 'note', { max: 240 });
  return transaction(() => {
    const session = loadReceivingSessionRecord(context, sessionId);
    if (session.status !== 'IN_PROGRESS') throw fail('Receive session must be in progress before posting', 409);
    const order = loadReceivingPurchaseOrder(context, session.purchase_order_id);
    const lines = loadReceivingSessionLines(context, sessionId);
    if (!lines.length) throw fail('Receive session has no lines to post', 409);
    const now = nowIso();
    const orderLines = loadPurchaseOrderLines(context, order.id);
    for (const line of lines) {
      const received = Number(line.qty_received || 0);
      const damaged = Number(line.qty_damaged || 0);
      const short = Number(line.qty_short || 0);
      const processed = received + damaged + short;
      if (processed === 0) {
        throw fail(`Receive line ${line.id} has no quantities posted`, 409);
      }
      if (processed > Number(line.qty_ordered || 0) && !capabilitySet(context.user.role_key).has('over_receive_stock')) {
        throw fail('Over-receiving is not permitted for this role', 409);
      }
      const bin = line.bin_id ? selectOne('SELECT * FROM bins WHERE tenant_id = ? AND id = ?', [context.tenant.id, line.bin_id]) : chooseReceivingBin(context, order.facility_id, line.item_id);
      if (!bin) throw fail('Receiving bin not found', 404);
      if (received > 0) {
        const existingBalance = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? AND bin_id = ?', [context.tenant.id, line.item_id, bin.id]);
        if (existingBalance) {
          execute('UPDATE stock_balances SET on_hand = on_hand + ?, available = available + ?, updated_at = ? WHERE id = ?', [received, received, now, existingBalance.id]);
        } else {
          insert('stock_balances', {
            id: newId('stock'),
            tenant_id: context.tenant.id,
            item_id: line.item_id,
            facility_id: order.facility_id,
            bin_id: bin.id,
            on_hand: received,
            reserved: 0,
            available: received,
            updated_at: now
          });
        }
        insert('stock_movements', {
          id: newId('movement'),
          tenant_id: context.tenant.id,
          item_id: line.item_id,
          facility_id: order.facility_id,
          bin_id: bin.id,
          movement_type: 'RECEIVE',
          quantity: received,
          reference_type: 'receive_session',
          reference_id: session.id,
          performed_by_user_id: context.user.id,
          department_id: order.department_id,
          note: note || `Receipt for ${order.po_no}`
        });
      }
      const receiptState = receivingLineStatus(line.qty_ordered, received, damaged, short);
      execute(
        `UPDATE purchase_order_lines
         SET qty_received = COALESCE(qty_received, 0) + ?, qty_damaged = COALESCE(qty_damaged, 0) + ?, qty_short = COALESCE(qty_short, 0) + ?, receiving_status = ?, received_at = COALESCE(received_at, ?), received_by_user_id = COALESCE(received_by_user_id, ?), evidence_document_id = COALESCE(evidence_document_id, ?), updated_at = ?, updated_by_user_id = ?
         WHERE tenant_id = ? AND id = ?`,
        [received, damaged, short, receiptState, now, context.user.id, line.evidence_document_id || null, now, context.user.id, context.tenant.id, line.purchase_order_line_id]
      );
      execute(
        'UPDATE receive_session_lines SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
        [receiptState, now, context.user.id, context.tenant.id, line.id]
      );
    }
    execute(
      'UPDATE receive_sessions SET status = ?, posted_at = ?, completed_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['POSTED', now, context.user.id, now, context.user.id, context.tenant.id, sessionId]
    );
    const orderTotals = receivingReceiptTotals(context, order.id);
    const nextOrderStatus = receivingOrderStatusFromTotals(orderTotals, orderLines);
    execute(
      'UPDATE purchase_orders SET receiving_status = ?, status = ?, received_at = COALESCE(received_at, ?), received_by_user_id = COALESCE(received_by_user_id, ?), receiving_notes = COALESCE(NULLIF(receiving_notes, \'\'), ?), updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      [nextOrderStatus, nextOrderStatus, now, context.user.id, note || `Received via ${sessionId}`, now, context.user.id, context.tenant.id, order.id]
    );
    insertAudit(context, {
      action: 'POST_RECEIVE_SESSION',
      entityType: 'receive_session',
      entityId: sessionId,
      summary: `${order.po_no} posted${note ? `: ${note}` : ''}`,
      before: session,
      after: { ...session, status: 'POSTED', posted_at: now, completed_by_user_id: context.user.id }
    });
    return getReceiveSessionDetail(context, sessionId);
  });
}

export function cancelReceiveSession(context, sessionId, body = {}) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'cancel_receive_session');
  const reason = optionalString(body.reason ?? body.cancelReason, 'reason', { max: 240 }) || 'Cancelled by supervisor';
  return transaction(() => {
    const session = loadReceivingSessionRecord(context, sessionId);
    if (!['DRAFT', 'IN_PROGRESS'].includes(session.status)) throw fail('Receive session cannot be cancelled in its current state', 409);
    const now = nowIso();
    execute(
      'UPDATE receive_sessions SET status = ?, cancelled_at = ?, cancelled_by_user_id = ?, cancel_reason = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['CANCELLED', now, context.user.id, reason, now, context.user.id, context.tenant.id, sessionId]
    );
    insertAudit(context, {
      action: 'CANCEL_RECEIVE_SESSION',
      entityType: 'receive_session',
      entityId: sessionId,
      summary: `${sessionId} cancelled: ${reason}`,
      before: session,
      after: { ...session, status: 'CANCELLED', cancelled_at: now, cancelled_by_user_id: context.user.id, cancel_reason: reason }
    });
    return getReceiveSessionDetail(context, sessionId);
  });
}

export function listReceivingMovements(context) {
  requireFeature(context, 'receiving_core');
  requireCapability(context, 'view_receiving');
  ensureTenantUser(context, context.tenant.id);
  const scope = receivingScopeClause(context, 'po');
  return selectAll(
    `
      SELECT sm.*, i.name AS item_name, i.sku, b.code AS bin_code, u.name AS actor_name, po.po_no
      FROM stock_movements sm
      JOIN items i ON i.id = sm.item_id
      LEFT JOIN bins b ON b.id = sm.bin_id
      JOIN users u ON u.id = sm.performed_by_user_id
      LEFT JOIN receive_sessions rs ON rs.id = sm.reference_id AND sm.reference_type = 'receive_session'
      LEFT JOIN purchase_orders po ON po.id = rs.purchase_order_id
      WHERE sm.tenant_id = ? AND sm.reference_type = 'receive_session'${scope.sql}
      ORDER BY sm.created_at DESC, sm.id DESC
    `,
    [context.tenant.id, ...scope.params]
  );
}

export function listSyncBatches(context) {
  requireFeature(context, 'offline_ops');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `
      SELECT sb.*, d.name AS device_name, u.name AS user_name
      FROM sync_batches sb
      JOIN devices d ON d.id = sb.device_id
      JOIN users u ON u.id = sb.user_id
      WHERE sb.tenant_id = ?
      ORDER BY sb.created_at DESC
    `,
    [context.tenant.id]
  );
}

export function listSyncBatchTasks(context, batchId) {
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    'SELECT * FROM sync_tasks WHERE tenant_id = ? AND batch_id = ? ORDER BY task_index ASC',
    [context.tenant.id, batchId]
  ).map((task) => ({ ...task, payload: asJson(task.payload_json) }));
}

export function reviewSyncBatch(context, batchId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'review_sync');
  const decision = requireEnum(body.decision, 'decision', ['APPROVE', 'REJECT']);
  const reason = body.reason ? requireString(body.reason, 'reason', { max: 240 }) : '';
  return transaction(() => {
    const batch = selectOne('SELECT * FROM sync_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
    if (!batch) throw fail('Sync batch not found', 404);
    if (batch.review_status !== 'PENDING') throw fail('Sync batch already reviewed', 409);
    const tasks = listSyncBatchTasks(context, batchId);
    if (decision === 'REJECT') {
      execute(
        'UPDATE sync_batches SET status = ?, review_status = ?, reviewed_at = ?, reviewed_by_user_id = ?, rejected_reason = ? WHERE id = ?',
        ['REJECTED', 'REJECTED', nowIso(), context.user.id, reason, batchId]
      );
      insertAudit(context, {
        action: 'REJECT_SYNC_BATCH',
        entityType: 'sync_batch',
        entityId: batchId,
        summary: `${batch.status} rejected${reason ? `: ${reason}` : ''}`,
        before: batch,
        after: { ...batch, status: 'REJECTED', review_status: 'REJECTED', rejected_reason: reason }
      });
      return { batch: getSyncBatch(context, batchId), tasks };
    }

    for (const task of tasks) {
      if (task.task_type === 'RECEIVE') {
        applySyncReceive(context, batch, task);
      } else if (task.task_type === 'ISSUE') {
        applySyncIssue(context, batch, task);
      } else if (task.task_type === 'COUNT') {
        applySyncCount(context, batch, task);
      }
    }
    execute(
      'UPDATE sync_batches SET status = ?, review_status = ?, reviewed_at = ?, reviewed_by_user_id = ?, posted_at = ? WHERE id = ?',
      ['POSTED', 'APPROVED', nowIso(), context.user.id, nowIso(), batchId]
    );
    insertAudit(context, {
      action: 'APPROVE_SYNC_BATCH',
      entityType: 'sync_batch',
      entityId: batchId,
      summary: `${batch.id} posted with ${tasks.length} tasks`,
      before: batch,
      after: { ...batch, status: 'POSTED', review_status: 'APPROVED' }
    });
    return { batch: getSyncBatch(context, batchId), tasks: listSyncBatchTasks(context, batchId) };
  });
}

function applySyncReceive(context, batch, task) {
  const payload = task.payload;
  const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id LIKE ?', [context.tenant.id, `%_${payload.item}`]);
  if (!item) return;
  const stock = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, item.id]);
  if (!stock) return;
  const qty = requirePositiveInt(payload.qty, 'qty', { max: 100000 });
  execute(
    'UPDATE stock_balances SET on_hand = on_hand + ?, available = available + ?, updated_at = ? WHERE id = ?',
    [qty, qty, nowIso(), stock.id]
  );
  insert('stock_movements', {
    id: newId('movement'),
    tenant_id: context.tenant.id,
    item_id: item.id,
    facility_id: stock.facility_id,
    bin_id: stock.bin_id,
    movement_type: 'RECEIVE',
    quantity: qty,
    reference_type: 'sync_batch',
    reference_id: batch.id,
    performed_by_user_id: context.user.id,
    department_id: context.user.department_id,
    note: `Offline receive from ${batch.id}`
  });
}

function applySyncIssue(context, batch, task) {
  const payload = task.payload;
  const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id LIKE ?', [context.tenant.id, `%_${payload.item}`]);
  if (!item) return;
  const stock = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, item.id]);
  if (!stock) return;
  const qty = requirePositiveInt(payload.qty, 'qty', { max: 100000 });
  if (stock.available < qty) throw fail(`Insufficient stock while posting sync batch for ${item.name}`, 409);
  execute(
    'UPDATE stock_balances SET on_hand = on_hand - ?, available = available - ?, updated_at = ? WHERE id = ?',
    [qty, qty, nowIso(), stock.id]
  );
  insert('stock_movements', {
    id: newId('movement'),
    tenant_id: context.tenant.id,
    item_id: item.id,
    facility_id: stock.facility_id,
    bin_id: stock.bin_id,
    movement_type: 'ISSUE',
    quantity: qty,
    reference_type: 'sync_batch',
    reference_id: batch.id,
    performed_by_user_id: context.user.id,
    department_id: context.user.department_id,
    note: `Offline issue from ${batch.id}`
  });
}

function applySyncCount(context, batch, task) {
  const payload = task.payload;
  const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id LIKE ?', [context.tenant.id, `%_${payload.item}`]);
  if (!item) return;
  const stock = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, item.id]);
  if (!stock) return;
  const counted = requirePositiveInt(payload.counted, 'counted', { max: 100000 });
  const delta = counted - stock.on_hand;
  execute(
    'UPDATE stock_balances SET on_hand = ?, available = ?, updated_at = ? WHERE id = ?',
    [counted, Math.max(0, counted - stock.reserved), nowIso(), stock.id]
  );
  insert('stock_movements', {
    id: newId('movement'),
    tenant_id: context.tenant.id,
    item_id: item.id,
    facility_id: stock.facility_id,
    bin_id: stock.bin_id,
    movement_type: 'COUNT',
    quantity: delta,
    reference_type: 'sync_batch',
    reference_id: batch.id,
    performed_by_user_id: context.user.id,
    department_id: context.user.department_id,
    note: `Cycle count posted from ${batch.id}`
  });
}

export function getSyncBatch(context, batchId) {
  return selectOne(
    `
      SELECT sb.*, d.name AS device_name, u.name AS user_name
      FROM sync_batches sb
      JOIN devices d ON d.id = sb.device_id
      JOIN users u ON u.id = sb.user_id
      WHERE sb.tenant_id = ? AND sb.id = ?
    `,
    [context.tenant.id, batchId]
  );
}

export function createLabelJob(context, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'manage_labels');
  const kind = requireEnum(body.kind, 'kind', ['ITEM_LABEL', 'BIN_LABEL', 'RECEIVING_LABEL']);
  const entityType = requireString(body.entityType, 'entityType', { max: 60 });
  const entityId = requireString(body.entityId, 'entityId', { max: 80 });
  const barcode = requireString(body.barcode, 'barcode', { max: 80 });
  const defaultDevice = selectOne('SELECT id FROM devices WHERE tenant_id = ? AND facility_id = ? ORDER BY name LIMIT 1', [context.tenant.id, context.user.facility_id]);
  const deviceId = requireString(body.deviceId ?? defaultDevice?.id, 'deviceId', { max: 80 });
  if (!selectOne('SELECT id FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId])) throw fail('Device not found for tenant', 404);
  return transaction(() => {
    const job = {
      id: newId('label'),
      tenant_id: context.tenant.id,
      device_id: deviceId,
      kind,
      entity_type: entityType,
      entity_id: entityId,
      barcode,
      status: 'QUEUED',
      created_by_user_id: context.user.id
    };
    insert('label_print_jobs', job);
    insertAudit(context, {
      action: 'PRINT_LABEL',
      entityType: 'label_print_job',
      entityId: job.id,
      summary: `${kind} queued for ${entityType} ${entityId}`,
      after: job
    });
    return job;
  });
}

export function listLabelJobs(context) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'manage_labels');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `
      SELECT lpj.*, d.name AS device_name, u.name AS creator_name
      FROM label_print_jobs lpj
      JOIN devices d ON d.id = lpj.device_id
      JOIN users u ON u.id = lpj.created_by_user_id
      WHERE lpj.tenant_id = ?
      ORDER BY lpj.created_at DESC
    `,
    [context.tenant.id]
  );
}

function requireReportsRead(context) {
  requireFeature(context, 'reports');
  requireCapability(context, 'view_reports');
}

function requireReportsWrite(context) {
  requireFeature(context, 'reports');
  requireCapability(context, 'run_reports');
}

export function listReportDefinitions(context) {
  requireReportsRead(context);
  return listReportDefinitionsAction('TENANT', context);
}

export function listReportSummary(context) {
  requireReportsRead(context);
  return listReportSummaryAction('TENANT', context);
}

export function listReportRuns(context) {
  requireReportsRead(context);
  return listReportRunsAction('TENANT', context);
}

export function getReportRun(context, runId) {
  requireReportsRead(context);
  return getReportRunAction('TENANT', context, runId);
}

export function runReport(context, body = {}) {
  requireReportsWrite(context);
  return runReportAction('TENANT', context, body);
}

export function cancelReportRun(context, runId, body = {}) {
  requireReportsWrite(context);
  return cancelReportRunAction('TENANT', context, runId, body);
}

export function exportReportRunCsv(context, runId) {
  requireReportsRead(context);
  return exportReportCsvAction('TENANT', context, runId);
}

export function exportReportRunPdf(context, runId) {
  requireReportsRead(context);
  return exportReportPdfAction('TENANT', context, runId);
}

function normalizeExportSelection(body = {}) {
  const dateFrom = optionalString(body.dateFrom ?? body.date_from, 'dateFrom', { max: 32 });
  const dateTo = optionalString(body.dateTo ?? body.date_to, 'dateTo', { max: 32 });
  const facilityId = optionalString(body.facilityId ?? body.facility_id, 'facilityId', { max: 80 });
  const departmentId = optionalString(body.departmentId ?? body.department_id, 'departmentId', { max: 80 });
  const format = requireEnum((body.format || 'CSV').toString().toUpperCase(), 'format', ['CSV', 'JSON']);
  const sourceTypes = Array.isArray(body.sourceTypes) && body.sourceTypes.length > 0
    ? [...new Set(body.sourceTypes.map((value) => String(value || '').toUpperCase()).filter(Boolean))]
    : ['PURCHASE_ORDERS', 'RECEIPTS'];
  return { dateFrom, dateTo, facilityId, departmentId, format, sourceTypes };
}

function exportSelectionSql(selection, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  const clauses = [];
  const params = [];
  if (selection.dateFrom) {
    clauses.push(`substr(${prefix}created_at, 1, 10) >= ?`);
    params.push(selection.dateFrom);
  }
  if (selection.dateTo) {
    clauses.push(`substr(${prefix}created_at, 1, 10) <= ?`);
    params.push(`${selection.dateTo}`);
  }
  if (selection.facilityId) {
    clauses.push(`${prefix}facility_id = ?`);
    params.push(selection.facilityId);
  }
  if (selection.departmentId) {
    clauses.push(`${prefix}department_id = ?`);
    params.push(selection.departmentId);
  }
  return { sql: clauses.length ? ` AND ${clauses.join(' AND ')}` : '', params };
}

function exportBatchById(context, batchId) {
  const batch = selectOne('SELECT * FROM export_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
  if (!batch) throw fail('Export batch not found', 404);
  return batch;
}

function exportBatchOpenErrors(context, batchId) {
  return selectAll(
    `SELECT * FROM export_validation_errors WHERE tenant_id = ? AND export_batch_id = ? AND status = 'OPEN' ORDER BY created_at DESC, id DESC`,
    [context.tenant.id, batchId]
  );
}

function exportBatchDetail(context, batchId) {
  const batch = exportBatchById(context, batchId);
  const transferRows = selectAll(
    `SELECT et.*, ij.status AS job_status, ij.job_type, ij.attempt_count, ij.connection_id, ij.export_batch_id
     FROM export_transfers et
     LEFT JOIN integration_jobs ij ON ij.id = et.job_id
     WHERE et.tenant_id = ? AND et.export_batch_id = ?
     ORDER BY COALESCE(et.attempted_at, et.queued_at) DESC, et.id DESC`,
    [context.tenant.id, batchId]
  );
  const jobRows = selectAll(
    `SELECT ij.*, ic.provider_name, ic.status AS connection_status, ic.auth_mode, ic.endpoint_label, eb.batch_no
     FROM integration_jobs ij
     LEFT JOIN integration_connections ic ON ic.id = ij.connection_id
     LEFT JOIN export_batches eb ON eb.id = ij.export_batch_id
     WHERE ij.tenant_id = ? AND ij.export_batch_id = ?
     ORDER BY ij.created_at DESC`,
    [context.tenant.id, batchId]
  );
  const evidenceLinks = listEvidenceLinks(context, 'export_batch', batchId);
  const audit = listAuditLogs(context, { entityType: 'export_batch', entityId: batchId, limit: 50 });
  return { batch, errors: exportBatchOpenErrors(context, batchId), transfers: transferRows, jobs: jobRows, evidenceLinks, audit };
}

function loadExportPurchaseOrders(context, selection = {}) {
  const scoped = exportSelectionSql(selection, 'po');
  return selectAll(
    `
      SELECT
        po.*,
        po.source_purchase_request_id,
        po.approved_at,
        po.issued_at,
        po.notes,
        pr.pr_no AS request_no,
        pr.accounting_code,
        pr.status AS request_status,
        v.name AS vendor_name,
        v.code AS vendor_code,
        d.name AS department_name,
        f.name AS facility_name,
        u.name AS creator_name,
        COALESCE(COUNT(pol.id), 0) AS line_count,
        COALESCE(SUM(pol.line_total), 0) AS line_total,
        COALESCE(SUM(CASE WHEN COALESCE(NULLIF(pr.accounting_code, ''), '') = '' THEN 1 ELSE 0 END), 0) AS missing_accounting_code_lines
      FROM purchase_orders po
      LEFT JOIN purchase_requests pr ON pr.id = po.source_purchase_request_id
      JOIN vendors v ON v.id = po.vendor_id
      JOIN departments d ON d.id = po.department_id
      JOIN facilities f ON f.id = po.facility_id
      JOIN users u ON u.id = po.created_by_user_id
      LEFT JOIN purchase_order_lines pol ON pol.purchase_order_id = po.id
      WHERE po.tenant_id = ? AND po.status IN ('APPROVED', 'ISSUED')${scoped.sql}
      GROUP BY po.id
      ORDER BY po.created_at DESC, po.id DESC
    `,
    [context.tenant.id, ...scoped.params]
  );
}

function loadExportReceipts(context, selection = {}) {
  const clauses = [];
  const params = [];
  if (selection.dateFrom) {
    clauses.push('substr(rs.created_at, 1, 10) >= ?');
    params.push(selection.dateFrom);
  }
  if (selection.dateTo) {
    clauses.push('substr(rs.created_at, 1, 10) <= ?');
    params.push(selection.dateTo);
  }
  if (selection.facilityId) {
    clauses.push('rs.facility_id = ?');
    params.push(selection.facilityId);
  }
  if (selection.departmentId) {
    clauses.push('po.department_id = ?');
    params.push(selection.departmentId);
  }
  return selectAll(
    `
      SELECT
        rs.*,
        po.po_no,
        po.status AS purchase_order_status,
        v.name AS vendor_name,
        v.code AS vendor_code,
        d.name AS department_name,
        f.name AS facility_name,
        u.name AS starter_name,
        COALESCE(COUNT(rl.id), 0) AS line_count,
        COALESCE(SUM(rl.qty_received), 0) AS qty_received,
        COALESCE(SUM(rl.qty_damaged), 0) AS qty_damaged,
        COALESCE(SUM(rl.qty_short), 0) AS qty_short
      FROM receive_sessions rs
      JOIN purchase_orders po ON po.id = rs.purchase_order_id
      LEFT JOIN vendors v ON v.id = po.vendor_id
      LEFT JOIN departments d ON d.id = po.department_id
      LEFT JOIN facilities f ON f.id = po.facility_id
      LEFT JOIN users u ON u.id = rs.started_by_user_id
      LEFT JOIN receive_session_lines rl ON rl.receive_session_id = rs.id
      WHERE rs.tenant_id = ? AND rs.status = 'POSTED'${clauses.length ? ` AND ${clauses.join(' AND ')}` : ''}
      GROUP BY rs.id
      ORDER BY rs.created_at DESC, rs.id DESC
    `,
    [context.tenant.id, ...params]
  );
}

function loadExportMovements(context, selection = {}) {
  const scoped = exportSelectionSql(selection, 'sm');
  return selectAll(
    `
      SELECT
        sm.*,
        i.sku,
        i.name AS item_name,
        COALESCE(NULLIF(i.unit_of_measure, ''), i.uom) AS unit_of_measure,
        b.code AS bin_code,
        u.name AS actor_name,
        po.po_no,
        rs.id AS receive_session_no,
        rs.status AS receive_status
      FROM stock_movements sm
      JOIN items i ON i.id = sm.item_id
      LEFT JOIN bins b ON b.id = sm.bin_id
      JOIN users u ON u.id = sm.performed_by_user_id
      LEFT JOIN purchase_orders po ON po.id = sm.reference_id AND sm.reference_type = 'PURCHASE_ORDER'
      LEFT JOIN receive_sessions rs ON rs.id = sm.reference_id AND sm.reference_type = 'RECEIVE_SESSION'
      WHERE sm.tenant_id = ? AND sm.reference_type IN ('RECEIVE_SESSION', 'PURCHASE_ORDER', 'STOCK_ADJUSTMENT')${scoped.sql}
      ORDER BY sm.created_at DESC, sm.id DESC
      LIMIT 200
    `,
    [context.tenant.id, ...scoped.params]
  );
}

function exportValidationIssues(context, selection = {}) {
  const purchaseOrders = loadExportPurchaseOrders(context, selection);
  const receipts = loadExportReceipts(context, selection);
  const issues = [];
  const warnings = [];
  if (purchaseOrders.length === 0 && receipts.length === 0) {
    issues.push({
      severity: 'ERROR',
      code: 'NO_EXPORTABLE_RECORDS',
      message: 'No approved purchase orders or posted receipts were found for the selected export scope.',
      entityType: 'export_batch',
      entityId: ''
    });
  }
  for (const order of purchaseOrders) {
    if (!String(order.accounting_code || '').trim()) {
      issues.push({
        severity: 'ERROR',
        code: 'ACCOUNTING_CODE_REQUIRED',
        message: `${order.po_no} is missing an accounting code on its source purchase request.`,
        entityType: 'purchase_order',
        entityId: order.id
      });
    }
    if (!Number(order.line_count || 0)) {
      issues.push({
        severity: 'ERROR',
        code: 'PURCHASE_ORDER_LINES_REQUIRED',
        message: `${order.po_no} has no exportable lines.`,
        entityType: 'purchase_order',
        entityId: order.id
      });
    }
    if (!['APPROVED', 'ISSUED'].includes(order.status)) {
      issues.push({
        severity: 'ERROR',
        code: 'PURCHASE_ORDER_STATUS_INVALID',
        message: `${order.po_no} must be approved before export.`,
        entityType: 'purchase_order',
        entityId: order.id
      });
    }
  }
  for (const receipt of receipts) {
    if (receipt.status !== 'POSTED') {
      issues.push({
        severity: 'ERROR',
        code: 'RECEIPT_NOT_POSTED',
        message: `${receipt.id} must be posted before export.`,
        entityType: 'receive_session',
        entityId: receipt.id
      });
    }
    if (!Number(receipt.line_count || 0)) {
      issues.push({
        severity: 'ERROR',
        code: 'RECEIPT_LINES_REQUIRED',
        message: `${receipt.id} has no posted receipt lines.`,
        entityType: 'receive_session',
        entityId: receipt.id
      });
    }
    if (!selectAll('SELECT COUNT(*) AS count FROM evidence_links WHERE tenant_id = ? AND entity_type = ? AND entity_id = ?', [context.tenant.id, 'receive_session', receipt.id])[0].count) {
      warnings.push({
        severity: 'WARN',
        code: 'RECEIPT_EVIDENCE_RECOMMENDED',
        message: `${receipt.id} has no linked evidence record.`,
        entityType: 'receive_session',
        entityId: receipt.id
      });
    }
  }
  return { issues, warnings, purchaseOrders, receipts };
}

function exportPayloadText(format, payload) {
  if (format === 'JSON') {
    return JSON.stringify(payload, null, 2);
  }
  const lines = ['type,source_no,status,amount,accounting_code,vendor,facility,department,posted_at'];
  for (const order of payload.purchaseOrders) {
    lines.push([
      'PURCHASE_ORDER',
      order.po_no,
      order.status,
      Number(order.line_total || 0).toFixed(2),
      order.accounting_code || '',
      order.vendor_name || '',
      order.facility_name || '',
      order.department_name || '',
      order.issued_at || order.approved_at || ''
    ].map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','));
  }
  for (const receipt of payload.receipts) {
    lines.push([
      'RECEIPT',
      receipt.id,
      receipt.status,
      Number((Number(receipt.qty_received || 0) - Number(receipt.qty_damaged || 0)) || 0).toFixed(2),
      receipt.po_no || '',
      receipt.vendor_name || '',
      receipt.facility_name || '',
      receipt.department_name || '',
      receipt.posted_at || receipt.created_at || ''
    ].map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','));
  }
  return lines.join('\n');
}

function buildExportPayload(context, batch, selection, purchaseOrders, receipts, movements) {
  const payload = {
    batch: {
      id: batch.id,
      batch_no: batch.batch_no,
      kind: batch.kind,
      format: batch.format,
      tenant_id: batch.tenant_id,
      date_from: batch.date_from || selection.dateFrom || '',
      date_to: batch.date_to || selection.dateTo || '',
      facility_id: batch.facility_id || selection.facilityId || '',
      department_id: batch.department_id || selection.departmentId || ''
    },
    tenant: {
      id: context.tenant.id,
      name: context.tenant.name,
      slug: context.tenant.slug
    },
    selection,
    purchaseOrders,
    receipts,
    movements
  };
  const text = exportPayloadText(selection.format || batch.generated_payload_format || batch.format, payload);
  const hash = createHash('sha256').update(text).digest('hex');
  return {
    payload,
    text,
    hash
  };
}

function loadExportBatchRows(context) {
  return selectAll(
    `
      SELECT
        eb.*,
        u.name AS creator_name,
        approver.name AS approver_name,
        canceller.name AS canceller_name,
        updater.name AS updater_name,
        f.name AS facility_name,
        d.name AS department_name
      FROM export_batches eb
      JOIN users u ON u.id = eb.created_by_user_id
      LEFT JOIN users approver ON approver.id = eb.approved_by_user_id
      LEFT JOIN users canceller ON canceller.id = eb.updated_by_user_id
      LEFT JOIN users updater ON updater.id = eb.updated_by_user_id
      LEFT JOIN facilities f ON f.id = eb.facility_id
      LEFT JOIN departments d ON d.id = eb.department_id
      WHERE eb.tenant_id = ?
      ORDER BY eb.created_at DESC, eb.id DESC
    `,
    [context.tenant.id]
  ).map((row) => ({
    ...row,
    open_error_count: selectOne(
      `SELECT COUNT(*) AS count FROM export_validation_errors WHERE tenant_id = ? AND export_batch_id = ? AND status = 'OPEN'`,
      [context.tenant.id, row.id]
    ).count,
    transfer_count: selectOne(
      `SELECT COUNT(*) AS count FROM export_transfers WHERE tenant_id = ? AND export_batch_id = ?`,
      [context.tenant.id, row.id]
    ).count,
    job_count: selectOne(
      `SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ? AND export_batch_id = ?`,
      [context.tenant.id, row.id]
    ).count
  }));
}

export function listExportSummary(context) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'manage_exports');
  ensureTenantUser(context, context.tenant.id);
  const statusCounts = selectAll(
    `SELECT status, COUNT(*) AS count FROM export_batches WHERE tenant_id = ? GROUP BY status ORDER BY count DESC, status`,
    [context.tenant.id]
  );
  const openErrors = selectOne(
    `SELECT COUNT(*) AS count FROM export_validation_errors WHERE tenant_id = ? AND status = 'OPEN'`,
    [context.tenant.id]
  ).count;
  const transfers = selectOne(
    `SELECT COUNT(*) AS count FROM export_transfers WHERE tenant_id = ?`,
    [context.tenant.id]
  ).count;
  const jobs = selectOne(
    `SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ?`,
    [context.tenant.id]
  ).count;
  const blockedJobs = selectOne(
    `SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ? AND status IN ('FAILED', 'BLOCKED')`,
    [context.tenant.id]
  ).count;
  const connections = selectOne(
    `SELECT COUNT(*) AS count FROM integration_connections WHERE tenant_id = ?`,
    [context.tenant.id]
  ).count;
  const sandboxConnections = selectOne(
    `SELECT COUNT(*) AS count FROM integration_connections WHERE tenant_id = ? AND auth_mode = 'SANDBOX_ONLY'`,
    [context.tenant.id]
  ).count;
  const exportableOrders = selectOne(
    `SELECT COUNT(*) AS count FROM purchase_orders WHERE tenant_id = ? AND status IN ('APPROVED', 'ISSUED')`,
    [context.tenant.id]
  ).count;
  const exportableReceipts = selectOne(
    `SELECT COUNT(*) AS count FROM receive_sessions WHERE tenant_id = ? AND status = 'POSTED'`,
    [context.tenant.id]
  ).count;
  return {
    summary: {
      batches: selectOne(`SELECT COUNT(*) AS count FROM export_batches WHERE tenant_id = ?`, [context.tenant.id]).count,
      openErrors,
      transfers,
      jobs,
      blockedJobs,
      connections,
      sandboxConnections,
      exportableOrders,
      exportableReceipts,
      readiness: Math.max(0, 100 - (openErrors * 20) - (blockedJobs * 10) + (connections > 0 ? 10 : 0))
    },
    statusCounts
  };
}

export function listExportCandidates(context, filters = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_exports');
  ensureTenantUser(context, context.tenant.id);
  const selection = normalizeExportSelection(filters);
  return {
    selection,
    purchaseOrders: loadExportPurchaseOrders(context, selection),
    receipts: loadExportReceipts(context, selection),
    movements: loadExportMovements(context, selection)
  };
}

export function createExportBatch(context, body = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'create_export_batch');
  ensureTenantUser(context, context.tenant.id);
  const selection = normalizeExportSelection(body);
  const now = nowIso();
  const batchId = newId('export');
  const batchNo = `EXP-${String(Date.now()).slice(-6)}`;
  const batch = {
    id: batchId,
    tenant_id: context.tenant.id,
    batch_no: batchNo,
    kind: 'FINANCE_SYNC',
    format: selection.format,
    status: 'DRAFT',
    record_count: 0,
    file_name: `finance_export_${batchNo}.${selection.format.toLowerCase()}`,
    created_by_user_id: context.user.id,
    created_at: now,
    generated_at: null,
    validation_summary: 'Draft export batch created.',
    date_from: selection.dateFrom || null,
    date_to: selection.dateTo || null,
    facility_id: selection.facilityId || null,
    department_id: selection.departmentId || null,
    validation_error_count: 0,
    generated_payload_hash: '',
    generated_payload_format: selection.format,
    approved_at: null,
    approved_by_user_id: null,
    dispatched_at: null,
    cancelled_at: null,
    failure_reason: '',
    updated_at: now,
    updated_by_user_id: context.user.id,
    selection_json: JSON.stringify(selection),
    generated_payload_json: '{}',
    generated_payload_text: ''
  };
  insert('export_batches', batch);
  insertAudit(context, {
    action: 'CREATE_EXPORT_BATCH',
    entityType: 'export_batch',
    entityId: batchId,
    summary: `${batchNo} created for FinanceSync`,
    after: batch
  });
  return { batch };
}

export function listExportBatches(context, filters = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_exports');
  ensureTenantUser(context, context.tenant.id);
  const selection = normalizeExportSelection(filters);
  const rows = loadExportBatchRows(context);
  const filtered = rows.filter((row) => {
    if (selection.dateFrom && String(row.created_at || '') < selection.dateFrom) return false;
    if (selection.dateTo && String(row.created_at || '') > selection.dateTo) return false;
    if (selection.facilityId && row.facility_id !== selection.facilityId) return false;
    if (selection.departmentId && row.department_id !== selection.departmentId) return false;
    return true;
  });
  return { batches: filtered };
}

export function getExportBatchDetail(context, batchId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_exports');
  ensureTenantUser(context, context.tenant.id);
  const batch = exportBatchById(context, batchId);
  const selection = asJson(batch.selection_json, {});
  const purchaseOrders = loadExportPurchaseOrders(context, selection);
  const receipts = loadExportReceipts(context, selection);
  const movements = loadExportMovements(context, selection);
  return {
    ...exportBatchDetail(context, batchId),
    purchaseOrders,
    receipts,
    movements,
    selection
  };
}

export function listExportBatchErrors(context, batchId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_export_errors');
  ensureTenantUser(context, context.tenant.id);
  exportBatchById(context, batchId);
  return { errors: exportBatchOpenErrors(context, batchId) };
}

export function validateExportBatch(context, batchId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'validate_export_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = exportBatchById(context, batchId);
    if (['CANCELLED'].includes(batch.status)) throw fail('Cancelled batches cannot be validated', 409);
    const selection = asJson(batch.selection_json, {});
    const { issues, warnings, purchaseOrders, receipts } = exportValidationIssues(context, selection);
    execute('DELETE FROM export_validation_errors WHERE tenant_id = ? AND export_batch_id = ?', [context.tenant.id, batchId]);
    for (const issue of [...issues, ...warnings]) {
      insert('export_validation_errors', {
        id: newId('export_error'),
        tenant_id: context.tenant.id,
        export_batch_id: batchId,
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
        entity_type: issue.entityType,
        entity_id: issue.entityId,
        status: 'OPEN',
        resolved_at: null,
        resolved_by_user_id: null,
        waived_at: null,
        waived_by_user_id: null,
        waiver_reason: '',
        updated_at: nowIso(),
        updated_by_user_id: context.user.id
      });
    }
    const nextStatus = issues.length ? 'FAILED_VALIDATION' : 'VALIDATED';
    const now = nowIso();
    execute(
      `UPDATE export_batches
       SET status = ?, record_count = ?, validation_summary = ?, validation_error_count = ?, file_name = ?, generated_payload_format = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [
        nextStatus,
        purchaseOrders.length + receipts.length,
        issues.length ? `${issues.length} blocking issue(s), ${warnings.length} warning(s)` : `Validated ${purchaseOrders.length + receipts.length} record(s) with ${warnings.length} warning(s)`,
        issues.length,
        batch.file_name || `finance_export_${batch.batch_no}.${batch.format.toLowerCase()}`,
        batch.format,
        now,
        context.user.id,
        context.tenant.id,
        batchId
      ]
    );
    const updated = exportBatchById(context, batchId);
    insertAudit(context, {
      action: 'VALIDATE_EXPORT_BATCH',
      entityType: 'export_batch',
      entityId: batchId,
      summary: `${batch.batch_no} validation ${issues.length ? 'blocked' : 'passed'}`,
      before: batch,
      after: updated
    });
    return { batch: updated, issues, warnings, purchaseOrders, receipts };
  });
}

export function approveExportBatch(context, batchId, body = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'approve_export_batch');
  ensureTenantUser(context, context.tenant.id);
  const note = optionalString(body.note ?? body.reason, 'note', { max: 240 });
  return transaction(() => {
    const batch = exportBatchById(context, batchId);
    const errors = exportBatchOpenErrors(context, batchId).filter((row) => row.severity === 'ERROR');
    if (errors.length) throw fail('Export batch has blocking validation errors', 409);
    if (!['DRAFT', 'FAILED_VALIDATION', 'VALIDATED'].includes(batch.status)) throw fail('Export batch cannot be approved in its current state', 409);
    const now = nowIso();
    execute(
      `UPDATE export_batches
       SET status = 'APPROVED', approved_at = ?, approved_by_user_id = ?, validation_summary = COALESCE(NULLIF(validation_summary, ''), ?), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [now, context.user.id, note || 'Approved for payload generation.', now, context.user.id, context.tenant.id, batchId]
    );
    const updated = exportBatchById(context, batchId);
    insertAudit(context, {
      action: 'APPROVE_EXPORT_BATCH',
      entityType: 'export_batch',
      entityId: batchId,
      summary: `${batch.batch_no} approved${note ? `: ${note}` : ''}`,
      before: batch,
      after: updated
    });
    return { batch: updated };
  });
}

export function generateExportBatch(context, batchId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'generate_export_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = exportBatchById(context, batchId);
    if (!['APPROVED', 'VALIDATED'].includes(batch.status)) throw fail('Export batch must be approved before generation', 409);
    const errors = exportBatchOpenErrors(context, batchId).filter((row) => row.severity === 'ERROR');
    if (errors.length) throw fail('Export batch has blocking validation errors', 409);
    const selection = asJson(batch.selection_json, {});
    const purchaseOrders = loadExportPurchaseOrders(context, selection);
    const receipts = loadExportReceipts(context, selection);
    const movements = loadExportMovements(context, selection);
    const payload = buildExportPayload(context, batch, selection, purchaseOrders, receipts, movements);
    const now = nowIso();
    execute(
      `UPDATE export_batches
       SET status = 'GENERATED', record_count = ?, generated_at = ?, generated_payload_hash = ?, generated_payload_format = ?, generated_payload_json = ?, generated_payload_text = ?, validation_summary = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [
        purchaseOrders.length + receipts.length,
        now,
        payload.hash,
        selection.format || batch.format,
        JSON.stringify(payload.payload),
        payload.text,
        `Generated ${purchaseOrders.length} purchase order(s) and ${receipts.length} receipt(s).`,
        now,
        context.user.id,
        context.tenant.id,
        batchId
      ]
    );
    const updated = exportBatchById(context, batchId);
    insertAudit(context, {
      action: 'GENERATE_EXPORT_BATCH',
      entityType: 'export_batch',
      entityId: batchId,
      summary: `${batch.batch_no} payload generated`,
      before: batch,
      after: updated
    });
    return { batch: updated, payload: payload.payload, text: payload.text, hash: payload.hash };
  });
}

export function dispatchExportBatch(context, batchId, body = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'dispatch_export_batch');
  ensureTenantUser(context, context.tenant.id);
  const destination = optionalString(body.destination ?? body.providerName, 'destination', { max: 160 }) || 'ERP Integration';
  const requestedConnectionId = optionalString(body.connectionId ?? body.connection_id, 'connectionId', { max: 80 });
  return transaction(() => {
    const batch = exportBatchById(context, batchId);
    if (batch.status !== 'GENERATED') throw fail('Export batch must be generated before dispatch', 409);
    const openErrors = exportBatchOpenErrors(context, batchId).filter((row) => row.severity === 'ERROR');
    if (openErrors.length) throw fail('Export batch still has blocking validation errors', 409);
    const connection = requestedConnectionId
      ? selectOne('SELECT * FROM integration_connections WHERE tenant_id = ? AND id = ?', [context.tenant.id, requestedConnectionId])
      : selectOne('SELECT * FROM integration_connections WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1', [context.tenant.id]);
    const now = nowIso();
    let dispatchMode = 'NOT_CONFIGURED';
    let transferStatus = 'FAILED';
    let jobStatus = 'BLOCKED';
    let failureReason = 'No ERP integration connection is configured.';
    if (connection) {
      dispatchMode = connection.auth_mode === 'SANDBOX_ONLY' ? 'SANDBOX_ONLY' : 'CONFIGURED';
      transferStatus = 'QUEUED';
      jobStatus = 'QUEUED';
      failureReason = connection.auth_mode === 'SANDBOX_ONLY'
        ? 'Sandbox-only connection recorded locally. No external ERP acknowledgement is claimed.'
        : '';
    }
    const job = {
      id: newId('job'),
      tenant_id: context.tenant.id,
      connection_id: connection?.id || null,
      export_batch_id: batchId,
      integration_key: connection?.provider_name || destination,
      job_type: 'EXPORT_DISPATCH',
      direction: 'OUTBOUND',
      status: jobStatus,
      payload_hash: batch.generated_payload_hash || createHash('sha256').update(String(batch.generated_payload_text || '')).digest('hex'),
      retry_count: 0,
      attempt_count: 0,
      last_error: failureReason,
      queued_at: now,
      started_at: null,
      finished_at: null,
      created_at: now,
      created_by_user_id: context.user.id,
      updated_at: now,
      updated_by_user_id: context.user.id
    };
    insert('integration_jobs', job);
    const transfer = {
      id: newId('transfer'),
      tenant_id: context.tenant.id,
      export_batch_id: batchId,
      destination,
      status: transferStatus,
      sent_at: null,
      error_message: failureReason,
      connection_id: connection?.id || null,
      job_id: job.id,
      dispatch_mode: dispatchMode,
      attempted_at: now,
      updated_at: now,
      updated_by_user_id: context.user.id
    };
    insert('export_transfers', transfer);
    execute(
      `UPDATE export_batches
       SET status = ?, dispatched_at = COALESCE(dispatched_at, ?), failure_reason = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [connection ? 'DISPATCH_QUEUED' : 'DISPATCH_FAILED', now, failureReason, now, context.user.id, context.tenant.id, batchId]
    );
    const updated = exportBatchById(context, batchId);
    insertAudit(context, {
      action: 'DISPATCH_EXPORT_BATCH',
      entityType: 'export_batch',
      entityId: batchId,
      summary: `${batch.batch_no} dispatch ${connection ? 'queued' : 'blocked'}${failureReason ? `: ${failureReason}` : ''}`,
      before: batch,
      after: updated
    });
    return { batch: updated, transfer, job };
  });
}

export function cancelExportBatch(context, batchId, body = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'cancel_export_batch');
  ensureTenantUser(context, context.tenant.id);
  const reason = optionalString(body.reason ?? body.note, 'reason', { max: 240 }) || 'Cancelled by operator';
  return transaction(() => {
    const batch = exportBatchById(context, batchId);
    if (['CANCELLED'].includes(batch.status)) throw fail('Export batch is already cancelled', 409);
    const now = nowIso();
    execute(
      `UPDATE export_batches
       SET status = 'CANCELLED', cancelled_at = ?, failure_reason = ?, updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [now, reason, now, context.user.id, context.tenant.id, batchId]
    );
    execute(
      `UPDATE export_transfers
       SET status = 'CANCELLED', error_message = COALESCE(NULLIF(error_message, ''), ?), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND export_batch_id = ? AND status IN ('QUEUED', 'FAILED')`,
      [reason, now, context.user.id, context.tenant.id, batchId]
    );
    execute(
      `UPDATE integration_jobs
       SET status = 'CANCELLED', last_error = COALESCE(NULLIF(last_error, ''), ?), finished_at = COALESCE(finished_at, ?), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND export_batch_id = ? AND status IN ('QUEUED', 'BLOCKED', 'RETRYING')`,
      [reason, now, now, context.user.id, context.tenant.id, batchId]
    );
    const updated = exportBatchById(context, batchId);
    insertAudit(context, {
      action: 'CANCEL_EXPORT_BATCH',
      entityType: 'export_batch',
      entityId: batchId,
      summary: `${batch.batch_no} cancelled: ${reason}`,
      before: batch,
      after: updated
    });
    return { batch: updated };
  });
}

export function listIntegrationSummary(context) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_integrations');
  ensureTenantUser(context, context.tenant.id);
  const summary = {
    connections: selectOne(`SELECT COUNT(*) AS count FROM integration_connections WHERE tenant_id = ?`, [context.tenant.id]).count,
    configured: selectOne(`SELECT COUNT(*) AS count FROM integration_connections WHERE tenant_id = ? AND status = 'CONFIGURED'`, [context.tenant.id]).count,
    sandboxOnly: selectOne(`SELECT COUNT(*) AS count FROM integration_connections WHERE tenant_id = ? AND auth_mode = 'SANDBOX_ONLY'`, [context.tenant.id]).count,
    jobs: selectOne(`SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ?`, [context.tenant.id]).count,
    queuedJobs: selectOne(`SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ? AND status = 'QUEUED'`, [context.tenant.id]).count,
    failedJobs: selectOne(`SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ? AND status = 'FAILED'`, [context.tenant.id]).count,
    blockedJobs: selectOne(`SELECT COUNT(*) AS count FROM integration_jobs WHERE tenant_id = ? AND status = 'BLOCKED'`, [context.tenant.id]).count
  };
  return { summary };
}

export function listIntegrationConnections(context) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_integrations');
  ensureTenantUser(context, context.tenant.id);
  return {
    connections: selectAll(
      `
        SELECT
          ic.id,
          ic.tenant_id,
          ic.connection_type,
          ic.provider_name,
          ic.status,
          ic.endpoint_label,
          ic.auth_mode,
          ic.last_tested_at,
          ic.last_success_at,
          ic.last_error,
          ic.created_at,
          ic.created_by_user_id,
          ic.updated_at,
          ic.updated_by_user_id,
          u.name AS creator_name,
          updater.name AS updater_name,
          CASE WHEN COALESCE(ic.secret_ref, '') <> '' THEN 1 ELSE 0 END AS has_secret
        FROM integration_connections ic
        LEFT JOIN users u ON u.id = ic.created_by_user_id
        LEFT JOIN users updater ON updater.id = ic.updated_by_user_id
        WHERE ic.tenant_id = ?
        ORDER BY ic.created_at DESC, ic.id DESC
      `,
      [context.tenant.id]
    )
  };
}

export function createIntegrationConnection(context, body = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'manage_integrations');
  ensureTenantUser(context, context.tenant.id);
  const providerName = requireString(body.providerName ?? body.provider_name, 'providerName', { max: 120 });
  const connectionType = requireEnum((body.connectionType ?? body.connection_type ?? 'ERP').toString().toUpperCase(), 'connectionType', ['ERP', 'FINANCE', 'ACCOUNTING', 'WMS', 'CUSTOM']);
  const authMode = requireEnum((body.authMode ?? body.auth_mode ?? 'SANDBOX_ONLY').toString().toUpperCase(), 'authMode', ['NONE', 'SANDBOX_ONLY', 'BASIC', 'OAUTH', 'SAML']);
  const endpointLabel = optionalString(body.endpointLabel ?? body.endpoint_label, 'endpointLabel', { max: 120 }) || providerName;
  const secretRef = optionalString(body.secretRef ?? body.secret_ref, 'secretRef', { max: 160 });
  const now = nowIso();
  const connection = {
    id: newId('integration'),
    tenant_id: context.tenant.id,
    connection_type: connectionType,
    provider_name: providerName,
    status: 'CONFIGURED',
    endpoint_label: endpointLabel,
    auth_mode: authMode,
    secret_ref: secretRef || `secret://${context.tenant.slug}/${providerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    last_tested_at: now,
    last_success_at: authMode === 'NONE' ? null : now,
    last_error: authMode === 'NONE' ? 'Connection requires credential configuration.' : '',
    created_at: now,
    created_by_user_id: context.user.id,
    updated_at: now,
    updated_by_user_id: context.user.id
  };
  insert('integration_connections', connection);
  insertAudit(context, {
    action: 'CREATE_INTEGRATION_CONNECTION',
    entityType: 'integration_connection',
    entityId: connection.id,
    summary: `${providerName} connection created`,
    after: connection
  });
  const { secret_ref, ...safeConnection } = connection;
  return { connection: { ...safeConnection, has_secret: Boolean(secret_ref) } };
}

export function getIntegrationConnectionDetail(context, connectionId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_integrations');
  ensureTenantUser(context, context.tenant.id);
  const connection = selectOne(
    `
      SELECT
        ic.*,
        u.name AS creator_name,
        updater.name AS updater_name,
        CASE WHEN COALESCE(ic.secret_ref, '') <> '' THEN 1 ELSE 0 END AS has_secret
      FROM integration_connections ic
      LEFT JOIN users u ON u.id = ic.created_by_user_id
      LEFT JOIN users updater ON updater.id = ic.updated_by_user_id
      WHERE ic.tenant_id = ? AND ic.id = ?
    `,
    [context.tenant.id, connectionId]
  );
  if (!connection) throw fail('Integration connection not found', 404);
  const jobs = selectAll('SELECT * FROM integration_jobs WHERE tenant_id = ? AND connection_id = ? ORDER BY created_at DESC', [context.tenant.id, connectionId]);
  const audit = listAuditLogs(context, { entityType: 'integration_connection', entityId: connectionId, limit: 50 });
  const { secret_ref, ...safeConnection } = connection;
  return { connection: { ...safeConnection, has_secret: Boolean(secret_ref) }, jobs, audit };
}

export function listIntegrationJobs(context, filters = {}) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_integrations');
  ensureTenantUser(context, context.tenant.id);
  const selection = normalizeExportSelection(filters);
  const params = [context.tenant.id];
  if (selection.dateFrom) params.push(selection.dateFrom);
  if (selection.dateTo) params.push(selection.dateTo);
  return {
    jobs: selectAll(
      `
        SELECT
          ij.*,
          ic.provider_name,
          ic.status AS connection_status,
          ic.auth_mode,
          ic.endpoint_label,
          eb.batch_no,
          eb.status AS batch_status,
          u.name AS creator_name
        FROM integration_jobs ij
        LEFT JOIN integration_connections ic ON ic.id = ij.connection_id
        LEFT JOIN export_batches eb ON eb.id = ij.export_batch_id
        LEFT JOIN users u ON u.id = ij.created_by_user_id
        WHERE ij.tenant_id = ?${selection.dateFrom ? ' AND ij.created_at >= ?' : ''}${selection.dateTo ? ' AND ij.created_at <= ?' : ''}
        ORDER BY ij.created_at DESC, ij.id DESC
      `,
      params
    )
  };
}

export function getIntegrationJobDetail(context, jobId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_integrations');
  ensureTenantUser(context, context.tenant.id);
  const job = selectOne(
    `
      SELECT
        ij.*,
        ic.provider_name,
        ic.status AS connection_status,
        ic.auth_mode,
        ic.endpoint_label,
        eb.batch_no,
        eb.status AS batch_status,
        u.name AS creator_name
      FROM integration_jobs ij
      LEFT JOIN integration_connections ic ON ic.id = ij.connection_id
      LEFT JOIN export_batches eb ON eb.id = ij.export_batch_id
      LEFT JOIN users u ON u.id = ij.created_by_user_id
      WHERE ij.tenant_id = ? AND ij.id = ?
    `,
    [context.tenant.id, jobId]
  );
  if (!job) throw fail('Integration job not found', 404);
  const audit = listAuditLogs(context, { entityType: 'integration_job', entityId: jobId, limit: 50 });
  return { job, audit };
}

export function retryIntegrationJob(context, jobId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'retry_integration_job');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const job = selectOne('SELECT * FROM integration_jobs WHERE tenant_id = ? AND id = ?', [context.tenant.id, jobId]);
    if (!job) throw fail('Integration job not found', 404);
    if (!['FAILED', 'BLOCKED', 'CANCELLED', 'QUEUED'].includes(job.status)) throw fail('Integration job cannot be retried in its current state', 409);
    const now = nowIso();
    execute(
      `UPDATE integration_jobs
       SET status = 'RETRYING', retry_count = retry_count + 1, attempt_count = attempt_count + 1, last_error = '', started_at = COALESCE(started_at, ?), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [now, now, context.user.id, context.tenant.id, jobId]
    );
    const updated = selectOne('SELECT * FROM integration_jobs WHERE tenant_id = ? AND id = ?', [context.tenant.id, jobId]);
    insertAudit(context, {
      action: 'RETRY_INTEGRATION_JOB',
      entityType: 'integration_job',
      entityId: jobId,
      summary: `${job.integration_key} retry queued`,
      before: job,
      after: updated
    });
    return { job: updated };
  });
}

export function cancelIntegrationJob(context, jobId) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'cancel_integration_job');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const job = selectOne('SELECT * FROM integration_jobs WHERE tenant_id = ? AND id = ?', [context.tenant.id, jobId]);
    if (!job) throw fail('Integration job not found', 404);
    if (['DISPATCHED', 'COMPLETED'].includes(job.status)) throw fail('Integration job cannot be cancelled in its current state', 409);
    const now = nowIso();
    execute(
      `UPDATE integration_jobs
       SET status = 'CANCELLED', last_error = COALESCE(NULLIF(last_error, ''), 'Cancelled by operator'), finished_at = COALESCE(finished_at, ?), updated_at = ?, updated_by_user_id = ?
       WHERE tenant_id = ? AND id = ?`,
      [now, now, context.user.id, context.tenant.id, jobId]
    );
    const updated = selectOne('SELECT * FROM integration_jobs WHERE tenant_id = ? AND id = ?', [context.tenant.id, jobId]);
    insertAudit(context, {
      action: 'CANCEL_INTEGRATION_JOB',
      entityType: 'integration_job',
      entityId: jobId,
      summary: `${job.integration_key} cancelled`,
      before: job,
      after: updated
    });
    return { job: updated };
  });
}

export function listExports(context) {
  requireFeature(context, 'finance_sync_export_hub');
  requireCapability(context, 'view_exports');
  ensureTenantUser(context, context.tenant.id);
  return {
    summary: listExportSummary(context).summary,
    batches: listExportBatches(context).batches,
    candidates: listExportCandidates(context),
    errors: selectAll(
      `SELECT ee.*, eb.batch_no
       FROM export_validation_errors ee
       LEFT JOIN export_batches eb ON eb.id = ee.export_batch_id
       WHERE ee.tenant_id = ? AND ee.status = 'OPEN'
       ORDER BY ee.created_at DESC`,
      [context.tenant.id]
    ),
    transfers: selectAll(
      `
        SELECT et.*, eb.batch_no, ij.status AS job_status, COALESCE(et.attempted_at, et.queued_at) AS created_at
        FROM export_transfers et
        LEFT JOIN export_batches eb ON eb.id = et.export_batch_id
        LEFT JOIN integration_jobs ij ON ij.id = et.job_id
        WHERE et.tenant_id = ?
        ORDER BY COALESCE(et.attempted_at, et.queued_at) DESC, et.id DESC
      `,
      [context.tenant.id]
    ),
    connections: listIntegrationConnections(context).connections,
    jobs: listIntegrationJobs(context).jobs
  };
}

export function validateFinanceExport(context) {
  const batch = createExportBatch(context, { format: 'CSV' }).batch;
  return validateExportBatch(context, batch.id);
}

export function generateFinanceExport(context) {
  const batch = createExportBatch(context, { format: 'CSV' }).batch;
  validateExportBatch(context, batch.id);
  approveExportBatch(context, batch.id, { note: 'Auto-approved by compatibility wrapper' });
  return generateExportBatch(context, batch.id);
}

export function dispatchExport(context, exportBatchId, body = {}) {
  return dispatchExportBatch(context, exportBatchId, body);
}

export function listSyncConflicts(context) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'review_sync');
  ensureTenantUser(context, context.tenant.id);
  return selectAll(
    `
      SELECT sc.*, sb.id AS batch_no, st.task_index, st.task_type, st.entity_id AS entity_reference
      FROM sync_conflicts sc
      JOIN sync_batches sb ON sb.id = sc.sync_batch_id
      JOIN sync_tasks st ON st.id = sc.task_id
      WHERE sc.tenant_id = ?
      ORDER BY sc.created_at DESC
    `,
    [context.tenant.id]
  );
}

export function resolveSyncConflict(context, conflictId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'review_sync');
  const resolutionAction = requireEnum(body.resolutionAction, 'resolutionAction', ['RESOLVE', 'IGNORE']);
  const resolutionNote = requireString(body.resolutionNote ?? 'Reviewed by supervisor', 'resolutionNote', { max: 240 });
  return transaction(() => {
    const conflict = selectOne('SELECT * FROM sync_conflicts WHERE tenant_id = ? AND id = ?', [context.tenant.id, conflictId]);
    if (!conflict) throw fail('Sync conflict not found', 404);
    if (conflict.status !== 'PENDING') throw fail('Sync conflict already resolved', 409);
    const nextStatus = resolutionAction === 'RESOLVE' ? 'RESOLVED' : 'IGNORED';
    execute(
      'UPDATE sync_conflicts SET status = ?, resolution_note = ?, resolved_by_user_id = ?, resolved_at = ? WHERE id = ?',
      [nextStatus, resolutionNote, context.user.id, nowIso(), conflictId]
    );
    insertAudit(context, {
      action: resolutionAction === 'RESOLVE' ? 'RESOLVE_SYNC_CONFLICT' : 'IGNORE_SYNC_CONFLICT',
      entityType: 'sync_conflict',
      entityId: conflictId,
      summary: `${conflict.conflict_type} ${nextStatus.toLowerCase()} with note: ${resolutionNote}`,
      before: conflict,
      after: { ...conflict, status: nextStatus, resolution_note: resolutionNote, resolved_by_user_id: context.user.id }
    });
    return selectOne('SELECT * FROM sync_conflicts WHERE tenant_id = ? AND id = ?', [context.tenant.id, conflictId]);
  });
}

function evidenceContentChecksum(contentBase64) {
  const payload = String(contentBase64 || '').trim();
  if (!payload) return '';
  const raw = payload.includes('base64,') ? payload.split('base64,')[1] : payload;
  return createHash('sha256').update(Buffer.from(raw, 'base64')).digest('hex');
}

function evidenceEntityExists(context, entityType, entityId) {
  const map = {
    document: 'SELECT id FROM documents WHERE tenant_id = ? AND id = ?',
    item: 'SELECT id FROM items WHERE tenant_id = ? AND id = ?',
    stock_adjustment: 'SELECT id FROM stock_adjustments WHERE tenant_id = ? AND id = ?',
    stock_movement: 'SELECT id FROM stock_movements WHERE tenant_id = ? AND id = ?',
    internal_request: 'SELECT id FROM internal_requests WHERE tenant_id = ? AND id = ?',
    request_line: 'SELECT id FROM request_lines WHERE tenant_id = ? AND id = ?',
    warehouse_task: 'SELECT id FROM warehouse_tasks WHERE tenant_id = ? AND id = ?',
    warehouse_task_line: 'SELECT id FROM warehouse_task_lines WHERE tenant_id = ? AND id = ?',
    vendor: 'SELECT id FROM vendors WHERE tenant_id = ? AND id = ?',
    purchase_request: 'SELECT id FROM purchase_requests WHERE tenant_id = ? AND id = ?',
    purchase_request_line: 'SELECT id FROM purchase_request_lines WHERE tenant_id = ? AND id = ?',
    purchase_order: 'SELECT id FROM purchase_orders WHERE tenant_id = ? AND id = ?',
    purchase_order_line: 'SELECT id FROM purchase_order_lines WHERE tenant_id = ? AND id = ?',
    receive_session: 'SELECT id FROM receive_sessions WHERE tenant_id = ? AND id = ?',
    receive_session_line: 'SELECT id FROM receive_session_lines WHERE tenant_id = ? AND id = ?',
    export_batch: 'SELECT id FROM export_batches WHERE tenant_id = ? AND id = ?',
    export_transfer: 'SELECT id FROM export_transfers WHERE tenant_id = ? AND id = ?',
    integration_connection: 'SELECT id FROM integration_connections WHERE tenant_id = ? AND id = ?',
    integration_job: 'SELECT id FROM integration_jobs WHERE tenant_id = ? AND id = ?'
  };
  const sql = map[entityType];
  if (!sql) throw fail('Unsupported evidence entity type', 400);
  const record = selectOne(sql, [context.tenant.id, entityId]);
  if (!record) throw fail('Evidence entity not found for tenant', 404);
  return record;
}

function listEvidenceLinksForEntity(context, entityType, entityId) {
  return selectAll(
    `
      SELECT el.*, d.file_name, d.doc_type, d.visibility, d.evidence_state, d.checksum, d.checksum_algorithm, d.created_at AS evidence_created_at, u.name AS creator_name
      FROM evidence_links el
      JOIN documents d ON d.id = el.document_id
      LEFT JOIN users u ON u.id = el.created_by_user_id
      WHERE el.tenant_id = ? AND el.entity_type = ? AND el.entity_id = ?
      ORDER BY el.created_at DESC
    `,
    [context.tenant.id, entityType, entityId]
  );
}

function normalizeAuditFilters(filters = {}) {
  return {
    entityType: String(filters.entityType || '').trim(),
    entityId: String(filters.entityId || '').trim(),
    action: String(filters.action || '').trim(),
    module: String(filters.module || '').trim(),
    limit: Math.min(Math.max(Number(filters.limit || 200) || 200, 1), 500)
  };
}

function auditFilterWhere(filters) {
  const clauses = [];
  const params = [];
  if (filters.entityType) {
    clauses.push('a.entity_type = ?');
    params.push(filters.entityType);
  }
  if (filters.entityId) {
    clauses.push('a.entity_id = ?');
    params.push(filters.entityId);
  }
  if (filters.action) {
    clauses.push('a.action = ?');
    params.push(filters.action);
  }
  if (filters.module) {
    const moduleMap = {
      command_center: ['item', 'inventory', 'purchase_request', 'purchase_order', 'receive_session', 'warehouse_task', 'document'],
      documents_evidence_vault: ['document', 'evidence_link'],
      audit_black_box: ['audit_log', 'api_route'],
      procurement_purchasing: ['vendor', 'purchase_request', 'purchase_request_line', 'purchase_order', 'purchase_order_line'],
      finance_sync_export_hub: ['export_batch', 'export_transfer', 'integration_connection', 'integration_job'],
      receiving_core: ['receive_session', 'receive_session_line', 'purchase_order', 'purchase_order_line', 'stock_movement'],
      warehouse_workflows: ['warehouse_task', 'warehouse_task_line', 'stock_movement', 'request'],
      inventory_control: ['item', 'stock_adjustment', 'stock_movement', 'bin', 'stock_balance']
    };
    const entities = moduleMap[filters.module] || [];
    if (entities.length) {
      clauses.push(`a.entity_type IN (${entities.map(() => '?').join(',')})`);
      params.push(...entities);
    }
  }
  return { sql: clauses.length ? ` AND ${clauses.join(' AND ')}` : '', params };
}

export function uploadDocument(context, body) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'upload_evidence');
  ensureTenantUser(context, context.tenant.id);
  const fileName = requireString(body.fileName, 'fileName', { max: 160 });
  const docType = requireString(body.docType, 'docType', { max: 80 });
  const visibility = requireString(body.visibility, 'visibility', { max: 80 });
  const entityType = requireString(body.entityType, 'entityType', { max: 80 });
  const entityId = requireString(body.entityId, 'entityId', { max: 80 });
  const contentBase64 = String(body.contentBase64 || '').trim();
  const mimeType = String(body.mimeType || 'application/octet-stream');
  const checksum = evidenceContentChecksum(contentBase64);
  const metadataJson = JSON.stringify(body.metadata || body.metadataJson || {});
  const storageMode = evidenceStorageMode();

  const id = newId('doc');
  const storedName = `${id}_${safeFileName(fileName)}`;
  const payload = contentBase64.includes('base64,') ? contentBase64.split('base64,')[1] : contentBase64;
  const stored = writeEvidenceBinary({
    storageMode,
    storageKey: `tenant/${context.tenant.slug}/${id}`,
    storedFileName: storedName,
    contentBase64: payload || (body.storeFile !== false ? Buffer.from(`Uploaded ${fileName} for ${entityType} ${entityId}\nMIME: ${mimeType}\n`, 'utf8').toString('base64') : ''),
    fileName,
    mimeType
  });

  return transaction(() => {
    evidenceEntityExists(context, entityType, entityId);
    const document = {
      id,
      tenant_id: context.tenant.id,
      entity_type: entityType,
      entity_id: entityId,
      file_name: fileName,
      doc_type: docType,
      visibility,
      evidence_state: 'PENDING',
      checksum,
      checksum_algorithm: checksum ? 'SHA-256' : '',
      stored_file_name: stored.storageMode === 'filesystem' ? stored.storedFileName : '',
      storage_mode: storageMode,
      storage_key: stored.storageMode === 'filesystem' ? stored.storedFileName : stored.storageKey,
      mime_type: mimeType,
      metadata_json: metadataJson,
      linked_at: null,
      verified_at: null,
      verified_by_user_id: null,
      rejected_at: null,
      rejected_by_user_id: null,
      archived_at: null,
      archived_by_user_id: null,
      uploaded_by_user_id: context.user.id,
      created_at: nowIso(),
      updated_at: nowIso()
    };
    insert('documents', document);
    insert('chain_of_custody_events', {
      id: newId('custody'),
      tenant_id: context.tenant.id,
      evidence_document_id: id,
      actor_user_id: context.user.id,
      action: 'CREATED',
      note: `Evidence record created for ${entityType} ${entityId}`,
      created_at: nowIso()
    });
    insertAudit(context, {
      action: 'CREATE_EVIDENCE',
      entityType: 'document',
      entityId: document.id,
      summary: `${fileName} captured for ${entityType} ${entityId}`,
      after: document
    });
    return { evidence: document, storedFileName: stored.storageMode === 'filesystem' ? stored.storedFileName : null, accessUrl: buildEvidenceAccessUrl(context, id) };
  });
}

function loadEvidenceRecord(context, evidenceId) {
  requireFeature(context, 'documents_evidence_vault');
  ensureTenantUser(context, context.tenant.id);
  const evidence = selectOne('SELECT * FROM documents WHERE tenant_id = ? AND id = ?', [context.tenant.id, evidenceId]);
  if (!evidence) throw fail('Evidence not found', 404);
  return evidence;
}

function evidenceDetail(context, evidenceId) {
  const evidence = loadEvidenceRecord(context, evidenceId);
  const links = listEvidenceLinksForEntity(context, evidence.entity_type, evidence.entity_id);
  const audit = capabilitySet(context.user.role_key).has('view_audit')
    ? listAuditLogs(context, { entityType: 'document', entityId: evidence.id, limit: 50 })
    : [];
  return {
    evidence,
    links,
    accessUrl: buildEvidenceAccessUrl(context, evidence.id),
    audit
  };
}

export function listEvidence(context, filters = {}) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'view_evidence');
  ensureTenantUser(context, context.tenant.id);
  const normalized = normalizeAuditFilters(filters);
  const where = [];
  const params = [context.tenant.id];
  if (normalized.entityType) {
    where.push('d.entity_type = ?');
    params.push(normalized.entityType);
  }
  if (normalized.entityId) {
    where.push('d.entity_id = ?');
    params.push(normalized.entityId);
  }
  if (normalized.action) {
    where.push('EXISTS (SELECT 1 FROM audit_logs a WHERE a.tenant_id = d.tenant_id AND a.entity_type = ? AND a.entity_id = d.id AND a.action = ?)');
    params.push('document', normalized.action);
  }
  return selectAll(
    `
      SELECT d.*, u.name AS uploaded_by_name,
        COUNT(DISTINCT el.id) AS link_count
      FROM documents d
      JOIN users u ON u.id = d.uploaded_by_user_id
      LEFT JOIN evidence_links el ON el.document_id = d.id AND el.tenant_id = d.tenant_id
      WHERE d.tenant_id = ? ${where.length ? `AND ${where.join(' AND ')}` : ''}
      GROUP BY d.id
      ORDER BY d.created_at DESC
      LIMIT ${normalized.limit}
    `,
    params
  ).map((row) => ({ ...row, access_url: buildEvidenceAccessUrl(context, row.id) }));
}

export const listDocuments = listEvidence;

export function getEvidenceDetail(context, evidenceId) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'view_evidence');
  return evidenceDetail(context, evidenceId);
}

export function downloadEvidenceContent(context, evidenceId, token = '') {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'view_evidence');
  const evidence = loadEvidenceRecord(context, evidenceId);
  const signed = verifyEvidenceAccessToken(token, context.tenant.id, evidenceId);
  if (!signed.valid) throw fail(`Evidence access denied: ${signed.reason}`, 403);
  const storageMode = evidenceStorageMode();
  let raw;
  try {
    raw = readEvidenceBinary({
      storageMode,
      storageKey: evidence.storage_key,
      storedFileName: evidence.stored_file_name,
      fileName: evidence.file_name
    }).content;
  } catch (error) {
    if (error.code === 'OBJECT_NOT_FOUND') throw error;
    if (error.code === 'CONFIGURATION_REQUIRED' && storageMode === 's3') throw error;
    raw = Buffer.from(`Evidence placeholder for ${evidence.file_name}\nStorage mode: ${evidence.storage_mode}\n`, 'utf8');
  }
  insertAudit(context, {
    action: 'VIEW_EVIDENCE_BINARY',
    entityType: 'document',
    entityId: evidenceId,
    summary: `Viewed evidence binary for ${evidence.file_name}`,
    before: evidence,
    after: evidence
  });
  return {
    evidence,
    content: raw,
    mimeType: evidence.mime_type || 'application/octet-stream',
    fileName: evidence.file_name
  };
}

export function linkEvidence(context, evidenceId, body = {}) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'manage_evidence');
  const evidence = loadEvidenceRecord(context, evidenceId);
  const entityType = requireString(body.entityType, 'entityType', { max: 80 });
  const entityId = requireString(body.entityId, 'entityId', { max: 80 });
  const linkType = optionalString(body.linkType, 'linkType', { max: 80 }) || 'EVIDENCE_LINK';
  return transaction(() => {
    evidenceEntityExists(context, entityType, entityId);
    const existing = selectOne('SELECT * FROM evidence_links WHERE tenant_id = ? AND document_id = ? AND entity_type = ? AND entity_id = ?', [context.tenant.id, evidenceId, entityType, entityId]);
    if (!existing) {
      insert('evidence_links', {
        id: newId('evidence_link'),
        tenant_id: context.tenant.id,
        document_id: evidenceId,
        entity_type: entityType,
        entity_id: entityId,
        link_type: linkType,
        created_at: nowIso(),
        created_by_user_id: context.user.id
      });
    }
    execute(
      'UPDATE documents SET evidence_state = ?, linked_at = COALESCE(linked_at, ?), updated_at = ? WHERE tenant_id = ? AND id = ?',
      ['LINKED', nowIso(), nowIso(), context.tenant.id, evidenceId]
    );
    insert('chain_of_custody_events', {
      id: newId('custody'),
      tenant_id: context.tenant.id,
      evidence_document_id: evidenceId,
      actor_user_id: context.user.id,
      action: 'LINKED',
      note: `${entityType} ${entityId}`,
      created_at: nowIso()
    });
    insertAudit(context, {
      action: 'LINK_EVIDENCE',
      entityType: 'document',
      entityId: evidenceId,
      summary: `${evidence.file_name} linked to ${entityType} ${entityId}`,
      before: evidence,
      after: { ...evidence, evidence_state: 'LINKED', linked_at: nowIso() }
    });
    return evidenceDetail(context, evidenceId);
  });
}

export function verifyEvidence(context, evidenceId, body = {}) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'verify_evidence');
  const decision = requireEnum((body.decision || body.status || 'VERIFIED').toUpperCase(), 'decision', ['VERIFIED', 'REJECTED']);
  const note = optionalString(body.note ?? body.reason, 'note', { max: 240 });
  return transaction(() => {
    const evidence = loadEvidenceRecord(context, evidenceId);
    const now = nowIso();
    const next = {
      ...evidence,
      evidence_state: decision,
      verified_at: decision === 'VERIFIED' ? now : evidence.verified_at,
      verified_by_user_id: decision === 'VERIFIED' ? context.user.id : evidence.verified_by_user_id,
      rejected_at: decision === 'REJECTED' ? now : evidence.rejected_at,
      rejected_by_user_id: decision === 'REJECTED' ? context.user.id : evidence.rejected_by_user_id,
      updated_at: now
    };
    execute(
      `UPDATE documents
       SET evidence_state = ?, verified_at = COALESCE(?, verified_at), verified_by_user_id = COALESCE(?, verified_by_user_id), rejected_at = COALESCE(?, rejected_at), rejected_by_user_id = COALESCE(?, rejected_by_user_id), updated_at = ?
       WHERE tenant_id = ? AND id = ?`,
      [decision, decision === 'VERIFIED' ? now : null, decision === 'VERIFIED' ? context.user.id : null, decision === 'REJECTED' ? now : null, decision === 'REJECTED' ? context.user.id : null, now, context.tenant.id, evidenceId]
    );
    insert('chain_of_custody_events', {
      id: newId('custody'),
      tenant_id: context.tenant.id,
      evidence_document_id: evidenceId,
      actor_user_id: context.user.id,
      action: decision,
      note: note || '',
      created_at: now
    });
    insertAudit(context, {
      action: decision === 'VERIFIED' ? 'VERIFY_EVIDENCE' : 'REJECT_EVIDENCE',
      entityType: 'document',
      entityId: evidenceId,
      summary: `${evidence.file_name} ${decision.toLowerCase()}${note ? `: ${note}` : ''}`,
      before: evidence,
      after: next
    });
    return evidenceDetail(context, evidenceId);
  });
}

export function archiveEvidence(context, evidenceId, body = {}) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'archive_evidence');
  const note = optionalString(body.note ?? body.reason, 'note', { max: 240 });
  return transaction(() => {
    const evidence = loadEvidenceRecord(context, evidenceId);
    const now = nowIso();
    const next = { ...evidence, evidence_state: 'ARCHIVED', archived_at: now, archived_by_user_id: context.user.id, updated_at: now };
    execute(
      'UPDATE documents SET evidence_state = ?, archived_at = ?, archived_by_user_id = ?, updated_at = ? WHERE tenant_id = ? AND id = ?',
      ['ARCHIVED', now, context.user.id, now, context.tenant.id, evidenceId]
    );
    insert('chain_of_custody_events', {
      id: newId('custody'),
      tenant_id: context.tenant.id,
      evidence_document_id: evidenceId,
      actor_user_id: context.user.id,
      action: 'ARCHIVED',
      note: note || '',
      created_at: now
    });
    insertAudit(context, {
      action: 'ARCHIVE_EVIDENCE',
      entityType: 'document',
      entityId: evidenceId,
      summary: `${evidence.file_name} archived${note ? `: ${note}` : ''}`,
      before: evidence,
      after: next
    });
    return evidenceDetail(context, evidenceId);
  });
}

export function listEvidenceLinks(context, entityType, entityId) {
  requireFeature(context, 'documents_evidence_vault');
  requireCapability(context, 'view_evidence');
  ensureTenantUser(context, context.tenant.id);
  evidenceEntityExists(context, entityType, entityId);
  return listEvidenceLinksForEntity(context, entityType, entityId);
}

function auditFiltersSql(context, filters = {}) {
  const normalized = normalizeAuditFilters(filters);
  const where = ['a.tenant_id = ?'];
  const params = [context.tenant.id];
  if (normalized.entityType) {
    where.push('a.entity_type = ?');
    params.push(normalized.entityType);
  }
  if (normalized.entityId) {
    where.push('a.entity_id = ?');
    params.push(normalized.entityId);
  }
  if (normalized.action) {
    where.push('a.action = ?');
    params.push(normalized.action);
  }
  const moduleWhere = auditFilterWhere(normalized);
  if (moduleWhere.sql) {
    where.push(moduleWhere.sql.replace(/^ AND /, ''));
    params.push(...moduleWhere.params);
  }
  return { where: where.join(' AND '), params, limit: normalized.limit };
}

export function listAuditLogs(context, filters = {}) {
  requireFeature(context, 'audit_black_box');
  requireCapability(context, 'view_audit');
  ensureTenantUser(context, context.tenant.id);
  const scoped = auditFiltersSql(context, filters);
  return selectAll(
    `
      SELECT a.*, u.name AS actor_name
      FROM audit_logs a
      JOIN users u ON u.id = a.actor_user_id
      WHERE ${scoped.where}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ${scoped.limit}
    `,
    scoped.params
  );
}

export function getEntityAudit(context, entityType, entityId, filters = {}) {
  requireFeature(context, 'audit_black_box');
  requireCapability(context, 'view_audit');
  ensureTenantUser(context, context.tenant.id);
  evidenceEntityExists(context, entityType, entityId);
  return listAuditLogs(context, { ...filters, entityType, entityId });
}

export function getAuditSummary(context, filters = {}) {
  requireFeature(context, 'audit_black_box');
  requireCapability(context, 'view_audit');
  ensureTenantUser(context, context.tenant.id);
  const scoped = auditFiltersSql(context, filters);
  const total = selectOne(`SELECT COUNT(*) AS count FROM audit_logs a WHERE ${scoped.where}`, scoped.params).count;
  const byEntityType = selectAll(
    `SELECT a.entity_type, COUNT(*) AS count FROM audit_logs a WHERE ${scoped.where} GROUP BY a.entity_type ORDER BY count DESC, a.entity_type`,
    scoped.params
  );
  const byAction = selectAll(
    `SELECT a.action, COUNT(*) AS count FROM audit_logs a WHERE ${scoped.where} GROUP BY a.action ORDER BY count DESC, a.action`,
    scoped.params
  );
  const byDay = selectAll(
    `SELECT substr(a.created_at, 1, 10) AS day, COUNT(*) AS count FROM audit_logs a WHERE ${scoped.where} GROUP BY substr(a.created_at, 1, 10) ORDER BY day DESC`,
    scoped.params
  );
  const denied = selectOne(`SELECT COUNT(*) AS count FROM audit_logs a WHERE ${scoped.where} AND a.action = 'DENIED_ROUTE_ACCESS'`, scoped.params).count;
  return {
    summary: {
      total,
      denied,
      byEntityType,
      byAction,
      byDay
    }
  };
}

export function getAdminSnapshot(context) {
  requireFeature(context, 'admin');
  requireCapability(context, 'manage_admin');
  return {
    users: selectAll('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
    departments: selectAll('SELECT id, tenant_id, name, code FROM departments WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
    facilities: selectAll('SELECT id, tenant_id, name, code, city, state FROM facilities WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
    devices: selectAll('SELECT id, tenant_id, facility_id, name, device_type, trusted, last_seen_at FROM devices WHERE tenant_id = ? ORDER BY name', [context.tenant.id]),
    roles: selectAll('SELECT key, name, description FROM roles ORDER BY name')
  };
}

export function listCompliance(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const summary = getDashboardSummary(context);
  const controls = selectAll(
    'SELECT * FROM compliance_controls WHERE tenant_id = ? ORDER BY framework_ref, created_at',
    [context.tenant.id]
  );
  const implemented = controls.filter((c) => c.status === 'implemented').length;
  const overdue = controls.filter((c) => c.next_review_due_at && c.next_review_due_at < nowIso()).length;
  return {
    controls,
    controlSummary: {
      total: controls.length,
      implemented,
      inProgress: controls.filter((c) => c.status === 'in_progress').length,
      notStarted: controls.filter((c) => c.status === 'not_started').length,
      exception: controls.filter((c) => c.status === 'exception').length,
      overdue,
      implementedPct: controls.length ? Math.round((implemented / controls.length) * 100) : 0
    },
    summary
  };
}

export function listComplianceControls(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const controls = selectAll(
    'SELECT * FROM compliance_controls WHERE tenant_id = ? ORDER BY framework_ref, created_at',
    [context.tenant.id]
  );
  return { controls };
}

export function updateComplianceControl(context, controlId, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  const existing = selectOne(
    'SELECT * FROM compliance_controls WHERE id = ? AND tenant_id = ?',
    [controlId, context.tenant.id]
  );
  if (!existing) throw fail('Control not found', 404);
  const allowed = ['status', 'last_reviewed_at', 'next_review_due_at', 'evidence_source', 'exception_count'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) throw fail('No updatable fields provided', 400);
  updates.updated_at = nowIso();
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  execute(
    `UPDATE compliance_controls SET ${setClauses} WHERE id = ? AND tenant_id = ?`,
    [...Object.values(updates), controlId, context.tenant.id]
  );
  insertAudit(context, { action: 'COMPLIANCE_CONTROL_UPDATED', entityType: 'compliance_control', entityId: controlId, summary: `Control ${controlId} updated`, before: { status: existing.status }, after: { status: updates.status ?? existing.status } });
  return selectOne('SELECT * FROM compliance_controls WHERE id = ? AND tenant_id = ?', [controlId, context.tenant.id]);
}

export function listComplianceEvidence(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const evidence = selectAll(
    `SELECT ce.*, cc.framework_ref, cc.name AS control_name, cc.category AS control_category,
            d.file_name, d.doc_type, d.visibility, d.entity_type, d.entity_id
     FROM compliance_evidence ce
     JOIN compliance_controls cc ON ce.compliance_control_id = cc.id
     JOIN documents d ON ce.evidence_document_id = d.id
     WHERE ce.tenant_id = ?
     ORDER BY ce.linked_at DESC`,
    [context.tenant.id]
  );
  return { evidence };
}

export function listAccessReviews(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const reviews = selectAll(
    `SELECT ar.*, u.name AS reviewer_name
     FROM access_reviews ar
     LEFT JOIN users u ON ar.reviewer_user_id = u.id
     WHERE ar.tenant_id = ?
     ORDER BY ar.created_at DESC`,
    [context.tenant.id]
  );
  const reviewsWithEntries = reviews.map((review) => {
    const entries = selectAll(
      `SELECT are.*, u.name AS subject_name, u.role_key AS subject_role_key, u.email AS subject_email
       FROM access_review_entries are
       JOIN users u ON are.subject_user_id = u.id
       WHERE are.access_review_id = ? AND are.tenant_id = ?
       ORDER BY are.created_at`,
      [review.id, context.tenant.id]
    );
    return { ...review, entries };
  });
  return { reviews: reviewsWithEntries };
}

export function createAccessReview(context, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  if (!body.review_name) throw fail('review_name is required', 400);
  const users = selectAll(
    'SELECT id, role_key, department_id, facility_id, name, email FROM users WHERE tenant_id = ? AND active = 1',
    [context.tenant.id]
  );
  const reviewId = newId('access_review');
  const now = nowIso();
  execute(
    `INSERT INTO access_reviews (id, tenant_id, review_name, reviewer_user_id, status, started_at, due_at, total_entries, reviewed_entries, revoked_entries, notes, created_at, created_by_user_id)
     VALUES (?, ?, ?, ?, 'IN_PROGRESS', ?, ?, ?, 0, 0, '', ?, ?)`,
    [reviewId, context.tenant.id, body.review_name, context.user.id, now, body.due_at || null, users.length, now, context.user.id]
  );
  for (const user of users) {
    const entryId = newId('are');
    execute(
      `INSERT INTO access_review_entries (id, tenant_id, access_review_id, subject_user_id, "current_role", permission_snapshot, recommendation, created_at)
       VALUES (?, ?, ?, ?, ?, '[]', 'RETAIN', ?)`,
      [entryId, context.tenant.id, reviewId, user.id, user.role_key, now]
    );
  }
  insertAudit(context, { action: 'ACCESS_REVIEW_CREATED', entityType: 'access_review', entityId: reviewId, summary: `Access review created: ${body.review_name}`, before: {}, after: { review_name: body.review_name, total_entries: users.length } });
  return selectOne('SELECT * FROM access_reviews WHERE id = ? AND tenant_id = ?', [reviewId, context.tenant.id]);
}

export function reviewAccessEntry(context, reviewId, entryId, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  const review = selectOne('SELECT * FROM access_reviews WHERE id = ? AND tenant_id = ?', [reviewId, context.tenant.id]);
  if (!review) throw fail('Access review not found', 404);
  if (review.status === 'COMPLETED') throw fail('Access review is already completed', 409);
  const entry = selectOne(
    'SELECT * FROM access_review_entries WHERE id = ? AND access_review_id = ? AND tenant_id = ?',
    [entryId, reviewId, context.tenant.id]
  );
  if (!entry) throw fail('Access review entry not found', 404);
  if (!body.decision || !['CONFIRMED', 'REVOKED', 'MODIFIED'].includes(body.decision)) {
    throw fail('decision must be CONFIRMED, REVOKED, or MODIFIED', 400);
  }
  const now = nowIso();
  execute(
    `UPDATE access_review_entries SET decision = ?, decision_reason = ?, reviewed_by_user_id = ?, reviewed_at = ?, updated_at = ?
     WHERE id = ? AND tenant_id = ?`,
    [body.decision, body.decision_reason || '', context.user.id, now, now, entryId, context.tenant.id]
  );
  const reviewed = selectAll(
    'SELECT id FROM access_review_entries WHERE access_review_id = ? AND tenant_id = ? AND decision IS NOT NULL',
    [reviewId, context.tenant.id]
  ).length;
  const revoked = selectAll(
    "SELECT id FROM access_review_entries WHERE access_review_id = ? AND tenant_id = ? AND decision = 'REVOKED'",
    [reviewId, context.tenant.id]
  ).length;
  const total = review.total_entries;
  const allDone = reviewed >= total;
  execute(
    `UPDATE access_reviews SET reviewed_entries = ?, revoked_entries = ?, status = ?, completed_at = ?, updated_at = ?
     WHERE id = ? AND tenant_id = ?`,
    [reviewed, revoked, allDone ? 'COMPLETED' : 'IN_PROGRESS', allDone ? now : null, now, reviewId, context.tenant.id]
  );
  insertAudit(context, { action: 'ACCESS_REVIEW_ENTRY_DECIDED', entityType: 'access_review_entry', entityId: entryId, summary: `Access review entry ${body.decision}`, before: { decision: entry.decision }, after: { decision: body.decision, reason: body.decision_reason || '' } });
  return selectOne('SELECT * FROM access_review_entries WHERE id = ? AND tenant_id = ?', [entryId, context.tenant.id]);
}

export function listRiskRegister(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const risks = selectAll(
    `SELECT rr.*, u.name AS owner_name, cc.framework_ref AS control_ref, cc.name AS control_name
     FROM risk_register rr
     LEFT JOIN users u ON rr.owner_user_id = u.id
     LEFT JOIN compliance_controls cc ON rr.related_control_id = cc.id
     WHERE rr.tenant_id = ?
     ORDER BY rr.risk_score DESC, rr.created_at DESC`,
    [context.tenant.id]
  );
  return { risks };
}

export function createRiskEntry(context, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  if (!body.title) throw fail('title is required', 400);
  const count = selectOne('SELECT COUNT(*) AS n FROM risk_register WHERE tenant_id = ?', [context.tenant.id]).n;
  const riskNo = `RSK-${String(count + 1).padStart(3, '0')}`;
  const riskId = newId('risk');
  const now = nowIso();
  const probImpactScore = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 100 };
  const prob = body.probability || 'MEDIUM';
  const impact = body.impact || 'MEDIUM';
  const score = Math.round((probImpactScore[prob] || 50) * (probImpactScore[impact] || 50) / 100);
  execute(
    `INSERT INTO risk_register (id, tenant_id, risk_no, title, description, category, domain, probability, impact, risk_score, status, mitigation, mitigation_status, owner_user_id, owner_role, created_at, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, 'NOT_STARTED', ?, ?, ?, ?)`,
    [riskId, context.tenant.id, riskNo, body.title, body.description || '', body.category || 'OPERATIONAL', body.domain || '', prob, impact, score, body.mitigation || '', body.owner_user_id || null, context.user.role_key, now, context.user.id]
  );
  insertAudit(context, { action: 'RISK_CREATED', entityType: 'risk_register', entityId: riskId, summary: `Risk created: ${riskNo} — ${body.title}`, before: {}, after: { risk_no: riskNo, title: body.title, risk_score: score } });
  return selectOne('SELECT * FROM risk_register WHERE id = ? AND tenant_id = ?', [riskId, context.tenant.id]);
}

export function updateRiskEntry(context, riskId, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  const existing = selectOne('SELECT * FROM risk_register WHERE id = ? AND tenant_id = ?', [riskId, context.tenant.id]);
  if (!existing) throw fail('Risk not found', 404);
  const allowed = ['title', 'description', 'probability', 'impact', 'status', 'mitigation', 'mitigation_status', 'owner_user_id', 'last_reviewed_at', 'next_review_at'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (updates.probability || updates.impact) {
    const scoreMap = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 100 };
    const prob = updates.probability || existing.probability;
    const impact = updates.impact || existing.impact;
    updates.risk_score = Math.round((scoreMap[prob] || 50) * (scoreMap[impact] || 50) / 100);
  }
  if (updates.status === 'CLOSED') updates.closed_at = nowIso();
  updates.updated_at = nowIso();
  updates.updated_by_user_id = context.user.id;
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  execute(
    `UPDATE risk_register SET ${setClauses} WHERE id = ? AND tenant_id = ?`,
    [...Object.values(updates), riskId, context.tenant.id]
  );
  insertAudit(context, { action: 'RISK_UPDATED', entityType: 'risk_register', entityId: riskId, summary: `Risk updated: ${existing.risk_no}`, before: { status: existing.status }, after: { status: updates.status ?? existing.status } });
  return selectOne('SELECT * FROM risk_register WHERE id = ? AND tenant_id = ?', [riskId, context.tenant.id]);
}

export function listIncidentRegister(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const incidents = selectAll(
    `SELECT ir.*, u.name AS owner_name, cc.framework_ref AS control_ref, rr.risk_no AS related_risk_no
     FROM incident_register ir
     LEFT JOIN users u ON ir.owner_user_id = u.id
     LEFT JOIN compliance_controls cc ON ir.related_control_id = cc.id
     LEFT JOIN risk_register rr ON ir.related_risk_id = rr.id
     WHERE ir.tenant_id = ?
     ORDER BY ir.created_at DESC`,
    [context.tenant.id]
  );
  return { incidents };
}

export function createIncident(context, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  if (!body.title) throw fail('title is required', 400);
  const count = selectOne('SELECT COUNT(*) AS n FROM incident_register WHERE tenant_id = ?', [context.tenant.id]).n;
  const incidentNo = `INC-${String(count + 1).padStart(3, '0')}`;
  const incidentId = newId('incident');
  const now = nowIso();
  execute(
    `INSERT INTO incident_register (id, tenant_id, incident_no, title, description, category, severity, status, affected_systems, affected_user_count, detected_at, reported_at, owner_user_id, created_at, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, ?)`,
    [incidentId, context.tenant.id, incidentNo, body.title, body.description || '', body.category || 'OPERATIONAL', body.severity || 'LOW', body.affected_systems || '', body.affected_user_count || 0, now, now, context.user.id, now, context.user.id]
  );
  insertAudit(context, { action: 'INCIDENT_CREATED', entityType: 'incident_register', entityId: incidentId, summary: `Incident created: ${incidentNo} — ${body.title}`, before: {}, after: { incident_no: incidentNo, title: body.title, severity: body.severity || 'LOW' } });
  return selectOne('SELECT * FROM incident_register WHERE id = ? AND tenant_id = ?', [incidentId, context.tenant.id]);
}

export function updateIncident(context, incidentId, body) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'manage_compliance');
  const existing = selectOne('SELECT * FROM incident_register WHERE id = ? AND tenant_id = ?', [incidentId, context.tenant.id]);
  if (!existing) throw fail('Incident not found', 404);
  const allowed = ['title', 'description', 'severity', 'status', 'root_cause', 'resolution', 'affected_systems', 'affected_user_count', 'contained_at', 'resolved_at', 'post_mortem', 'related_control_id', 'related_risk_id', 'owner_user_id'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  updates.updated_at = nowIso();
  updates.updated_by_user_id = context.user.id;
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  execute(
    `UPDATE incident_register SET ${setClauses} WHERE id = ? AND tenant_id = ?`,
    [...Object.values(updates), incidentId, context.tenant.id]
  );
  insertAudit(context, { action: 'INCIDENT_UPDATED', entityType: 'incident_register', entityId: incidentId, summary: `Incident updated: ${existing.incident_no}`, before: { status: existing.status }, after: { status: updates.status ?? existing.status } });
  return selectOne('SELECT * FROM incident_register WHERE id = ? AND tenant_id = ?', [incidentId, context.tenant.id]);
}

export function listVendorIntegrationRegister(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const connections = selectAll(
    'SELECT * FROM integration_connections WHERE tenant_id = ? ORDER BY created_at DESC',
    [context.tenant.id]
  );
  const storage = evidenceStorageStatus();
  const tenantAuth = getTenantOidcRuntimeSelection(process.env);
  const platformAuth = getPlatformOidcRuntimeSelection(process.env);
  const staticVendors = [
    { vendor_key: 'oidc_provider', name: 'OIDC / SSO Provider', type: 'AUTHENTICATION', status: tenantAuth.issuer ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED', data_handled: 'User identities, session tokens', risk_level: 'HIGH', notes: tenantAuth.issuer ? `Issuer: ${tenantAuth.issuer}` : 'No OIDC issuer configured. Dev-context only.' },
    { vendor_key: 'platform_oidc_provider', name: 'Platform OIDC / SSO Provider', type: 'AUTHENTICATION', status: platformAuth.issuer ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED', data_handled: 'Platform admin identities, support sessions', risk_level: 'HIGH', notes: platformAuth.issuer ? `Issuer: ${platformAuth.issuer}` : 'No platform OIDC issuer configured.' },
    { vendor_key: 'object_storage', name: 'Object Storage (S3)', type: 'STORAGE', status: storage.status, data_handled: 'Evidence documents, uploaded files', risk_level: 'MEDIUM', notes: storage.status === 'CONFIGURED' ? 'S3 backend configured.' : storage.status === 'LOCAL_ONLY' ? 'Using local filesystem. S3 required for production.' : 'Object storage is not configured.' },
    { vendor_key: 'ai_provider', name: 'AI/LLM Provider', type: 'AI_ADVISORY', status: 'NOT_CONFIGURED', data_handled: 'Operational context (read-only, no PII)', risk_level: 'MEDIUM', notes: 'No LLM provider configured. All AI is SYSTEM_GENERATED deterministic rules.' },
    { vendor_key: 'ocr_provider', name: 'OCR / Invoice Extraction Provider', type: 'DOCUMENT_PROCESSING', status: 'NOT_CONFIGURED', data_handled: 'Invoice documents, line-item data', risk_level: 'MEDIUM', notes: 'OCR provider not configured. Invoice extraction uses deterministic parsing only.' },
    { vendor_key: 'email_provider', name: 'Email / Notification Provider', type: 'NOTIFICATIONS', status: 'NOT_CONFIGURED', data_handled: 'User email addresses, event notifications', risk_level: 'LOW', notes: 'Email notifications not implemented. Events are audit-logged only.' }
  ];
  const integrationVendors = connections.map((conn) => ({
    vendor_key: conn.id,
    name: conn.name,
    type: 'ERP_INTEGRATION',
    status: conn.status,
    data_handled: 'Export batches, purchase orders, invoices',
    risk_level: 'HIGH',
    last_reviewed: conn.updated_at || conn.created_at,
    notes: conn.type + (conn.endpoint ? ` → ${conn.endpoint}` : '')
  }));
  return { vendors: [...staticVendors, ...integrationVendors] };
}

export function listSsoConfigurations(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  return {
    configurations: selectAll(
      'SELECT * FROM sso_configurations WHERE tenant_id = ? ORDER BY created_at DESC',
      [context.tenant.id]
    )
  };
}

export function listBackupRecords(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  return {
    records: selectAll(
      'SELECT br.*, u.name AS verifier_name FROM backup_records br LEFT JOIN users u ON u.id = br.verified_by_user_id WHERE br.tenant_id = ? ORDER BY br.created_at DESC',
      [context.tenant.id]
    )
  };
}

export function listRestoreTests(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  return {
    tests: selectAll(
      'SELECT rt.*, u.name AS tester_name FROM restore_test_records rt LEFT JOIN users u ON u.id = rt.tested_by_user_id WHERE rt.tenant_id = ? ORDER BY rt.created_at DESC',
      [context.tenant.id]
    )
  };
}

export function listAiGovernanceLogs(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const logs = selectAll(
    `SELECT agl.*, u.name AS actor_name, u.role_key AS actor_role_key,
            approver.name AS approver_name
     FROM ai_governance_logs agl
     LEFT JOIN users u ON agl.actor_user_id = u.id
     LEFT JOIN users approver ON agl.human_approved_by_user_id = approver.id
     WHERE agl.tenant_id = ?
     ORDER BY agl.created_at DESC`,
    [context.tenant.id]
  );
  const summary = {
    total: logs.length,
    advisoryRequests: logs.filter((l) => l.event_type === 'ADVISORY_REQUEST').length,
    copilotQueries: logs.filter((l) => l.event_type === 'COPILOT_QUERY').length,
    humanApproved: logs.filter((l) => l.human_approval_required && l.human_approved_at).length,
    totalCost: logs.reduce((sum, l) => sum + (l.estimated_cost || 0), 0),
    providerStatus: 'NOT_CONFIGURED'
  };
  return { logs, summary };
}

export function getSecurityPosture(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const currentAuthMode = authMode();
  const isProduction = process.env.NODE_ENV === 'production';
  const tenantAuth = getTenantOidcRuntimeSelection(process.env);
  const platformAuth = getPlatformOidcRuntimeSelection(process.env);
  const sessionSelection = getSessionRuntimeSelection(process.env);
  const tenantOidcEnabled = Boolean(tenantAuth.issuer && tenantAuth.clientId && tenantAuth.clientSecret);
  const platformOidcEnabled = Boolean(platformAuth.issuer && platformAuth.clientId && platformAuth.clientSecret);
  const mfaStatus = currentAuthMode === 'oidc' || tenantOidcEnabled || platformOidcEnabled ? 'PROVIDER_DEPENDENT' : 'NOT_CONFIGURED';
  const ssoConfig = selectOne('SELECT * FROM sso_configurations WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1', [context.tenant.id]);
  const tenantSsoStatus = ssoConfig?.status || (tenantOidcEnabled ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED');
  const platformSsoStatus = platformOidcEnabled ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED';
  const devContextBlocked = isProduction;
  const storage = evidenceStorageStatus();
  const recentFailedLogins = selectAll(
    `SELECT COUNT(*) AS n FROM audit_logs WHERE tenant_id = ? AND action = 'AUTH_DENIED' AND created_at > datetime('now', '-24 hours')`,
    [context.tenant.id]
  )[0]?.n || 0;
  const roleChangeCount = selectAll(
    `SELECT COUNT(*) AS n FROM audit_logs WHERE tenant_id = ? AND action IN ('ROLE_CHANGED', 'PERMISSION_CHANGED') AND created_at > datetime('now', '-30 days')`,
    [context.tenant.id]
  )[0]?.n || 0;
  return {
    posture: {
      authMode: currentAuthMode,
      environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
      mfa: { status: mfaStatus, note: mfaStatus === 'NOT_CONFIGURED' ? 'OIDC provider with MFA policy required for SOC2.' : 'MFA policy controlled by IdP.' },
      sso: { status: tenantSsoStatus, issuer: ssoConfig?.issuer || tenantAuth.issuer || null, providerType: ssoConfig?.provider_type || 'OIDC', note: tenantSsoStatus === 'CONFIGURATION_REQUIRED' ? 'OIDC_ISSUER, client ID, and secret must be set for tenant production deployment.' : 'Tenant OIDC configured.' },
      platformSso: { status: platformSsoStatus, issuer: platformAuth.issuer || null, providerType: 'OIDC', note: platformSsoStatus === 'CONFIGURATION_REQUIRED' ? 'PLATFORM_OIDC_ISSUER, client ID, and secret must be set for platform admin deployment.' : 'Platform OIDC configured.' },
      sessionSecrets: {
        status: sessionSelection.tenantSecret && sessionSelection.platformSecret ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED',
        note: sessionSelection.tenantSecret && sessionSelection.platformSecret ? 'Tenant and platform session signing secrets configured.' : 'Distinct tenant and platform session secrets are required.'
      },
      objectStorage: { status: storage.status, mode: storage.mode, note: storage.status === 'CONFIGURED' ? 'Object storage backend configured.' : storage.status === 'LOCAL_ONLY' ? 'Using local filesystem. S3 required for production evidence binaries.' : 'Object storage configuration required.' },
      devContext: { blocked: devContextBlocked, note: devContextBlocked ? 'Dev context correctly blocked in production.' : 'Dev context is active — acceptable in non-production environments only.' },
      sessionTtl: { hours: 8, status: 'CONFIGURED' },
      csrfProtection: { status: 'ACTIVE', note: 'X-CSRF-Token required for all state-mutating requests.' },
      tenantIsolation: { status: 'ENFORCED', note: 'All queries include tenant_id binding. Cross-tenant access rejected at service layer.' },
      rbac: { status: 'ENFORCED', note: 'All routes enforce capabilitySet() checks before data access.' },
      securityHeaders: { status: 'ACTIVE', headers: ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection', 'Referrer-Policy', 'Content-Security-Policy'] },
      stackTraces: { suppressed: isProduction, note: isProduction ? 'Stack traces suppressed in production (NODE_ENV=production).' : 'Stack traces visible in development mode.' },
      rateLimiting: { status: 'CONFIGURATION_REQUIRED', note: 'Rate limiting must be configured at the reverse proxy layer (nginx, Caddy, ALB).' },
      apiAudit: { recentFailedLogins, roleChangeCount }
    }
  };
}

export function getAvailabilityPosture(context) {
  requireFeature(context, 'compliance_center');
  requireCapability(context, 'view_compliance');
  const migrationVersion = selectOne('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations')?.v || 0;
  const dbPath = process.env.OPSTRAX_DB_PATH || 'data/opstrax.production.sqlite';
  const backupRecords = listBackupRecords(context).records;
  const restoreTests = listRestoreTests(context).tests;
  const recentJobFailures = selectAll(
    "SELECT COUNT(*) AS n FROM integration_jobs WHERE tenant_id = ? AND status = 'FAILED' AND created_at > datetime('now', '-7 days')",
    [context.tenant.id]
  )[0]?.n || 0;
  const pendingOfflineBatches = selectAll(
    "SELECT COUNT(*) AS n FROM sync_batches WHERE tenant_id = ? AND status NOT IN ('POSTED', 'REJECTED')",
    [context.tenant.id]
  )[0]?.n || 0;
  return {
    posture: {
      healthEndpoints: {
        liveness: { path: '/healthz', status: 'ACTIVE' },
        readiness: { path: '/healthz/ready', status: 'ACTIVE', checks: ['db'] }
      },
      database: {
        path: dbPath,
        migrationVersion,
        expectedVersion: 23,
        status: migrationVersion >= 23 ? 'CURRENT' : 'MIGRATION_REQUIRED'
      },
      backup: {
        status: backupRecords.some((row) => row.status === 'VERIFIED') ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED',
        note: backupRecords.some((row) => row.status === 'VERIFIED') ? 'At least one backup verification record exists.' : 'Automated backup must be configured externally. No verified backup record exists yet.',
        records: backupRecords
      },
      restore: {
        status: restoreTests.some((row) => row.status === 'VERIFIED') ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED',
        note: restoreTests.some((row) => row.status === 'VERIFIED') ? 'At least one restore test record exists.' : 'Restore test evidence is not yet recorded. Production restore must be validated against backup media.',
        tests: restoreTests
      },
      monitoring: {
        status: process.env.OPSTRAX_MONITORING_URL ? 'CONFIGURED' : 'CONFIGURATION_REQUIRED',
        url: process.env.OPSTRAX_MONITORING_URL || null,
        note: 'Uptime monitoring must be configured against /healthz. Alert if non-200 for >1 minute.'
      },
      integrationJobs: {
        recentFailures: recentJobFailures,
        status: recentJobFailures > 5 ? 'DEGRADED' : recentJobFailures > 0 ? 'ATTENTION_REQUIRED' : 'HEALTHY'
      },
      offlineSync: {
        pendingBatches: pendingOfflineBatches,
        status: pendingOfflineBatches > 0 ? 'BATCHES_PENDING' : 'CLEAR'
      }
    }
  };
}

export function getTenantById(tenantId) {
  return selectOne('SELECT id, name, slug, industry, status FROM tenants WHERE id = ?', [tenantId]);
}

export function resolveDefaultTenant() {
  return selectOne(
    `SELECT id, name, slug, industry, status
     FROM tenants
     ORDER BY CASE WHEN name = 'IntelliFlow Systems' THEN 0 WHEN name = 'Evostel LLC' THEN 1 ELSE 2 END, name
     LIMIT 1`
  );
}

export function getUserById(userId) {
  return selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE id = ? AND active = 1', [userId]);
}

export function resolveDefaultUserForTenant(tenantId) {
  return selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? AND role_key = \'admin\' LIMIT 1', [tenantId])
    ?? selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? ORDER BY role_key LIMIT 1', [tenantId]);
}

export function resolveContext(headers, query = {}) {
  if (isLocalDemoEnabled()) {
    const session = readSession(headers);
    if (session) {
      return {
        tenant: getTenantById(session.tenant_id),
        user: getUserById(session.user_id),
        device: null,
        session
      };
    }
    const tenantId = headerValue(headers, 'x-tenant-id') || query.tenant || '';
    if (!tenantId) {
      const error = fail('Authentication required', 401);
      error.loginUrl = '/auth/login';
      throw error;
    }
    const tenant = getTenantById(tenantId);
    if (!tenant) throw fail('Tenant not found', 404);
    const userId = headerValue(headers, 'x-user-id') || query.user;
    if (!userId) {
      const error = fail('Authentication required', 401);
      error.loginUrl = '/auth/login';
      throw error;
    }
    const user = getUserById(userId);
    if (!user || user.tenant_id !== tenantId) throw fail('User not found for tenant', 403);
    const deviceId = headerValue(headers, 'x-device-id') || query.device || null;
    const device = deviceId ? selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [tenantId, deviceId]) : null;
    return { tenant, user, device };
  }
  const auth = authMode();
  if (auth === 'oidc') {
    const session = readSession(headers);
    if (!session) {
      const error = fail('Authentication required', 401);
      error.loginUrl = '/auth/login';
      throw error;
    }
    return {
      tenant: getTenantById(session.tenant_id),
      user: getUserById(session.user_id),
      device: null,
      session
    };
  }
  if (auth !== 'dev') {
    const error = fail('Authentication required', 401);
    error.loginUrl = '/auth/login';
    throw error;
  }
  const session = readSession(headers);
  if (session) {
    return {
      tenant: getTenantById(session.tenant_id),
      user: getUserById(session.user_id),
      device: null,
      session
    };
  }
  const tenantId = headerValue(headers, 'x-tenant-id') || query.tenant || '';
  if (!tenantId) {
    const error = fail('Authentication required', 401);
    error.loginUrl = '/auth/login';
    throw error;
  }
  const tenant = getTenantById(tenantId);
  if (!tenant) throw fail('Tenant not found', 404);
  const userId = headerValue(headers, 'x-user-id') || query.user;
  if (!userId) {
    const error = fail('Authentication required', 401);
    error.loginUrl = '/auth/login';
    throw error;
  }
  const user = getUserById(userId);
  if (!user || user.tenant_id !== tenantId) throw fail('User not found for tenant', 403);
  const deviceId = headerValue(headers, 'x-device-id') || query.device || null;
  const device = deviceId ? selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [tenantId, deviceId]) : null;
  return { tenant, user, device };
}

// ─── Phase 1H: DeviceOps + Offline Sync Core ───────────────────────────────

export function listDeviceOpsSummary(context) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'view_devices');
  ensureTenantUser(context, context.tenant.id);
  const tid = context.tenant.id;
  const total = selectOne('SELECT COUNT(*) AS c FROM devices WHERE tenant_id = ?', [tid]).c;
  const trusted = selectOne("SELECT COUNT(*) AS c FROM devices WHERE tenant_id = ? AND trust_state = 'TRUSTED'", [tid]).c;
  const untrusted = selectOne("SELECT COUNT(*) AS c FROM devices WHERE tenant_id = ? AND trust_state = 'UNTRUSTED'", [tid]).c;
  const suspended = selectOne("SELECT COUNT(*) AS c FROM devices WHERE tenant_id = ? AND trust_state = 'SUSPENDED'", [tid]).c;
  const revoked = selectOne("SELECT COUNT(*) AS c FROM devices WHERE tenant_id = ? AND trust_state = 'REVOKED'", [tid]).c;
  const recentScans = selectOne("SELECT COUNT(*) AS c FROM device_events WHERE tenant_id = ? AND created_at >= datetime('now','-24 hours')", [tid]).c;
  const failedScans = selectOne("SELECT COUNT(*) AS c FROM device_events WHERE tenant_id = ? AND validation_status = 'INVALID' AND created_at >= datetime('now','-24 hours')", [tid]).c;
  const openBatches = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status IN ('CAPTURED','UPLOADED','VALIDATING','REVIEW_PENDING')", [tid]).c;
  return { devices: { total, trusted, untrusted, suspended, revoked }, scans: { last24h: recentScans, failed: failedScans }, offline: { openBatches } };
}

export function createDevice(context, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'manage_devices');
  ensureTenantUser(context, context.tenant.id);
  const deviceName = requireString(body.device_name ?? body.name, 'device_name', { max: 120 });
  const deviceCode = requireString(body.device_code, 'device_code', { max: 64 });
  const deviceType = requireEnum(body.device_type, 'device_type', ['SCANNER', 'TABLET', 'WORKSTATION', 'MOBILE', 'KIOSK', 'OTHER']);
  const facilityId = requireString(body.facility_id, 'facility_id', { max: 120 });
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);
  const existing = selectOne('SELECT id FROM devices WHERE tenant_id = ? AND device_code = ?', [context.tenant.id, deviceCode]);
  if (existing) throw fail('Device code already registered for tenant', 409);
  const id = newId('device');
  const now = nowIso();
  insert('devices', {
    id, tenant_id: context.tenant.id, facility_id: facilityId,
    name: deviceName, device_code: deviceCode, device_type: deviceType,
    trust_state: 'UNTRUSTED', trusted: 0, last_seen_at: now,
    created_by_user_id: context.user.id, created_at: now,
    updated_at: now, updated_by_user_id: context.user.id
  });
  insertAudit(context, { action: 'DEVICE_CREATED', entityType: 'device', entityId: id, summary: `Device ${deviceName} (${deviceCode}) registered as UNTRUSTED`, after: { id, name: deviceName, device_code: deviceCode, device_type: deviceType, trust_state: 'UNTRUSTED' } });
  return { device: getDeviceDetail(context, id) };
}

export function getDeviceDetail(context, deviceId) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'view_devices');
  ensureTenantUser(context, context.tenant.id);
  const device = selectOne(
    `SELECT d.*, f.name AS facility_name, f.code AS facility_code, u.name AS assigned_user_name
     FROM devices d LEFT JOIN facilities f ON f.id = d.facility_id LEFT JOIN users u ON u.id = d.assigned_to_user_id
     WHERE d.tenant_id = ? AND d.id = ?`,
    [context.tenant.id, deviceId]
  );
  if (!device) throw fail('Device not found', 404);
  return device;
}

export function updateDevice(context, deviceId, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'manage_devices');
  ensureTenantUser(context, context.tenant.id);
  const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
  if (!device) throw fail('Device not found', 404);
  if (device.trust_state === 'REVOKED') throw fail('Cannot update a revoked device', 409);
  const updates = {};
  if (body.device_name || body.name) updates.name = requireString(body.device_name ?? body.name, 'device_name', { max: 120 });
  if (body.assigned_to_user_id !== undefined) updates.assigned_to_user_id = body.assigned_to_user_id || null;
  if (Object.keys(updates).length === 0) throw fail('No valid fields to update', 400);
  updates.updated_at = nowIso();
  updates.updated_by_user_id = context.user.id;
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  execute(`UPDATE devices SET ${setClauses} WHERE tenant_id = ? AND id = ?`, [...Object.values(updates), context.tenant.id, deviceId]);
  insertAudit(context, { action: 'DEVICE_UPDATED', entityType: 'device', entityId: deviceId, summary: `Device ${device.name} updated`, before: device, after: { ...device, ...updates } });
  return getDeviceDetail(context, deviceId);
}

export function trustDevice(context, deviceId) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'trust_device');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
    if (!device) throw fail('Device not found', 404);
    if (device.trust_state === 'REVOKED') throw fail('Cannot trust a revoked device', 409);
    if (device.trust_state === 'TRUSTED') throw fail('Device is already trusted', 409);
    const now = nowIso();
    execute('UPDATE devices SET trust_state = ?, trusted = 1, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['TRUSTED', now, context.user.id, context.tenant.id, deviceId]);
    insertAudit(context, { action: 'DEVICE_TRUSTED', entityType: 'device', entityId: deviceId, summary: `Device ${device.name} set to TRUSTED`, before: { trust_state: device.trust_state }, after: { trust_state: 'TRUSTED' } });
    return { device: getDeviceDetail(context, deviceId) };
  });
}

export function suspendDevice(context, deviceId, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'suspend_device');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
    if (!device) throw fail('Device not found', 404);
    if (device.trust_state === 'REVOKED') throw fail('Cannot suspend a revoked device', 409);
    if (device.trust_state === 'SUSPENDED') throw fail('Device is already suspended', 409);
    const reason = optionalString(body.reason, 'reason', { max: 240 }) ?? '';
    const now = nowIso();
    execute('UPDATE devices SET trust_state = ?, trusted = 0, suspended_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['SUSPENDED', now, now, context.user.id, context.tenant.id, deviceId]);
    insertAudit(context, { action: 'DEVICE_SUSPENDED', entityType: 'device', entityId: deviceId, summary: `Device ${device.name} suspended${reason ? ': ' + reason : ''}`, before: { trust_state: device.trust_state }, after: { trust_state: 'SUSPENDED', suspended_at: now } });
    return { device: getDeviceDetail(context, deviceId) };
  });
}

export function revokeDevice(context, deviceId, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'revoke_device');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
    if (!device) throw fail('Device not found', 404);
    if (device.trust_state === 'REVOKED') throw fail('Device is already revoked', 409);
    const reason = optionalString(body.reason, 'reason', { max: 240 }) ?? '';
    const now = nowIso();
    execute('UPDATE devices SET trust_state = ?, trusted = 0, revoked_at = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?', ['REVOKED', now, now, context.user.id, context.tenant.id, deviceId]);
    insertAudit(context, { action: 'DEVICE_REVOKED', entityType: 'device', entityId: deviceId, summary: `Device ${device.name} revoked${reason ? ': ' + reason : ''}`, before: { trust_state: device.trust_state }, after: { trust_state: 'REVOKED', revoked_at: now } });
    return { device: getDeviceDetail(context, deviceId) };
  });
}

export function listDeviceEvents(context, deviceId) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'view_devices');
  ensureTenantUser(context, context.tenant.id);
  const device = selectOne('SELECT id FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
  if (!device) throw fail('Device not found', 404);
  return selectAll(
    `SELECT de.*, u.name AS user_name FROM device_events de LEFT JOIN users u ON u.id = de.user_id
     WHERE de.tenant_id = ? AND de.device_id = ? ORDER BY de.created_at DESC LIMIT 200`,
    [context.tenant.id, deviceId]
  );
}

function parseScanValue(context, rawValue) {
  if (!rawValue || !rawValue.trim()) return { type: 'UNKNOWN', id: null, valid: false, message: 'Empty scan value' };
  const v = rawValue.trim();
  const item = selectOne('SELECT id, name, sku FROM items WHERE tenant_id = ? AND (barcode = ? OR sku = ?)', [context.tenant.id, v, v]);
  if (item) return { type: 'ITEM', id: item.id, valid: true, message: '' };
  const bin = selectOne('SELECT id, code FROM bins WHERE tenant_id = ? AND code = ?', [context.tenant.id, v]);
  if (bin) return { type: 'BIN', id: bin.id, valid: true, message: '' };
  const task = selectOne('SELECT id, status FROM warehouse_tasks WHERE tenant_id = ? AND id = ?', [context.tenant.id, v]);
  if (task) {
    if (task.status === 'CANCELLED' || task.status === 'CLOSED') return { type: 'WAREHOUSE_TASK', id: task.id, valid: false, message: `Task is ${task.status}` };
    return { type: 'WAREHOUSE_TASK', id: task.id, valid: true, message: '' };
  }
  const session = selectOne('SELECT id, status FROM receive_sessions WHERE tenant_id = ? AND id = ?', [context.tenant.id, v]);
  if (session) return { type: 'RECEIVE_SESSION', id: session.id, valid: session.status !== 'CANCELLED', message: session.status === 'CANCELLED' ? 'Receive session is cancelled' : '' };
  return { type: 'UNKNOWN', id: null, valid: false, message: 'Barcode not found in inventory, bins, or tasks' };
}

export function recordScanEvent(context, deviceId, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'record_scan_event');
  ensureTenantUser(context, context.tenant.id);
  const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
  if (!device) throw fail('Device not found', 404);
  if (device.trust_state === 'REVOKED') {
    insertAudit(context, { action: 'DENIED_DEVICE_ACTION', entityType: 'device', entityId: deviceId, summary: 'Scan rejected: device revoked' });
    throw fail('Device is revoked and cannot record scan events', 403);
  }
  const rawValue = requireString(body.rawValue ?? body.raw_value, 'raw_value', { max: 512 });
  const scanType = requireEnum(body.scan_type ?? 'BARCODE', 'scan_type', ['BARCODE', 'QR_CODE', 'MANUAL', 'NFC', 'RFID']);
  const contextType = optionalString(body.context_type, 'context_type', { max: 64 }) ?? '';
  const contextId = optionalString(body.context_id, 'context_id', { max: 120 }) ?? '';
  const parsed = parseScanValue(context, rawValue);
  const id = newId('de');
  const now = nowIso();
  insert('device_events', {
    id, tenant_id: context.tenant.id, device_id: deviceId,
    facility_id: device.facility_id, user_id: context.user.id,
    scan_type: scanType, raw_value: rawValue,
    parsed_type: parsed.type, parsed_id: parsed.id ?? '',
    validation_status: parsed.valid ? 'VALID' : 'INVALID',
    validation_message: parsed.message ?? '',
    context_type: contextType, context_id: contextId, created_at: now
  });
  execute('UPDATE devices SET last_seen_at = ? WHERE id = ?', [now, deviceId]);
  if (!parsed.valid) {
    insertAudit(context, { action: 'SCAN_VALIDATION_FAILED', entityType: 'device_event', entityId: id, summary: `Scan ${rawValue} invalid: ${parsed.message}` });
  } else {
    insertAudit(context, { action: 'SCAN_EVENT_RECORDED', entityType: 'device_event', entityId: id, summary: `Scan ${rawValue} → ${parsed.type}:${parsed.id ?? ''}` });
  }
  return { id, validation_status: parsed.valid ? 'VALID' : 'INVALID', parsed_type: parsed.type, parsed_id: parsed.id ?? '', validation_message: parsed.message ?? '' };
}

export function validateScan(context, body) {
  requireFeature(context, 'barcode_device_hub');
  requireCapability(context, 'validate_scan');
  ensureTenantUser(context, context.tenant.id);
  const rawValue = requireString(body.rawValue ?? body.raw_value, 'raw_value', { max: 512 });
  const contextType = optionalString(body.context_type, 'context_type', { max: 64 }) ?? '';
  const contextId = optionalString(body.context_id, 'context_id', { max: 120 }) ?? '';
  const parsed = parseScanValue(context, rawValue);
  let contextValidation = null;
  if (contextType && contextId && parsed.valid) {
    if (contextType === 'warehouse_task' && parsed.type === 'ITEM') {
      const task = selectOne('SELECT * FROM warehouse_tasks WHERE tenant_id = ? AND id = ?', [context.tenant.id, contextId]);
      if (!task) contextValidation = { valid: false, message: 'Task not found' };
      else if (task.status === 'CANCELLED' || task.status === 'CLOSED') contextValidation = { valid: false, message: `Task is ${task.status}` };
      else {
        const line = selectOne('SELECT * FROM warehouse_task_lines WHERE tenant_id = ? AND task_id = ? AND item_id = ?', [context.tenant.id, contextId, parsed.id]);
        contextValidation = line ? { valid: true, message: '' } : { valid: false, message: 'Item not on this task' };
      }
    } else if (contextType === 'receive_session' && parsed.type === 'ITEM') {
      const session = selectOne('SELECT * FROM receive_sessions WHERE tenant_id = ? AND id = ?', [context.tenant.id, contextId]);
      if (!session) contextValidation = { valid: false, message: 'Receive session not found' };
      else contextValidation = session.status === 'CANCELLED' ? { valid: false, message: 'Session is cancelled' } : { valid: true, message: '' };
    }
  }
  return { raw_value: rawValue, context_type: contextType, context_id: contextId, parsed_type: parsed.type, parsed_id: parsed.id ?? null, validation_status: parsed.valid ? 'VALID' : 'INVALID', validation_message: parsed.message ?? '', context_validation: contextValidation };
}

// ── Offline Sync ─────────────────────────────────────────────────────────────

export function listOfflineSummary(context) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_offline_batches');
  ensureTenantUser(context, context.tenant.id);
  const tid = context.tenant.id;
  const total = selectOne('SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ?', [tid]).c;
  const captured = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status = 'CAPTURED'", [tid]).c;
  const uploaded = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status = 'UPLOADED'", [tid]).c;
  const reviewPending = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status = 'REVIEW_PENDING'", [tid]).c;
  const approved = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status = 'APPROVED'", [tid]).c;
  const posted = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status = 'POSTED'", [tid]).c;
  const failed = selectOne("SELECT COUNT(*) AS c FROM offline_batches WHERE tenant_id = ? AND status IN ('REJECTED','FAILED')", [tid]).c;
  const openConflicts = selectOne("SELECT COUNT(*) AS c FROM sync_conflicts WHERE tenant_id = ? AND status = 'OPEN' AND offline_batch_id IS NOT NULL", [tid]).c;
  return { total, captured, uploaded, reviewPending, approved, posted, failed, openConflicts };
}

export function createOfflineBatch(context, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'create_offline_batch');
  ensureTenantUser(context, context.tenant.id);
  const batchKey = requireString(body.batch_key, 'batch_key', { max: 128 });
  const deviceId = requireString(body.device_id, 'device_id', { max: 120 });
  const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, deviceId]);
  if (!device) throw fail('Device not found for tenant', 404);
  if (device.trust_state === 'REVOKED') {
    insertAudit(context, { action: 'DENIED_OFFLINE_ACTION', entityType: 'offline_batch', entityId: '', summary: `Offline batch denied: device ${deviceId} revoked` });
    throw fail('Device is revoked', 403);
  }
  const facilityId = requireString(body.facility_id ?? device.facility_id, 'facility_id', { max: 120 });
  assertFacilityBelongsToTenant(context.tenant.id, facilityId);
  const existing = selectOne('SELECT * FROM offline_batches WHERE tenant_id = ? AND batch_key = ?', [context.tenant.id, batchKey]);
  if (existing) return { ...getOfflineBatchDetail(context, existing.id), created: false };
  const id = newId('ob');
  const now = nowIso();
  insert('offline_batches', { id, tenant_id: context.tenant.id, device_id: deviceId, facility_id: facilityId, uploaded_by_user_id: context.user.id, batch_key: batchKey, status: 'CAPTURED', action_count: 0, conflict_count: 0, posted_count: 0, created_at: now, updated_at: now });
  insertAudit(context, { action: 'OFFLINE_BATCH_CREATED', entityType: 'offline_batch', entityId: id, summary: `Offline batch ${batchKey} created via device ${device.name}` });
  return { ...getOfflineBatchDetail(context, id), created: true };
}

export function listOfflineBatches(context, filters = {}) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_offline_batches');
  ensureTenantUser(context, context.tenant.id);
  const statusFilter = filters.status ? ' AND ob.status = ?' : '';
  const params = [context.tenant.id, ...(filters.status ? [filters.status] : [])];
  const batches = selectAll(
    `SELECT ob.*, d.name AS device_name, f.name AS facility_name, u.name AS uploaded_by_user_name
     FROM offline_batches ob
     JOIN devices d ON d.id = ob.device_id JOIN facilities f ON f.id = ob.facility_id JOIN users u ON u.id = ob.uploaded_by_user_id
     WHERE ob.tenant_id = ?${statusFilter} ORDER BY ob.created_at DESC LIMIT 200`,
    params
  );
  return { batches };
}

export function getOfflineBatchDetail(context, batchId) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_offline_batches');
  ensureTenantUser(context, context.tenant.id);
  const batch = selectOne(
    `SELECT ob.*, d.name AS device_name, f.name AS facility_name, u.name AS uploaded_by_user_name
     FROM offline_batches ob JOIN devices d ON d.id = ob.device_id JOIN facilities f ON f.id = ob.facility_id JOIN users u ON u.id = ob.uploaded_by_user_id
     WHERE ob.tenant_id = ? AND ob.id = ?`,
    [context.tenant.id, batchId]
  );
  if (!batch) throw fail('Offline batch not found', 404);
  const tasks = selectAll('SELECT * FROM offline_tasks WHERE tenant_id = ? AND offline_batch_id = ? ORDER BY created_at ASC', [context.tenant.id, batchId]);
  const conflicts = selectAll('SELECT * FROM sync_conflicts WHERE tenant_id = ? AND offline_batch_id = ? ORDER BY created_at DESC', [context.tenant.id, batchId]);
  return { batch, tasks, conflicts };
}

export function uploadOfflineBatch(context, batchId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'create_offline_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = selectOne('SELECT * FROM offline_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
    if (!batch) throw fail('Offline batch not found', 404);
    if (!['CAPTURED', 'UPLOADED'].includes(batch.status)) throw fail('Batch cannot be uploaded in current state', 409);
    const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, batch.device_id]);
    if (device && device.trust_state === 'REVOKED') {
      insertAudit(context, { action: 'DENIED_OFFLINE_ACTION', entityType: 'offline_batch', entityId: batchId, summary: 'Upload denied: device revoked' });
      throw fail('Device is revoked', 403);
    }
    const tasks = requireArray(body.tasks, 'tasks');
    execute('DELETE FROM offline_tasks WHERE tenant_id = ? AND offline_batch_id = ?', [context.tenant.id, batchId]);
    const now = nowIso();
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const actionType = requireString(t.action_type, `tasks[${i}].action_type`, { max: 64 });
      const entityType = requireString(t.entity_type, `tasks[${i}].entity_type`, { max: 64 });
      const entityId = optionalString(t.entity_id, `tasks[${i}].entity_id`, { max: 120 }) ?? '';
      const payloadJson = JSON.stringify(t.payload ?? t.payload_json ?? {});
      const payloadHash = createHash('sha256').update(payloadJson).digest('hex');
      insert('offline_tasks', { id: newId('ot'), tenant_id: context.tenant.id, offline_batch_id: batchId, device_id: batch.device_id, user_id: context.user.id, action_key: t.action_key ?? `${actionType}_${i}`, action_type: actionType, entity_type: entityType, entity_id: entityId, payload_json: payloadJson, payload_hash: payloadHash, status: 'CAPTURED', created_at: now, updated_at: now });
    }
    execute('UPDATE offline_batches SET status = ?, action_count = ?, uploaded_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['UPLOADED', tasks.length, now, now, context.tenant.id, batchId]);
    insertAudit(context, { action: 'OFFLINE_BATCH_UPLOADED', entityType: 'offline_batch', entityId: batchId, summary: `Batch ${batch.batch_key} uploaded with ${tasks.length} tasks` });
    return getOfflineBatchDetail(context, batchId);
  });
}

function validateOfflineTask(context, task, device) {
  if (device && device.trust_state === 'REVOKED') return { valid: false, reason: 'Device revoked', conflictType: 'REVOKED_DEVICE' };
  if (task.payload_hash) {
    const dup = selectOne("SELECT id FROM offline_tasks WHERE tenant_id = ? AND payload_hash = ? AND status = 'POSTED' AND id != ?", [context.tenant.id, task.payload_hash, task.id]);
    if (dup) return { valid: false, reason: 'Duplicate action already posted', conflictType: 'DUPLICATE_ACTION' };
  }
  const payload = asJson(task.payload_json, {});
  if (['STOCK_ISSUE', 'ISSUE'].includes(task.action_type)) {
    if (task.entity_id) {
      const wt = selectOne('SELECT id, status FROM warehouse_tasks WHERE tenant_id = ? AND id = ?', [context.tenant.id, task.entity_id]);
      if (wt && (wt.status === 'CANCELLED' || wt.status === 'CLOSED')) return { valid: false, reason: `Task is ${wt.status}`, conflictType: 'CLOSED_TASK' };
    }
    if (payload.item_id && payload.quantity > 0) {
      const stock = selectOne('SELECT available FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, payload.item_id]);
      if (!stock || stock.available < payload.quantity) return { valid: false, reason: `Insufficient stock: need ${payload.quantity}, have ${stock?.available ?? 0}`, conflictType: 'INSUFFICIENT_STOCK' };
    }
  }
  if (['STOCK_RECEIVE', 'RECEIVE'].includes(task.action_type)) {
    if (payload.item_id) {
      const item = selectOne('SELECT id, active FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, payload.item_id]);
      if (!item) return { valid: false, reason: 'Item not found', conflictType: 'INVALID_ITEM' };
      if (!item.active) return { valid: false, reason: 'Item is inactive', conflictType: 'INVALID_ITEM' };
    }
    if (payload.bin_id) {
      const bin = selectOne('SELECT id FROM bins WHERE tenant_id = ? AND id = ?', [context.tenant.id, payload.bin_id]);
      if (!bin) return { valid: false, reason: 'Bin not found', conflictType: 'INVALID_BIN' };
    }
  }
  return { valid: true, reason: '', conflictType: '' };
}

export function validateOfflineBatch(context, batchId) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'validate_offline_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = selectOne('SELECT * FROM offline_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
    if (!batch) throw fail('Offline batch not found', 404);
    if (!['UPLOADED', 'VALIDATING'].includes(batch.status)) throw fail('Batch must be in UPLOADED state to validate', 409);
    const device = selectOne('SELECT * FROM devices WHERE tenant_id = ? AND id = ?', [context.tenant.id, batch.device_id]);
    const tasks = selectAll('SELECT * FROM offline_tasks WHERE tenant_id = ? AND offline_batch_id = ? ORDER BY created_at ASC', [context.tenant.id, batchId]);
    execute('UPDATE offline_batches SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['VALIDATING', nowIso(), context.tenant.id, batchId]);
    execute('DELETE FROM sync_conflicts WHERE tenant_id = ? AND offline_batch_id = ?', [context.tenant.id, batchId]);
    let conflictCount = 0;
    const now = nowIso();
    for (const task of tasks) {
      const { valid, reason, conflictType } = validateOfflineTask(context, task, device);
      if (!valid) {
        conflictCount++;
        const conflictId = newId('conflict');
        insert('sync_conflicts', {
          id: conflictId, tenant_id: context.tenant.id,
          sync_batch_id: batch.id, task_id: task.id,
          offline_batch_id: batchId, offline_task_id: task.id,
          conflict_type: conflictType, severity: 'HIGH', status: 'OPEN',
          description: reason, conflict_summary: reason,
          entity_type: task.entity_type, entity_id: task.entity_id,
          recommended_resolution: '', created_at: now
        });
        execute('UPDATE offline_tasks SET status = ?, validation_message = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['CONFLICT', reason, now, context.tenant.id, task.id]);
        insertAudit(context, { action: 'SYNC_CONFLICT_CREATED', entityType: 'sync_conflict', entityId: conflictId, summary: `Conflict on ${task.action_type}: ${reason}` });
      } else {
        execute('UPDATE offline_tasks SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['VALIDATED', now, context.tenant.id, task.id]);
      }
    }
    const finalStatus = conflictCount > 0 ? 'REVIEW_PENDING' : 'VALIDATING';
    execute('UPDATE offline_batches SET status = ?, conflict_count = ?, validated_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [finalStatus, conflictCount, now, now, context.tenant.id, batchId]);
    insertAudit(context, { action: 'OFFLINE_BATCH_VALIDATED', entityType: 'offline_batch', entityId: batchId, summary: `Batch ${batch.batch_key} validated: ${conflictCount} conflict(s)` });
    return getOfflineBatchDetail(context, batchId);
  });
}

function replayReceiveTask(context, batch, task, payload) {
  const itemId = payload.item_id;
  const qty = Number(payload.quantity ?? payload.qty ?? 0);
  if (!itemId || qty <= 0) return { posted: false, error: 'Missing item_id or quantity' };
  const item = selectOne('SELECT id, active FROM items WHERE tenant_id = ? AND id = ?', [context.tenant.id, itemId]);
  if (!item) return { posted: false, error: 'Item not found' };
  const stock = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, itemId]);
  if (!stock) return { posted: false, error: 'No stock record for item' };
  execute('UPDATE stock_balances SET on_hand = on_hand + ?, available = available + ?, updated_at = ? WHERE id = ?', [qty, qty, nowIso(), stock.id]);
  insert('stock_movements', { id: newId('sm'), tenant_id: context.tenant.id, item_id: itemId, facility_id: stock.facility_id, bin_id: stock.bin_id, movement_type: 'OFFLINE_RECEIVE', quantity: qty, reference_type: 'offline_batch', reference_id: batch.id, performed_by_user_id: context.user.id, department_id: context.user.department_id, note: `Offline receive batch ${batch.batch_key}`, created_at: nowIso() });
  return { posted: true };
}

function replayIssueTask(context, batch, task, payload) {
  const itemId = payload.item_id;
  const qty = Number(payload.quantity ?? payload.qty ?? 0);
  if (!itemId || qty <= 0) return { posted: false, error: 'Missing item_id or quantity' };
  const stock = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, itemId]);
  if (!stock || stock.available < qty) return { posted: false, error: `Insufficient stock: need ${qty}, have ${stock?.available ?? 0}` };
  execute('UPDATE stock_balances SET on_hand = on_hand - ?, available = available - ?, updated_at = ? WHERE id = ?', [qty, qty, nowIso(), stock.id]);
  insert('stock_movements', { id: newId('sm'), tenant_id: context.tenant.id, item_id: itemId, facility_id: stock.facility_id, bin_id: stock.bin_id, movement_type: 'OFFLINE_ISSUE', quantity: -qty, reference_type: 'offline_batch', reference_id: batch.id, performed_by_user_id: context.user.id, department_id: context.user.department_id, note: `Offline issue batch ${batch.batch_key}`, created_at: nowIso() });
  return { posted: true };
}

function replayCountTask(context, batch, task, payload) {
  const itemId = payload.item_id;
  const countedQty = Number(payload.counted_qty ?? payload.quantity ?? 0);
  if (!itemId) return { posted: false, error: 'Missing item_id' };
  const stock = selectOne('SELECT * FROM stock_balances WHERE tenant_id = ? AND item_id = ? ORDER BY available DESC LIMIT 1', [context.tenant.id, itemId]);
  if (!stock) return { posted: false, error: 'No stock record for item' };
  const delta = countedQty - stock.on_hand;
  execute('UPDATE stock_balances SET on_hand = ?, available = available + ?, updated_at = ? WHERE id = ?', [countedQty, delta, nowIso(), stock.id]);
  insert('stock_movements', { id: newId('sm'), tenant_id: context.tenant.id, item_id: itemId, facility_id: stock.facility_id, bin_id: stock.bin_id, movement_type: 'OFFLINE_COUNT', quantity: delta, reference_type: 'offline_batch', reference_id: batch.id, performed_by_user_id: context.user.id, department_id: context.user.department_id, note: `Offline count batch ${batch.batch_key}`, created_at: nowIso() });
  return { posted: true };
}

function replayOfflineTask(context, batch, task) {
  const payload = asJson(task.payload_json, {});
  try {
    if (['STOCK_RECEIVE', 'RECEIVE'].includes(task.action_type)) return replayReceiveTask(context, batch, task, payload);
    if (['STOCK_ISSUE', 'ISSUE'].includes(task.action_type)) return replayIssueTask(context, batch, task, payload);
    if (['STOCK_COUNT', 'COUNT'].includes(task.action_type)) return replayCountTask(context, batch, task, payload);
    return { posted: false, error: `Unknown action_type: ${task.action_type}` };
  } catch (err) {
    return { posted: false, error: err.message ?? 'Replay error' };
  }
}

export function replayOfflineBatch(context, batchId) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'replay_offline_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = selectOne('SELECT * FROM offline_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
    if (!batch) throw fail('Offline batch not found', 404);
    if (!['VALIDATING', 'APPROVED'].includes(batch.status)) throw fail('Batch must be VALIDATING or APPROVED to replay', 409);
    const tasks = selectAll("SELECT * FROM offline_tasks WHERE tenant_id = ? AND offline_batch_id = ? AND status IN ('VALIDATED','STAGED','APPROVED') ORDER BY created_at ASC", [context.tenant.id, batchId]);
    let postedCount = 0;
    const now = nowIso();
    for (const task of tasks) {
      if (task.payload_hash) {
        const alreadyPosted = selectOne("SELECT id FROM offline_tasks WHERE tenant_id = ? AND payload_hash = ? AND status = 'POSTED' AND id != ?", [context.tenant.id, task.payload_hash, task.id]);
        if (alreadyPosted) {
          execute('UPDATE offline_tasks SET status = ?, replay_result = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['POSTED', 'IDEMPOTENT_SKIP', now, context.tenant.id, task.id]);
          postedCount++;
          continue;
        }
      }
      const result = replayOfflineTask(context, batch, task);
      execute('UPDATE offline_tasks SET status = ?, replay_result = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [result.posted ? 'POSTED' : 'FAILED', JSON.stringify(result), now, context.tenant.id, task.id]);
      if (result.posted) {
        postedCount++;
        insertAudit(context, { action: 'OFFLINE_TASK_POSTED', entityType: 'offline_task', entityId: task.id, summary: `Offline task ${task.action_type} posted` });
      } else {
        insertAudit(context, { action: 'OFFLINE_TASK_FAILED', entityType: 'offline_task', entityId: task.id, summary: `Offline task ${task.action_type} failed: ${result.error}` });
      }
    }
    execute('UPDATE offline_batches SET posted_count = ?, replayed_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', [postedCount, now, now, context.tenant.id, batchId]);
    if (batch.status === 'APPROVED') {
      execute("UPDATE offline_batches SET status = ? WHERE tenant_id = ? AND id = ?", ['POSTED', context.tenant.id, batchId]);
    }
    insertAudit(context, { action: 'OFFLINE_BATCH_REPLAYED', entityType: 'offline_batch', entityId: batchId, summary: `Batch ${batch.batch_key} replayed: ${postedCount} task(s) posted` });
    return getOfflineBatchDetail(context, batchId);
  });
}

export function approveOfflineBatch(context, batchId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'approve_offline_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = selectOne('SELECT * FROM offline_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
    if (!batch) throw fail('Offline batch not found', 404);
    if (batch.status !== 'REVIEW_PENDING') throw fail('Batch is not in REVIEW_PENDING state', 409);
    const openConflicts = selectOne("SELECT COUNT(*) AS c FROM sync_conflicts WHERE tenant_id = ? AND offline_batch_id = ? AND status = 'OPEN'", [context.tenant.id, batchId]).c;
    if (openConflicts > 0) throw fail(`Batch has ${openConflicts} unresolved conflict(s)`, 409);
    const note = optionalString(body.note, 'note', { max: 240 }) ?? '';
    const now = nowIso();
    execute('UPDATE offline_batches SET status = ?, approved_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['APPROVED', now, now, context.tenant.id, batchId]);
    execute("UPDATE offline_tasks SET status = 'STAGED', updated_at = ? WHERE tenant_id = ? AND offline_batch_id = ? AND status = 'VALIDATED'", [now, context.tenant.id, batchId]);
    insertAudit(context, { action: 'OFFLINE_BATCH_APPROVED', entityType: 'offline_batch', entityId: batchId, summary: `Batch ${batch.batch_key} approved${note ? ': ' + note : ''}` });
    return getOfflineBatchDetail(context, batchId);
  });
}

export function rejectOfflineBatch(context, batchId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'reject_offline_batch');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const batch = selectOne('SELECT * FROM offline_batches WHERE tenant_id = ? AND id = ?', [context.tenant.id, batchId]);
    if (!batch) throw fail('Offline batch not found', 404);
    if (['POSTED', 'REJECTED'].includes(batch.status)) throw fail('Batch cannot be rejected in current state', 409);
    const reason = requireString(body.reason, 'reason', { max: 240 });
    const now = nowIso();
    execute('UPDATE offline_batches SET status = ?, rejected_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['REJECTED', now, now, context.tenant.id, batchId]);
    insertAudit(context, { action: 'OFFLINE_BATCH_REJECTED', entityType: 'offline_batch', entityId: batchId, summary: `Batch ${batch.batch_key} rejected: ${reason}` });
    return getOfflineBatchDetail(context, batchId);
  });
}

export function listSyncConflictsNew(context, filters = {}) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_sync_conflicts');
  ensureTenantUser(context, context.tenant.id);
  const statusFilter = filters.status ? ' AND sc.status = ?' : '';
  const batchFilter = filters.batch_id ? ' AND sc.offline_batch_id = ?' : '';
  const params = [context.tenant.id, ...(filters.status ? [filters.status] : []), ...(filters.batch_id ? [filters.batch_id] : [])];
  const conflicts = selectAll(
    `SELECT sc.* FROM sync_conflicts sc WHERE sc.tenant_id = ?${statusFilter}${batchFilter} AND sc.offline_batch_id IS NOT NULL ORDER BY sc.created_at DESC LIMIT 200`,
    params
  );
  return { conflicts };
}

export function getSyncConflictDetail(context, conflictId) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_sync_conflicts');
  ensureTenantUser(context, context.tenant.id);
  const conflict = selectOne('SELECT * FROM sync_conflicts WHERE tenant_id = ? AND id = ?', [context.tenant.id, conflictId]);
  if (!conflict) throw fail('Sync conflict not found', 404);
  return conflict;
}

export function approveSyncConflict(context, conflictId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'resolve_sync_conflicts');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const conflict = selectOne('SELECT * FROM sync_conflicts WHERE tenant_id = ? AND id = ?', [context.tenant.id, conflictId]);
    if (!conflict) throw fail('Sync conflict not found', 404);
    if (conflict.status !== 'OPEN') throw fail('Conflict is not OPEN', 409);
    const note = optionalString(body.note, 'note', { max: 240 }) ?? '';
    const now = nowIso();
    execute('UPDATE sync_conflicts SET status = ?, supervisor_decision = ?, decided_by_user_id = ?, decided_at = ?, resolution_note = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['APPROVED', 'APPROVE', context.user.id, now, note, now, context.tenant.id, conflictId]);
    if (conflict.offline_task_id) {
      execute("UPDATE offline_tasks SET status = 'APPROVED', updated_at = ? WHERE tenant_id = ? AND id = ?", [now, context.tenant.id, conflict.offline_task_id]);
    }
    insertAudit(context, { action: 'SYNC_CONFLICT_APPROVED', entityType: 'sync_conflict', entityId: conflictId, summary: `Conflict ${conflict.conflict_type} approved${note ? ': ' + note : ''}` });
    if (conflict.offline_batch_id) {
      const openCount = selectOne("SELECT COUNT(*) AS c FROM sync_conflicts WHERE tenant_id = ? AND offline_batch_id = ? AND status = 'OPEN'", [context.tenant.id, conflict.offline_batch_id]).c;
      if (openCount === 0) execute("UPDATE offline_batches SET status = 'APPROVED', approved_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", [now, now, context.tenant.id, conflict.offline_batch_id]);
    }
    return getSyncConflictDetail(context, conflictId);
  });
}

export function rejectSyncConflict(context, conflictId, body) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'resolve_sync_conflicts');
  ensureTenantUser(context, context.tenant.id);
  return transaction(() => {
    const conflict = selectOne('SELECT * FROM sync_conflicts WHERE tenant_id = ? AND id = ?', [context.tenant.id, conflictId]);
    if (!conflict) throw fail('Sync conflict not found', 404);
    if (conflict.status !== 'OPEN') throw fail('Conflict is not OPEN', 409);
    const note = requireString(body.note ?? body.reason, 'note', { max: 240 });
    const now = nowIso();
    execute('UPDATE sync_conflicts SET status = ?, supervisor_decision = ?, decided_by_user_id = ?, decided_at = ?, resolution_note = ?, updated_at = ? WHERE tenant_id = ? AND id = ?', ['REJECTED', 'REJECT', context.user.id, now, note, now, context.tenant.id, conflictId]);
    if (conflict.offline_task_id) {
      execute("UPDATE offline_tasks SET status = 'REJECTED', validation_message = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", [note, now, context.tenant.id, conflict.offline_task_id]);
    }
    insertAudit(context, { action: 'SYNC_CONFLICT_REJECTED', entityType: 'sync_conflict', entityId: conflictId, summary: `Conflict ${conflict.conflict_type} rejected: ${note}` });
    return { conflict: getSyncConflictDetail(context, conflictId) };
  });
}

export function listOfflineTasks(context, filters = {}) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_offline_batches');
  ensureTenantUser(context, context.tenant.id);
  const batchFilter = filters.batch_id ? ' AND ot.offline_batch_id = ?' : '';
  const statusFilter = filters.status ? ' AND ot.status = ?' : '';
  const params = [context.tenant.id];
  if (filters.batch_id) params.push(filters.batch_id);
  if (filters.status) params.push(filters.status);
  const tasks = selectAll(`SELECT ot.* FROM offline_tasks ot WHERE ot.tenant_id = ?${batchFilter}${statusFilter} ORDER BY ot.created_at DESC LIMIT 500`, params);
  return { tasks };
}

export function getOfflineTaskDetail(context, taskId) {
  requireFeature(context, 'offline_ops');
  requireCapability(context, 'view_offline_batches');
  ensureTenantUser(context, context.tenant.id);
  const task = selectOne('SELECT * FROM offline_tasks WHERE tenant_id = ? AND id = ?', [context.tenant.id, taskId]);
  if (!task) throw fail('Offline task not found', 404);
  return task;
}

// ── AI Governance + Read-Only Intelligence ───────────────────────────────────
// All AI functions are read-only with respect to domain records.
// The only writes performed are to: ai_recommendations, ai_recommendation_sources,
// ai_run_logs, ai_approvals. No inventory/request/warehouse/procurement writes.

const AI_AGENTS = [
  { agent_key: 'intake_agent', name: 'Intake Agent', description: 'Monitors internal request queue for delays and exception patterns.', category: 'OPERATIONS', read_only: true },
  { agent_key: 'inventory_agent', name: 'Inventory Agent', description: 'Flags low-stock, stockout risk, overstock, and controlled item issues.', category: 'INVENTORY', read_only: true },
  { agent_key: 'procurement_agent', name: 'Procurement Agent', description: 'Detects procurement delays, stalled purchase orders, and vendor issues.', category: 'PROCUREMENT', read_only: true },
  { agent_key: 'compliance_agent', name: 'Compliance Agent', description: 'Surfaces compliance gaps, evidence deficiencies, and audit exceptions.', category: 'COMPLIANCE', read_only: true },
  { agent_key: 'export_agent', name: 'Export Agent', description: 'Flags export validation errors and stalled FinanceSync batches.', category: 'FINANCE', read_only: true },
  { agent_key: 'offline_reconciliation_agent', name: 'Offline Reconciliation Agent', description: 'Identifies unresolved offline conflicts and device trust issues.', category: 'DEVICE_OPS', read_only: true },
  { agent_key: 'audit_agent', name: 'Audit Agent', description: 'Detects denied-action spikes and audit anomalies in the black box.', category: 'AUDIT', read_only: true },
  { agent_key: 'ops_copilot', name: 'Ops Copilot', description: 'Read-only Q&A assistant for operational context. Answers from tenant-safe source records only.', category: 'COPILOT', read_only: true }
];

export function buildPermissionAwareAiContext(context, scope = 'ALL') {
  ensureTenantUser(context, context.tenant.id);
  const tid = context.tenant.id;
  const canViewRestricted = capabilitySet(context.user.role_key).has('view_restricted_items') || capabilitySet(context.user.role_key).has('view_restricted_ai_context');
  const restrictedFilter = canViewRestricted ? '' : ' AND i.restricted = 0 AND i.controlled = 0';

  const lowStockItems = selectAll(
    `SELECT i.id, i.sku, i.name, i.barcode, COALESCE(SUM(sb.on_hand),0) AS on_hand,
            COALESCE(NULLIF(i.min_stock,0), i.min_qty, 0) AS min_stock,
            i.restricted, i.controlled, i.item_type, i.tenant_id
     FROM items i
     LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
     WHERE i.tenant_id = ?${restrictedFilter}
     GROUP BY i.id
     HAVING on_hand <= min_stock
     ORDER BY on_hand ASC LIMIT 50`,
    [tid]
  );
  const stockoutItems = selectAll(
    `SELECT i.id, i.sku, i.name, i.barcode, COALESCE(SUM(sb.on_hand),0) AS on_hand,
            COALESCE(NULLIF(i.min_stock,0), i.min_qty, 0) AS min_stock,
            i.restricted, i.controlled, i.tenant_id
     FROM items i
     LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
     WHERE i.tenant_id = ?${restrictedFilter}
     GROUP BY i.id
     HAVING on_hand = 0
     ORDER BY i.name LIMIT 20`,
    [tid]
  );
  const openRequests = selectAll(
    `SELECT ir.id, ir.request_no, ir.status, ir.priority, ir.created_at, ir.department_id
     FROM internal_requests ir WHERE ir.tenant_id = ? AND ir.status IN ('SUBMITTED','APPROVED','PICKING') ORDER BY ir.created_at ASC LIMIT 30`,
    [tid]
  );
  const openWarehouseTasks = selectAll(
    `SELECT wt.id, wt.task_no, wt.status, wt.priority, wt.task_type, wt.created_at
     FROM warehouse_tasks wt WHERE wt.tenant_id = ? AND wt.status NOT IN ('CLOSED','CANCELLED') ORDER BY wt.created_at ASC LIMIT 30`,
    [tid]
  );
  const openConflicts = selectAll(
    `SELECT sc.id, sc.conflict_type, sc.status, sc.entity_type, sc.entity_id, sc.created_at
     FROM sync_conflicts sc WHERE sc.tenant_id = ? AND sc.status = 'OPEN' ORDER BY sc.created_at ASC LIMIT 20`,
    [tid]
  );
  const untrustedDevices = selectAll(
    `SELECT d.id, d.name, d.trust_state, d.device_type, d.last_seen_at
     FROM devices d WHERE d.tenant_id = ? AND d.trust_state NOT IN ('TRUSTED') ORDER BY d.created_at ASC LIMIT 20`,
    [tid]
  );
  const exportErrors = selectAll(
    `SELECT ev.id, ev.code, ev.message, ev.severity, ev.entity_type, ev.entity_id FROM export_validation_errors ev
     WHERE ev.tenant_id = ? AND ev.resolved_at IS NULL ORDER BY ev.created_at DESC LIMIT 20`,
    [tid]
  );
  const recentDenials = selectAll(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at FROM audit_logs al
     WHERE al.tenant_id = ? AND al.action LIKE 'DENIED%' AND al.created_at >= datetime('now','-7 days') ORDER BY al.created_at DESC LIMIT 20`,
    [tid]
  );
  const openOfflineBatches = selectAll(
    `SELECT ob.id, ob.batch_key, ob.status, ob.conflict_count, ob.action_count, ob.created_at
     FROM offline_batches ob WHERE ob.tenant_id = ? AND ob.status IN ('CAPTURED','UPLOADED','VALIDATING','REVIEW_PENDING') ORDER BY ob.created_at ASC LIMIT 20`,
    [tid]
  );
  const stalePurchaseRequests = selectAll(
    `SELECT pr.id, pr.pr_no, pr.status, pr.created_at FROM purchase_requests pr
     WHERE pr.tenant_id = ? AND pr.status IN ('DRAFT','PENDING_APPROVAL') AND pr.created_at <= datetime('now','-3 days') ORDER BY pr.created_at ASC LIMIT 20`,
    [tid]
  );
  return {
    lowStockItems, stockoutItems, openRequests, openWarehouseTasks,
    openConflicts, untrustedDevices, exportErrors, recentDenials,
    openOfflineBatches, stalePurchaseRequests,
    canViewRestricted, scope, tenantId: tid
  };
}

function createAiRunLog(context, { agent_key, run_type = 'GENERATE', status, provider = 'SYSTEM', model = '', input_record_count = 0, output_record_count = 0, failure_reason = '' }) {
  const id = newId('airun');
  const now = nowIso();
  insert('ai_run_logs', {
    id, tenant_id: context.tenant.id, agent_key, run_type, status, provider, model,
    prompt_hash: '', input_record_count, output_record_count,
    token_input_count: 0, token_output_count: 0, estimated_cost: 0.0,
    failure_reason, started_at: now, completed_at: now,
    created_by_user_id: context.user.id, created_at: now
  });
  return id;
}

function createAiRecommendation(context, { agent_key, category, title, summary, severity = 'INFO', confidence = 0.85, recommended_action_label = '', action_available = false, required_permission = '' }) {
  const id = newId('airec');
  const now = nowIso();
  insert('ai_recommendations', {
    id, tenant_id: context.tenant.id, agent_key,
    subject_type: category, subject_id: id,
    category, title, severity, confidence, status: 'OPEN',
    recommendation_json: JSON.stringify({ title, summary, category, severity, recommended_action_label }),
    human_summary: summary,
    recommended_action_label, action_available: action_available ? 1 : 0,
    required_permission, facility_id: null, department_id: null,
    expires_at: null, dismissed_at: null, dismissed_by_user_id: null,
    created_by_user_id: context.user.id, created_at: now,
    updated_at: now, updated_by_user_id: context.user.id
  });
  return id;
}

function linkAiRecommendationSources(context, recommendationId, sources) {
  const now = nowIso();
  for (const src of sources) {
    insert('ai_recommendation_sources', {
      id: newId('airsrc'), tenant_id: context.tenant.id,
      ai_recommendation_id: recommendationId,
      source_type: src.entity_type || src.source_type || 'UNKNOWN',
      source_id: src.entity_id || src.source_id || '',
      source_label: src.label || src.source_label || '',
      source_snapshot_json: JSON.stringify(src.snapshot || {}),
      created_at: now
    });
  }
}

export function listAiSummary(context) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'view_ai_summary');
  ensureTenantUser(context, context.tenant.id);
  const tid = context.tenant.id;
  const open = selectOne("SELECT COUNT(*) AS c FROM ai_recommendations WHERE tenant_id = ? AND status = 'OPEN'", [tid])?.c ?? 0;
  const dismissed = selectOne("SELECT COUNT(*) AS c FROM ai_recommendations WHERE tenant_id = ? AND status = 'DISMISSED'", [tid])?.c ?? 0;
  const approvalPending = selectOne("SELECT COUNT(*) AS c FROM ai_recommendations WHERE tenant_id = ? AND status IN ('APPROVAL_REQUESTED','APPROVED_PLACEHOLDER')", [tid])?.c ?? 0;
  const totalRuns = selectOne('SELECT COUNT(*) AS c FROM ai_run_logs WHERE tenant_id = ?', [tid])?.c ?? 0;
  const lastRun = selectOne('SELECT created_at, agent_key, status FROM ai_run_logs WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1', [tid]);
  const categoryCounts = selectAll(
    "SELECT category, COUNT(*) AS count FROM ai_recommendations WHERE tenant_id = ? AND status = 'OPEN' GROUP BY category",
    [tid]
  );
  const providerStatus = 'NOT_CONFIGURED';
  return {
    open, dismissed, approvalPending, totalRuns, lastRun, categoryCounts,
    providerStatus, agents: AI_AGENTS.map((a) => ({ ...a, provider: 'NOT_CONFIGURED' }))
  };
}

export function listAiAgents() {
  return { agents: AI_AGENTS.map((a) => ({ ...a, provider: 'NOT_CONFIGURED', status: 'SYSTEM_GENERATED' })) };
}

export function listAiRecommendations(context, filters = {}) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'view_ai_recommendations');
  ensureTenantUser(context, context.tenant.id);
  const statusFilter = filters.status ? ' AND ar.status = ?' : '';
  const categoryFilter = filters.category ? ' AND ar.category = ?' : '';
  const agentFilter = filters.agent_key ? ' AND ar.agent_key = ?' : '';
  const params = [context.tenant.id,
    ...(filters.status ? [filters.status] : []),
    ...(filters.category ? [filters.category] : []),
    ...(filters.agent_key ? [filters.agent_key] : [])
  ];
  const recommendations = selectAll(
    `SELECT ar.* FROM ai_recommendations ar WHERE ar.tenant_id = ?${statusFilter}${categoryFilter}${agentFilter} ORDER BY ar.created_at DESC LIMIT 200`,
    params
  );
  return { recommendations };
}

export function generateAiRecommendations(context, body = {}) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'generate_ai_recommendations');
  ensureTenantUser(context, context.tenant.id);
  const scope = optionalString(body.scope, 'scope', { max: 64 }) ?? 'ALL';
  const agentKey = optionalString(body.agent_key, 'agent_key', { max: 64 }) ?? 'ALL';
  const now = nowIso();
  const tid = context.tenant.id;

  return transaction(() => {
    // Expire old OPEN recommendations older than 24h to keep queue fresh
    execute(
      "UPDATE ai_recommendations SET status = 'EXPIRED', updated_at = ? WHERE tenant_id = ? AND status = 'OPEN' AND created_at <= datetime('now','-24 hours')",
      [now, tid]
    );

    const aiCtx = buildPermissionAwareAiContext(context, scope);
    const created = [];

    // Inventory Agent rules
    if (agentKey === 'ALL' || agentKey === 'inventory_agent') {
      for (const item of aiCtx.stockoutItems) {
        const recId = createAiRecommendation(context, {
          agent_key: 'inventory_agent', category: 'STOCKOUT_RISK',
          title: `Stockout: ${item.name}`,
          summary: `Item ${item.sku} (${item.name}) has zero on-hand quantity. Immediate replenishment action required.`,
          severity: 'CRITICAL', confidence: 1.0,
          recommended_action_label: 'Create replenishment request',
          action_available: false, required_permission: 'create_purchase_request'
        });
        linkAiRecommendationSources(context, recId, [{ entity_type: 'item', entity_id: item.id, label: `${item.sku} · ${item.name}`, snapshot: { on_hand: item.on_hand, min_stock: item.min_stock } }]);
        created.push(recId);
      }
      for (const item of aiCtx.lowStockItems.filter((i) => i.on_hand > 0)) {
        const recId = createAiRecommendation(context, {
          agent_key: 'inventory_agent', category: 'LOW_STOCK',
          title: `Low stock: ${item.name}`,
          summary: `Item ${item.sku} has ${item.on_hand} on-hand vs minimum threshold of ${item.min_stock}. Consider replenishment.`,
          severity: 'HIGH', confidence: 1.0,
          recommended_action_label: 'Review stock levels',
          action_available: false, required_permission: 'view_inventory'
        });
        linkAiRecommendationSources(context, recId, [{ entity_type: 'item', entity_id: item.id, label: `${item.sku} · ${item.name}`, snapshot: { on_hand: item.on_hand, min_stock: item.min_stock } }]);
        created.push(recId);
      }
    }

    // Intake Agent rules
    if (agentKey === 'ALL' || agentKey === 'intake_agent') {
      const staleRequests = aiCtx.openRequests.filter((r) => {
        const ageMs = Date.now() - new Date(r.created_at).getTime();
        return r.status === 'SUBMITTED' && ageMs > 24 * 60 * 60 * 1000;
      });
      for (const req of staleRequests) {
        const recId = createAiRecommendation(context, {
          agent_key: 'intake_agent', category: 'REQUEST_DELAY',
          title: `Request delay: ${req.request_no}`,
          summary: `Request ${req.request_no} has been in SUBMITTED status for over 24 hours without supervisor approval.`,
          severity: 'MEDIUM', confidence: 0.9,
          recommended_action_label: 'Review request queue',
          action_available: false, required_permission: 'view_requests'
        });
        linkAiRecommendationSources(context, recId, [{ entity_type: 'internal_request', entity_id: req.id, label: req.request_no, snapshot: { status: req.status, priority: req.priority } }]);
        created.push(recId);
      }
      const delayedTasks = aiCtx.openWarehouseTasks.filter((t) => {
        const ageMs = Date.now() - new Date(t.created_at).getTime();
        return ageMs > 48 * 60 * 60 * 1000 && t.status !== 'CLOSED';
      });
      for (const task of delayedTasks.slice(0, 5)) {
        const recId = createAiRecommendation(context, {
          agent_key: 'intake_agent', category: 'WAREHOUSE_DELAY',
          title: `Warehouse task delay: ${task.task_no}`,
          summary: `Warehouse task ${task.task_no} has been open for over 48 hours. Current status: ${task.status}.`,
          severity: 'MEDIUM', confidence: 0.85,
          recommended_action_label: 'Review warehouse queue',
          action_available: false, required_permission: 'view_warehouse_tasks'
        });
        linkAiRecommendationSources(context, recId, [{ entity_type: 'warehouse_task', entity_id: task.id, label: task.task_no, snapshot: { status: task.status, priority: task.priority } }]);
        created.push(recId);
      }
    }

    // Procurement Agent rules
    if (agentKey === 'ALL' || agentKey === 'procurement_agent') {
      for (const pr of aiCtx.stalePurchaseRequests.slice(0, 5)) {
        const recId = createAiRecommendation(context, {
          agent_key: 'procurement_agent', category: 'PROCUREMENT_DELAY',
          title: `Stale purchase request: ${pr.pr_no}`,
          summary: `Purchase request ${pr.pr_no} has been in ${pr.status} for more than 3 days without progression.`,
          severity: 'MEDIUM', confidence: 0.9,
          recommended_action_label: 'Review purchase request',
          action_available: false, required_permission: 'view_purchasing'
        });
        linkAiRecommendationSources(context, recId, [{ entity_type: 'purchase_request', entity_id: pr.id, label: pr.pr_no, snapshot: { status: pr.status } }]);
        created.push(recId);
      }
    }

    // Export Agent rules
    if (agentKey === 'ALL' || agentKey === 'export_agent') {
      if (aiCtx.exportErrors.length > 0) {
        const recId = createAiRecommendation(context, {
          agent_key: 'export_agent', category: 'EXPORT_VALIDATION_RISK',
          title: `Export validation errors: ${aiCtx.exportErrors.length} unresolved`,
          summary: `There are ${aiCtx.exportErrors.length} unresolved export validation error(s) blocking FinanceSync export generation.`,
          severity: 'HIGH', confidence: 1.0,
          recommended_action_label: 'Review export errors',
          action_available: false, required_permission: 'view_export_errors'
        });
        linkAiRecommendationSources(context, recId, aiCtx.exportErrors.slice(0, 5).map((e) => ({ entity_type: 'export_validation_error', entity_id: e.id, label: e.field_path, snapshot: { error: e.error_message } })));
        created.push(recId);
      }
    }

    // Offline Reconciliation Agent rules
    if (agentKey === 'ALL' || agentKey === 'offline_reconciliation_agent') {
      if (aiCtx.openConflicts.length > 0) {
        const recId = createAiRecommendation(context, {
          agent_key: 'offline_reconciliation_agent', category: 'OFFLINE_CONFLICT_RISK',
          title: `Open offline conflicts: ${aiCtx.openConflicts.length}`,
          summary: `${aiCtx.openConflicts.length} offline sync conflict(s) are OPEN and blocking batch approval. Supervisor review required.`,
          severity: 'HIGH', confidence: 1.0,
          recommended_action_label: 'Review conflict queue',
          action_available: false, required_permission: 'view_sync_conflicts'
        });
        linkAiRecommendationSources(context, recId, aiCtx.openConflicts.slice(0, 5).map((c) => ({ entity_type: 'sync_conflict', entity_id: c.id, label: c.conflict_type, snapshot: { status: c.status, entity_type: c.entity_type } })));
        created.push(recId);
      }
      const revokedOrUntrusted = aiCtx.untrustedDevices.filter((d) => d.trust_state === 'REVOKED' || d.trust_state === 'UNTRUSTED');
      if (revokedOrUntrusted.length > 0) {
        const recId = createAiRecommendation(context, {
          agent_key: 'offline_reconciliation_agent', category: 'DEVICE_TRUST_RISK',
          title: `Device trust issues: ${revokedOrUntrusted.length} device(s)`,
          summary: `${revokedOrUntrusted.length} device(s) are in UNTRUSTED or REVOKED state. Review device registry before allowing offline operations.`,
          severity: 'MEDIUM', confidence: 0.95,
          recommended_action_label: 'Review device registry',
          action_available: false, required_permission: 'view_devices'
        });
        linkAiRecommendationSources(context, recId, revokedOrUntrusted.slice(0, 5).map((d) => ({ entity_type: 'device', entity_id: d.id, label: d.name, snapshot: { trust_state: d.trust_state } })));
        created.push(recId);
      }
    }

    // Audit Agent rules
    if (agentKey === 'ALL' || agentKey === 'audit_agent') {
      if (aiCtx.recentDenials.length >= 3) {
        const recId = createAiRecommendation(context, {
          agent_key: 'audit_agent', category: 'AUDIT_EXCEPTION',
          title: `Denied action spike: ${aiCtx.recentDenials.length} in 7 days`,
          summary: `${aiCtx.recentDenials.length} denied action event(s) in the last 7 days. Review audit trail for potential unauthorized access patterns.`,
          severity: 'HIGH', confidence: 0.9,
          recommended_action_label: 'Review audit log',
          action_available: false, required_permission: 'view_audit'
        });
        linkAiRecommendationSources(context, recId, aiCtx.recentDenials.slice(0, 5).map((a) => ({ entity_type: 'audit_log', entity_id: a.id, label: a.action, snapshot: { entity_type: a.entity_type, entity_id: a.entity_id } })));
        created.push(recId);
      }
    }

    // Log the generation run
    createAiRunLog(context, {
      agent_key: agentKey === 'ALL' ? 'system' : agentKey,
      run_type: 'GENERATE', status: 'COMPLETED',
      provider: 'SYSTEM_GENERATED',
      input_record_count: Object.values(aiCtx).filter(Array.isArray).reduce((s, a) => s + a.length, 0),
      output_record_count: created.length
    });

    insertAudit(context, { action: 'AI_RECOMMENDATIONS_GENERATED', entityType: 'ai_recommendations', entityId: '', summary: `Generated ${created.length} recommendation(s) via ${agentKey} agent(s)` });

    return { generated: created.length, recommendationIds: created, providerStatus: 'SYSTEM_GENERATED', label: 'SYSTEM_GENERATED' };
  });
}

export function getAiRecommendationDetail(context, recommendationId) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'view_ai_recommendations');
  ensureTenantUser(context, context.tenant.id);
  const rec = selectOne('SELECT * FROM ai_recommendations WHERE tenant_id = ? AND id = ?', [context.tenant.id, recommendationId]);
  if (!rec) throw fail('AI recommendation not found', 404);
  const sources = selectAll('SELECT * FROM ai_recommendation_sources WHERE tenant_id = ? AND ai_recommendation_id = ?', [context.tenant.id, recommendationId]);
  const approvals = selectAll('SELECT * FROM ai_approvals WHERE tenant_id = ? AND ai_recommendation_id = ?', [context.tenant.id, recommendationId]);
  return { recommendation: rec, sources, approvals };
}

export function dismissAiRecommendation(context, recommendationId, body = {}) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'dismiss_ai_recommendations');
  ensureTenantUser(context, context.tenant.id);
  const note = optionalString(body.note ?? body.reason, 'note', { max: 240 }) ?? '';
  return transaction(() => {
    const rec = selectOne('SELECT * FROM ai_recommendations WHERE tenant_id = ? AND id = ?', [context.tenant.id, recommendationId]);
    if (!rec) throw fail('AI recommendation not found', 404);
    if (rec.status === 'DISMISSED') throw fail('Recommendation is already dismissed', 409);
    const now = nowIso();
    execute(
      'UPDATE ai_recommendations SET status = ?, dismissed_at = ?, dismissed_by_user_id = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['DISMISSED', now, context.user.id, now, context.user.id, context.tenant.id, recommendationId]
    );
    insertAudit(context, { action: 'AI_RECOMMENDATION_DISMISSED', entityType: 'ai_recommendation', entityId: recommendationId, summary: `Recommendation ${rec.title} dismissed${note ? ': ' + note : ''}` });
    return { recommendation: selectOne('SELECT * FROM ai_recommendations WHERE id = ?', [recommendationId]) };
  });
}

export function approveAiRecommendationPlaceholder(context, recommendationId, body = {}) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'approve_ai_placeholder');
  ensureTenantUser(context, context.tenant.id);
  // This is explicitly a placeholder. It does NOT execute any domain action.
  const notes = optionalString(body.notes ?? body.note, 'notes', { max: 480 }) ?? '';
  return transaction(() => {
    const rec = selectOne('SELECT * FROM ai_recommendations WHERE tenant_id = ? AND id = ?', [context.tenant.id, recommendationId]);
    if (!rec) throw fail('AI recommendation not found', 404);
    if (['DISMISSED', 'EXPIRED'].includes(rec.status)) throw fail('Cannot approve a dismissed or expired recommendation', 409);
    const now = nowIso();
    execute(
      'UPDATE ai_recommendations SET status = ?, updated_at = ?, updated_by_user_id = ? WHERE tenant_id = ? AND id = ?',
      ['APPROVED_PLACEHOLDER', now, context.user.id, context.tenant.id, recommendationId]
    );
    insert('ai_approvals', {
      id: newId('aiapr'), tenant_id: context.tenant.id,
      ai_recommendation_id: recommendationId,
      approver_user_id: context.user.id,
      decision: 'APPROVED_PLACEHOLDER',
      reason: notes,
      approval_status: 'APPROVED_PLACEHOLDER',
      requested_action: rec.recommended_action_label || 'NONE',
      approved_at: now,
      notes,
      decided_at: now,
      created_at: now
    });
    insertAudit(context, { action: 'AI_PLACEHOLDER_APPROVED', entityType: 'ai_recommendation', entityId: recommendationId, summary: `Placeholder approval recorded for: ${rec.title}. No domain action executed.` });
    return {
      recommendation: selectOne('SELECT * FROM ai_recommendations WHERE id = ?', [recommendationId]),
      notice: 'PLACEHOLDER_ONLY — no domain action was executed'
    };
  });
}

export function listAiRuns(context, filters = {}) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'view_ai_runs');
  ensureTenantUser(context, context.tenant.id);
  const statusFilter = filters.status ? ' AND rl.status = ?' : '';
  const agentFilter = filters.agent_key ? ' AND rl.agent_key = ?' : '';
  const params = [context.tenant.id, ...(filters.status ? [filters.status] : []), ...(filters.agent_key ? [filters.agent_key] : [])];
  const runs = selectAll(
    `SELECT rl.* FROM ai_run_logs rl WHERE rl.tenant_id = ?${statusFilter}${agentFilter} ORDER BY rl.created_at DESC LIMIT 200`,
    params
  );
  return { runs };
}

export function getAiRunDetail(context, runId) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'view_ai_runs');
  ensureTenantUser(context, context.tenant.id);
  const run = selectOne('SELECT * FROM ai_run_logs WHERE tenant_id = ? AND id = ?', [context.tenant.id, runId]);
  if (!run) throw fail('AI run not found', 404);
  return run;
}

export function queryOpsCopilot(context, body = {}) {
  requireFeature(context, 'ask_opstrax_ai');
  requireCapability(context, 'query_ops_copilot');
  ensureTenantUser(context, context.tenant.id);
  const query = requireString(body.query, 'query', { max: 1000 });

  // No LLM provider is configured. Return honest NOT_CONFIGURED status
  // with deterministic safe response from tenant-scoped context only.
  const aiCtx = buildPermissionAwareAiContext(context, 'COPILOT');
  const lowStockCount = aiCtx.lowStockItems.length;
  const stockoutCount = aiCtx.stockoutItems.length;
  const conflictCount = aiCtx.openConflicts.length;
  const denialCount = aiCtx.recentDenials.length;
  const requestCount = aiCtx.openRequests.length;

  // Log the copilot query as a run
  createAiRunLog(context, {
    agent_key: 'ops_copilot', run_type: 'COPILOT_QUERY',
    status: 'BLOCKED_NOT_CONFIGURED', provider: 'NOT_CONFIGURED',
    input_record_count: 1, output_record_count: 0,
    failure_reason: 'No LLM provider configured'
  });
  insertAudit(context, { action: 'COPILOT_QUERY_SUBMITTED', entityType: 'copilot', entityId: '', summary: `Ops Copilot query submitted (provider: NOT_CONFIGURED)` });

  // Deterministic safe summary — clearly labeled SYSTEM_GENERATED, never LLM_GENERATED
  const summary = [
    stockoutCount > 0 ? `${stockoutCount} item(s) are at zero stock and need immediate replenishment.` : null,
    lowStockCount > 0 ? `${lowStockCount} item(s) are below minimum stock threshold.` : null,
    requestCount > 0 ? `${requestCount} internal request(s) are active (submitted/approved/picking).` : null,
    conflictCount > 0 ? `${conflictCount} offline sync conflict(s) are unresolved and blocking batch approval.` : null,
    denialCount > 0 ? `${denialCount} denied action(s) recorded in the last 7 days — review audit trail.` : null,
  ].filter(Boolean);

  return {
    providerStatus: 'NOT_CONFIGURED',
    responseType: 'SYSTEM_GENERATED',
    notice: 'No AI model provider is configured. This response is deterministic and rule-based, not LLM-generated.',
    query,
    answer: summary.length > 0
      ? summary.join(' ')
      : 'No operational issues detected in current tenant state based on available data.',
    sources: [
      { type: 'inventory', count: aiCtx.lowStockItems.length + aiCtx.stockoutItems.length },
      { type: 'requests', count: aiCtx.openRequests.length },
      { type: 'conflicts', count: aiCtx.openConflicts.length },
      { type: 'audit_denials', count: aiCtx.recentDenials.length }
    ]
  };
}

// ── Phase 3I: Inventory Optimization ─────────────────────────────────────────

function requireInvOptRead(context) {
  requireFeature(context, 'inventory_optimization');
  requireCapability(context, 'view_inventory_optimization');
}

function requireInvOptCycleCount(context) {
  requireFeature(context, 'inventory_optimization');
  requireCapability(context, 'manage_cycle_counts');
}

function requireInvOptVarianceApproval(context) {
  requireFeature(context, 'inventory_optimization');
  requireCapability(context, 'approve_variances');
}

function requireInvOptReplenishment(context) {
  requireFeature(context, 'inventory_optimization');
  requireCapability(context, 'manage_replenishment');
}

function requireInvOptClassification(context) {
  requireFeature(context, 'inventory_optimization');
  requireCapability(context, 'manage_classifications');
}

export function getInventoryOptimizationSummary(context) {
  requireInvOptRead(context);
  return getInvOptSummaryAction(context.tenant.id);
}

export function listInventoryCycleCountPlans(context, filters = {}) {
  requireInvOptRead(context);
  return listCycleCountPlansAction(context.tenant.id, filters);
}

export function createInventoryCycleCountPlan(context, body) {
  requireInvOptCycleCount(context);
  return createCycleCountPlanAction(context.tenant.id, context.user.id, body);
}

export function getInventoryCycleCountPlanDetail(context, planId) {
  requireInvOptRead(context);
  return getCycleCountPlanDetailAction(context.tenant.id, planId);
}

export function updateInventoryCycleCountPlan(context, planId, body) {
  requireInvOptCycleCount(context);
  return updateCycleCountPlanAction(context.tenant.id, context.user.id, planId, body);
}

export function scheduleInventoryCycleCountPlan(context, planId, body) {
  requireInvOptCycleCount(context);
  return scheduleCycleCountPlanAction(context.tenant.id, context.user.id, planId, body);
}

export function startInventoryCycleCountPlan(context, planId) {
  requireInvOptCycleCount(context);
  return startCycleCountPlanAction(context.tenant.id, context.user.id, planId);
}

export function cancelInventoryCycleCountPlan(context, planId, body) {
  requireInvOptCycleCount(context);
  return cancelCycleCountPlanAction(context.tenant.id, context.user.id, planId, body);
}

export function addInventoryCycleCountPlanLine(context, planId, body) {
  requireInvOptCycleCount(context);
  return addPlanLineAction(context.tenant.id, context.user.id, planId, body);
}

export function updateInventoryCycleCountPlanLine(context, planId, lineId, body) {
  requireInvOptCycleCount(context);
  return updatePlanLineAction(context.tenant.id, context.user.id, planId, lineId, body);
}

export function createInventoryCountSession(context, planId, body) {
  requireInvOptCycleCount(context);
  return createCountSessionAction(context.tenant.id, context.user.id, planId, body);
}

export function getInventoryCountSessionDetail(context, sessionId) {
  requireInvOptRead(context);
  return getCountSessionDetailAction(context.tenant.id, sessionId);
}

export function recordCountSessionLine(context, sessionId, body) {
  requireInvOptCycleCount(context);
  return countSessionLineAction(context.tenant.id, context.user.id, sessionId, body);
}

export function submitCountSessionForReview(context, sessionId, body) {
  requireInvOptCycleCount(context);
  return submitSessionForReviewAction(context.tenant.id, context.user.id, sessionId, body);
}

export function approveInventoryCountSession(context, sessionId, body) {
  requireInvOptVarianceApproval(context);
  return approveCountSessionAction(context.tenant.id, context.user.id, sessionId, body);
}

export function postInventoryCountSession(context, sessionId, body) {
  requireInvOptVarianceApproval(context);
  return postCountSessionAction(context.tenant.id, context.user.id, sessionId, body);
}

export function listInventoryVariances(context, filters = {}) {
  requireInvOptRead(context);
  return listVariancesAction(context.tenant.id, filters);
}

export function getInventoryVarianceDetail(context, varianceId) {
  requireInvOptRead(context);
  return getVarianceDetailAction(context.tenant.id, varianceId);
}

export function approveInventoryVariance(context, varianceId, body) {
  requireInvOptVarianceApproval(context);
  return approveVarianceAction(context.tenant.id, context.user.id, varianceId, body);
}

export function rejectInventoryVariance(context, varianceId, body) {
  requireInvOptVarianceApproval(context);
  return rejectVarianceAction(context.tenant.id, context.user.id, varianceId, body);
}

export function waiveInventoryVariance(context, varianceId, body) {
  requireInvOptVarianceApproval(context);
  return waiveVarianceAction(context.tenant.id, context.user.id, varianceId, body);
}

export function listInventoryReplenishmentRecommendations(context, filters = {}) {
  requireInvOptRead(context);
  return listRecommendationsAction(context.tenant.id, filters);
}

export function generateInventoryReplenishmentRecommendations(context, body = {}) {
  requireInvOptReplenishment(context);
  return generateRecommendationsAction(context.tenant.id, context.user.id, body);
}

export function approveInventoryRecommendation(context, recId, body) {
  requireInvOptReplenishment(context);
  return approveRecommendationAction(context.tenant.id, context.user.id, recId, body);
}

export function dismissInventoryRecommendation(context, recId, body) {
  requireInvOptReplenishment(context);
  return dismissRecommendationAction(context.tenant.id, context.user.id, recId, body);
}

export function convertInventoryRecommendationToRequest(context, recId, body) {
  requireInvOptReplenishment(context);
  return convertRecommendationToRequestAction(context.tenant.id, context.user.id, recId, body);
}

export function listInventoryClassifications(context, filters = {}) {
  requireInvOptRead(context);
  return listClassificationsAction(context.tenant.id, filters);
}

export function recalculateInventoryClassifications(context, body = {}) {
  requireInvOptClassification(context);
  return recalculateClassificationsAction(context.tenant.id, context.user.id, body);
}

// ── Phase 3J: Asset & Custody Center ─────────────────────────────────────────

function requireAssetCustodyRead(context) {
  requireFeature(context, 'asset_custody');
  requireCapability(context, 'view_asset_custody');
}

function requireAssetRegistry(context) {
  requireFeature(context, 'asset_custody');
  requireCapability(context, 'manage_asset_registry');
}

function requireAssetCustody(context) {
  requireFeature(context, 'asset_custody');
  requireCapability(context, 'manage_asset_custody');
}

function requireAssetDisposalApproval(context) {
  requireFeature(context, 'asset_custody');
  requireCapability(context, 'approve_asset_disposal');
}

function requireAssetMaintenance(context) {
  requireFeature(context, 'asset_custody');
  requireCapability(context, 'manage_asset_maintenance');
}

export function getAssetCustodySummary(context) {
  requireAssetCustodyRead(context);
  return getAssetCustodySummaryAction(context.tenant.id);
}

export function listAssets(context, filters = {}) {
  requireAssetCustodyRead(context);
  return listAssetsAction(context.tenant.id, filters);
}

export function createAsset(context, body) {
  requireAssetRegistry(context);
  return createAssetAction(context.tenant.id, context.user.id, body);
}

export function getAssetDetail(context, assetId) {
  requireAssetCustodyRead(context);
  return getAssetDetailAction(context.tenant.id, assetId);
}

export function updateAsset(context, assetId, body) {
  requireAssetRegistry(context);
  return updateAssetAction(context.tenant.id, context.user.id, assetId, body);
}

export function getAssetTimeline(context, assetId) {
  requireAssetCustodyRead(context);
  return getAssetTimelineAction(context.tenant.id, assetId);
}

export function assignAsset(context, assetId, body) {
  requireAssetCustody(context);
  return assignAssetAction(context.tenant.id, context.user.id, assetId, body);
}

export function createAssetTransferRequest(context, assetId, body) {
  requireAssetCustody(context);
  return createTransferRequestAction(context.tenant.id, context.user.id, assetId, body);
}

export function approveAssetTransferRequest(context, assetId, body) {
  requireAssetCustody(context);
  return approveTransferRequestAction(context.tenant.id, context.user.id, assetId, body);
}

export function createAssetReturnRequest(context, assetId, body) {
  requireAssetCustody(context);
  return createReturnRequestAction(context.tenant.id, context.user.id, assetId, body);
}

export function acceptAssetReturn(context, assetId, body) {
  requireAssetCustody(context);
  return acceptReturnAction(context.tenant.id, context.user.id, assetId, body);
}

export function createAssetConditionReport(context, assetId, body) {
  requireAssetCustody(context);
  return createConditionReportAction(context.tenant.id, context.user.id, assetId, body);
}

export function reportAssetDamage(context, assetId, body) {
  requireAssetCustody(context);
  return reportDamageAction(context.tenant.id, context.user.id, assetId, body);
}

export function reportAssetLoss(context, assetId, body) {
  requireAssetCustody(context);
  return reportLossAction(context.tenant.id, context.user.id, assetId, body);
}

export function quarantineAsset(context, assetId, body) {
  requireAssetCustody(context);
  return quarantineAssetAction(context.tenant.id, context.user.id, assetId, body);
}

export function releaseAssetQuarantine(context, assetId, body) {
  requireAssetCustody(context);
  return releaseQuarantineAction(context.tenant.id, context.user.id, assetId, body);
}

export function openAssetMaintenance(context, assetId, body) {
  requireAssetMaintenance(context);
  return openMaintenanceAction(context.tenant.id, context.user.id, assetId, body);
}

export function closeAssetMaintenance(context, caseId, body) {
  requireAssetMaintenance(context);
  return closeMaintenanceAction(context.tenant.id, context.user.id, caseId, body);
}

export function listAssetMaintenanceCases(context, filters = {}) {
  requireAssetCustodyRead(context);
  return listMaintenanceCasesAction(context.tenant.id, filters);
}

export function listAssetDisposalRequests(context, filters = {}) {
  requireAssetCustodyRead(context);
  return listDisposalRequestsAction(context.tenant.id, filters);
}

export function createAssetDisposalRequest(context, assetId, body) {
  requireAssetCustody(context);
  return createDisposalRequestAction(context.tenant.id, context.user.id, assetId, body);
}

export function approveAssetDisposalRequest(context, disposalId, body) {
  requireAssetDisposalApproval(context);
  return approveDisposalRequestAction(context.tenant.id, context.user.id, disposalId, body);
}

export function rejectAssetDisposalRequest(context, disposalId, body) {
  requireAssetDisposalApproval(context);
  return rejectDisposalRequestAction(context.tenant.id, context.user.id, disposalId, body);
}

export function postAssetDisposal(context, disposalId, body) {
  requireAssetDisposalApproval(context);
  return postDisposalAction(context.tenant.id, context.user.id, disposalId, body);
}

export function addAssetEvidence(context, assetId, body) {
  requireAssetCustody(context);
  return addAssetEvidenceAction(context.tenant.id, context.user.id, assetId, body);
}

export function getAssetEvidence(context, assetId) {
  requireAssetCustodyRead(context);
  return getAssetEvidenceAction(context.tenant.id, assetId);
}

export { requireCapability, capabilitySet };
