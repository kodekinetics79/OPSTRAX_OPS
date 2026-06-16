PRAGMA foreign_keys = ON;

ALTER TABLE internal_requests ADD COLUMN reason TEXT NOT NULL DEFAULT '';
ALTER TABLE internal_requests ADD COLUMN needed_by_date TEXT;
ALTER TABLE internal_requests ADD COLUMN issue_ready_at TEXT;
ALTER TABLE internal_requests ADD COLUMN issue_ready_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE internal_requests ADD COLUMN rejected_at TEXT;
ALTER TABLE internal_requests ADD COLUMN rejected_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE internal_requests ADD COLUMN rejection_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE internal_requests ADD COLUMN closed_at TEXT;
ALTER TABLE internal_requests ADD COLUMN closed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_internal_requests_tenant_status_created ON internal_requests(tenant_id, status, created_at DESC);

INSERT INTO permissions (key, name, description, active)
VALUES
  ('reject_request', 'Reject requests', 'Reject internal requests after review.', 1)
ON CONFLICT(key) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  active = excluded.active;

UPDATE role_permissions SET enabled = 1 WHERE role_key IN ('admin', 'supervisor') AND permission_key = 'reject_request';

UPDATE internal_requests
SET
  reason = COALESCE(NULLIF(reason, ''), purpose),
  issue_ready_at = COALESCE(issue_ready_at, CASE WHEN status IN ('APPROVED', 'ISSUE_READY') THEN approved_at ELSE NULL END),
  issue_ready_by_user_id = COALESCE(issue_ready_by_user_id, approved_by_user_id),
  rejected_at = COALESCE(rejected_at, CASE WHEN status = 'REJECTED' THEN created_at ELSE NULL END),
  rejected_by_user_id = COALESCE(rejected_by_user_id, CASE WHEN status = 'REJECTED' THEN requested_by_user_id ELSE NULL END),
  rejection_reason = COALESCE(NULLIF(rejection_reason, ''), ''),
  closed_at = COALESCE(closed_at, CASE WHEN status = 'CLOSED' THEN created_at ELSE NULL END),
  closed_by_user_id = COALESCE(closed_by_user_id, CASE WHEN status = 'CLOSED' THEN requested_by_user_id ELSE NULL END)
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
      AND r.status = 'REJECTED'
  ) THEN 'REJECTED'
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status IN ('APPROVED', 'ISSUE_READY')
  ) THEN 'ISSUE_READY'
  WHEN EXISTS (
    SELECT 1
    FROM internal_requests r
    WHERE r.id = request_lines.request_id
      AND r.tenant_id = request_lines.tenant_id
      AND r.status = 'SUBMITTED'
  ) THEN 'REQUESTED'
  ELSE 'DRAFT'
END
WHERE EXISTS (
  SELECT 1
  FROM internal_requests r
  WHERE r.id = request_lines.request_id
    AND r.tenant_id = request_lines.tenant_id
);
