# Phase 3J — Chain-of-Custody + Asset Lifecycle + Returns/Disposal

## Overview

Phase 3J delivers the Asset & Custody Center: a fully audited, tenant-isolated module for tracking serialized and high-value assets from acquisition through disposal. Every custody movement is recorded on an immutable timeline. No asset can change hands, be written off, or be disposed of without an audit trail and required approvals.

## What ships

### Asset Registry
- Serialized and bulk asset tracking with status lifecycle: AVAILABLE → ASSIGNED → IN_TRANSFER → RETURN_PENDING → RETURNED → DAMAGED / LOST / QUARANTINED / IN_MAINTENANCE / DISPOSAL_PENDING → DISPOSED / RETIRED
- Asset numbers: ASSET-XXXX sequential per tenant
- Controlled and high_value flags for elevated handling
- Full search and filter by status, category, controlled flag

### Chain-of-Custody Timeline
- Immutable `asset_custody_events` table (no `updated_at` — append-only)
- Every status transition, assignment, transfer, return, damage report, and disposal writes a timestamped event
- Timeline is sortable by `created_at ASC` and returns actor, from/to custodians per event

### Assignment & Transfer
- Assign asset to a custodian — creates REGISTERED/ASSIGNED events
- Transfer request (TRF-XXXX) requires approval before custodian changes
- Transfer approval updates custodian and writes TRANSFERRED event
- Terminal states (DISPOSED, LOST) block all new assignments and transfers

### Returns
- Return request (RET-XXXX) puts asset in RETURN_PENDING
- Acceptance workflow: MAJOR_DAMAGE → DAMAGED status; otherwise → AVAILABLE
- Condition notes required for acceptance

### Damage / Loss / Quarantine
- Damage and loss condition reports (CDR-XXXX) require a description — enforcement at the service layer, not nullable column
- Loss report sets LOST (terminal state — no reassignment permitted)
- Quarantine/release workflow: QUARANTINED → AVAILABLE after release

### Maintenance
- Maintenance cases (MNT-XXXX): CORRECTIVE, PREVENTIVE, INSPECTION types
- Open → IN_MAINTENANCE; Close → AVAILABLE with resolution notes required
- Maintenance list filterable by status

### Disposal Approval Workflow
- Disposal requests (DIS-XXXX): DRAFT → APPROVAL_PENDING → APPROVED → DISPOSED
- Reason required for both creation and rejection
- Segregation of duties: requester cannot approve their own disposal (HTTP 403)
- `postDisposal` requires APPROVED status — cannot bypass approval step
- Once DISPOSED, asset is terminal — no further state changes permitted

### Evidence Links
- Attach documents, photos, reference IDs to any asset
- Description required; evidence retrievable per-asset ordered by recency

### 6 New Reports (Reports Center → Asset & Custody category)
| Report Key | Coverage |
|---|---|
| `asset_registry_report` | Full registry with custodian, facility, controlled/high-value flags |
| `chain_of_custody_timeline_report` | All custody events per asset, ordered chronologically |
| `asset_assignment_report` | Active and historical assignments with custodian details |
| `damaged_lost_asset_report` | DAMAGED/LOST assets with condition reports and severity |
| `disposal_approval_report` | All disposal requests with approval status and financial data |
| `maintenance_case_report` | Open/closed maintenance cases with resolution notes |

## Security & Compliance Posture

### Tenant isolation
All queries include `WHERE tenant_id = ?` binding. Feature flag `asset_custody` gates the entire module — restricted tenants (e.g. Evostel) receive 403 on all asset API calls.

### RBAC
| Capability | Roles |
|---|---|
| `view_asset_custody` | admin, supervisor, requester, worker, finance |
| `manage_asset_registry` | admin, supervisor |
| `manage_asset_custody` | admin, supervisor, worker |
| `approve_asset_disposal` | admin, supervisor |
| `manage_asset_maintenance` | admin, supervisor |

### Audit logging
Every mutation calls `writeAudit()` — actor, role, department, facility, before/after JSON, entity type/id. Pattern identical to Phase 3I inventory-optimization module.

### Segregation of duties
Disposal approval enforces requester ≠ approver at the service layer — cannot be bypassed via direct DB writes on the frontend.

### No frontend-only state changes
All status transitions are backend-controlled. The frontend renders read state only; all actions go through the API → service → asset-custody module → database chain.

## Data Model

10 new tables in migration 026 (`026_asset_custody_lifecycle.sql`):
- `asset_records` — core registry
- `asset_custody_events` — immutable timeline (no `updated_at`)
- `asset_assignments` — active/historical custodian assignments
- `asset_transfer_requests` — pending and completed transfers
- `asset_return_requests` — return workflow
- `asset_condition_reports` — damage/loss reports (`description NOT NULL`)
- `asset_maintenance_cases` — maintenance lifecycle
- `asset_disposal_requests` — disposal approval workflow (`reason NOT NULL`)
- `asset_evidence_links` — documents and evidence
- `asset_lifecycle_snapshots` — point-in-time snapshots for reporting

## Demo Seed Data (IntelliFlow Systems)
| Asset | Status | Notes |
|---|---|---|
| ASSET-0001 Laptop Pro | ASSIGNED | High-value, controlled — assigned to admin user |
| ASSET-0002 Barcode Scanner | IN_TRANSFER | Transfer request pending approval |
| ASSET-0003 Tool Kit | AVAILABLE | Controlled item |
| ASSET-0004 Field Tablet | RETURN_PENDING | Return requested |
| ASSET-0005 Label Printer | DAMAGED | Condition report on file |
| ASSET-0006 Server Rack | DISPOSAL_PENDING | High-value, disposal approval in queue |

## Definition of Done Checklist
- [x] Migration 026 applied and tracked in schema_migrations
- [x] 10 new tables with full tenant isolation
- [x] asset-custody.js module (~950 lines) with all service functions
- [x] services.js — 26 new exported wrappers with RBAC guards
- [x] server.js — 35 new API routes
- [x] app.js — Asset & Custody Center page with KPI strip, registry, disposal queue, maintenance queue
- [x] reporting.js — 6 new report definitions and data handlers
- [x] seed.js — feature flag, 5 new RBAC capabilities, seed rows for all 6 tenants
- [x] 25+ test cases covering all workflows
- [x] verify-migration.mjs updated to v26
- [x] browser-smoke.mjs covers module nav, API, Evostel restriction

## Constraints Carried Forward
- No Invoice/OCR work included
- No AI execution
- SOC2-ready / audit-ready / control-aligned — not certified
- Staging: no work performed without real external inputs
