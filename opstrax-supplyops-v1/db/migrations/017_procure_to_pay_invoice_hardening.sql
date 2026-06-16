PRAGMA foreign_keys = ON;

ALTER TABLE vendor_invoices ADD COLUMN cancelled_at TEXT;
ALTER TABLE vendor_invoices ADD COLUMN cancelled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE vendor_invoices ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE vendor_invoices ADD COLUMN extraction_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE vendor_invoices ADD COLUMN match_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE vendor_invoices ADD COLUMN export_delivery_status TEXT NOT NULL DEFAULT 'NOT_REQUESTED';
ALTER TABLE vendor_invoices ADD COLUMN export_delivery_notes TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_vendor_invoices_tenant_delivery ON vendor_invoices(tenant_id, export_delivery_status, status, created_at DESC);
