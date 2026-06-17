-- Migration 022: Platform Admin control-plane refresh
-- Normalizes platform-plan vocabulary, support-session lifecycle states,
-- and seeds the third platform tenant for existing local/demo databases.

PRAGMA foreign_keys = ON;

ALTER TABLE platform_support_sessions ADD COLUMN expires_at TEXT;

UPDATE tenant_plans
SET
  plan_code = CASE tenant_id
    WHEN 'tenant_intelliflow_systems' THEN 'GOVERNMENT'
    WHEN 'tenant_northstar_logistics' THEN 'ENTERPRISE'
    WHEN 'tenant_evostel' THEN 'STARTER'
    ELSE plan_code
  END,
  plan_name = CASE tenant_id
    WHEN 'tenant_intelliflow_systems' THEN 'Government Control Plane'
    WHEN 'tenant_northstar_logistics' THEN 'Enterprise Logistics Plan'
    WHEN 'tenant_evostel' THEN 'Starter Restricted Ops Plan'
    ELSE plan_name
  END,
  billing_cycle = CASE tenant_id
    WHEN 'tenant_evostel' THEN 'ANNUAL'
    ELSE 'MONTHLY'
  END,
  seat_limit = CASE tenant_id
    WHEN 'tenant_intelliflow_systems' THEN 24
    WHEN 'tenant_northstar_logistics' THEN 18
    ELSE 6
  END,
  module_limit_json = CASE tenant_id
    WHEN 'tenant_intelliflow_systems' THEN json_object('command_center', 1, 'inventory_control', 1, 'procurement_purchasing', 1, 'supplier_governance', 1, 'contract_repository', 1, 'budget_controls', 1, 'procure_to_pay_intelligence', 1, 'compliance_center', 1)
    WHEN 'tenant_northstar_logistics' THEN json_object('command_center', 1, 'inventory_control', 1, 'procurement_purchasing', 1, 'supplier_governance', 1, 'contract_repository', 1, 'budget_controls', 1, 'integration_center', 1, 'compliance_center', 1)
    ELSE json_object('command_center', 1, 'inventory_control', 1, 'internal_storefront', 1, 'audit_black_box', 1, 'compliance_center', 1, 'reports', 1)
  END,
  updated_at = datetime('now')
WHERE tenant_id IN ('tenant_intelliflow_systems', 'tenant_evostel');

INSERT OR IGNORE INTO tenants (id, name, slug, industry, status, created_at)
SELECT
  'tenant_northstar_logistics',
  'Northstar Logistics',
  'northstar-logistics',
  'Distribution & Fleet Logistics',
  'active',
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO tenant_plans (id, tenant_id, plan_code, plan_name, billing_cycle, seat_limit, module_limit_json, status, effective_at, expires_at, created_at, updated_at)
SELECT
  'platform_plan_tenant_northstar_logistics',
  'tenant_northstar_logistics',
  'ENTERPRISE',
  'Enterprise Logistics Plan',
  'MONTHLY',
  18,
  json_object('command_center', 1, 'inventory_control', 1, 'procurement_purchasing', 1, 'supplier_governance', 1, 'contract_repository', 1, 'budget_controls', 1, 'integration_center', 1, 'compliance_center', 1),
  'ACTIVE',
  datetime('now'),
  NULL,
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO tenant_subscriptions (id, tenant_id, plan_id, status, seat_limit, consumed_seats, reserved_seats, renewal_at, suspension_reason, created_at, updated_at)
SELECT
  'platform_subscription_tenant_northstar_logistics',
  'tenant_northstar_logistics',
  'platform_plan_tenant_northstar_logistics',
  'ACTIVE',
  18,
  11,
  2,
  '2026-12-15T00:00:00Z',
  '',
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO tenant_usage_snapshots (id, tenant_id, snapshot_date, active_users, active_devices, api_requests, open_work_items, storage_mb, export_batches, offline_batches, created_at, updated_at)
SELECT
  'platform_usage_tenant_northstar_logistics',
  'tenant_northstar_logistics',
  date('now'),
  11,
  2,
  1310,
  12,
  662,
  4,
  2,
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO tenant_health_snapshots (id, tenant_id, snapshot_date, auth_status, storage_status, integration_status, audit_status, support_status, note, created_at, updated_at)
SELECT
  'platform_health_tenant_northstar_logistics',
  'tenant_northstar_logistics',
  date('now'),
  'CONFIGURED',
  'CONFIGURED',
  'HEALTHY',
  'CONFIGURED',
  'HEALTHY',
  'Enterprise logistics tenant validated for production-style platform control.',
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO tenant_feature_entitlements (id, tenant_id, feature_key, entitlement_status, source, notes, created_at, updated_at)
SELECT 'platform_entitlement_northstar_command_center', 'tenant_northstar_logistics', 'command_center', 'ENABLED', 'PLATFORM_OVERRIDE', 'Core workspace enabled', datetime('now'), datetime('now') WHERE EXISTS (SELECT 1 FROM tenants);
INSERT OR IGNORE INTO tenant_feature_entitlements (id, tenant_id, feature_key, entitlement_status, source, notes, created_at, updated_at)
SELECT 'platform_entitlement_northstar_inventory', 'tenant_northstar_logistics', 'inventory_control', 'ENABLED', 'PLATFORM_OVERRIDE', 'Inventory enabled', datetime('now'), datetime('now') WHERE EXISTS (SELECT 1 FROM tenants);
INSERT OR IGNORE INTO tenant_feature_entitlements (id, tenant_id, feature_key, entitlement_status, source, notes, created_at, updated_at)
SELECT 'platform_entitlement_northstar_procurement', 'tenant_northstar_logistics', 'procurement_purchasing', 'ENABLED', 'PLATFORM_OVERRIDE', 'Procurement enabled', datetime('now'), datetime('now') WHERE EXISTS (SELECT 1 FROM tenants);
INSERT OR IGNORE INTO tenant_feature_entitlements (id, tenant_id, feature_key, entitlement_status, source, notes, created_at, updated_at)
SELECT 'platform_entitlement_northstar_compliance', 'tenant_northstar_logistics', 'compliance_center', 'ENABLED', 'PLATFORM_OVERRIDE', 'Compliance enabled', datetime('now'), datetime('now') WHERE EXISTS (SELECT 1 FROM tenants);
INSERT OR IGNORE INTO tenant_feature_entitlements (id, tenant_id, feature_key, entitlement_status, source, notes, created_at, updated_at)
SELECT 'platform_entitlement_northstar_audit', 'tenant_northstar_logistics', 'audit_black_box', 'ENABLED', 'PLATFORM_OVERRIDE', 'Audit trail enabled', datetime('now'), datetime('now') WHERE EXISTS (SELECT 1 FROM tenants);
INSERT OR IGNORE INTO tenant_feature_entitlements (id, tenant_id, feature_key, entitlement_status, source, notes, created_at, updated_at)
SELECT 'platform_entitlement_northstar_integration', 'tenant_northstar_logistics', 'integration_center', 'ENABLED', 'PLATFORM_OVERRIDE', 'Integration enabled', datetime('now'), datetime('now') WHERE EXISTS (SELECT 1 FROM tenants);

UPDATE platform_support_sessions
SET status = CASE
  WHEN tenant_id = 'tenant_intelliflow_systems' THEN 'REQUESTED'
  WHEN tenant_id = 'tenant_evostel' THEN 'DENIED'
  ELSE status
END,
closed_at = CASE
  WHEN tenant_id = 'tenant_evostel' THEN COALESCE(closed_at, datetime('now'))
  ELSE closed_at
END,
expires_at = CASE
  WHEN tenant_id = 'tenant_intelliflow_systems' THEN COALESCE(expires_at, datetime('now', '+1 day'))
  ELSE expires_at
END,
updated_at = datetime('now')
WHERE tenant_id IN ('tenant_intelliflow_systems', 'tenant_evostel');

INSERT OR IGNORE INTO platform_support_sessions (id, platform_user_id, tenant_id, subject_user_id, session_type, status, reason, summary, evidence_required, opened_at, expires_at, closed_at, created_at, updated_at)
SELECT
  'platform_support_if_002',
  'platform_user_support',
  'tenant_northstar_logistics',
  NULL,
  'AUDIT',
  'ACTIVE',
  'Enterprise tenant posture review.',
  'Northstar validation session currently active.',
  1,
  datetime('now'),
  NULL,
  NULL,
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO platform_billing_events (id, platform_user_id, tenant_id, event_type, status, amount_cents, currency, summary, details_json, created_at, updated_at)
SELECT
  'platform_billing_002',
  'platform_user_billing',
  'tenant_northstar_logistics',
  'PLAN_REVIEW',
  'RECORDED',
  264000,
  'USD',
  'Northstar Logistics plan posture reviewed.',
  json_object('plan', 'Enterprise Logistics Plan', 'seat_limit', 18),
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);

INSERT OR IGNORE INTO platform_security_events (id, platform_user_id, tenant_id, event_type, severity, status, summary, details_json, created_at, updated_at)
SELECT
  'platform_security_002',
  'platform_user_security',
  'tenant_northstar_logistics',
  'TENANT_POSTURE_REVIEW',
  'INFO',
  'RECORDED',
  'Northstar Logistics posture verified for production-style platform control.',
  json_object('auth', 'CONFIGURED', 'storage', 'CONFIGURED', 'integration', 'HEALTHY'),
  datetime('now'),
  datetime('now')
WHERE EXISTS (SELECT 1 FROM tenants);
