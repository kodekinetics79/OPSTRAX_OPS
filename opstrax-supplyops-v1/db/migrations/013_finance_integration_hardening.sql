PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS integration_connections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  status TEXT NOT NULL,
  endpoint_label TEXT NOT NULL DEFAULT '',
  auth_mode TEXT NOT NULL DEFAULT 'NONE',
  secret_ref TEXT NOT NULL DEFAULT '',
  last_tested_at TEXT,
  last_success_at TEXT,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_integration_connections_tenant_status ON integration_connections(tenant_id, status, created_at DESC);

ALTER TABLE export_batches ADD COLUMN date_from TEXT;
ALTER TABLE export_batches ADD COLUMN date_to TEXT;
ALTER TABLE export_batches ADD COLUMN facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL;
ALTER TABLE export_batches ADD COLUMN department_id TEXT REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE export_batches ADD COLUMN validation_error_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE export_batches ADD COLUMN generated_payload_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE export_batches ADD COLUMN generated_payload_format TEXT NOT NULL DEFAULT '';
ALTER TABLE export_batches ADD COLUMN approved_at TEXT;
ALTER TABLE export_batches ADD COLUMN approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE export_batches ADD COLUMN dispatched_at TEXT;
ALTER TABLE export_batches ADD COLUMN cancelled_at TEXT;
ALTER TABLE export_batches ADD COLUMN failure_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE export_batches ADD COLUMN updated_at TEXT;
ALTER TABLE export_batches ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE export_batches ADD COLUMN selection_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE export_batches ADD COLUMN generated_payload_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE export_batches ADD COLUMN generated_payload_text TEXT NOT NULL DEFAULT '';

ALTER TABLE export_validation_errors ADD COLUMN status TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE export_validation_errors ADD COLUMN resolved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE export_validation_errors ADD COLUMN waived_at TEXT;
ALTER TABLE export_validation_errors ADD COLUMN waived_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE export_validation_errors ADD COLUMN waiver_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE export_validation_errors ADD COLUMN updated_at TEXT;
ALTER TABLE export_validation_errors ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE export_transfers ADD COLUMN connection_id TEXT REFERENCES integration_connections(id) ON DELETE SET NULL;
ALTER TABLE export_transfers ADD COLUMN job_id TEXT REFERENCES integration_jobs(id) ON DELETE SET NULL;
ALTER TABLE export_transfers ADD COLUMN dispatch_mode TEXT NOT NULL DEFAULT 'NOT_CONFIGURED';
ALTER TABLE export_transfers ADD COLUMN attempted_at TEXT;
ALTER TABLE export_transfers ADD COLUMN updated_at TEXT;
ALTER TABLE export_transfers ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE integration_jobs ADD COLUMN connection_id TEXT REFERENCES integration_connections(id) ON DELETE SET NULL;
ALTER TABLE integration_jobs ADD COLUMN export_batch_id TEXT REFERENCES export_batches(id) ON DELETE SET NULL;
ALTER TABLE integration_jobs ADD COLUMN job_type TEXT NOT NULL DEFAULT 'EXPORT_DISPATCH';
ALTER TABLE integration_jobs ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE integration_jobs ADD COLUMN queued_at TEXT;
ALTER TABLE integration_jobs ADD COLUMN started_at TEXT;
ALTER TABLE integration_jobs ADD COLUMN finished_at TEXT;
ALTER TABLE integration_jobs ADD COLUMN created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE integration_jobs ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_integration_jobs_tenant_connection ON integration_jobs(tenant_id, connection_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_jobs_tenant_batch ON integration_jobs(tenant_id, export_batch_id, status, created_at DESC);
