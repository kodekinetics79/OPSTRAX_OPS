-- Phase 1I: AI Governance + Read-Only Intelligence
-- All AI writes are scoped to AI tables only. No domain mutation.

-- AI agent registry
CREATE TABLE IF NOT EXISTS ai_agents (
  id TEXT PRIMARY KEY,
  agent_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  read_only INTEGER NOT NULL DEFAULT 1,
  provider TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  capabilities TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AI run logs (spec-compliant, distinct from legacy ai_execution_logs)
CREATE TABLE IF NOT EXISTS ai_run_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  run_type TEXT NOT NULL DEFAULT 'GENERATE',
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  provider TEXT NOT NULL DEFAULT 'SYSTEM',
  model TEXT NOT NULL DEFAULT '',
  prompt_hash TEXT NOT NULL DEFAULT '',
  input_record_count INTEGER NOT NULL DEFAULT 0,
  output_record_count INTEGER NOT NULL DEFAULT 0,
  token_input_count INTEGER NOT NULL DEFAULT 0,
  token_output_count INTEGER NOT NULL DEFAULT 0,
  estimated_cost REAL NOT NULL DEFAULT 0.0,
  failure_reason TEXT NOT NULL DEFAULT '',
  started_at TEXT,
  completed_at TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_run_logs_tenant_agent ON ai_run_logs(tenant_id, agent_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_run_logs_tenant_status ON ai_run_logs(tenant_id, status, created_at DESC);

-- Add required columns to ai_recommendations
ALTER TABLE ai_recommendations ADD COLUMN category TEXT NOT NULL DEFAULT '';
ALTER TABLE ai_recommendations ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE ai_recommendations ADD COLUMN severity TEXT NOT NULL DEFAULT 'INFO';
ALTER TABLE ai_recommendations ADD COLUMN recommended_action_label TEXT NOT NULL DEFAULT '';
ALTER TABLE ai_recommendations ADD COLUMN action_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_recommendations ADD COLUMN required_permission TEXT NOT NULL DEFAULT '';
ALTER TABLE ai_recommendations ADD COLUMN facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL;
ALTER TABLE ai_recommendations ADD COLUMN department_id TEXT REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE ai_recommendations ADD COLUMN expires_at TEXT;
ALTER TABLE ai_recommendations ADD COLUMN dismissed_at TEXT;
ALTER TABLE ai_recommendations ADD COLUMN dismissed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ai_recommendations ADD COLUMN created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ai_recommendations ADD COLUMN updated_at TEXT;
ALTER TABLE ai_recommendations ADD COLUMN updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- Add source label to ai_recommendation_sources
ALTER TABLE ai_recommendation_sources ADD COLUMN source_label TEXT NOT NULL DEFAULT '';

-- Add approval tracking columns to ai_approvals
ALTER TABLE ai_approvals ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'REQUESTED';
ALTER TABLE ai_approvals ADD COLUMN requested_action TEXT NOT NULL DEFAULT '';
ALTER TABLE ai_approvals ADD COLUMN approved_at TEXT;
ALTER TABLE ai_approvals ADD COLUMN notes TEXT NOT NULL DEFAULT '';

-- New AI governance permissions
-- (role_permissions omitted from migration — inserted via seedFoundationAccess to avoid FK violation before seed runs)
INSERT OR IGNORE INTO permissions(key, name, description) VALUES
  ('view_ai_summary', 'View AI summary', 'View AI operations summary and KPIs.'),
  ('view_ai_recommendations', 'View AI recommendations', 'Read AI recommendations and source citations.'),
  ('generate_ai_recommendations', 'Generate AI recommendations', 'Trigger AI recommendation generation runs.'),
  ('dismiss_ai_recommendations', 'Dismiss AI recommendations', 'Dismiss AI recommendations from the queue.'),
  ('approve_ai_placeholder', 'Approve AI placeholder', 'Mark an AI recommendation as placeholder-approved (no domain action).'),
  ('view_ai_runs', 'View AI runs', 'Read AI execution run logs.'),
  ('query_ops_copilot', 'Query Ops Copilot', 'Submit read-only queries to the Ops Copilot.'),
  ('view_restricted_ai_context', 'View restricted AI context', 'Allow AI context to include restricted/controlled items.');
