# OpsTrax SupplyOps — Technical Architecture Summary

## Runtime Architecture

- **Application server:** Node HTTP server
- **Frontend:** server-rendered shell and module views
- **Demo database:** SQLite, seeded deterministically
- **Production database path:** Postgres migration path is documented and intended for production deployments
- **Platform admin surface:** separate `/platform` control plane with its own session cookie, auth bootstrap, and platform audit trail

## Data Model

- tenant-scoped relational data model
- normalized entities for users, roles, scopes, items, bins, requests, purchase requests, purchase orders, receiving, evidence, audit, devices, sync batches, integrations, exports, and AI runs
- all critical records carry tenant ownership and workflow state
- procure-to-pay entities include vendor invoices, invoice lines, invoice exceptions, extraction runs, matching runs, approval events, and export delivery posture

## Procure-to-Pay Workflow States

- vendor invoice lifecycle: `DRAFT` → `UPLOADED` → `EXTRACTION_PENDING` → `EXTRACTED` → `MATCHING_PENDING` → `MATCHED` / `EXCEPTION` → `APPROVAL_PENDING` → `APPROVED` → `EXPORT_READY` → `EXPORTED` / `CANCELLED`
- invoice edits are limited to draft and pre-final states
- matching exceptions must be waived with a reason before approval can proceed
- export delivery is local and deterministic in RC1; external ERP acknowledgement is not claimed unless a real connector is configured

## Authorization Model

- server-owned authorization
- role-based and capability-based checks
- facility and department scoping enforced in backend queries and service logic
- restricted tenant access is denied at the API layer
- platform admin permissions are separate from tenant user permissions
- tenant cookies do not authenticate platform APIs, and platform cookies do not authenticate tenant APIs

## Audit / Event Model

- critical write actions create audit entries
- denied actions are also audit-logged
- evidence and workflow state changes are linked back to auditability
- RC1 uses the audit trail as a first-class surface, not a hidden log dump

## Evidence Model

- evidence is stored as metadata and links in the local demo
- evidence hashes, stored-file metadata, and signed access URLs are part of the compliance posture
- production binary storage is backed by an object-storage abstraction; local filesystem remains the demo/local path

## Reporting Model

- report definitions are backend-owned: 13 tenant reports + 6 platform reports
- report generation is synchronous and tenant-isolated (all queries include `WHERE tenant_id = ?` binding)
- CSV export uses `safeCsvCell()` for formula-injection protection (leading `=`, `+`, `-`, `@` prefixed with `'`)
- PDF export uses stdlib-only PDF generation (no external dependencies); binary buffers start with `%PDF`
- every report run and download is audit-logged; denied report access is logged as `DENIED_ROUTE_ACCESS`
- report run states: `QUEUED` → `RUNNING` → `COMPLETED` / `FAILED` / `CANCELLED`
- platform reports are gated to platform-role users and do not expose tenant operational detail

## Inventory Optimization Model

- cycle count plans follow DRAFT → SCHEDULED → IN_PROGRESS → REVIEW_PENDING → APPROVED → POSTED / CANCELLED lifecycle
- count sessions track per-line variance; variance severity tiers: BLOCKER (controlled item or ≥20%), WARNING (≥5%), INFO (<5%)
- BLOCKER variances structurally block session approval at the service layer — cannot be bypassed via the frontend
- posting a session adjusts `stock_balances` and inserts `stock_movements` with `movement_type=ADJUSTMENT`; posting is idempotent
- replenishment recommendations are generated from live signals: on-hand vs reorder_point, open PO qty, requisition demand, 90-day avg daily issue rate
- converting a recommendation creates a real `internal_request` in DRAFT state; stock is never auto-adjusted
- ABC classification score = value_score (0–40) + movement_score (0–40) + criticality_score (0–20); items with <3 movements in 90 days get `insufficient_history=1` and movement_score=0
- all mutations write to `audit_logs`; tenant isolation enforced via `WHERE tenant_id = ?` binding on every query
- feature flag `inventory_optimization` gates the module; restricted tenants (Evostel) receive 403 on all InvOpt endpoints

## Integration Model

- integration jobs are tracked in the product
- export and integration posture is visible even when a real ERP connector is not configured
- dispatch is foundation/sandbox in RC1, not a completed external handoff

## Offline Validation Model

- offline batches are staged and reviewed before posting
- conflict resolution is validated server-side
- replay cannot bypass service-layer business rules

## CI / Security Checks

- syntax checks via `node --check`
- automated test suite via `npm test`
- build verification via `npm run build`
- supply-chain audit via `npm run security`
- migration verification via `npm run verify-migration`
- browser smoke verification via `npm run browser-smoke`

## Production Path Summary

- SQLite is appropriate for demo/local RC1
- Postgres is the intended production database
- OIDC/SAML must be configured for production identity
- SSO configuration records are tenant-scoped so auth posture can be surfaced safely
- object storage must be configured for production evidence binaries
- backup verification records and restore test records are part of the production posture
- operational monitoring, backups, restore drills, and connector hardening remain part of the production path
