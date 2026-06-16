PRAGMA foreign_keys = ON;

ALTER TABLE warehouse_tasks ADD COLUMN task_no TEXT;
ALTER TABLE warehouse_tasks ADD COLUMN request_id TEXT REFERENCES internal_requests(id) ON DELETE CASCADE;
ALTER TABLE warehouse_tasks ADD COLUMN department_id TEXT REFERENCES departments(id) ON DELETE RESTRICT;
ALTER TABLE warehouse_tasks ADD COLUMN created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE warehouse_tasks ADD COLUMN started_at TEXT;
ALTER TABLE warehouse_tasks ADD COLUMN picked_at TEXT;
ALTER TABLE warehouse_tasks ADD COLUMN issued_at TEXT;
ALTER TABLE warehouse_tasks ADD COLUMN closed_at TEXT;
ALTER TABLE warehouse_tasks ADD COLUMN cancelled_at TEXT;
ALTER TABLE warehouse_tasks ADD COLUMN exception_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE warehouse_tasks ADD COLUMN last_action_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE warehouse_tasks ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_warehouse_tasks_tenant_task_no ON warehouse_tasks(tenant_id, task_no);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_tenant_request ON warehouse_tasks(tenant_id, request_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_tasks_tenant_assignee ON warehouse_tasks(tenant_id, assigned_to_user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS warehouse_task_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  warehouse_task_id TEXT NOT NULL REFERENCES warehouse_tasks(id) ON DELETE CASCADE,
  request_line_id TEXT NOT NULL REFERENCES request_lines(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  requested_quantity INTEGER NOT NULL DEFAULT 0,
  picked_quantity INTEGER NOT NULL DEFAULT 0,
  issued_quantity INTEGER NOT NULL DEFAULT 0,
  short_quantity INTEGER NOT NULL DEFAULT 0,
  unit_of_measure TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  lot_no TEXT NOT NULL DEFAULT '',
  serial_no TEXT NOT NULL DEFAULT '',
  expiry_date TEXT,
  exception_reason TEXT NOT NULL DEFAULT '',
  evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_warehouse_task_lines_task_request_line ON warehouse_task_lines(tenant_id, warehouse_task_id, request_line_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_task_lines_tenant_status ON warehouse_task_lines(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_task_lines_tenant_item ON warehouse_task_lines(tenant_id, item_id, status);
