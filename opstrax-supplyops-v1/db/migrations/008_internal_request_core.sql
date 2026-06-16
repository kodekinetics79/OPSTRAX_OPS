PRAGMA foreign_keys = ON;

ALTER TABLE internal_requests ADD COLUMN submitted_at TEXT;
ALTER TABLE internal_requests ADD COLUMN submitted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE internal_requests ADD COLUMN canceled_at TEXT;
ALTER TABLE internal_requests ADD COLUMN canceled_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE internal_requests ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_internal_requests_tenant_department_status ON internal_requests(tenant_id, department_id, status, created_at DESC);

INSERT INTO permissions (key, name, description, active)
VALUES
  ('submit_request', 'Submit requests', 'Submit internal requests for review.', 1),
  ('cancel_request', 'Cancel requests', 'Cancel internal requests before issue.', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  active = excluded.active;

UPDATE role_permissions SET enabled = 1 WHERE role_key IN ('admin', 'supervisor', 'requester') AND permission_key = 'submit_request';
UPDATE role_permissions SET enabled = 1 WHERE role_key IN ('admin', 'supervisor', 'requester') AND permission_key = 'cancel_request';

UPDATE internal_requests
SET
  submitted_at = COALESCE(submitted_at, CASE WHEN status = 'DRAFT' THEN NULL ELSE created_at END),
  submitted_by_user_id = COALESCE(submitted_by_user_id, CASE WHEN status = 'DRAFT' THEN NULL ELSE requested_by_user_id END),
  canceled_at = COALESCE(canceled_at, CASE WHEN status = 'CANCELLED' THEN created_at ELSE NULL END),
  canceled_by_user_id = COALESCE(canceled_by_user_id, CASE WHEN status = 'CANCELLED' THEN requested_by_user_id ELSE NULL END),
  cancel_reason = COALESCE(NULLIF(cancel_reason, ''), '')
;

UPDATE request_lines
SET status = CASE
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status = 'CANCELLED'
  ) THEN 'CANCELLED'
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status = 'ISSUED'
  ) THEN 'ISSUED'
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status = 'APPROVED'
  ) THEN 'APPROVED'
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status = 'PICKING'
  ) THEN 'PICKING'
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status = 'SUBMITTED'
  ) THEN 'SUBMITTED'
  ELSE 'DRAFT'
END
WHERE EXISTS (
  SELECT 1
  FROM internal_requests r
  WHERE r.id = request_lines.request_id
    AND r.tenant_id = request_lines.tenant_id
);
