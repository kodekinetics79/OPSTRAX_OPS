PRAGMA foreign_keys = ON;

ALTER TABLE vendors ADD COLUMN contact_name TEXT NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN email TEXT NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN phone TEXT NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN last_reviewed_at TEXT;

ALTER TABLE purchase_requests ADD COLUMN vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE purchase_requests ADD COLUMN submitted_at TEXT;
ALTER TABLE purchase_requests ADD COLUMN submitted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_requests ADD COLUMN rejected_at TEXT;
ALTER TABLE purchase_requests ADD COLUMN rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_requests ADD COLUMN rejection_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_requests ADD COLUMN cancelled_at TEXT;
ALTER TABLE purchase_requests ADD COLUMN cancelled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_requests ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_requests ADD COLUMN closed_at TEXT;
ALTER TABLE purchase_requests ADD COLUMN closed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_requests ADD COLUMN updated_at TEXT;
ALTER TABLE purchase_requests ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE purchase_request_lines ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE purchase_request_lines ADD COLUMN created_at TEXT;
ALTER TABLE purchase_request_lines ADD COLUMN updated_at TEXT;
ALTER TABLE purchase_request_lines ADD COLUMN created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_request_lines ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE purchase_orders ADD COLUMN source_purchase_request_id TEXT REFERENCES purchase_requests(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN approved_at TEXT;
ALTER TABLE purchase_orders ADD COLUMN approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN issued_at TEXT;
ALTER TABLE purchase_orders ADD COLUMN issued_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN cancelled_at TEXT;
ALTER TABLE purchase_orders ADD COLUMN cancelled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN closed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN notes TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  purchase_request_line_id TEXT REFERENCES purchase_request_lines(id) ON DELETE SET NULL,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty_ordered INTEGER NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_tenant_vendor ON purchase_requests(tenant_id, vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_request_lines_tenant_request ON purchase_request_lines(tenant_id, purchase_request_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_vendor ON purchase_orders(tenant_id, vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_order_lines_tenant_order ON purchase_order_lines(tenant_id, purchase_order_id, status);
