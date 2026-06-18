PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS asset_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_no TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  subcategory TEXT NOT NULL DEFAULT '',
  serial_number TEXT NOT NULL DEFAULT '',
  asset_type TEXT NOT NULL DEFAULT 'STANDARD',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  current_custodian_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  acquisition_cost REAL,
  acquisition_date TEXT,
  last_audit_date TEXT,
  disposal_at TEXT,
  controlled INTEGER NOT NULL DEFAULT 0,
  high_value INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, asset_no)
);

CREATE INDEX IF NOT EXISTS idx_asset_records_tenant_status ON asset_records(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_records_tenant_category ON asset_records(tenant_id, category, status);
CREATE INDEX IF NOT EXISTS idx_asset_records_tenant_custodian ON asset_records(tenant_id, current_custodian_user_id, status);
CREATE INDEX IF NOT EXISTS idx_asset_records_serial ON asset_records(tenant_id, serial_number);

CREATE TABLE IF NOT EXISTS asset_custody_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  from_custodian_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  to_custodian_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  from_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  to_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  from_department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  to_department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  status_before TEXT NOT NULL DEFAULT '',
  status_after TEXT NOT NULL DEFAULT '',
  reference_id TEXT NOT NULL DEFAULT '',
  reference_type TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_asset_custody_events_asset ON asset_custody_events(tenant_id, asset_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_asset_custody_events_tenant ON asset_custody_events(tenant_id, event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS asset_assignments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  custodian_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  assigned_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  expected_return_at TEXT,
  return_requested_at TEXT,
  returned_at TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_tenant_asset ON asset_assignments(tenant_id, asset_id, status);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_tenant_custodian ON asset_assignments(tenant_id, custodian_user_id, status);

CREATE TABLE IF NOT EXISTS asset_transfer_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  transfer_no TEXT NOT NULL,
  from_custodian_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  to_custodian_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  from_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  to_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  from_department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  to_department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  requested_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  reason TEXT NOT NULL DEFAULT '',
  approval_notes TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  transferred_at TEXT,
  cancelled_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, transfer_no)
);

CREATE INDEX IF NOT EXISTS idx_asset_transfer_requests_tenant_status ON asset_transfer_requests(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_transfer_requests_asset ON asset_transfer_requests(tenant_id, asset_id, status);

CREATE TABLE IF NOT EXISTS asset_return_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  assignment_id TEXT REFERENCES asset_assignments(id) ON DELETE SET NULL,
  return_no TEXT NOT NULL,
  requested_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  accepted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  return_condition TEXT NOT NULL DEFAULT 'GOOD',
  condition_notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, return_no)
);

CREATE INDEX IF NOT EXISTS idx_asset_return_requests_tenant_status ON asset_return_requests(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_return_requests_asset ON asset_return_requests(tenant_id, asset_id, status);

CREATE TABLE IF NOT EXISTS asset_condition_reports (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  report_no TEXT NOT NULL,
  reported_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  condition_type TEXT NOT NULL DEFAULT 'INSPECTION',
  severity TEXT NOT NULL DEFAULT 'LOW',
  description TEXT NOT NULL,
  repair_cost_estimate REAL,
  evidence_ref TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'OPEN',
  resolved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, report_no)
);

CREATE INDEX IF NOT EXISTS idx_asset_condition_reports_tenant_status ON asset_condition_reports(tenant_id, status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_condition_reports_asset ON asset_condition_reports(tenant_id, asset_id, status);

CREATE TABLE IF NOT EXISTS asset_maintenance_cases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  case_no TEXT NOT NULL,
  maintenance_type TEXT NOT NULL DEFAULT 'PREVENTIVE',
  status TEXT NOT NULL DEFAULT 'OPEN',
  opened_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  closed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  resolution TEXT NOT NULL DEFAULT '',
  scheduled_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, case_no)
);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_cases_tenant_status ON asset_maintenance_cases(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_cases_asset ON asset_maintenance_cases(tenant_id, asset_id, status);

CREATE TABLE IF NOT EXISTS asset_disposal_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  disposal_no TEXT NOT NULL,
  requested_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  posted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  reason TEXT NOT NULL,
  disposal_method TEXT NOT NULL DEFAULT 'WRITE_OFF',
  disposal_value REAL,
  approval_notes TEXT NOT NULL DEFAULT '',
  rejection_notes TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  submitted_at TEXT,
  approved_at TEXT,
  rejected_at TEXT,
  disposed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, disposal_no)
);

CREATE INDEX IF NOT EXISTS idx_asset_disposal_requests_tenant_status ON asset_disposal_requests(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_disposal_requests_asset ON asset_disposal_requests(tenant_id, asset_id, status);

CREATE TABLE IF NOT EXISTS asset_evidence_links (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES asset_records(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES asset_custody_events(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL DEFAULT 'DOCUMENT',
  description TEXT NOT NULL DEFAULT '',
  reference TEXT NOT NULL DEFAULT '',
  added_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_asset_evidence_links_asset ON asset_evidence_links(tenant_id, asset_id, created_at DESC);

CREATE TABLE IF NOT EXISTS asset_lifecycle_snapshots (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_date TEXT NOT NULL,
  total_assets INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 0,
  assigned INTEGER NOT NULL DEFAULT 0,
  in_transfer INTEGER NOT NULL DEFAULT 0,
  return_pending INTEGER NOT NULL DEFAULT 0,
  damaged INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  quarantined INTEGER NOT NULL DEFAULT 0,
  in_maintenance INTEGER NOT NULL DEFAULT 0,
  disposal_pending INTEGER NOT NULL DEFAULT 0,
  disposed INTEGER NOT NULL DEFAULT 0,
  high_value_assigned INTEGER NOT NULL DEFAULT 0,
  controlled_assigned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_snapshots_tenant ON asset_lifecycle_snapshots(tenant_id, snapshot_date DESC);
