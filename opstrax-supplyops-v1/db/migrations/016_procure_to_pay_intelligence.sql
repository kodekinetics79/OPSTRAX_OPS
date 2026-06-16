PRAGMA foreign_keys = ON;

ALTER TABLE tenants ADD COLUMN p2p_enabled INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS vendor_invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  vendor_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  purchase_order_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  receiving_session_id TEXT REFERENCES receive_sessions(id) ON DELETE SET NULL,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  invoice_date TEXT NOT NULL DEFAULT (datetime('now')),
  due_date TEXT,
  subtotal_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  freight_amount REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  extraction_provider TEXT NOT NULL DEFAULT 'DETERMINISTIC_DEMO',
  extraction_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  extraction_notes TEXT NOT NULL DEFAULT '',
  extraction_requested_at TEXT,
  extracted_at TEXT,
  match_mode TEXT NOT NULL DEFAULT '2WAY',
  match_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  match_summary TEXT NOT NULL DEFAULT '',
  submitted_at TEXT,
  submitted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TEXT,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TEXT,
  rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT NOT NULL DEFAULT '',
  export_ready_at TEXT,
  exported_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS vendor_invoice_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_invoice_id TEXT NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  purchase_order_line_id TEXT REFERENCES purchase_order_lines(id) ON DELETE SET NULL,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  match_status TEXT NOT NULL DEFAULT 'PENDING',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_extraction_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_invoice_id TEXT NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  status TEXT NOT NULL,
  request_payload_json TEXT NOT NULL DEFAULT '{}',
  response_payload_json TEXT NOT NULL DEFAULT '{}',
  normalized_payload_json TEXT NOT NULL DEFAULT '{}',
  error_message TEXT NOT NULL DEFAULT '',
  requested_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_match_results (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_invoice_id TEXT NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  match_mode TEXT NOT NULL,
  status TEXT NOT NULL,
  blocker_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  info_count INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '{}',
  matched_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_match_exceptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_invoice_id TEXT NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  vendor_invoice_line_id TEXT REFERENCES vendor_invoice_lines(id) ON DELETE CASCADE,
  severity TEXT NOT NULL,
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  expected_value TEXT NOT NULL DEFAULT '',
  actual_value TEXT NOT NULL DEFAULT '',
  waived_at TEXT,
  waived_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  waiver_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_approval_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_invoice_id TEXT NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rfq_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rfq_no TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  requested_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_at TEXT,
  sent_at TEXT,
  evaluated_at TEXT,
  awarded_at TEXT,
  cancelled_at TEXT,
  cancel_reason TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, rfq_no)
);

CREATE TABLE IF NOT EXISTS rfq_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rfq_request_id TEXT NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  target_unit_price REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vendor_quotes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rfq_request_id TEXT NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  quote_no TEXT NOT NULL,
  status TEXT NOT NULL,
  subtotal_amount REAL NOT NULL DEFAULT 0,
  freight_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  submitted_at TEXT,
  shortlisted_at TEXT,
  awarded_at TEXT,
  rejected_at TEXT,
  expired_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, quote_no)
);

ALTER TABLE rfq_requests ADD COLUMN awarded_quote_id TEXT REFERENCES vendor_quotes(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS vendor_quote_lines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_quote_id TEXT NOT NULL REFERENCES vendor_quotes(id) ON DELETE CASCADE,
  rfq_line_id TEXT REFERENCES rfq_lines(id) ON DELETE SET NULL,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  lead_time_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vendor_scorecards (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  score_date TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  on_time_delivery_rate REAL NOT NULL DEFAULT 0,
  invoice_match_rate REAL NOT NULL DEFAULT 0,
  rfq_win_rate REAL NOT NULL DEFAULT 0,
  quality_rate REAL NOT NULL DEFAULT 0,
  open_exceptions INTEGER NOT NULL DEFAULT 0,
  spend_90d REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  summary TEXT NOT NULL DEFAULT '',
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_invoices_tenant_vendor ON vendor_invoices(tenant_id, vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_tenant_po ON vendor_invoices(tenant_id, purchase_order_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_tenant_receiving ON vendor_invoices(tenant_id, receiving_session_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_tenant_number ON vendor_invoices(tenant_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_tenant_status ON vendor_invoices(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_lines_tenant_invoice ON vendor_invoice_lines(tenant_id, vendor_invoice_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_extraction_runs_tenant_invoice ON invoice_extraction_runs(tenant_id, vendor_invoice_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_match_results_tenant_invoice ON invoice_match_results(tenant_id, vendor_invoice_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_match_exceptions_tenant_invoice ON invoice_match_exceptions(tenant_id, vendor_invoice_id, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_approval_events_tenant_invoice ON invoice_approval_events(tenant_id, vendor_invoice_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_tenant_vendor ON rfq_requests(tenant_id, requested_by_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_tenant_status ON rfq_requests(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfq_lines_tenant_rfq ON rfq_lines(tenant_id, rfq_request_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_quotes_tenant_rfq_vendor ON vendor_quotes(tenant_id, rfq_request_id, vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_quotes_tenant_status ON vendor_quotes(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_quote_lines_tenant_quote ON vendor_quote_lines(tenant_id, vendor_quote_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_scorecards_tenant_vendor ON vendor_scorecards(tenant_id, vendor_id, score_date DESC, created_at DESC);
