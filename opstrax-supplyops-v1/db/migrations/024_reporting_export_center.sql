PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS report_definitions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  surface TEXT NOT NULL DEFAULT 'TENANT',
  report_key TEXT NOT NULL,
  report_category TEXT NOT NULL DEFAULT 'Operational Reports',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  module_page TEXT NOT NULL DEFAULT '',
  required_feature TEXT NOT NULL DEFAULT '',
  required_role_capability TEXT NOT NULL DEFAULT '',
  default_format TEXT NOT NULL DEFAULT 'CSV',
  enabled INTEGER NOT NULL DEFAULT 1,
  printable INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(surface, report_key)
);

CREATE INDEX IF NOT EXISTS idx_report_definitions_surface_enabled ON report_definitions(surface, enabled, title);

CREATE TABLE IF NOT EXISTS report_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  surface TEXT NOT NULL DEFAULT 'TENANT',
  report_key TEXT NOT NULL,
  report_title TEXT NOT NULL,
  report_category TEXT NOT NULL DEFAULT 'Operational Reports',
  module_page TEXT NOT NULL DEFAULT '',
  run_no TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'CSV',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  filters_json TEXT NOT NULL DEFAULT '{}',
  row_count INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT NOT NULL DEFAULT '',
  output_file_name TEXT NOT NULL DEFAULT '',
  output_content_type TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by_platform_user_id TEXT REFERENCES platform_users(id) ON DELETE SET NULL,
  started_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  updated_at TEXT,
  UNIQUE(surface, tenant_id, run_no)
);

CREATE INDEX IF NOT EXISTS idx_report_runs_surface_tenant_status ON report_runs(surface, tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_runs_surface_key ON report_runs(surface, tenant_id, report_key, created_at DESC);

CREATE TABLE IF NOT EXISTS report_exports (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  surface TEXT NOT NULL DEFAULT 'TENANT',
  report_run_id TEXT NOT NULL REFERENCES report_runs(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL DEFAULT 'CSV',
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_text TEXT NOT NULL DEFAULT '',
  content_blob BYTEA,
  checksum_sha256 TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by_platform_user_id TEXT REFERENCES platform_users(id) ON DELETE SET NULL,
  UNIQUE(report_run_id, export_format)
);

CREATE INDEX IF NOT EXISTS idx_report_exports_surface_run ON report_exports(surface, tenant_id, report_run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_exports_surface_format ON report_exports(surface, tenant_id, export_format, created_at DESC);

