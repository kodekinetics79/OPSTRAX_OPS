PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cycle_count_plans (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_no TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  scope_type TEXT NOT NULL DEFAULT 'FULL',
  scheduled_date TEXT,
  started_at TEXT,
  completed_at TEXT,
  approved_at TEXT,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  posted_at TEXT,
  posted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  cancelled_at TEXT,
  cancelled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, plan_no)
);

CREATE INDEX IF NOT EXISTS idx_cycle_count_plans_tenant_status ON cycle_count_plans(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_count_plans_tenant_facility ON cycle_count_plans(tenant_id, facility_id, status);

CREATE TABLE IF NOT EXISTS cycle_count_plan_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES cycle_count_plans(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  expected_qty REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cycle_count_plan_lines_plan ON cycle_count_plan_lines(tenant_id, plan_id, status);
CREATE INDEX IF NOT EXISTS idx_cycle_count_plan_lines_item ON cycle_count_plan_lines(tenant_id, item_id);

CREATE TABLE IF NOT EXISTS cycle_count_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES cycle_count_plans(id) ON DELETE CASCADE,
  session_no TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  counted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  posted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TEXT,
  reviewed_at TEXT,
  approved_at TEXT,
  posted_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, session_no)
);

CREATE INDEX IF NOT EXISTS idx_cycle_count_sessions_tenant_plan ON cycle_count_sessions(tenant_id, plan_id, status);
CREATE INDEX IF NOT EXISTS idx_cycle_count_sessions_tenant_status ON cycle_count_sessions(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS cycle_count_session_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES cycle_count_sessions(id) ON DELETE CASCADE,
  plan_line_id TEXT REFERENCES cycle_count_plan_lines(id) ON DELETE SET NULL,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  expected_qty REAL NOT NULL DEFAULT 0,
  counted_qty REAL,
  variance_qty REAL,
  variance_pct REAL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  counted_at TEXT,
  counted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cycle_count_session_lines_session ON cycle_count_session_lines(tenant_id, session_id, status);
CREATE INDEX IF NOT EXISTS idx_cycle_count_session_lines_item ON cycle_count_session_lines(tenant_id, item_id);

CREATE TABLE IF NOT EXISTS inventory_variances (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES cycle_count_sessions(id) ON DELETE SET NULL,
  session_line_id TEXT REFERENCES cycle_count_session_lines(id) ON DELETE SET NULL,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  expected_qty REAL NOT NULL DEFAULT 0,
  counted_qty REAL NOT NULL DEFAULT 0,
  variance_qty REAL NOT NULL DEFAULT 0,
  variance_pct REAL NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'INFO',
  status TEXT NOT NULL DEFAULT 'OPEN',
  controlled INTEGER NOT NULL DEFAULT 0,
  waiver_reason TEXT NOT NULL DEFAULT '',
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TEXT,
  rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TEXT,
  waived_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  waived_at TEXT,
  posted_at TEXT,
  posted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  stock_movement_id TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_variances_tenant_status ON inventory_variances(tenant_id, status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_variances_tenant_item ON inventory_variances(tenant_id, item_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_variances_session ON inventory_variances(tenant_id, session_id);

CREATE TABLE IF NOT EXISTS replenishment_recommendations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  run_id TEXT,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL DEFAULT 'REORDER',
  status TEXT NOT NULL DEFAULT 'OPEN',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  on_hand_qty REAL NOT NULL DEFAULT 0,
  reorder_point REAL NOT NULL DEFAULT 0,
  suggested_qty REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  signal_details_json TEXT NOT NULL DEFAULT '{}',
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TEXT,
  dismissed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  dismissed_at TEXT,
  dismissed_reason TEXT NOT NULL DEFAULT '',
  converted_request_id TEXT,
  converted_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_replenishment_recs_tenant_status ON replenishment_recommendations(tenant_id, status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replenishment_recs_tenant_item ON replenishment_recommendations(tenant_id, item_id, status);
CREATE INDEX IF NOT EXISTS idx_replenishment_recs_run ON replenishment_recommendations(tenant_id, run_id);

CREATE TABLE IF NOT EXISTS inventory_optimization_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL DEFAULT 'REPLENISHMENT',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  items_analyzed INTEGER NOT NULL DEFAULT 0,
  recommendations_generated INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT NOT NULL DEFAULT '',
  run_notes TEXT NOT NULL DEFAULT '',
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invopt_runs_tenant_type ON inventory_optimization_runs(tenant_id, run_type, status, created_at DESC);

CREATE TABLE IF NOT EXISTS inventory_classifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  run_id TEXT REFERENCES inventory_optimization_runs(id) ON DELETE SET NULL,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  classification TEXT NOT NULL DEFAULT 'C',
  score REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  value_score REAL NOT NULL DEFAULT 0,
  movement_score REAL NOT NULL DEFAULT 0,
  criticality_score REAL NOT NULL DEFAULT 0,
  insufficient_history INTEGER NOT NULL DEFAULT 0,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_classifications_tenant ON inventory_classifications(tenant_id, classification, score DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_classifications_run ON inventory_classifications(tenant_id, run_id);

CREATE TABLE IF NOT EXISTS inventory_accuracy_snapshots (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_date TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  items_counted INTEGER NOT NULL DEFAULT 0,
  items_with_variance INTEGER NOT NULL DEFAULT 0,
  items_accurate INTEGER NOT NULL DEFAULT 0,
  accuracy_pct REAL NOT NULL DEFAULT 0,
  open_variances INTEGER NOT NULL DEFAULT 0,
  blocker_variances INTEGER NOT NULL DEFAULT 0,
  controlled_variances INTEGER NOT NULL DEFAULT 0,
  reorder_risks INTEGER NOT NULL DEFAULT 0,
  stockout_risks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_inventory_accuracy_snapshots_tenant ON inventory_accuracy_snapshots(tenant_id, snapshot_date DESC);
