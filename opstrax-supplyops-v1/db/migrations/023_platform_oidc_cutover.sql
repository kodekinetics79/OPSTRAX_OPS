-- Migration 023: Platform OIDC cutover
-- Adds platform OIDC identity mapping and login request state so the
-- platform admin control plane can authenticate separately from tenant users.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS platform_auth_login_requests (
  state TEXT PRIMARY KEY,
  code_verifier TEXT NOT NULL,
  return_to TEXT NOT NULL DEFAULT '/platform/dashboard',
  nonce TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_auth_login_requests_expires ON platform_auth_login_requests(expires_at);

CREATE TABLE IF NOT EXISTS platform_auth_identities (
  id TEXT PRIMARY KEY,
  platform_user_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  subject TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  last_login_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  UNIQUE(provider, subject)
);

CREATE INDEX IF NOT EXISTS idx_platform_auth_identities_user ON platform_auth_identities(platform_user_id);
