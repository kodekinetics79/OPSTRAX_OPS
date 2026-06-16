PRAGMA foreign_keys = ON;

ALTER TABLE vendors ADD COLUMN blocked_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN last_compliance_review_at TEXT;
ALTER TABLE vendors ADD COLUMN last_contract_review_at TEXT;

CREATE TABLE IF NOT EXISTS cost_centers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_cost_centers_tenant_department ON cost_centers(tenant_id, department_id, status);

ALTER TABLE purchase_requests ADD COLUMN cost_center_id TEXT REFERENCES cost_centers(id) ON DELETE RESTRICT;
ALTER TABLE purchase_orders ADD COLUMN cost_center_id TEXT REFERENCES cost_centers(id) ON DELETE RESTRICT;
ALTER TABLE vendor_invoices ADD COLUMN cost_center_id TEXT REFERENCES cost_centers(id) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS supplier_compliance_documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  issued_at TEXT,
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'VALID',
  required INTEGER NOT NULL DEFAULT 1,
  evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_supplier_docs_tenant_vendor ON supplier_compliance_documents(tenant_id, vendor_id, status, expires_at);

CREATE TABLE IF NOT EXISTS supplier_contracts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  contract_no TEXT NOT NULL,
  title TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  document_reference TEXT NOT NULL DEFAULT '',
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  item_category TEXT NOT NULL DEFAULT '',
  pricing_reference TEXT NOT NULL DEFAULT '',
  renewal_alert_at TEXT,
  renewal_alert_status TEXT NOT NULL DEFAULT 'NONE',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, contract_no)
);

CREATE INDEX IF NOT EXISTS idx_supplier_contracts_tenant_vendor ON supplier_contracts(tenant_id, vendor_id, status, expiry_date);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_tenant_category ON supplier_contracts(tenant_id, item_category, status, expiry_date);

CREATE TABLE IF NOT EXISTS procurement_waivers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  waiver_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'APPROVED',
  expires_at TEXT,
  approved_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approved_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_procurement_waivers_tenant_entity ON procurement_waivers(tenant_id, waiver_type, entity_type, entity_id, status);

CREATE TABLE IF NOT EXISTS department_budgets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  cost_center_id TEXT NOT NULL REFERENCES cost_centers(id) ON DELETE RESTRICT,
  fiscal_year INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  budget_amount REAL NOT NULL DEFAULT 0,
  reserved_amount REAL NOT NULL DEFAULT 0,
  consumed_amount REAL NOT NULL DEFAULT 0,
  alert_threshold_pct REAL NOT NULL DEFAULT 0.85,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, cost_center_id, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_department_budgets_tenant_center ON department_budgets(tenant_id, cost_center_id, fiscal_year, status);

CREATE TABLE IF NOT EXISTS budget_ledger_entries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_budget_id TEXT NOT NULL REFERENCES department_budgets(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, department_budget_id, entry_type, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_budget_ledger_tenant_budget ON budget_ledger_entries(tenant_id, department_budget_id, entry_type, status, created_at DESC);
