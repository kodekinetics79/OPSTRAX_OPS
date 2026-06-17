import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';
import { fail, requireEnum, requireString, asBool } from './validation.js';
import {
  createPlatformDemoSession,
  getPlatformAuthBootstrap,
  isDemoLoginEnabled as isTenantDemoLoginEnabled,
  logoutPlatformSession,
  readPlatformSession
} from './auth.js';
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

const PLATFORM_ROLE_CAPABILITIES = {
  PLATFORM_OWNER: new Set(['*']),
  PLATFORM_ADMIN: new Set([
    'VIEW_PLATFORM_SUMMARY',
    'VIEW_PLATFORM_TENANTS',
    'VIEW_PLATFORM_TENANT_DETAIL',
    'VIEW_PLATFORM_TENANT_USERS',
    'VIEW_PLATFORM_TENANT_MODULES',
    'VIEW_PLATFORM_TENANT_USAGE',
    'VIEW_PLATFORM_TENANT_HEALTH',
    'VIEW_PLATFORM_AUDIT_EVENTS',
    'VIEW_PLATFORM_SECURITY_EVENTS',
    'VIEW_PLATFORM_BILLING_EVENTS',
    'VIEW_PLATFORM_SUPPORT_SESSIONS',
    'MANAGE_PLATFORM_SUPPORT_SESSIONS',
    'MANAGE_PLATFORM_SUBSCRIPTION',
    'MANAGE_PLATFORM_ENTITLEMENTS',
    'MANAGE_PLATFORM_TENANT_STATUS',
    'VIEW_PLATFORM_SYSTEM_HEALTH',
    'VIEW_PLATFORM_REPORTS',
    'RUN_PLATFORM_REPORTS'
  ]),
  PLATFORM_SUPPORT: new Set([
    'VIEW_PLATFORM_SUMMARY',
    'VIEW_PLATFORM_TENANTS',
    'VIEW_PLATFORM_TENANT_DETAIL',
    'VIEW_PLATFORM_TENANT_USERS',
    'VIEW_PLATFORM_TENANT_MODULES',
    'VIEW_PLATFORM_TENANT_USAGE',
    'VIEW_PLATFORM_TENANT_HEALTH',
    'VIEW_PLATFORM_AUDIT_EVENTS',
    'VIEW_PLATFORM_SECURITY_EVENTS',
    'VIEW_PLATFORM_SUPPORT_SESSIONS',
    'MANAGE_PLATFORM_SUPPORT_SESSIONS',
    'VIEW_PLATFORM_REPORTS',
    'RUN_PLATFORM_REPORTS'
  ]),
  PLATFORM_BILLING: new Set([
    'VIEW_PLATFORM_SUMMARY',
    'VIEW_PLATFORM_TENANTS',
    'VIEW_PLATFORM_TENANT_DETAIL',
    'VIEW_PLATFORM_TENANT_USAGE',
    'VIEW_PLATFORM_TENANT_HEALTH',
    'VIEW_PLATFORM_BILLING_EVENTS',
    'MANAGE_PLATFORM_SUBSCRIPTION',
    'VIEW_PLATFORM_REPORTS'
  ]),
  PLATFORM_SECURITY: new Set([
    'VIEW_PLATFORM_SUMMARY',
    'VIEW_PLATFORM_TENANTS',
    'VIEW_PLATFORM_TENANT_DETAIL',
    'VIEW_PLATFORM_TENANT_HEALTH',
    'VIEW_PLATFORM_AUDIT_EVENTS',
    'VIEW_PLATFORM_SECURITY_EVENTS',
    'MANAGE_PLATFORM_TENANT_STATUS',
    'VIEW_PLATFORM_REPORTS',
    'RUN_PLATFORM_REPORTS'
  ]),
  PLATFORM_AUDITOR: new Set([
    'VIEW_PLATFORM_SUMMARY',
    'VIEW_PLATFORM_TENANTS',
    'VIEW_PLATFORM_TENANT_DETAIL',
    'VIEW_PLATFORM_TENANT_USERS',
    'VIEW_PLATFORM_TENANT_MODULES',
    'VIEW_PLATFORM_TENANT_USAGE',
    'VIEW_PLATFORM_TENANT_HEALTH',
    'VIEW_PLATFORM_AUDIT_EVENTS',
    'VIEW_PLATFORM_SECURITY_EVENTS',
    'VIEW_PLATFORM_BILLING_EVENTS',
    'VIEW_PLATFORM_SUPPORT_SESSIONS',
    'VIEW_PLATFORM_SYSTEM_HEALTH',
    'VIEW_PLATFORM_REPORTS'
  ])
};

const PLATFORM_PLAN_CODES = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'GOVERNMENT', 'CUSTOM'];
const PLATFORM_SUPPORT_STATUSES = ['REQUESTED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'DENIED'];
const PLATFORM_SUBSCRIPTION_STATUSES = ['ACTIVE', 'SUSPENDED', 'RESTRICTED'];
const PLATFORM_PLAN_NAME_BY_CODE = {
  STARTER: 'Starter Restricted Ops Plan',
  PROFESSIONAL: 'Professional Workspace Plan',
  ENTERPRISE: 'Enterprise Logistics Plan',
  GOVERNMENT: 'Government Control Plane',
  CUSTOM: 'Custom Commercial Plan'
};

function platformUserCapabilities(roleKey) {
  if (roleKey === 'PLATFORM_OWNER') return new Set(['*']);
  return PLATFORM_ROLE_CAPABILITIES[roleKey] || new Set();
}

function platformFail(message, status = 400) {
  return fail(message, status);
}

function platformSessionUser(session) {
  if (!session) return null;
  return {
    id: session.platform_user_id,
    name: session.user_name,
    email: session.user_email,
    role_key: session.role_key,
    active: 1
  };
}

export function isPlatformDemoLoginEnabled() {
  return isTenantDemoLoginEnabled();
}

export function getPlatformBootstrap() {
  return getPlatformAuthBootstrap();
}

export function createPlatformWorkspaceSession(headers, payload = {}) {
  return createPlatformDemoSession(headers, payload);
}

export function endPlatformWorkspaceSession(headers) {
  return logoutPlatformSession(headers);
}

export function resolvePlatformContext(headers, query = {}) {
  const session = readPlatformSession(headers);
  if (!session) {
    const error = platformFail('Platform authentication required', 401);
    error.loginUrl = '/platform/login';
    error.platformSurface = true;
    throw error;
  }
  const user = platformSessionUser(session);
  return { platformUser: user, user, session, requestId: query.requestId || '' };
}

function requirePlatformRole(context, allowedRoles) {
  if (!context?.platformUser?.role_key) throw platformFail('Platform authentication required', 401);
  if (allowedRoles.includes(context.platformUser.role_key) || context.platformUser.role_key === 'PLATFORM_OWNER') return;
  throw platformFail('Missing platform capability', 403);
}

function insertPlatformAudit(context, payload) {
  insert('platform_audit_events', {
    id: newId('platform_audit'),
    platform_user_id: context?.platformUser?.id ?? null,
    tenant_id: payload.tenantId ?? null,
    actor_role: context?.platformUser?.role_key || 'UNAUTHENTICATED',
    action: payload.action,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    summary: payload.summary,
    details_json: JSON.stringify(payload.details ?? {}),
    request_id: payload.requestId ?? context?.requestId ?? '',
    created_at: nowIso()
  });
}

function insertPlatformSecurityEvent(context, payload) {
  insert('platform_security_events', {
    id: newId('platform_security'),
    platform_user_id: context?.platformUser?.id ?? null,
    tenant_id: payload.tenantId ?? null,
    event_type: payload.eventType,
    severity: payload.severity || 'INFO',
    status: payload.status || 'RECORDED',
    summary: payload.summary,
    details_json: JSON.stringify(payload.details ?? {}),
    created_at: nowIso(),
    updated_at: nowIso()
  });
}

function insertPlatformBillingEvent(context, payload) {
  insert('platform_billing_events', {
    id: newId('platform_billing'),
    platform_user_id: context?.platformUser?.id ?? null,
    tenant_id: payload.tenantId ?? null,
    event_type: payload.eventType,
    status: payload.status || 'RECORDED',
    amount_cents: payload.amountCents || 0,
    currency: payload.currency || 'USD',
    summary: payload.summary,
    details_json: JSON.stringify(payload.details ?? {}),
    created_at: nowIso(),
    updated_at: nowIso()
  });
}

function requireTenant(tenantId) {
  const tenant = selectOne('SELECT id, name, slug, industry, status, tier FROM tenants WHERE id = ?', [tenantId]);
  if (!tenant) throw platformFail('Tenant not found', 404);
  return tenant;
}

function planNameForCode(planCode) {
  return PLATFORM_PLAN_NAME_BY_CODE[planCode] || 'Custom Commercial Plan';
}

function normalizePlanCode(value, fallback = 'CUSTOM') {
  const planCode = String(value || fallback).toUpperCase();
  return requireEnum(planCode, 'plan_code', PLATFORM_PLAN_CODES);
}

function normalizeSupportSessionStatus(value, fallback = 'REQUESTED') {
  const status = String(value || fallback).toUpperCase();
  return requireEnum(status, 'status', PLATFORM_SUPPORT_STATUSES);
}

function getSubscription(tenantId) {
  return selectOne(
    `SELECT s.*, p.plan_code, p.plan_name, p.billing_cycle, p.module_limit_json, p.effective_at AS plan_effective_at, p.expires_at AS plan_expires_at
     FROM tenant_subscriptions s
     JOIN tenant_plans p ON p.id = s.plan_id
     WHERE s.tenant_id = ?
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [tenantId]
  );
}

function getLatestUsage(tenantId) {
  return selectOne(
    'SELECT * FROM tenant_usage_snapshots WHERE tenant_id = ? ORDER BY snapshot_date DESC, created_at DESC LIMIT 1',
    [tenantId]
  );
}

function getLatestHealth(tenantId) {
  return selectOne(
    'SELECT * FROM tenant_health_snapshots WHERE tenant_id = ? ORDER BY snapshot_date DESC, created_at DESC LIMIT 1',
    [tenantId]
  );
}

function listEntitlements(tenantId) {
  return selectAll(
    'SELECT * FROM tenant_feature_entitlements WHERE tenant_id = ? ORDER BY feature_key',
    [tenantId]
  );
}

function listUsers(tenantId) {
  return selectAll(
    'SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? ORDER BY name',
    [tenantId]
  );
}

function listPlatformTenantsInternal() {
  return selectAll(
    `SELECT
       t.id,
       t.name,
       t.slug,
       t.industry,
       t.status AS tenant_status,
       t.tier,
       p.plan_code,
       p.plan_name,
       p.status AS plan_status,
       s.status AS subscription_status,
       s.seat_limit,
       s.consumed_seats,
       s.reserved_seats,
       s.renewal_at,
       u.active_users,
       u.active_devices,
       u.api_requests,
       u.open_work_items,
       u.storage_mb,
       u.export_batches,
       u.offline_batches,
       h.auth_status,
       h.storage_status,
       h.integration_status,
       h.audit_status,
       h.support_status,
       h.note AS health_note,
       (
         SELECT COUNT(*)
         FROM tenant_feature_entitlements e
         WHERE e.tenant_id = t.id AND e.entitlement_status = 'ENABLED'
       ) AS active_modules,
       (
         SELECT COUNT(*)
         FROM users usr
         WHERE usr.tenant_id = t.id AND usr.active = 1
       ) AS active_users_count,
       (
         SELECT COUNT(*)
         FROM platform_support_sessions ss
         WHERE ss.tenant_id = t.id AND ss.status IN ('REQUESTED', 'ACTIVE')
       ) AS open_support_sessions
     FROM tenants t
     LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
     LEFT JOIN tenant_plans p ON p.id = s.plan_id
     LEFT JOIN tenant_usage_snapshots u ON u.tenant_id = t.id AND u.snapshot_date = (SELECT MAX(snapshot_date) FROM tenant_usage_snapshots WHERE tenant_id = t.id)
     LEFT JOIN tenant_health_snapshots h ON h.tenant_id = t.id AND h.snapshot_date = (SELECT MAX(snapshot_date) FROM tenant_health_snapshots WHERE tenant_id = t.id)
     ORDER BY t.name`
  );
}

export function getPlatformSummary(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  const tenants = listPlatformTenantsInternal();
  const subscriptions = tenants.filter((row) => row.subscription_status === 'ACTIVE' || row.subscription_status === 'RESTRICTED');
  const restricted = tenants.filter((row) => row.tier === 'restricted');
  const requestedSupport = selectAll("SELECT COUNT(*) AS count FROM platform_support_sessions WHERE status = 'REQUESTED'")[0]?.count || 0;
  const activeSupport = selectAll("SELECT COUNT(*) AS count FROM platform_support_sessions WHERE status = 'ACTIVE'")[0]?.count || 0;
  const expiredSupport = selectAll("SELECT COUNT(*) AS count FROM platform_support_sessions WHERE status = 'EXPIRED'")[0]?.count || 0;
  const revokedSupport = selectAll("SELECT COUNT(*) AS count FROM platform_support_sessions WHERE status = 'REVOKED'")[0]?.count || 0;
  const deniedSupport = selectAll("SELECT COUNT(*) AS count FROM platform_support_sessions WHERE status = 'DENIED'")[0]?.count || 0;
  const openSecurity = selectAll("SELECT COUNT(*) AS count FROM platform_security_events WHERE status = 'RECORDED'")[0]?.count || 0;
  const billingEvents = selectAll("SELECT COUNT(*) AS count FROM platform_billing_events WHERE status = 'RECORDED'")[0]?.count || 0;
  const healthyTenants = tenants.filter((row) => row.auth_status !== 'CONFIGURATION_REQUIRED' && row.storage_status !== 'CONFIGURATION_REQUIRED' && row.integration_status !== 'RESTRICTED').length;
  return {
    summary: {
      totalTenants: tenants.length,
      activeTenants: subscriptions.length,
      restrictedTenants: restricted.length,
      requestedSupportSessions: requestedSupport,
      activeSupportSessions: activeSupport,
      expiredSupportSessions: expiredSupport,
      revokedSupportSessions: revokedSupport,
      deniedSupportSessions: deniedSupport,
      openSupportSessions: requestedSupport + activeSupport,
      securityEvents: openSecurity,
      billingEvents,
      auditEvents: selectAll('SELECT COUNT(*) AS count FROM platform_audit_events')[0]?.count || 0,
      healthyTenants,
      totalModules: tenants.reduce((sum, row) => sum + Number(row.active_modules || 0), 0),
      planTiers: tenants.reduce((acc, row) => {
        const key = String(row.plan_code || row.plan_name || 'CUSTOM').toUpperCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    }
  };
}

export function listPlatformTenants(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  return listPlatformTenantsInternal().map((row) => ({
    ...row,
    active_modules: Number(row.active_modules || 0),
    active_users_count: Number(row.active_users_count || 0),
    open_support_sessions: Number(row.open_support_sessions || 0)
  }));
}

export function getPlatformTenantDetail(context, tenantId) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  const tenant = requireTenant(tenantId);
  const subscription = getSubscription(tenantId);
  const usage = getLatestUsage(tenantId);
  const health = getLatestHealth(tenantId);
  return {
    tenant,
    subscription,
    usage,
    health,
    plan: subscription ? {
      id: subscription.plan_id,
      plan_code: subscription.plan_code,
      plan_name: subscription.plan_name,
      billing_cycle: subscription.billing_cycle,
      module_limit_json: subscription.module_limit_json,
      status: subscription.plan_status,
      effective_at: subscription.plan_effective_at,
      expires_at: subscription.plan_expires_at
    } : null
  };
}

export function getPlatformTenantUsers(context, tenantId) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_AUDITOR']);
  requireTenant(tenantId);
  return { users: listUsers(tenantId) };
}

export function getPlatformTenantModules(context, tenantId) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_AUDITOR']);
  requireTenant(tenantId);
  const entitlements = listEntitlements(tenantId);
  return {
    tenant: requireTenant(tenantId),
    entitlements,
    enabledCount: entitlements.filter((row) => row.entitlement_status === 'ENABLED').length,
    disabledCount: entitlements.filter((row) => row.entitlement_status !== 'ENABLED').length
  };
}

export function getPlatformTenantUsage(context, tenantId) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING', 'PLATFORM_AUDITOR']);
  requireTenant(tenantId);
  return {
    tenant: requireTenant(tenantId),
    usage: getLatestUsage(tenantId),
    history: selectAll(
      'SELECT * FROM tenant_usage_snapshots WHERE tenant_id = ? ORDER BY snapshot_date DESC, created_at DESC LIMIT 6',
      [tenantId]
    )
  };
}

export function getPlatformTenantHealth(context, tenantId) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  requireTenant(tenantId);
  return {
    tenant: requireTenant(tenantId),
    health: getLatestHealth(tenantId),
    history: selectAll(
      'SELECT * FROM tenant_health_snapshots WHERE tenant_id = ? ORDER BY snapshot_date DESC, created_at DESC LIMIT 6',
      [tenantId]
    )
  };
}

export function listPlatformAuditEvents(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_AUDITOR']);
  return { events: selectAll('SELECT * FROM platform_audit_events ORDER BY created_at DESC LIMIT 200') };
}

export function listPlatformSecurityEvents(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  return { events: selectAll('SELECT * FROM platform_security_events ORDER BY created_at DESC LIMIT 200') };
}

export function listPlatformBillingEvents(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_BILLING', 'PLATFORM_AUDITOR']);
  return { events: selectAll('SELECT * FROM platform_billing_events ORDER BY created_at DESC LIMIT 200') };
}

export function listPlatformSupportSessions(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_AUDITOR']);
  return {
    sessions: selectAll(
      `SELECT ss.*, t.name AS tenant_name, t.slug AS tenant_slug, u.name AS subject_user_name
       FROM platform_support_sessions ss
       JOIN tenants t ON t.id = ss.tenant_id
       LEFT JOIN users u ON u.id = ss.subject_user_id
       ORDER BY ss.created_at DESC`
    )
  };
}

export function updatePlatformTenantPlan(context, tenantId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_BILLING']);
  const tenant = requireTenant(tenantId);
  const subscription = getSubscription(tenant.id);
  if (!subscription) throw platformFail('Tenant subscription not found', 404);
  const currentPlan = selectOne('SELECT * FROM tenant_plans WHERE id = ?', [subscription.plan_id]);
  if (!currentPlan) throw platformFail('Tenant plan not found', 404);
  const planCode = normalizePlanCode(body.plan_code || body.planCode || currentPlan.plan_code);
  const planName = requireString(body.plan_name || body.planName || planNameForCode(planCode), 'plan_name', { min: 3, max: 120 });
  const billingCycle = requireEnum(String(body.billing_cycle || body.billingCycle || currentPlan.billing_cycle || 'MONTHLY').toUpperCase(), 'billing_cycle', ['MONTHLY', 'QUARTERLY', 'ANNUAL']);
  const seatLimit = body.seat_limit !== undefined || body.seatLimit !== undefined
    ? Number(body.seat_limit ?? body.seatLimit)
    : currentPlan.seat_limit;
  if (!Number.isInteger(seatLimit) || seatLimit < 0) throw platformFail('seat_limit must be a non-negative integer');
  const moduleLimitJson = body.module_limit_json || body.moduleLimitJson || currentPlan.module_limit_json || '{}';
  const moduleLimitValue = typeof moduleLimitJson === 'string' ? moduleLimitJson : JSON.stringify(moduleLimitJson);
  const status = body.status ? requireEnum(String(body.status).toUpperCase(), 'status', ['ACTIVE', 'RETIRED', 'SUSPENDED']) : currentPlan.status;
  const effectiveAt = body.effective_at || body.effectiveAt || currentPlan.effective_at || nowIso();
  const expiresAt = body.expires_at || body.expiresAt || currentPlan.expires_at || null;
  const subscriptionStatus = body.subscription_status || body.subscriptionStatus
    ? requireEnum(String(body.subscription_status || body.subscriptionStatus).toUpperCase(), 'subscription_status', PLATFORM_SUBSCRIPTION_STATUSES)
    : subscription.status;
  transaction(() => {
    execute(
      'UPDATE tenant_plans SET plan_code = ?, plan_name = ?, billing_cycle = ?, seat_limit = ?, module_limit_json = ?, status = ?, effective_at = ?, expires_at = ?, updated_at = ? WHERE id = ?',
      [planCode, planName, billingCycle, seatLimit, moduleLimitValue, status, effectiveAt, expiresAt, nowIso(), currentPlan.id]
    );
    execute(
      'UPDATE tenant_subscriptions SET status = ?, seat_limit = ?, updated_at = ? WHERE id = ?',
      [subscriptionStatus, seatLimit, nowIso(), subscription.id]
    );
    insertPlatformAudit(context, {
      action: 'UPDATE_PLATFORM_PLAN',
      entityType: 'tenant_plan',
      entityId: currentPlan.id,
      tenantId: tenant.id,
      summary: `${tenant.name} plan updated`,
      details: {
        plan_code: planCode,
        plan_name: planName,
        billing_cycle: billingCycle,
        seat_limit: seatLimit,
        subscription_status: subscriptionStatus
      }
    });
    insertPlatformBillingEvent(context, {
      eventType: 'PLAN_UPDATED',
      tenantId: tenant.id,
      summary: `${tenant.name} plan updated`,
      details: { plan_code: planCode, seat_limit: seatLimit, billing_cycle: billingCycle }
    });
  });
  return {
    tenant: requireTenant(tenant.id),
    plan: selectOne('SELECT * FROM tenant_plans WHERE id = ?', [currentPlan.id]),
    subscription: getSubscription(tenant.id)
  };
}

export function endPlatformSupportSession(context, sessionId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT']);
  const session = selectOne(
    `SELECT ss.*, t.name AS tenant_name, t.slug AS tenant_slug
     FROM platform_support_sessions ss
     JOIN tenants t ON t.id = ss.tenant_id
     WHERE ss.id = ?`,
    [sessionId]
  );
  if (!session) throw platformFail('Support session not found', 404);
  if (!['REQUESTED', 'ACTIVE'].includes(session.status)) throw platformFail('Support session is already closed', 409);
  const status = normalizeSupportSessionStatus(body.status || 'EXPIRED');
  if (!['EXPIRED', 'REVOKED', 'DENIED'].includes(status)) throw platformFail('Support session end status must be EXPIRED, REVOKED, or DENIED');
  const summary = requireString(body.summary || session.summary || 'Support session closed', 'summary', { min: 3, max: 255 });
  const reason = requireString(body.reason || session.reason || 'Support session ended', 'reason', { min: 3, max: 255 });
  transaction(() => {
    execute(
      'UPDATE platform_support_sessions SET status = ?, summary = ?, reason = ?, closed_at = ?, updated_at = ? WHERE id = ?',
      [status, summary, reason, nowIso(), nowIso(), session.id]
    );
    insertPlatformSecurityEvent(context, {
      eventType: `SUPPORT_SESSION_${status}`,
      severity: status === 'DENIED' || status === 'REVOKED' ? 'HIGH' : 'INFO',
      tenantId: session.tenant_id,
      summary: `${session.tenant_name} support session ${status.toLowerCase()}`,
      details: { session_id: session.id, reason, summary }
    });
    insertPlatformAudit(context, {
      action: 'END_PLATFORM_SUPPORT_SESSION',
      entityType: 'platform_support_session',
      entityId: session.id,
      tenantId: session.tenant_id,
      summary: `${session.tenant_name} support session ${status.toLowerCase()}`,
      details: { status, reason, summary }
    });
  });
  return {
    session: selectOne(
      `SELECT ss.*, t.name AS tenant_name, t.slug AS tenant_slug, u.name AS subject_user_name
       FROM platform_support_sessions ss
       JOIN tenants t ON t.id = ss.tenant_id
       LEFT JOIN users u ON u.id = ss.subject_user_id
       WHERE ss.id = ?`,
      [sessionId]
    )
  };
}

export function createPlatformSupportSession(context, tenantId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT']);
  const tenant = requireTenant(tenantId);
  const reason = requireString(body.reason ?? body.summary ?? '', 'reason', { min: 3, max: 255 });
  const summary = requireString(body.summary ?? reason, 'summary', { min: 3, max: 255 });
  const subjectUserId = body.subject_user_id || body.subjectUserId || '';
  if (subjectUserId) {
    const user = selectOne('SELECT id, tenant_id, name FROM users WHERE tenant_id = ? AND id = ?', [tenant.id, subjectUserId]);
    if (!user) throw platformFail('Subject user not found for tenant', 404);
  }
  const session = {
    id: newId('platform_support'),
    platform_user_id: context.platformUser.id,
    tenant_id: tenant.id,
    subject_user_id: subjectUserId || null,
    session_type: requireEnum((body.session_type || body.sessionType || 'ADVISORY').toString().toUpperCase(), 'session_type', ['ADVISORY', 'AUDIT', 'BILLING', 'SECURITY']),
    status: normalizeSupportSessionStatus(body.status || 'REQUESTED'),
    reason,
    summary,
    evidence_required: body.evidence_required !== undefined || body.evidenceRequired !== undefined
      ? (asBool(body.evidence_required ?? body.evidenceRequired) ? 1 : 0)
      : 1,
    opened_at: nowIso(),
    closed_at: null,
    expires_at: body.expires_at || body.expiresAt || null,
    created_at: nowIso(),
    updated_at: nowIso()
  };
  transaction(() => {
    insert('platform_support_sessions', session);
    insertPlatformAudit(context, {
      action: 'CREATE_PLATFORM_SUPPORT_SESSION',
      entityType: 'platform_support_session',
      entityId: session.id,
      tenantId: tenant.id,
      summary: `${tenant.name} support session opened`,
      details: { reason, session_type: session.session_type }
    });
  });
  return { session };
}

export function updatePlatformTenantSubscription(context, tenantId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_BILLING']);
  const tenant = requireTenant(tenantId);
  const subscription = getSubscription(tenant.id);
  if (!subscription) throw platformFail('Tenant subscription not found', 404);
  const status = body.status ? requireEnum(String(body.status).toUpperCase(), 'status', ['ACTIVE', 'SUSPENDED', 'RESTRICTED']) : subscription.status;
  const seatLimit = body.seat_limit !== undefined || body.seatLimit !== undefined
    ? Number(body.seat_limit ?? body.seatLimit)
    : subscription.seat_limit;
  if (!Number.isInteger(seatLimit) || seatLimit < 0) throw platformFail('seat_limit must be a non-negative integer');
  const renewalAt = body.renewal_at || body.renewalAt || subscription.renewal_at || null;
  const suspensionReason = body.suspension_reason || body.suspensionReason || subscription.suspension_reason || '';
  transaction(() => {
    execute(
      'UPDATE tenant_subscriptions SET status = ?, seat_limit = ?, renewal_at = ?, suspension_reason = ?, updated_at = ? WHERE id = ?',
      [status, seatLimit, renewalAt, suspensionReason, nowIso(), subscription.id]
    );
    insertPlatformAudit(context, {
      action: 'UPDATE_PLATFORM_SUBSCRIPTION',
      entityType: 'tenant_subscription',
      entityId: subscription.id,
      tenantId: tenant.id,
      summary: `${tenant.name} subscription updated`,
      details: { status, seat_limit: seatLimit, renewal_at: renewalAt }
    });
    insertPlatformBillingEvent(context, {
      eventType: 'SUBSCRIPTION_UPDATED',
      tenantId: tenant.id,
      summary: `${tenant.name} subscription updated`,
      details: { status, seat_limit: seatLimit, renewal_at: renewalAt }
    });
  });
  return { subscription: getSubscription(tenant.id) };
}

export function updatePlatformTenantEntitlements(context, tenantId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN']);
  const tenant = requireTenant(tenantId);
  const updates = Array.isArray(body.entitlements) ? body.entitlements : [];
  if (!updates.length) throw platformFail('entitlements must be a non-empty array');
  transaction(() => {
    for (const entry of updates) {
      const featureKey = requireString(entry.feature_key || entry.featureKey || '', 'feature_key', { min: 1, max: 120 });
      const status = requireEnum(String(entry.entitlement_status || entry.status || 'ENABLED').toUpperCase(), 'entitlement_status', ['ENABLED', 'DISABLED', 'ROADMAP']);
      const existing = selectOne('SELECT * FROM tenant_feature_entitlements WHERE tenant_id = ? AND feature_key = ?', [tenant.id, featureKey]);
      if (!existing) {
        insert('tenant_feature_entitlements', {
          id: newId('entitlement'),
          tenant_id: tenant.id,
          feature_key: featureKey,
          entitlement_status: status,
          source: 'PLATFORM_OVERRIDE',
          notes: requireString(entry.notes || 'Platform entitlement update', 'notes', { min: 3, max: 255 }),
          created_at: nowIso(),
          updated_at: nowIso()
        });
      } else {
        execute(
          'UPDATE tenant_feature_entitlements SET entitlement_status = ?, source = ?, notes = ?, updated_at = ? WHERE id = ?',
          [status, 'PLATFORM_OVERRIDE', requireString(entry.notes || existing.notes || 'Platform entitlement update', 'notes', { min: 3, max: 255 }), nowIso(), existing.id]
        );
      }
    }
    insertPlatformAudit(context, {
      action: 'UPDATE_PLATFORM_ENTITLEMENTS',
      entityType: 'tenant_feature_entitlement',
      entityId: tenant.id,
      tenantId: tenant.id,
      summary: `${tenant.name} feature entitlements updated`,
      details: { count: updates.length }
    });
  });
  return { tenant: requireTenant(tenant.id), entitlements: listEntitlements(tenant.id) };
}

export function suspendPlatformTenant(context, tenantId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SECURITY']);
  const tenant = requireTenant(tenantId);
  const subscription = getSubscription(tenant.id);
  if (!subscription) throw platformFail('Tenant subscription not found', 404);
  const reason = requireString(body.reason ?? body.suspension_reason ?? 'Platform review', 'reason', { min: 3, max: 255 });
  transaction(() => {
    execute('UPDATE tenant_subscriptions SET status = ?, suspension_reason = ?, updated_at = ? WHERE id = ?', ['SUSPENDED', reason, nowIso(), subscription.id]);
    insertPlatformSecurityEvent(context, {
      eventType: 'TENANT_SUSPENDED',
      severity: 'HIGH',
      tenantId: tenant.id,
      summary: `${tenant.name} suspended`,
      details: { reason }
    });
    insertPlatformAudit(context, {
      action: 'SUSPEND_PLATFORM_TENANT',
      entityType: 'tenant_subscription',
      entityId: subscription.id,
      tenantId: tenant.id,
      summary: `${tenant.name} suspended`,
      details: { reason }
    });
  });
  return { subscription: getSubscription(tenant.id) };
}

export function reactivatePlatformTenant(context, tenantId, body = {}) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SECURITY']);
  const tenant = requireTenant(tenantId);
  const subscription = getSubscription(tenant.id);
  if (!subscription) throw platformFail('Tenant subscription not found', 404);
  transaction(() => {
    execute('UPDATE tenant_subscriptions SET status = ?, suspension_reason = ?, updated_at = ? WHERE id = ?', ['ACTIVE', '', nowIso(), subscription.id]);
    insertPlatformSecurityEvent(context, {
      eventType: 'TENANT_REACTIVATED',
      severity: 'INFO',
      tenantId: tenant.id,
      summary: `${tenant.name} reactivated`,
      details: { reason: body.reason || '' }
    });
    insertPlatformAudit(context, {
      action: 'REACTIVATE_PLATFORM_TENANT',
      entityType: 'tenant_subscription',
      entityId: subscription.id,
      tenantId: tenant.id,
      summary: `${tenant.name} reactivated`,
      details: { reason: body.reason || '' }
    });
  });
  return { subscription: getSubscription(tenant.id) };
}

export function getPlatformMe(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  const capabilities = [...platformUserCapabilities(context.platformUser.role_key)];
  const summary = getPlatformSummary(context).summary;
  return {
    auth: {
      ...getPlatformAuthBootstrap(),
      authenticated: true
    },
    user: {
      id: context.platformUser.id,
      name: context.platformUser.name,
      email: context.platformUser.email,
      role_key: context.platformUser.role_key,
      active: context.platformUser.active
    },
    role: {
      key: context.platformUser.role_key,
      capabilities
    },
    capabilities,
    permissions: capabilities,
    summary,
    session: context.session ? {
      authenticated: true,
      provider: context.session.provider,
      csrf_token: context.session.csrf_token,
      expires_at: context.session.expires_at,
      mode: context.session.provider
    } : { authenticated: true, provider: 'platform-demo', mode: 'platform-demo' }
  };
}

export function getPlatformTenantHealthSnapshot(context, tenantId) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  requireTenant(tenantId);
  return getLatestHealth(tenantId);
}

export function auditPlatformDenied(context, payload) {
  insertPlatformSecurityEvent(context, {
    eventType: 'DENIED_PLATFORM_ACCESS',
    severity: 'HIGH',
    tenantId: payload.tenantId ?? null,
    summary: `${payload.method} ${payload.route} denied for ${payload.reason}`,
    details: {
      route: payload.route,
      method: payload.method,
      action: payload.action || '',
      reason: payload.reason || '',
      target: payload.target || ''
    }
  });
  insertPlatformAudit(context, {
    action: 'DENIED_PLATFORM_ACCESS',
    entityType: 'api_route',
    entityId: payload.route,
    tenantId: payload.tenantId ?? null,
    summary: `${payload.method} ${payload.route} denied for ${payload.reason}`,
    details: {
      route: payload.route,
      method: payload.method,
      action: payload.action || '',
      reason: payload.reason || '',
      target: payload.target || ''
    },
    requestId: payload.requestId || context?.requestId || ''
  });
}

function requirePlatformReportsRead(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING', 'PLATFORM_SECURITY', 'PLATFORM_AUDITOR']);
  if (!platformUserCapabilities(context.platformUser.role_key).has('*') && !platformUserCapabilities(context.platformUser.role_key).has('VIEW_PLATFORM_REPORTS')) {
    throw platformFail('Missing platform capability', 403);
  }
}

function requirePlatformReportsWrite(context) {
  requirePlatformRole(context, ['PLATFORM_OWNER', 'PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_SECURITY']);
  if (!platformUserCapabilities(context.platformUser.role_key).has('*') && !platformUserCapabilities(context.platformUser.role_key).has('RUN_PLATFORM_REPORTS')) {
    throw platformFail('Missing platform capability', 403);
  }
}

export function listPlatformReportDefinitions(context) {
  requirePlatformReportsRead(context);
  return listReportDefinitionsAction('PLATFORM', context);
}

export function listPlatformReportSummary(context) {
  requirePlatformReportsRead(context);
  return listReportSummaryAction('PLATFORM', context);
}

export function listPlatformReportRuns(context) {
  requirePlatformReportsRead(context);
  return listReportRunsAction('PLATFORM', context);
}

export function getPlatformReportRun(context, runId) {
  requirePlatformReportsRead(context);
  return getReportRunAction('PLATFORM', context, runId);
}

export function runPlatformReport(context, body = {}) {
  requirePlatformReportsWrite(context);
  return runReportAction('PLATFORM', context, body);
}

export function cancelPlatformReportRun(context, runId, body = {}) {
  requirePlatformReportsWrite(context);
  return cancelReportRunAction('PLATFORM', context, runId, body);
}

export function exportPlatformReportRunCsv(context, runId) {
  requirePlatformReportsRead(context);
  return exportReportCsvAction('PLATFORM', context, runId);
}

export function exportPlatformReportRunPdf(context, runId) {
  requirePlatformReportsRead(context);
  return exportReportPdfAction('PLATFORM', context, runId);
}

export {
  endPlatformWorkspaceSession as logoutPlatformSession,
  createPlatformWorkspaceSession as createPlatformDemoSession,
  getPlatformBootstrap as getPlatformAuthBootstrap
};
