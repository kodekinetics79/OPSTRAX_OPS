-- Migration 019: Compliance & Trust Center
-- Adds SOC2-ready control library, access reviews, risk register,
-- incident register, and AI governance log tables.
-- All tables are tenant-scoped and additive-only.

PRAGMA foreign_keys = ON;

-- Enrich existing compliance_controls with SOC2-aligned columns
ALTER TABLE compliance_controls ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE compliance_controls ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE compliance_controls ADD COLUMN category TEXT NOT NULL DEFAULT 'SECURITY';
ALTER TABLE compliance_controls ADD COLUMN domain TEXT NOT NULL DEFAULT '';
ALTER TABLE compliance_controls ADD COLUMN framework_ref TEXT NOT NULL DEFAULT '';
ALTER TABLE compliance_controls ADD COLUMN evidence_source TEXT NOT NULL DEFAULT '';
ALTER TABLE compliance_controls ADD COLUMN exception_count INTEGER NOT NULL DEFAULT 0;

-- Access review cycles
CREATE TABLE IF NOT EXISTS access_reviews (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  review_name TEXT NOT NULL,
  reviewer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  due_at TEXT,
  total_entries INTEGER NOT NULL DEFAULT 0,
  reviewed_entries INTEGER NOT NULL DEFAULT 0,
  revoked_entries INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_access_reviews_tenant_status ON access_reviews(tenant_id, status, created_at DESC);

-- Per-user entries within an access review cycle
CREATE TABLE IF NOT EXISTS access_review_entries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  access_review_id TEXT NOT NULL REFERENCES access_reviews(id) ON DELETE CASCADE,
  subject_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  "current_role" TEXT NOT NULL,
  current_facility TEXT NOT NULL DEFAULT '',
  current_department TEXT NOT NULL DEFAULT '',
  permission_snapshot TEXT NOT NULL DEFAULT '[]',
  last_login_at TEXT,
  days_since_login INTEGER,
  recommendation TEXT NOT NULL DEFAULT 'RETAIN',
  decision TEXT,
  decision_reason TEXT NOT NULL DEFAULT '',
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_access_review_entries_review ON access_review_entries(tenant_id, access_review_id, decision);
CREATE INDEX IF NOT EXISTS idx_access_review_entries_user ON access_review_entries(tenant_id, subject_user_id);

-- Risk register
CREATE TABLE IF NOT EXISTS risk_register (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_no TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'OPERATIONAL',
  domain TEXT NOT NULL DEFAULT '',
  probability TEXT NOT NULL DEFAULT 'MEDIUM',
  impact TEXT NOT NULL DEFAULT 'MEDIUM',
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN',
  mitigation TEXT NOT NULL DEFAULT '',
  mitigation_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  owner_role TEXT NOT NULL DEFAULT '',
  related_control_id TEXT REFERENCES compliance_controls(id) ON DELETE SET NULL,
  last_reviewed_at TEXT,
  next_review_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, risk_no)
);

CREATE INDEX IF NOT EXISTS idx_risk_register_tenant_status ON risk_register(tenant_id, status, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_register_tenant_category ON risk_register(tenant_id, category, status);

-- Incident register
CREATE TABLE IF NOT EXISTS incident_register (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  incident_no TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'OPERATIONAL',
  severity TEXT NOT NULL DEFAULT 'LOW',
  status TEXT NOT NULL DEFAULT 'OPEN',
  root_cause TEXT NOT NULL DEFAULT '',
  resolution TEXT NOT NULL DEFAULT '',
  affected_systems TEXT NOT NULL DEFAULT '',
  affected_user_count INTEGER NOT NULL DEFAULT 0,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  reported_at TEXT,
  contained_at TEXT,
  resolved_at TEXT,
  owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  related_control_id TEXT REFERENCES compliance_controls(id) ON DELETE SET NULL,
  related_risk_id TEXT REFERENCES risk_register(id) ON DELETE SET NULL,
  post_mortem TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, incident_no)
);

CREATE INDEX IF NOT EXISTS idx_incident_register_tenant_status ON incident_register(tenant_id, status, severity, created_at DESC);

-- AI governance log — human-readable record of advisory requests and decisions
CREATE TABLE IF NOT EXISTS ai_governance_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  actor_role TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT '',
  agent_key TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT 'ADVISORY_REQUEST',
  data_scope TEXT NOT NULL DEFAULT '',
  provider_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  output_type TEXT NOT NULL DEFAULT 'ADVISORY_ONLY',
  human_approval_required INTEGER NOT NULL DEFAULT 0,
  human_approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  human_approved_at TEXT,
  input_record_count INTEGER NOT NULL DEFAULT 0,
  output_record_count INTEGER NOT NULL DEFAULT 0,
  token_input_count INTEGER NOT NULL DEFAULT 0,
  token_output_count INTEGER NOT NULL DEFAULT 0,
  estimated_cost REAL NOT NULL DEFAULT 0.0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_governance_logs_tenant ON ai_governance_logs(tenant_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_governance_logs_actor ON ai_governance_logs(tenant_id, actor_user_id, created_at DESC);
