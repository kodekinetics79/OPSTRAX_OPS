PRAGMA foreign_keys = ON;

ALTER TABLE items ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE items ADD COLUMN item_category_id TEXT REFERENCES item_categories(id) ON DELETE SET NULL;
ALTER TABLE items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'SUPPLY';
ALTER TABLE items ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE items ADD COLUMN controlled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN min_stock INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN max_stock INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN reorder_point INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN lot_required INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN serial_required INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN expiry_required INTEGER NOT NULL DEFAULT 0;
ALTER TABLE items ADD COLUMN unit_of_measure TEXT NOT NULL DEFAULT '';
ALTER TABLE items ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE items ADD COLUMN created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE items ADD COLUMN updated_at TEXT;
ALTER TABLE items ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE stock_movements ADD COLUMN reason TEXT NOT NULL DEFAULT '';
ALTER TABLE stock_movements ADD COLUMN before_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN after_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN status TEXT NOT NULL DEFAULT 'POSTED';
ALTER TABLE stock_movements ADD COLUMN lot_no TEXT NOT NULL DEFAULT '';
ALTER TABLE stock_movements ADD COLUMN serial_no TEXT NOT NULL DEFAULT '';
ALTER TABLE stock_movements ADD COLUMN expiry_date TEXT;
ALTER TABLE stock_movements ADD COLUMN evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE stock_movements ADD COLUMN adjustment_id TEXT REFERENCES stock_adjustments(id) ON DELETE SET NULL;
ALTER TABLE stock_movements ADD COLUMN posted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE stock_movements ADD COLUMN posted_at TEXT;

ALTER TABLE stock_adjustments ADD COLUMN before_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stock_adjustments ADD COLUMN after_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stock_adjustments ADD COLUMN lot_no TEXT NOT NULL DEFAULT '';
ALTER TABLE stock_adjustments ADD COLUMN serial_no TEXT NOT NULL DEFAULT '';
ALTER TABLE stock_adjustments ADD COLUMN expiry_date TEXT;
ALTER TABLE stock_adjustments ADD COLUMN posted_at TEXT;
ALTER TABLE stock_adjustments ADD COLUMN posted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE stock_adjustments ADD COLUMN movement_id TEXT REFERENCES stock_movements(id) ON DELETE SET NULL;
ALTER TABLE stock_adjustments ADD COLUMN status_note TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_items_tenant_category ON items(tenant_id, item_category_id);
CREATE INDEX IF NOT EXISTS idx_items_tenant_status ON items(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_item_created ON stock_movements(tenant_id, item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_type_created ON stock_movements(tenant_id, movement_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_tenant_item_created ON stock_adjustments(tenant_id, item_id, created_at DESC);

INSERT INTO permissions (key, name, description, active)
VALUES
  ('manage_items', 'Manage items', 'Create and update inventory item master records.', 1),
  ('adjust_stock', 'Adjust stock', 'Post stock adjustments and linked movements.', 1),
  ('view_stock_movements', 'View stock movements', 'Read movement and adjustment history.', 1),
  ('view_restricted_items', 'View restricted items', 'See controlled or restricted inventory items.', 1),
  ('manage_restricted_items', 'Manage restricted items', 'Create and update restricted inventory items.', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  active = excluded.active;

UPDATE role_permissions SET enabled = 1 WHERE role_key = 'admin' AND permission_key IN (
  'manage_items',
  'adjust_stock',
  'view_stock_movements',
  'view_restricted_items',
  'manage_restricted_items'
);
UPDATE role_permissions SET enabled = 1 WHERE role_key = 'supervisor' AND permission_key IN (
  'manage_items',
  'adjust_stock',
  'view_stock_movements',
  'view_restricted_items',
  'manage_restricted_items'
);
UPDATE role_permissions SET enabled = 1 WHERE role_key = 'worker' AND permission_key = 'view_stock_movements';
UPDATE role_permissions SET enabled = 1 WHERE role_key = 'finance' AND permission_key = 'view_stock_movements';
UPDATE role_permissions SET enabled = 0 WHERE role_key = 'requester' AND permission_key = 'manage_inventory';
UPDATE role_permissions SET enabled = 0 WHERE role_key = 'worker' AND permission_key = 'manage_inventory';

UPDATE items
SET
  description = COALESCE(NULLIF(description, ''), name),
  item_category_id = COALESCE(
    item_category_id,
    (
      SELECT ic.id
      FROM item_categories ic
      WHERE ic.tenant_id = items.tenant_id AND ic.name = items.category
      LIMIT 1
    )
  ),
  item_type = CASE WHEN restricted = 1 THEN 'CONTROLLED' ELSE COALESCE(NULLIF(item_type, ''), 'SUPPLY') END,
  status = COALESCE(NULLIF(status, ''), 'ACTIVE'),
  controlled = restricted,
  min_stock = CASE WHEN min_stock = 0 THEN min_qty ELSE min_stock END,
  max_stock = CASE WHEN max_stock = 0 THEN max_qty ELSE max_stock END,
  reorder_point = CASE WHEN reorder_point = 0 THEN min_qty ELSE reorder_point END,
  lot_required = CASE WHEN lot_required = 0 AND category = 'Medical Supplies' THEN 1 ELSE lot_required END,
  serial_required = CASE WHEN serial_required = 0 AND restricted = 1 THEN 1 ELSE serial_required END,
  expiry_required = CASE WHEN expiry_required = 0 AND category = 'Medical Supplies' THEN 1 ELSE expiry_required END,
  unit_of_measure = COALESCE(NULLIF(unit_of_measure, ''), uom),
  created_at = COALESCE(NULLIF(created_at, ''), datetime('now')),
  created_by_user_id = COALESCE(created_by_user_id, (
    SELECT u.id
    FROM users u
    WHERE u.tenant_id = items.tenant_id AND u.role_key = 'admin'
    LIMIT 1
  )),
  updated_at = COALESCE(updated_at, datetime('now')),
  updated_by_user_id = COALESCE(updated_by_user_id, (
    SELECT u.id
    FROM users u
    WHERE u.tenant_id = items.tenant_id AND u.role_key = 'admin'
    LIMIT 1
  ));

UPDATE stock_adjustments
SET
  before_quantity = COALESCE(before_quantity, 0),
  after_quantity = CASE WHEN after_quantity = 0 THEN quantity_delta ELSE after_quantity END,
  status_note = COALESCE(NULLIF(status_note, ''), ''),
  posted_at = COALESCE(posted_at, created_at),
  posted_by_user_id = COALESCE(posted_by_user_id, approved_by_user_id, reviewed_by_user_id, requested_by_user_id)
;

UPDATE stock_movements
SET
  reason = COALESCE(NULLIF(reason, ''), note),
  before_quantity = CASE WHEN before_quantity = 0 THEN 0 ELSE before_quantity END,
  after_quantity = CASE WHEN after_quantity = 0 THEN quantity ELSE after_quantity END,
  status = COALESCE(NULLIF(status, ''), 'POSTED'),
  lot_no = COALESCE(NULLIF(lot_no, ''), ''),
  serial_no = COALESCE(NULLIF(serial_no, ''), ''),
  posted_by_user_id = COALESCE(posted_by_user_id, performed_by_user_id),
  posted_at = COALESCE(posted_at, created_at)
;
