-- Migration 021: Platform Admin SaaS Control Plane
-- Adds platform-user authentication, tenant plan/subscription controls,
-- platform audit trails, support sessions, billing/security events, and
-- health snapshots. All tables are additive and SQLite-compatible.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS platform_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role_key TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS platform_user_roles (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  assigned_by_platform_user_id TEXT REFERENCES platform_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_user_roles_user_role ON platform_user_roles(platform_user_id, role_key);

CREATE TABLE IF NOT EXISTS platform_sessions (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'platform-demo',
  role_key TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  ip_address TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_sessions_user_expires ON platform_sessions(platform_user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS tenant_plans (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY',
  seat_limit INTEGER NOT NULL DEFAULT 0,
  module_limit_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  effective_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tenant_plans_tenant_status ON tenant_plans(tenant_id, status, effective_at DESC);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES tenant_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  seat_limit INTEGER NOT NULL DEFAULT 0,
  consumed_seats INTEGER NOT NULL DEFAULT 0,
  reserved_seats INTEGER NOT NULL DEFAULT 0,
  renewal_at TEXT,
  suspension_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_status ON tenant_subscriptions(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS tenant_feature_entitlements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  entitlement_status TEXT NOT NULL DEFAULT 'ENABLED',
  source TEXT NOT NULL DEFAULT 'PLAN',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE(tenant_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_feature_entitlements_tenant_status ON tenant_feature_entitlements(tenant_id, entitlement_status, feature_key);

CREATE TABLE IF NOT EXISTS tenant_usage_snapshots (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_date TEXT NOT NULL,
  active_users INTEGER NOT NULL DEFAULT 0,
  active_devices INTEGER NOT NULL DEFAULT 0,
  api_requests INTEGER NOT NULL DEFAULT 0,
  open_work_items INTEGER NOT NULL DEFAULT 0,
  storage_mb INTEGER NOT NULL DEFAULT 0,
  export_batches INTEGER NOT NULL DEFAULT 0,
  offline_batches INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_snapshots_tenant_date ON tenant_usage_snapshots(tenant_id, snapshot_date DESC);

CREATE TABLE IF NOT EXISTS tenant_health_snapshots (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_date TEXT NOT NULL,
  auth_status TEXT NOT NULL DEFAULT 'CONFIGURATION_REQUIRED',
  storage_status TEXT NOT NULL DEFAULT 'CONFIGURATION_REQUIRED',
  integration_status TEXT NOT NULL DEFAULT 'CONFIGURATION_REQUIRED',
  audit_status TEXT NOT NULL DEFAULT 'CONFIGURATION_REQUIRED',
  support_status TEXT NOT NULL DEFAULT 'HEALTHY',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tenant_health_snapshots_tenant_date ON tenant_health_snapshots(tenant_id, snapshot_date DESC);

CREATE TABLE IF NOT EXISTS platform_audit_events (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT REFERENCES platform_users(id) ON DELETE SET NULL,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  request_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_events_created ON platform_audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_events_tenant_created ON platform_audit_events(tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_support_sessions (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'ADVISORY',
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  reason TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  evidence_required INTEGER NOT NULL DEFAULT 1,
  opened_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_support_sessions_tenant_status ON platform_support_sessions(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_billing_events (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT REFERENCES platform_users(id) ON DELETE SET NULL,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECORDED',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  summary TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_billing_events_tenant_created ON platform_billing_events(tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_security_events (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT REFERENCES platform_users(id) ON DELETE SET NULL,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO',
  status TEXT NOT NULL DEFAULT 'RECORDED',
  summary TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_platform_security_events_tenant_created ON platform_security_events(tenant_id, created_at DESC);
