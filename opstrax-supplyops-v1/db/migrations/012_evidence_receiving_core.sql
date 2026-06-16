PRAGMA foreign_keys = ON;

ALTER TABLE documents ADD COLUMN evidence_state TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE documents ADD COLUMN checksum TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN checksum_algorithm TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN metadata_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE documents ADD COLUMN linked_at TEXT;
ALTER TABLE documents ADD COLUMN verified_at TEXT;
ALTER TABLE documents ADD COLUMN verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN rejected_at TEXT;
ALTER TABLE documents ADD COLUMN rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN archived_at TEXT;
ALTER TABLE documents ADD COLUMN archived_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN updated_at TEXT;

ALTER TABLE purchase_orders ADD COLUMN receiving_status TEXT NOT NULL DEFAULT 'NOT_RECEIVED';
ALTER TABLE purchase_orders ADD COLUMN received_at TEXT;
ALTER TABLE purchase_orders ADD COLUMN received_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN receiving_notes TEXT NOT NULL DEFAULT '';

ALTER TABLE purchase_order_lines ADD COLUMN qty_received INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchase_order_lines ADD COLUMN qty_damaged INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchase_order_lines ADD COLUMN qty_short INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchase_order_lines ADD COLUMN receiving_status TEXT NOT NULL DEFAULT 'NOT_RECEIVED';
ALTER TABLE purchase_order_lines ADD COLUMN received_at TEXT;
ALTER TABLE purchase_order_lines ADD COLUMN received_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_order_lines ADD COLUMN evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL;

ALTER TABLE receive_sessions ADD COLUMN purchase_order_id TEXT REFERENCES purchase_orders(id) ON DELETE CASCADE;
ALTER TABLE receive_sessions ADD COLUMN started_at TEXT;
ALTER TABLE receive_sessions ADD COLUMN posted_at TEXT;
ALTER TABLE receive_sessions ADD COLUMN cancelled_at TEXT;
ALTER TABLE receive_sessions ADD COLUMN cancelled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receive_sessions ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE receive_sessions ADD COLUMN exception_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE receive_sessions ADD COLUMN notes TEXT NOT NULL DEFAULT '';
ALTER TABLE receive_sessions ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS receive_session_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  receive_session_id TEXT NOT NULL REFERENCES receive_sessions(id) ON DELETE CASCADE,
  purchase_order_line_id TEXT NOT NULL REFERENCES purchase_order_lines(id) ON DELETE RESTRICT,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  qty_ordered INTEGER NOT NULL DEFAULT 0,
  qty_received INTEGER NOT NULL DEFAULT 0,
  qty_damaged INTEGER NOT NULL DEFAULT 0,
  qty_short INTEGER NOT NULL DEFAULT 0,
  lot_no TEXT NOT NULL DEFAULT '',
  serial_no TEXT NOT NULL DEFAULT '',
  expiry_date TEXT,
  status TEXT NOT NULL DEFAULT 'NOT_RECEIVED',
  exception_reason TEXT NOT NULL DEFAULT '',
  evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, receive_session_id, purchase_order_line_id)
);

CREATE INDEX IF NOT EXISTS idx_receive_session_lines_tenant_session ON receive_session_lines(tenant_id, receive_session_id, status);
CREATE INDEX IF NOT EXISTS idx_receive_session_lines_tenant_line ON receive_session_lines(tenant_id, purchase_order_line_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_entity_state ON documents(tenant_id, entity_type, entity_id, evidence_state, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_order_lines_tenant_receiving ON purchase_order_lines(tenant_id, purchase_order_id, receiving_status);
