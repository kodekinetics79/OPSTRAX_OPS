-- Migration 020: Production Foundation Hardening
-- Adds production-oriented storage, backup, restore, and SSO readiness tables.
-- All additions are tenant-scoped and backward-compatible for local/demo mode.

PRAGMA foreign_keys = ON;

ALTER TABLE documents ADD COLUMN stored_file_name TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN storage_mode TEXT NOT NULL DEFAULT 'filesystem';
ALTER TABLE documents ADD COLUMN storage_key TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN mime_type TEXT NOT NULL DEFAULT 'application/octet-stream';

CREATE TABLE IF NOT EXISTS backup_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL DEFAULT 'AUTOMATED',
  status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  storage_location TEXT NOT NULL DEFAULT '',
  checksum TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
  verified_at TEXT,
  verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_backup_records_tenant_status ON backup_records(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_records_tenant_verification ON backup_records(tenant_id, verification_status, created_at DESC);

CREATE TABLE IF NOT EXISTS restore_test_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  source_backup_id TEXT REFERENCES backup_records(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  tested_at TEXT,
  tested_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_restore_test_records_tenant_status ON restore_test_records(tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS sso_configurations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL DEFAULT 'OIDC',
  status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  issuer TEXT NOT NULL DEFAULT '',
  client_id TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sso_configurations_tenant_status ON sso_configurations(tenant_id, status, created_at DESC);
