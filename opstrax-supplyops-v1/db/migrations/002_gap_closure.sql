PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sync_batch_id TEXT NOT NULL REFERENCES sync_batches(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL REFERENCES sync_tasks(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  resolution_note TEXT NOT NULL DEFAULT '',
  resolved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_tenant_status ON sync_conflicts(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS export_transfers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  export_batch_id TEXT NOT NULL REFERENCES export_batches(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  status TEXT NOT NULL,
  queued_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT,
  error_message TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_export_transfers_tenant_status ON export_transfers(tenant_id, status, queued_at DESC);
