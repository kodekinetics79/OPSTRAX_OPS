PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS wms_capacity_units (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  bin_id TEXT REFERENCES bins(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  capacity_type TEXT NOT NULL DEFAULT 'PALLET_POSITION',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  zone TEXT NOT NULL DEFAULT '',
  temperature_class TEXT NOT NULL DEFAULT 'AMBIENT',
  max_weight REAL NOT NULL DEFAULT 0,
  blocked_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_wms_capacity_tenant_facility ON wms_capacity_units(tenant_id, facility_id, status, code);

CREATE TABLE IF NOT EXISTS wms_handling_units (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  parent_handling_unit_id TEXT REFERENCES wms_handling_units(id) ON DELETE SET NULL,
  lpn TEXT NOT NULL,
  sscc TEXT NOT NULL DEFAULT '',
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  owner_type TEXT NOT NULL DEFAULT 'CUSTOMER',
  owner_ref TEXT NOT NULL DEFAULT '',
  quantity REAL NOT NULL DEFAULT 0,
  uom TEXT NOT NULL DEFAULT 'EA',
  lot_no TEXT NOT NULL DEFAULT '',
  serial_no TEXT NOT NULL DEFAULT '',
  expiry_date TEXT,
  inventory_status TEXT NOT NULL DEFAULT 'RECEIVED_NOT_INSPECTED',
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  current_capacity_unit_id TEXT REFERENCES wms_capacity_units(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL DEFAULT '',
  source_id TEXT NOT NULL DEFAULT '',
  expected_release_at TEXT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  released_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, lpn)
);
CREATE INDEX IF NOT EXISTS idx_wms_hu_tenant_status ON wms_handling_units(tenant_id, facility_id, inventory_status, status);
CREATE INDEX IF NOT EXISTS idx_wms_hu_tenant_owner ON wms_handling_units(tenant_id, owner_ref, status);
CREATE INDEX IF NOT EXISTS idx_wms_hu_tenant_item ON wms_handling_units(tenant_id, item_id, inventory_status);

CREATE TABLE IF NOT EXISTS wms_quality_inspections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  handling_unit_id TEXT NOT NULL REFERENCES wms_handling_units(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  received_qty REAL NOT NULL DEFAULT 0,
  accepted_qty REAL NOT NULL DEFAULT 0,
  rejected_qty REAL NOT NULL DEFAULT 0,
  pending_qty REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  inspected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  inspected_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wms_quality_tenant_status ON wms_quality_inspections(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS wms_space_occupancies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  capacity_unit_id TEXT NOT NULL REFERENCES wms_capacity_units(id) ON DELETE RESTRICT,
  handling_unit_id TEXT NOT NULL REFERENCES wms_handling_units(id) ON DELETE CASCADE,
  customer_ref TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  started_at TEXT NOT NULL,
  expected_release_at TEXT,
  ended_at TEXT,
  release_confidence REAL NOT NULL DEFAULT 35,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_wms_occupancy_active ON wms_space_occupancies(tenant_id, facility_id, status, expected_release_at);
CREATE INDEX IF NOT EXISTS idx_wms_occupancy_unit ON wms_space_occupancies(tenant_id, capacity_unit_id, status);

CREATE TABLE IF NOT EXISTS wms_space_reservations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  capacity_unit_id TEXT NOT NULL REFERENCES wms_capacity_units(id) ON DELETE RESTRICT,
  customer_ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  reserved_from TEXT NOT NULL,
  reserved_until TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'SALES',
  source_id TEXT NOT NULL DEFAULT '',
  quoted_rate REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  cancelled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_wms_reservation_window ON wms_space_reservations(tenant_id, facility_id, status, reserved_from, reserved_until);
CREATE INDEX IF NOT EXISTS idx_wms_reservation_unit ON wms_space_reservations(tenant_id, capacity_unit_id, status, reserved_from);

CREATE TABLE IF NOT EXISTS wms_allocations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  demand_type TEXT NOT NULL,
  demand_id TEXT NOT NULL,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  handling_unit_id TEXT NOT NULL REFERENCES wms_handling_units(id) ON DELETE RESTRICT,
  quantity REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'ALLOCATED',
  allocated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  allocated_at TEXT NOT NULL DEFAULT (datetime('now')),
  released_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_wms_allocations_demand ON wms_allocations(tenant_id, demand_type, demand_id, status);
CREATE INDEX IF NOT EXISTS idx_wms_allocations_hu ON wms_allocations(tenant_id, handling_unit_id, status);

CREATE TABLE IF NOT EXISTS wms_customer_contracts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  currency TEXT NOT NULL DEFAULT 'USD',
  storage_rate_per_unit_day REAL NOT NULL DEFAULT 0,
  receiving_rate_per_unit REAL NOT NULL DEFAULT 0,
  outbound_rate_per_unit REAL NOT NULL DEFAULT 0,
  minimum_billable_days INTEGER NOT NULL DEFAULT 1,
  effective_from TEXT NOT NULL,
  effective_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, customer_ref, effective_from)
);
CREATE INDEX IF NOT EXISTS idx_wms_contract_customer ON wms_customer_contracts(tenant_id, customer_ref, status, effective_from);

CREATE TABLE IF NOT EXISTS wms_billable_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_ref TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  handling_unit_id TEXT REFERENCES wms_handling_units(id) ON DELETE SET NULL,
  capacity_unit_id TEXT REFERENCES wms_capacity_units(id) ON DELETE SET NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_rate REAL NOT NULL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  pricing_status TEXT NOT NULL DEFAULT 'UNPRICED',
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wms_billing_customer ON wms_billable_events(tenant_id, customer_ref, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_wms_billing_status ON wms_billable_events(tenant_id, pricing_status, occurred_at DESC);

CREATE TABLE IF NOT EXISTS wms_operational_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, event_type, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_wms_events_entity ON wms_operational_events(tenant_id, entity_type, entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_wms_events_type ON wms_operational_events(tenant_id, event_type, occurred_at DESC);

INSERT INTO wms_capacity_units (
  id, tenant_id, facility_id, bin_id, code, capacity_type, status, zone, created_at, updated_at
)
SELECT
  'wms_cu_' || b.id,
  b.tenant_id,
  b.facility_id,
  b.id,
  b.code || '-P01',
  'PALLET_POSITION',
  'AVAILABLE',
  COALESCE(b.zone, ''),
  datetime('now'),
  datetime('now')
FROM bins b
WHERE NOT EXISTS (
  SELECT 1 FROM wms_capacity_units cu WHERE cu.tenant_id = b.tenant_id AND cu.bin_id = b.id
);
