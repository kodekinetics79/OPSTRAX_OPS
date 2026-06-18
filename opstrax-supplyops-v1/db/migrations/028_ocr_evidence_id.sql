-- Phase 3L: Link OCR extraction runs to the evidence document that was submitted.
-- Allows the audit trail to show exactly which document file was passed to the OCR provider.

ALTER TABLE invoice_extraction_runs ADD COLUMN evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL;

PRAGMA user_version = 28;
INSERT OR REPLACE INTO schema_migrations (version, applied_at)
  VALUES (28, datetime('now'));
