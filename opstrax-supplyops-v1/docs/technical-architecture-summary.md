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
