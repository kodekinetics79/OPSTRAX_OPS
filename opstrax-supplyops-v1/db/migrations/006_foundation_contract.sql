PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS permissions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_key TEXT NOT NULL REFERENCES roles(key) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (role_key, permission_key)
);

CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL REFERENCES roles(key) ON DELETE RESTRICT,
  granted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT,
  revoked_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, user_id, role_key)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_user ON user_roles(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_role ON user_roles(tenant_id, role_key);

CREATE TABLE IF NOT EXISTS user_scopes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id TEXT REFERENCES facilities(id) ON DELETE CASCADE,
  department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  revoked_at TEXT,
  revoked_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_scopes_tenant_user ON user_scopes(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_scopes_tenant_facility ON user_scopes(tenant_id, facility_id);
CREATE INDEX IF NOT EXISTS idx_user_scopes_tenant_department ON user_scopes(tenant_id, department_id);

CREATE TABLE IF NOT EXISTS item_categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_item_categories_tenant_active ON item_categories(tenant_id, active);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  quantity_delta INTEGER NOT NULL,
  status TEXT NOT NULL,
  requested_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_tenant_status ON stock_adjustments(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_tenant_facility ON stock_adjustments(tenant_id, facility_id);

CREATE TABLE IF NOT EXISTS warehouse_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  assigned_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_tenant_status ON warehouse_tasks(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_tenant_facility ON warehouse_tasks(tenant_id, facility_id);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_vendors_tenant_status ON vendors(tenant_id, status, active);

CREATE TABLE IF NOT EXISTS receive_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  started_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  completed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_receive_sessions_tenant_status ON receive_sessions(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS putaway_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  bin_id TEXT NOT NULL REFERENCES bins(id) ON DELETE RESTRICT,
  stock_movement_id TEXT REFERENCES stock_movements(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  assigned_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_putaway_tasks_tenant_status ON putaway_tasks(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS pick_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  request_id TEXT NOT NULL REFERENCES internal_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  assigned_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  picked_qty INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pick_tasks_tenant_status ON pick_tasks(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS issue_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  request_id TEXT NOT NULL REFERENCES internal_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  issued_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_issue_tasks_tenant_status ON issue_tasks(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS transfer_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  transfer_no TEXT NOT NULL,
  source_facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  destination_facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  status TEXT NOT NULL,
  requested_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  shipped_at TEXT,
  received_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, transfer_no)
);

CREATE INDEX IF NOT EXISTS idx_transfer_orders_tenant_status ON transfer_orders(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS count_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  started_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  posted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_count_sessions_tenant_status ON count_sessions(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  po_no TEXT NOT NULL,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  status TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  created_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  sent_at TEXT,
  acknowledged_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, po_no)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_status ON purchase_orders(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS approval_steps (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  approver_role_key TEXT NOT NULL REFERENCES roles(key) ON DELETE RESTRICT,
  approver_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  decided_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_approval_steps_tenant_entity ON approval_steps(tenant_id, entity_type, entity_id, step_order);

CREATE TABLE IF NOT EXISTS approval_decisions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  approval_step_id TEXT NOT NULL REFERENCES approval_steps(id) ON DELETE CASCADE,
  approver_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  decided_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_approval_decisions_tenant_step ON approval_decisions(tenant_id, approval_step_id, decided_at DESC);

CREATE TABLE IF NOT EXISTS vendor_scores (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL,
  score_value REAL NOT NULL,
  scored_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_scores_tenant_vendor ON vendor_scores(tenant_id, vendor_id, scored_at DESC);

CREATE TABLE IF NOT EXISTS evidence_links (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_links_tenant_entity ON evidence_links(tenant_id, entity_type, entity_id);

CREATE TABLE IF NOT EXISTS audit_event_diffs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  audit_event_id TEXT NOT NULL REFERENCES audit_logs(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  before_value TEXT,
  after_value TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_event_diffs_tenant_event ON audit_event_diffs(tenant_id, audit_event_id);

CREATE TABLE IF NOT EXISTS chain_of_custody_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  evidence_document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chain_of_custody_tenant_document ON chain_of_custody_events(tenant_id, evidence_document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sync_decisions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sync_conflict_id TEXT NOT NULL REFERENCES sync_conflicts(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  decided_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL DEFAULT '',
  decided_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sync_decisions_tenant_conflict ON sync_decisions(tenant_id, sync_conflict_id);

CREATE TABLE IF NOT EXISTS integration_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  integration_key TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  payload_hash TEXT NOT NULL DEFAULT '',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_integration_jobs_tenant_status ON integration_jobs(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence REAL NOT NULL,
  recommendation_json TEXT NOT NULL,
  human_summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_tenant_status ON ai_recommendations(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_recommendation_sources (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ai_recommendation_id TEXT NOT NULL REFERENCES ai_recommendations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_sources_tenant_rec ON ai_recommendation_sources(tenant_id, ai_recommendation_id);

CREATE TABLE IF NOT EXISTS ai_approvals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ai_recommendation_id TEXT NOT NULL REFERENCES ai_recommendations(id) ON DELETE CASCADE,
  approver_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  decided_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_approvals_tenant_rec ON ai_approvals(tenant_id, ai_recommendation_id);

CREATE TABLE IF NOT EXISTS ai_execution_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ai_recommendation_id TEXT NOT NULL REFERENCES ai_recommendations(id) ON DELETE CASCADE,
  executed_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_execution_logs_tenant_rec ON ai_execution_logs(tenant_id, ai_recommendation_id);

CREATE TABLE IF NOT EXISTS compliance_controls (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  control_key TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_role_key TEXT NOT NULL REFERENCES roles(key) ON DELETE RESTRICT,
  review_frequency TEXT NOT NULL DEFAULT 'QUARTERLY',
  last_reviewed_at TEXT,
  next_review_due_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, control_key)
);

CREATE INDEX IF NOT EXISTS idx_compliance_controls_tenant_status ON compliance_controls(tenant_id, status, next_review_due_at);

CREATE TABLE IF NOT EXISTS compliance_evidence (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  compliance_control_id TEXT NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
  evidence_document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  linked_at TEXT NOT NULL DEFAULT (datetime('now')),
  linked_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_compliance_evidence_tenant_control ON compliance_evidence(tenant_id, compliance_control_id);

CREATE TABLE IF NOT EXISTS compliance_exceptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  exception_no TEXT NOT NULL,
  compliance_control_id TEXT NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  severity TEXT NOT NULL,
  reason TEXT NOT NULL,
  opened_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, exception_no)
);

CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_tenant_status ON compliance_exceptions(tenant_id, status, created_at DESC);
