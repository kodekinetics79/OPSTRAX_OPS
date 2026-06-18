-- Phase 3K: OCR review workflow
-- Adds review columns to invoice_extraction_runs to support the human review workflow:
-- after OCR extraction, proposed values must be reviewed by a human before use.
-- Also adds provider_run_id (external request ID) and overall_confidence per run.

ALTER TABLE invoice_extraction_runs ADD COLUMN provider_run_id TEXT NOT NULL DEFAULT '';
ALTER TABLE invoice_extraction_runs ADD COLUMN overall_confidence REAL NOT NULL DEFAULT 0;
ALTER TABLE invoice_extraction_runs ADD COLUMN proposed_fields_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE invoice_extraction_runs ADD COLUMN review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW';
ALTER TABLE invoice_extraction_runs ADD COLUMN reviewed_at TEXT;
ALTER TABLE invoice_extraction_runs ADD COLUMN reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE invoice_extraction_runs ADD COLUMN review_notes TEXT NOT NULL DEFAULT '';

PRAGMA user_version = 27;
INSERT OR REPLACE INTO schema_migrations (version, applied_at)
  VALUES (27, datetime('now'));
