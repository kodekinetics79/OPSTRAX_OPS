PRAGMA foreign_keys = ON;

-- Harden devices: add trust state machine and provenance fields
ALTER TABLE devices ADD COLUMN device_code TEXT NOT NULL DEFAULT '';
ALTER TABLE devices ADD COLUMN trust_state TEXT NOT NULL DEFAULT 'TRUSTED';
ALTER TABLE devices ADD COLUMN assigned_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE devices ADD COLUMN last_sync_at TEXT;
ALTER TABLE devices ADD COLUMN revoked_at TEXT;
ALTER TABLE devices ADD COLUMN suspended_at TEXT;
ALTER TABLE devices ADD COLUMN created_at TEXT;
ALTER TABLE devices ADD COLUMN created_by_user_id TEXT;
ALTER TABLE devices ADD COLUMN updated_at TEXT;
ALTER TABLE devices ADD COLUMN updated_by_user_id TEXT;

-- Device events: scan event capture
CREATE TABLE IF NOT EXISTS device_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL DEFAULT 'BARCODE',
  raw_value TEXT NOT NULL,
  parsed_type TEXT NOT NULL DEFAULT '',
  parsed_id TEXT NOT NULL DEFAULT '',
  validation_status TEXT NOT NULL DEFAULT 'PENDING',
  validation_message TEXT NOT NULL DEFAULT '',
  context_type TEXT NOT NULL DEFAULT '',
  context_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_device_events_tenant_device ON device_events(tenant_id, device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_events_tenant_status ON device_events(tenant_id, validation_status, created_at DESC);

-- Offline batches: hardened offline workflow with proper state machine
CREATE TABLE IF NOT EXISTS offline_batches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  uploaded_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  batch_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CAPTURED',
  action_count INTEGER NOT NULL DEFAULT 0,
  conflict_count INTEGER NOT NULL DEFAULT 0,
  posted_count INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT,
  validated_at TEXT,
  replayed_at TEXT,
  approved_at TEXT,
  rejected_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE (tenant_id, batch_key)
);

CREATE INDEX IF NOT EXISTS idx_offline_batches_tenant_status ON offline_batches(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_batches_tenant_device ON offline_batches(tenant_id, device_id);

-- Offline tasks / actions per batch
CREATE TABLE IF NOT EXISTS offline_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  offline_batch_id TEXT NOT NULL REFERENCES offline_batches(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action_key TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  payload_hash TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'CAPTURED',
  validation_message TEXT NOT NULL DEFAULT '',
  replay_result TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_offline_tasks_tenant_batch ON offline_tasks(tenant_id, offline_batch_id);
CREATE INDEX IF NOT EXISTS idx_offline_tasks_tenant_status ON offline_tasks(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_tasks_tenant_hash ON offline_tasks(tenant_id, payload_hash);

-- Extend sync_conflicts with new offline batch workflow fields
ALTER TABLE sync_conflicts ADD COLUMN offline_batch_id TEXT REFERENCES offline_batches(id) ON DELETE CASCADE;
ALTER TABLE sync_conflicts ADD COLUMN offline_task_id TEXT REFERENCES offline_tasks(id) ON DELETE CASCADE;
ALTER TABLE sync_conflicts ADD COLUMN entity_type TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN entity_id TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN conflict_summary TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN recommended_resolution TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN supervisor_decision TEXT;
ALTER TABLE sync_conflicts ADD COLUMN decided_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE sync_conflicts ADD COLUMN decided_at TEXT;
ALTER TABLE sync_conflicts ADD COLUMN updated_at TEXT;

-- New permissions for DeviceOps and Offline Sync
INSERT OR IGNORE INTO permissions(key, name, description) VALUES
  ('view_devices', 'View devices', 'Read device registry and trust posture.'),
  ('manage_devices', 'Manage devices', 'Create and update devices in the registry.'),
  ('trust_device', 'Trust device', 'Set device to trusted state.'),
  ('suspend_device', 'Suspend device', 'Suspend a trusted device.'),
  ('revoke_device', 'Revoke device', 'Permanently revoke a device.'),
  ('record_scan_event', 'Record scan event', 'Record barcode or QR scan events from a device.'),
  ('validate_scan', 'Validate scan', 'Validate scan input against inventory context.'),
  ('view_offline_batches', 'View offline batches', 'Read offline sync batches and task detail.'),
  ('create_offline_batch', 'Create offline batch', 'Create and upload offline sync batches.'),
  ('validate_offline_batch', 'Validate offline batch', 'Run server-side validation on offline batches.'),
  ('replay_offline_batch', 'Replay offline batch', 'Replay offline batch actions against backend services.'),
  ('approve_offline_batch', 'Approve offline batch', 'Approve offline batches for posting.'),
  ('reject_offline_batch', 'Reject offline batch', 'Reject offline batches from posting.'),
  ('view_sync_conflicts', 'View sync conflicts', 'Read sync conflict records.'),
  ('resolve_sync_conflicts', 'Resolve sync conflicts', 'Approve or reject individual sync conflicts.');

-- Role-permission grants are applied at seed time via seedFoundationAccess() to avoid
-- FK violations when migration runs before the roles table is populated.
