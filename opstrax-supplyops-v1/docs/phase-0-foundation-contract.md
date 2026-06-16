# OpsTrax SupplyOps Phase 0 Foundation Contract

## 1. Strict architecture verdict

Verdict: conditionally ready.

The blueprint is directionally correct, and the codebase already has a usable Node + SQLite foundation with server-owned checks. It is not yet fully build-ready as a government-grade contract because the following must be fixed before Phase 1 implementation is considered unambiguous:

1. Canonical role/permission matrix must be frozen.
2. Workflow state machines must be explicit and testable.
3. Core database entities must be enumerated as contract objects, not implied.
4. API groups must have fixed request/response shapes and denial rules.
5. Offline sync, evidence, export, and AI action rules must be defined as backend obligations.
6. CI gates must be measurable and enforced before merge.

Build may proceed only after the remaining ambiguities below are closed in this spec.

## 2. Phase 0 foundation verification

Phase 0 is complete only when these checks pass on a fresh database and on an upgraded database:

### Tenant isolation

- Every tenant-scoped query includes `tenant_id = :tenant_id`.
- Every access path rejects cross-tenant object IDs with `404` or `403`, never by silent fallback.
- A user from Tenant A cannot read tenant metadata, documents, audit, exports, devices, or stock from Tenant B.
- Direct API calls with forged tenant headers or query params are denied server-side.

Verification:

- Attempt read, write, approve, and export actions using a valid user from the wrong tenant.
- Attempt list endpoints with tenant headers pointing to a different tenant.
- Attempt object fetches using real IDs from a different tenant.

### RBAC

- The backend resolves role permissions from the database or a deterministic role map.
- UI visibility is advisory only.
- Every privileged route checks capability before business logic.

Verification:

- For each role, call every privileged endpoint directly.
- Expect `403 Missing capability` for disallowed actions.

### ABAC

Attribute rules are mandatory for these dimensions:

- facility
- department
- device trust state
- request ownership
- approval chain position
- export sensitivity
- evidence visibility

Verification:

- A user may only act inside assigned facility and department scope unless explicitly granted a broader scope.
- A worker cannot approve a workflow from a different facility.
- A finance user cannot access restricted evidence outside finance-visible scope.

### Facility and department scoping

- All physical inventory actions require facility scope.
- Human workflows require department scope.
- If an object lacks valid facility or department ownership, the write is rejected.

Verification:

- Create, approve, issue, receive, and export paths must fail if the related facility or department is missing or out of scope.

### Feature flags

- Feature flags are tenant-scoped and server-enforced.
- A disabled feature is denied at API level even if the user has a valid role.
- UI hides disabled modules, but the backend remains the source of truth.

Verification:

- Call disabled endpoints directly for restricted tenants.
- Expect `403 Feature disabled: <feature_key>`.

### Immutable audit trail

- Critical actions append audit rows.
- Audit rows are append-only.
- Audit writes cannot be updated or deleted by application code.
- Each audit entry records actor, tenant, scope, action, before, after, source, and correlation identifier.

Verification:

- Trigger create, approve, issue, export, sync review, conflict resolution, and document upload.
- Confirm a new audit row exists for each.
- Confirm update/delete operations on audit rows are not exposed.

### Evidence model

- Sensitive actions can attach evidence documents or references.
- Evidence records are tenant-scoped and tamper-evident.
- Evidence links are explicit and queryable.

Verification:

- Upload evidence for procurement and export workflows.
- Confirm evidence rows and audit rows are both created.

### Auth and session security

- SSO/OIDC is the production path.
- Dev context is explicitly opt-in and never the production default.
- CSRF is required for mutating browser requests under session auth.
- Session cookies are HttpOnly, same-site, and short-lived.

Verification:

- Validate login, callback, logout, session expiry, and CSRF rejection.

### Migration safety

- Fresh install works from migration 001 to current.
- Upgrade from each prior migration version works without manual intervention.
- Schema changes are additive first, then backfilled, then tightened.

Verification:

- Run fresh DB bootstrap.
- Run upgrade simulation from a DB frozen at each previous schema version.

### Seed tenants

Required seeded tenants:

- `IntelliFlow Systems` as full-capability tenant
- `Evostel LLC` as restricted tenant

Verification:

- Both tenants exist after seed.
- Feature sets differ by design.
- Restricted tenant cannot see full tenant modules.

### Admin and user lifecycle

- Create, disable, and scope users server-side.
- Deactivated users cannot authenticate.
- Role changes are audited.

Verification:

- Disable a user and confirm login/session denial.
- Modify a role or scope and confirm an audit entry.

### API route protection

- Every protected route requires auth context.
- Every mutating route checks CSRF in session mode.
- Every route checks tenant and capability before side effects.

Verification:

- Directly invoke routes with missing/invalid session.
- Directly invoke routes with forged tenant and user values.

### Frontend route protection

- Frontend routes are feature-gated for usability.
- Frontend route gating is not security.
- Unsupported pages are not rendered for restricted tenants.

Verification:

- Restricted tenant must not surface hidden modules in nav or shortcuts.

### Direct API denial behavior

- Missing auth => `401`.
- Missing capability => `403`.
- Disabled feature => `403`.
- Wrong tenant => `403` or `404` depending on object visibility policy.
- Invalid state transition => `409`.

## 3. Role and permission matrix

### Canonical permissions

- `view_command_center`
- `view_inventory`
- `manage_inventory`
- `view_requests`
- `create_request`
- `approve_request`
- `issue_request`
- `view_purchasing`
- `create_purchase_request`
- `approve_purchase_request`
- `view_vendors`
- `manage_vendors`
- `view_evidence`
- `upload_evidence`
- `view_audit`
- `view_compliance`
- `manage_compliance`
- `manage_exports`
- `manage_devices`
- `manage_bins`
- `manage_users`
- `manage_roles`
- `manage_facilities`
- `manage_departments`
- `review_sync`
- `manage_labels`
- `manage_ai_recommendations`
- `approve_ai_action`
- `manage_integrations`
- `export_data`

### Platform Owner

- Modules: all
- Read/write/approve/export: all
- Scope: all tenants, all facilities, all departments
- Restricted item access: all
- Evidence access: all
- Audit access: all
- AI access: all except direct writes
- Offline/device permissions: full platform control

### Tenant Admin

- Modules: command center, inventory, requests, purchasing, evidence, audit, compliance, exports, admin
- Write/approve/export: most tenant operations
- Scope: tenant-wide only
- Restricted item access: as granted by policy
- Evidence access: tenant-wide
- Audit access: tenant-wide
- AI access: approve AI recommendations; cannot bypass approval gates
- Offline/device permissions: manage tenant devices and sync review

### Facility Admin

- Modules: inventory, warehouse, devices, offline, labels, evidence, audit, compliance
- Read/write: facility-scoped operations
- Approve: inventory and sync review inside facility
- Export: no finance export unless explicitly granted
- Scope: one or more assigned facilities
- Department scope: none beyond assigned operational groups

### Warehouse Supervisor

- Modules: warehouse, inventory, offline, labels, evidence, audit
- Write: receive, putaway, pick, issue, adjust, count
- Approve: offline review, warehouse exceptions
- Scope: assigned facility only
- Evidence: read and attach operational evidence
- AI: may receive recommendations, cannot execute without approval
- Device permissions: approve or pair trusted devices within facility

### Warehouse Worker

- Modules: warehouse, offline, labels
- Read/write: execution tasks only
- Approve: none
- Scope: assigned facility and task assignment only
- Evidence: view task-linked evidence only
- Audit: read own task history only if allowed by policy
- AI: can view suggestions but cannot approve or execute AI actions
- Device permissions: scanner or mobile capture only

### Requester

- Modules: internal requests, command center, evidence
- Write: create requests and attach evidence
- Approve: none
- Scope: own department and assigned facility
- Evidence: attach and view own request evidence
- AI: can request summaries, not actions

### Procurement Officer

- Modules: procurement, vendors, approvals, evidence, audit, compliance
- Write: purchase requests, vendor updates, evidence links
- Approve: purchase requests only within delegation
- Scope: assigned departments and tenant
- AI: can draft, but all submission and approval stays human-controlled

### Finance Officer

- Modules: exports, compliance, evidence, audit, purchasing read-only
- Write: export validation notes, transfer dispatch
- Approve: finance export batches only
- Scope: tenant finance scope only
- Evidence: read finance-linked evidence
- AI: can review export recommendations, cannot auto-dispatch

### Compliance Officer

- Modules: compliance, evidence, audit, exports, AI recommendations
- Write: compliance controls, remediation notes
- Approve: control exceptions and remediation signoff
- Scope: tenant-wide
- Evidence: full compliance evidence access
- AI: can approve compliant recommendations only

### Auditor

- Modules: audit, evidence, compliance, exports
- Write: none, except audit notes if explicitly enabled
- Approve: none
- Scope: read-only, tenant-scoped or cross-tenant only if platform owner granted
- Evidence: read-only
- AI: read-only summaries only

### Executive Viewer

- Modules: command center, reports, compliance, audit summary
- Write/approve/export: none
- Scope: tenant-wide read only
- Evidence: metadata only unless explicitly granted
- AI: read-only insights, no execution

## 4. Workflow state machines

### Internal Request

States: `DRAFT -> SUBMITTED -> APPROVED -> PICKING -> ISSUED -> CLOSED`

Transitions:

- `DRAFT -> SUBMITTED`
  - Role: Requester
  - Event: `SUBMIT_INTERNAL_REQUEST`
  - Evidence: optional
  - Validation: at least one valid line item, tenant-scoped item IDs, requested quantities > 0
  - Failure: empty lines, invalid item, wrong scope

- `SUBMITTED -> APPROVED`
  - Role: Request approver or supervisor
  - Event: `APPROVE_INTERNAL_REQUEST`
  - Evidence: optional but recommended for controlled items
  - Validation: request still open, requester/dept scope valid
  - Failure: wrong status, insufficient permission

- `APPROVED -> PICKING`
  - Role: Warehouse supervisor
  - Event: `START_PICKING_INTERNAL_REQUEST`
  - Evidence: not required
  - Validation: inventory available or backorder policy allowed
  - Failure: inventory inaccessible, facility mismatch

- `PICKING -> ISSUED`
  - Role: Warehouse worker or supervisor
  - Event: `ISSUE_INTERNAL_REQUEST`
  - Evidence: required for controlled items
  - Validation: stock available, bin/facility scope valid
  - Failure: insufficient stock, wrong facility, restricted item policy violation

- `ISSUED -> CLOSED`
  - Role: system or supervisor
  - Event: `CLOSE_INTERNAL_REQUEST`
  - Evidence: none
  - Validation: all lines fully issued
  - Failure: partial issue remains

### Request Line

States: `SUBMITTED -> APPROVED -> PICKED -> ISSUED -> SHORTED -> CANCELLED`

- Line transitions mirror request transitions.
- Each line must never exceed requested quantity.
- Every line state change is audited.

### Purchase Request

States: `DRAFT -> PENDING_APPROVAL -> APPROVED -> REJECTED -> CONVERTED -> CLOSED`

- `DRAFT -> PENDING_APPROVAL`
  - Role: Procurement Officer
  - Event: `SUBMIT_PURCHASE_REQUEST`
  - Evidence: required for regulated or controlled buys
  - Validation: vendor known or justified, accounting code present when policy requires it

- `PENDING_APPROVAL -> APPROVED`
  - Role: Approver with procurement permission
  - Event: `APPROVE_PURCHASE_REQUEST`
  - Evidence: approval note optional, evidence recommended
  - Validation: delegation limits and spend threshold checked

- `PENDING_APPROVAL -> REJECTED`
  - Role: Approver
  - Event: `REJECT_PURCHASE_REQUEST`
  - Evidence: reason required
  - Validation: reason non-empty

### Purchase Order

States: `DRAFT -> SENT -> ACKNOWLEDGED -> PARTIALLY_RECEIVED -> RECEIVED -> CLOSED -> CANCELLED`

- Only procurement roles can create or send.
- Receipts update PO state only from warehouse/receiving workflows.
- Cancellations require open PO and manager-level permission.

### Receiving

States: `EXPECTED -> RECEIVED -> QC_HOLD -> PUTAWAY_PENDING -> PUTAWAY_DONE`

- `EXPECTED -> RECEIVED`
  - Role: Warehouse worker/supervisor
  - Event: `RECEIVE_ITEM`
  - Evidence: invoice, packing slip, or photo required for controlled receipts
  - Validation: item exists, quantity positive, facility valid

- `RECEIVED -> QC_HOLD`
  - Role: supervisor or compliance
  - Event: `PLACE_RECEIPT_ON_HOLD`
  - Evidence: issue explanation required

- `RECEIVED -> PUTAWAY_PENDING`
  - Role: system
  - Event: `QUEUE_PUTAWAY`

- `PUTAWAY_PENDING -> PUTAWAY_DONE`
  - Role: warehouse worker
  - Event: `CONFIRM_PUTAWAY`
  - Evidence: optional

### Putaway Task

States: `OPEN -> IN_PROGRESS -> COMPLETE -> CANCELLED`

- Task must target a valid bin in the same facility.
- Bin capacity and restricted-item rules must be checked before completion.

### Picking Task

States: `OPEN -> ASSIGNED -> IN_PROGRESS -> PICKED -> VERIFIED -> COMPLETE -> EXCEPTION`

- Picking from the wrong facility or bin is rejected.
- Controlled items require dual verification or supervisor confirmation if policy says so.

### Issuing

States: `QUEUED -> VALIDATED -> ISSUED -> REVERSED`

- `VALIDATED` requires stock available and requester scope valid.
- `REVERSED` requires supervisor or higher permission and a reversal reason.

### Transfer

States: `DRAFT -> APPROVED -> IN_TRANSIT -> RECEIVED -> CLOSED -> CANCELLED`

- Source and destination facilities must be tenant-valid.
- Transfer must not create negative stock.

### Stock Adjustment

States: `PROPOSED -> REVIEWED -> APPLIED -> REJECTED -> REVERSED`

- Requires explanation and optional evidence.
- Controlled items require supervisor or compliance approval.
- Adjustment reasons are mandatory.

### Cycle Count

States: `OPEN -> COUNTING -> SUBMITTED -> REVIEWED -> POSTED -> VARIANCE_EXCEPTION`

- Posting a variance writes stock movement and audit rows.
- Large variances can force exception state.

### Offline Batch

States: `DRAFT -> QUEUED -> REVIEW_PENDING -> APPROVED -> POSTED -> REJECTED -> ARCHIVED`

- Offline batches are tenant and device scoped.
- Supervisor review is mandatory before posting.
- Batch must be idempotent by client batch key.

### Sync Conflict

States: `PENDING -> RESOLVED -> IGNORED -> ESCALATED`

- Only reviewers with sync permission can resolve.
- Evidence is optional but conflict notes are mandatory.

### Evidence Document

States: `UPLOADED -> LINKED -> VERIFIED -> SUPERSEDED -> RETAINED`

- Evidence cannot be edited in place once linked.
- Replacements create a new document and mark the old one superseded.

### Finance Export Batch

States: `DRAFT -> VALIDATED -> GENERATED -> QUEUED -> DISPATCHED -> FAILED -> ARCHIVED`

- Validation must pass before generation.
- Dispatch requires finance permission.
- Any export mutation is audited.

### AI Recommendation

States: `DRAFT -> GENERATED -> REVIEWED -> APPROVED -> EXECUTED -> REJECTED -> EXPIRED`

- AI outputs never auto-execute.
- Human approval is mandatory for writes.
- Approved recommendations must be traceable to source records.

### Approval Workflow

States: `PENDING -> APPROVED -> REJECTED -> ESCALATED -> WITHDRAWN`

- A decision is only valid if approver is in the required chain and scope.
- Escalation is used when threshold or policy blocks a lower approver.

## 5. Database implementation contract

### Global rules

- Every mutable business table includes `tenant_id`.
- Every physical-work table includes `facility_id` when relevant.
- Every human-work table includes `department_id` when relevant.
- Immutable tables are append-only.
- Soft delete is allowed only for user-facing master data, never for audit or evidence.
- All timestamps use UTC ISO strings.

### Core table contract

| Table | Purpose | Required columns | Constraints and indexes | Audit / evidence |
| --- | --- | --- | --- | --- |
| Tenant | tenant master | id, name, slug, status, tier, created_at | unique slug; active status enum | audit on status/tier changes |
| Facility | physical site | id, tenant_id, name, code, city, state, status | unique (tenant_id, code); index tenant_id | audit on create/update |
| Department | org unit | id, tenant_id, name, code, status | unique (tenant_id, code) | audit on create/update |
| User | identity | id, tenant_id, department_id, facility_id, role_key, name, email, active, status | unique (tenant_id, email); indexes tenant/facility/department | audit on role/scope changes |
| Role | role catalog | key, name, description, active | immutable catalog or controlled seed | audit on catalog changes |
| Permission | permission catalog | key, name, description | immutable catalog or controlled seed | audit on catalog changes |
| UserRole | assignment | id, tenant_id, user_id, role_key, granted_by_user_id, granted_at | unique (tenant_id, user_id, role_key) | audit required |
| UserScope | ABAC scope | id, tenant_id, user_id, facility_id, department_id, scope_type | unique per scope row | audit required |
| Device | scanner/mobile device | id, tenant_id, facility_id, name, device_type, trusted, last_seen_at, status | index tenant/facility/trusted | audit on trust changes |
| Item | item master | id, tenant_id, sku, name, category_id, uom, barcode, min_qty, max_qty, restricted, supplier_name, active, status | unique (tenant_id, sku), unique (tenant_id, barcode) | audit on master changes |
| ItemCategory | category master | id, tenant_id, name, code, active | unique (tenant_id, code) | audit on changes |
| Bin | storage location | id, tenant_id, facility_id, code, zone, shelf, active | unique (tenant_id, facility_id, code) | audit on create/update |
| StockBalance | current stock | id, tenant_id, item_id, facility_id, bin_id, on_hand, reserved, available, updated_at | unique (tenant_id, item_id, bin_id); index item/facility | derived from movements |
| StockMovement | ledger | id, tenant_id, item_id, facility_id, bin_id, movement_type, quantity, reference_type, reference_id, performed_by_user_id, department_id, note, created_at | index tenant/item/reference | immutable ledger, audit paired |
| StockAdjustment | adjustment record | id, tenant_id, item_id, facility_id, bin_id, reason, quantity_delta, status, requested_by_user_id, reviewed_by_user_id, approved_by_user_id, created_at | index tenant/status | evidence required for controlled items |
| WarehouseTask | generic task | id, tenant_id, facility_id, task_type, status, priority, assigned_to_user_id, source_type, source_id, created_at | index tenant/facility/status | audit on task transitions |
| ReceiveSession | receiving session | id, tenant_id, facility_id, vendor_id, status, started_by_user_id, completed_by_user_id, created_at | index tenant/facility/status | evidence required |
| PutawayTask | putaway task | id, tenant_id, facility_id, bin_id, stock_movement_id, status | index tenant/facility/status | audit required |
| PickTask | pick task | id, tenant_id, facility_id, request_id, status, assigned_to_user_id, picked_qty, created_at | index tenant/facility/status | audit required |
| IssueTask | issue task | id, tenant_id, facility_id, request_id, status, issued_by_user_id, created_at | index tenant/facility/status | audit required |
| TransferOrder | inter-facility transfer | id, tenant_id, source_facility_id, destination_facility_id, status, requested_by_user_id, approved_by_user_id, shipped_at, received_at | index tenant/source/destination/status | audit and evidence on shipment |
| CountSession | cycle count | id, tenant_id, facility_id, bin_id, status, started_by_user_id, reviewed_by_user_id, posted_at | index tenant/facility/status | variance evidence optional but recommended |
| InternalRequest | internal request header | id, tenant_id, request_no, department_id, facility_id, requested_by_user_id, purpose, priority, status, created_at, approved_at, approved_by_user_id, issued_at, issued_by_user_id | unique (tenant_id, request_no); index tenant/status | audit required |
| RequestLine | request line | id, tenant_id, request_id, item_id, qty_requested, qty_issued, status | index tenant/request/item | audit required |
| PurchaseRequest | procurement header | id, tenant_id, pr_no, vendor_name, department_id, facility_id, requested_by_user_id, accounting_code, status, total_amount, created_at, approved_at, approved_by_user_id, invoice_status | unique (tenant_id, pr_no); index tenant/status | evidence links for quotes/invoices |
| PurchaseOrder | PO header | id, tenant_id, po_no, vendor_id, department_id, facility_id, status, total_amount, created_at, sent_at, acknowledged_at, closed_at | unique (tenant_id, po_no) | audit and evidence required |
| ApprovalStep | approval chain step | id, tenant_id, entity_type, entity_id, step_order, approver_role_key, approver_user_id, status, decided_at | index tenant/entity/status | audit required |
| ApprovalDecision | approval decision | id, tenant_id, approval_step_id, approver_user_id, decision, reason, decided_at | index tenant/step | immutable decision history |
| Vendor | vendor master | id, tenant_id, name, code, status, risk_score, active | unique (tenant_id, code) | audit on changes |
| VendorScore | vendor intelligence | id, tenant_id, vendor_id, score_type, score_value, scored_at, source | index tenant/vendor/type | auditable scoring input |
| EvidenceDocument | file metadata | id, tenant_id, file_name, mime_type, storage_key, sha256, visibility, uploaded_by_user_id, created_at, status | unique storage_key; index tenant/status | append-only, tamper-evident |
| EvidenceLink | evidence relation | id, tenant_id, document_id, entity_type, entity_id, link_type, created_at | index tenant/entity | audit required |
| AuditEvent | immutable audit | id, tenant_id, actor_user_id, actor_role, department_id, facility_id, action, entity_type, entity_id, correlation_id, request_id, summary, before_json, after_json, created_at | append-only; indexed by tenant/action/date | immutable |
| AuditEventDiff | audit diff | id, tenant_id, audit_event_id, field_name, before_value, after_value | index tenant/event | immutable |
| ChainOfCustodyEvent | custody trail | id, tenant_id, evidence_document_id, actor_user_id, action, note, created_at | index tenant/document | immutable |
| OfflineBatch | offline envelope | id, tenant_id, device_id, user_id, batch_key, status, review_status, task_count, exception_count, created_at, reviewed_at, posted_at | unique (tenant_id, batch_key) | audit required |
| OfflineTask | offline line item | id, tenant_id, offline_batch_id, task_index, task_type, entity_type, entity_id, payload_json, status | index tenant/batch/index | audit required |
| SyncConflict | sync exception | id, tenant_id, offline_batch_id, offline_task_id, conflict_type, severity, status, description, resolution_note, resolved_by_user_id, resolved_at, created_at | index tenant/status | audit required |
| SyncDecision | sync resolution | id, tenant_id, sync_conflict_id, decision, decided_by_user_id, reason, decided_at | index tenant/conflict | immutable |
| ExportBatch | export header | id, tenant_id, batch_no, kind, format, status, record_count, file_name, created_by_user_id, created_at, generated_at, validation_summary | unique (tenant_id, batch_no); index tenant/status | audit and evidence required |
| ExportValidationError | export issue | id, tenant_id, export_batch_id, severity, code, message, entity_type, entity_id, resolved_at, created_at | index tenant/batch/severity | immutable history |
| IntegrationJob | integration queue | id, tenant_id, integration_key, direction, status, payload_hash, retry_count, last_error, created_at, completed_at | index tenant/integration/status | audit required |
| AIRecommendation | ai output | id, tenant_id, agent_key, subject_type, subject_id, status, confidence, recommendation_json, human_summary, created_at, reviewed_at, approved_by_user_id | index tenant/agent/status | audit required |
| AIRecommendationSource | ai citations | id, tenant_id, ai_recommendation_id, source_type, source_id, source_snapshot_json | index tenant/recommendation | required for every AI output |
| AIApproval | ai approval | id, tenant_id, ai_recommendation_id, approver_user_id, decision, reason, decided_at | index tenant/recommendation | immutable |
| AIExecutionLog | ai runtime log | id, tenant_id, ai_recommendation_id, executed_by_user_id, action, result, created_at | index tenant/recommendation | audit mirrored |
| ComplianceControl | compliance control | id, tenant_id, control_key, name, status, owner_role_key, review_frequency, last_reviewed_at, next_review_due_at | unique (tenant_id, control_key) | audit required |
| ComplianceEvidence | control evidence | id, tenant_id, compliance_control_id, evidence_document_id, status, linked_at | index tenant/control | evidence-link required |

## 6. API contract specification

### Global API rules

- JSON only for application endpoints.
- Mutations are idempotent when a client request key is supplied.
- Every response includes `requestId` or correlation metadata when available.
- Error envelope: `{ error, code, requestId? }`.
- Tenant scope is inferred from authenticated session or dev context only, never from client-controlled business logic.

### Auth

Endpoints:

- `GET /auth/login`
- `GET /auth/callback`
- `POST /auth/logout`
- `GET /api/me`

Permissions:

- Public for login/callback
- Authenticated for me/logout

Request/response:

- Login redirects to IdP.
- Callback exchanges code and sets session cookie.
- Me returns user, tenant, role, scopes, feature flags.

Errors:

- `401` unauthenticated
- `403` CSRF or invalid session

Audit:

- Login, logout, and session revocation are audited.

Idempotency:

- Callback uses OIDC state and nonce; logout is idempotent.

### Bootstrap

Endpoint:

- `GET /api/bootstrap`

Permissions:

- Any authenticated user

Response:

- tenant
- user
- role
- scopes
- features
- lookups
- summary
- compliance

Audit:

- No audit for read-only bootstrap.

### Tenants

Endpoints:

- `GET /api/tenants`
- `GET /api/tenants/:id`
- `PATCH /api/tenants/:id`

Permissions:

- Platform owner only, except self-tenant read for tenant admin

Tenant enforcement:

- Tenant admin can only read own tenant.

### Users

Endpoints:

- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `POST /api/users/:id/disable`

Permissions:

- `manage_users`

Request shape:

- name, email, roleKey, departmentId, facilityId, active

Response shape:

- user object plus assigned scopes

Audit:

- create, disable, role change, scope change

### Roles

Endpoints:

- `GET /api/roles`
- `GET /api/permissions`

Permissions:

- authenticated read; admin write in future phase only

### Facilities

Endpoints:

- `GET /api/facilities`
- `POST /api/facilities`
- `PATCH /api/facilities/:id`

Permissions:

- `manage_facilities`

### Departments

Endpoints:

- `GET /api/departments`
- `POST /api/departments`
- `PATCH /api/departments/:id`

Permissions:

- `manage_departments`

### Devices

Endpoints:

- `GET /api/devices`
- `POST /api/devices`
- `PATCH /api/devices/:id/trust`
- `POST /api/devices/:id/rotate-secret`

Permissions:

- `manage_devices`

### Items

Endpoints:

- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items`
- `PATCH /api/items/:id`

Permissions:

- `view_inventory`, `manage_inventory`

### Bins

Endpoints:

- `GET /api/bins`
- `POST /api/bins`
- `PATCH /api/bins/:id`

Permissions:

- `manage_bins`

### Inventory

Endpoints:

- `GET /api/inventory/stock-balances`
- `GET /api/inventory/stock-movements`
- `POST /api/inventory/adjustments`
- `POST /api/inventory/cycle-counts`

Permissions:

- `view_inventory`, `manage_inventory`

### Warehouse tasks

Endpoints:

- `GET /api/warehouse/tasks`
- `POST /api/warehouse/tasks/:id/assign`
- `POST /api/warehouse/tasks/:id/start`
- `POST /api/warehouse/tasks/:id/complete`

Permissions:

- worker or supervisor according to task state

### Internal requests

Endpoints:

- `GET /api/requests`
- `GET /api/requests/:id`
- `POST /api/requests`
- `POST /api/requests/:id/approve`
- `POST /api/requests/:id/issue`

Permissions:

- requester for create
- approver for approve
- warehouse for issue

### Procurement

Endpoints:

- `GET /api/purchase-requests`
- `GET /api/purchase-requests/:id`
- `POST /api/purchase-requests`
- `POST /api/purchase-requests/:id/submit`
- `POST /api/purchase-requests/:id/cancel`

Permissions:

- procurement officer, approver

### Approvals

Endpoints:

- `GET /api/approvals`
- `POST /api/approvals/:id/decision`

Permissions:

- approver roles only

### Vendors

Endpoints:

- `GET /api/vendors`
- `POST /api/vendors`
- `PATCH /api/vendors/:id`

Permissions:

- view_vendors / manage_vendors

### Evidence

Endpoints:

- `GET /api/evidence`
- `POST /api/evidence`
- `POST /api/evidence/:id/link`
- `POST /api/evidence/:id/supersede`

Permissions:

- `view_evidence`, `upload_evidence`

### Audit

Endpoints:

- `GET /api/audit`
- `GET /api/audit/:id`

Permissions:

- `view_audit`

### Offline sync

Endpoints:

- `GET /api/offline/batches`
- `GET /api/offline/batches/:id`
- `POST /api/offline/batches`
- `POST /api/offline/batches/:id/review`
- `POST /api/offline/conflicts/:id/resolve`

Permissions:

- `review_sync`

### Exports

Endpoints:

- `GET /api/exports`
- `POST /api/exports/validate`
- `POST /api/exports/generate`
- `POST /api/exports/:id/dispatch`

Permissions:

- `manage_exports`

### Integrations

Endpoints:

- `GET /api/integrations`
- `POST /api/integrations/:key/jobs`
- `GET /api/integrations/jobs`

Permissions:

- `manage_integrations`

### Compliance

Endpoints:

- `GET /api/compliance`
- `GET /api/compliance/controls`
- `POST /api/compliance/controls/:id/review`

Permissions:

- `view_compliance`, `manage_compliance`

### AI recommendations

Endpoints:

- `GET /api/ai/recommendations`
- `GET /api/ai/recommendations/:id`
- `POST /api/ai/recommendations/:id/approve`
- `POST /api/ai/recommendations/:id/reject`

Permissions:

- `manage_ai_recommendations`, `approve_ai_action`

## 7. Threat model

### Tenant spoofing

- Mitigation: tenant derived from session or trusted dev context only.
- Mitigation: all object queries require tenant_id match.

### IDOR / direct object access

- Mitigation: every object lookup is tenant-scoped.
- Mitigation: role checks happen before mutation.

### Privilege escalation

- Mitigation: permissions are server-owned and tested per endpoint.
- Mitigation: UI never grants authority.

### Frontend permission bypass

- Mitigation: frontend is display only; backend denies direct calls.

### Offline replay attack

- Mitigation: batch keys are unique and idempotent.
- Mitigation: posted batch hashes are stored.

### Stolen scanner/device

- Mitigation: device trust status, facility binding, and revocation.
- Mitigation: trusted device secrets rotate and can be revoked.

### Duplicate sync batch

- Mitigation: unique batch key per tenant/device, same batch rejected with 409.

### Evidence tampering

- Mitigation: immutable object storage keys plus SHA-256 hash.
- Mitigation: supersede, do not mutate.

### Audit deletion / modification

- Mitigation: append-only audit tables, no update/delete paths.

### Finance export tampering

- Mitigation: export batch validation, signed file hash, dispatch log.

### AI data leakage

- Mitigation: AI services receive only tenant-scoped, permission-filtered data.
- Mitigation: no raw cross-tenant retrieval in agent runtime.

### AI unauthorized recommendation

- Mitigation: AI output is advisory until human approval.

### API rate abuse

- Mitigation: route-level throttles, especially auth, export, AI, and upload routes.

### Compromised admin

- Mitigation: dual-control for sensitive actions, audit alerting, session revocation.

### Integration credential exposure

- Mitigation: credentials stored server-side only, never in frontend or client payloads.

## 8. AI agent execution contract

### Shared AI rules

- AI never writes directly.
- AI never bypasses RBAC, ABAC, or tenant isolation.
- AI never sees unauthorized records.
- AI outputs structured JSON plus human-readable summary.
- AI outputs must cite source records.
- Every AI run is stored and audited.
- Any action-capable result requires human approval.

### Intake Agent

- Inputs: request text, attachments, tenant-scoped context
- Forbidden: raw cross-tenant data, secrets
- Services: request parsing, taxonomy mapping
- Forbidden actions: create/approve/write
- Output schema: `classification`, `entities`, `missing_fields`, `confidence`, `sources`
- Confidence threshold: 0.80
- Approval gate: user confirmation before any workflow creation
- Audit event: `AI_INTAKE_GENERATED`
- Failure fallback: manual form

### Inventory Agent

- Inputs: stock balances, movements, reorder thresholds
- Forbidden: vendor secrets, other-tenant inventory
- Services: inventory read service
- Forbidden actions: automatic adjustments
- Output schema: shortages, substitutions, expiry risks, recommendations
- Confidence threshold: 0.75
- Approval gate: supervisor or requester approval for action
- Audit event: `AI_INVENTORY_RECOMMENDATION`

### Procurement Agent

- Inputs: request lines, vendor catalog, policy constraints
- Forbidden: pricing outside tenant scope
- Services: procurement read, vendor intelligence
- Forbidden actions: sending RFQs, creating PO without approval
- Output schema: draft RFQ/PO, vendor ranking, policy issues
- Confidence threshold: 0.78
- Approval gate: procurement officer and approver
- Audit event: `AI_PROCUREMENT_DRAFT`

### Compliance Agent

- Inputs: controls, evidence links, approvals, export validation issues
- Forbidden: unauthorized evidence
- Services: compliance read, evidence read, audit read
- Forbidden actions: remediation execution
- Output schema: missing evidence, risks, due dates, exceptions
- Confidence threshold: 0.85
- Approval gate: compliance officer
- Audit event: `AI_COMPLIANCE_ALERT`

### Export Agent

- Inputs: export batch, validation errors, mapping rules
- Forbidden: finance credentials, raw unscoped records
- Services: export validation service
- Forbidden actions: dispatch without validation and approval
- Output schema: validation summary, fix suggestions, file readiness
- Confidence threshold: 0.90 for pass/fail classification
- Approval gate: finance officer
- Audit event: `AI_EXPORT_REVIEW`

### Offline Reconciliation Agent

- Inputs: offline batch, sync conflicts, source task payloads
- Forbidden: tasks from other tenants or devices
- Services: sync review service
- Forbidden actions: auto-posting conflicts
- Output schema: conflict groupings, resolution options, risk score
- Confidence threshold: 0.80
- Approval gate: supervisor
- Audit event: `AI_OFFLINE_RECONCILIATION`

### Audit Agent

- Inputs: audit logs, diffs, chain-of-custody, evidence metadata
- Forbidden: mutable audit writes
- Services: audit read only
- Forbidden actions: any write
- Output schema: change summary, exceptions, evidence gaps, timeline
- Confidence threshold: 0.70
- Approval gate: none for read-only summaries
- Audit event: `AI_AUDIT_SUMMARY`

### Ops Copilot

- Inputs: tenant-scoped live data, role-filtered summaries
- Forbidden: hidden or unauthorized records, secrets
- Services: read-only composition layer
- Forbidden actions: no writes, no export, no approval
- Output schema: answer, sources, confidence, follow-up actions
- Confidence threshold: 0.75
- Approval gate: required for any action suggestion
- Audit event: `AI_OPS_QUERY`

## 9. Non-functional requirements

- Dashboard p95 response time: <= 500 ms
- List view p95 response time: <= 750 ms
- Write transaction p95 time: <= 800 ms
- Offline sync batch size: 50 to 500 tasks, max payload 2 MB
- Export generation p95 time: <= 60 s for 100k records
- Concurrent interactive users: 2,000 platform-wide minimum target
- Concurrent active users per tenant: 250 minimum target
- Audit write latency overhead: <= 100 ms median
- Uptime target: 99.9%
- Backup frequency: hourly incremental, daily full
- RPO: 15 minutes
- RTO: 60 minutes
- Hot log retention: 365 days
- Audit retention: 7 years
- Evidence retention: 7 years minimum
- Security scan frequency: on every merge plus nightly

## 10. DevOps and CI/CD gates

Gate order:

1. Install
2. Lint
3. Typecheck
4. Unit tests
5. Integration tests
6. Migration check
7. Seed check
8. Contract tests
9. E2E smoke tests
10. Tenant isolation tests
11. RBAC tests
12. Security scan
13. Dependency scan
14. Build

Pass criteria:

- No failing test stage.
- No unapproved migration drift.
- No direct API bypass in tenant or RBAC tests.
- No critical security findings unresolved.
- Build artifacts generated successfully.

## 11. Build sequence with dependency order

1. Freeze tenant, role, permission, and feature definitions.
2. Lock schema and add migration-safe contract tables.
3. Implement auth, session, and request-context resolution.
4. Implement tenant and scope enforcement helpers.
5. Implement audit and evidence append-only writes.
6. Implement inventory core tables and workflows.
7. Implement requests and purchasing workflows.
8. Implement offline sync and conflict review.
9. Implement exports and validation.
10. Implement compliance dashboard and audit views.
11. Implement AI read-only recommendations.
12. Implement frontend role-based shell and page gating.
13. Add contract tests, E2E smoke, and load checks.

## 12. Acceptance gates

Phase 0 is accepted only if all of the following are true:

- Fresh DB migration succeeds.
- Upgrade from previous migrations succeeds.
- Seed tenants are present and scoped correctly.
- Every privileged route denies unauthorized direct calls.
- UI hides disabled modules for restricted tenants.
- Audit rows are appended for every critical action.
- Evidence is stored and linked for regulated flows.
- Offline sync requires review before posting.
- AI outputs cannot write without approval.
- CI passes end to end.

## 13. Immediate next implementation prompt

Implement Phase 1 only after the contract above is accepted:

1. Add canonical role and permission tables if missing.
2. Add remaining workflow tables for purchase orders, approvals, warehouse tasks, and AI logs.
3. Add API endpoints for each contract group.
4. Add server-side ABAC helpers for facility and department scope.
5. Add tenant-safe audit and evidence relations.
6. Add contract tests for every permission matrix row and workflow transition.
7. Add browser-level smoke tests for the enterprise shell.

