# OpsTrax SupplyOps — RC1 RFP Demo Package

## Executive Demo Narrative

OpsTrax SupplyOps is a secure, audit-first supply operations platform for controlled facilities and enterprise operations teams. It is built to run the operational core that sits between requests, stock, warehouses, procurement, receiving, invoice intelligence, evidence, audit, finance readiness, device operations, offline capture, and governed operational intelligence.

The product is intentionally narrower than a broad ERP suite, but deeper in the places that matter for government and controlled-facility operations:

- inventory control with tenant-scoped stock and bin data
- internal requests with approval and issue workflow
- warehouse execution for task-driven issue and movement
- procurement with vendor master, purchase requests, and purchase orders
- procure-to-pay intelligence with invoice extraction, matching, exceptions, and export posture
- receiving with quantity capture and stock posting only at receipt time
- evidence and audit surfaces tied to real workflow events
- finance export readiness and integration job tracking
- device operations and barcode/sensor validation foundations
- offline sync review and conflict handling
- governed AI intelligence that is read-only in RC1

The design principle is simple: the frontend presents, but the backend decides. Every critical action is permission-checked, tenant-scoped, facility-scoped, department-scoped where applicable, and audit-logged. Restricted tenants see a smaller module set, and the server enforces the same denial at the API level.

OpsTrax also includes a separate platform admin control plane at `/platform` for SaaS-owner operations such as tenant plans, entitlements, support sessions, billing posture, security posture, and platform audit review. It uses a separate session and does not impersonate tenant users.

## 10–12 Minute Demo Script

### 1. Login as IntelliFlow admin

- **Click:** open the local RC1 app at `http://localhost:9899`
- **Say:** “This is the seeded IntelliFlow Systems enterprise workspace. The shell and user context are resolved server-side.”
- **Business value:** proves the product starts from live tenant context, not a mock shell.
- **RFP scoring point:** secure authentication, tenant scoping, production-ready access model.

### 2. Show Command Center

- **Click:** landing page / Command Center
- **Say:** “This is the operational control surface: KPIs, current exceptions, and live module entry points.”
- **Business value:** shows a single executive surface for day-to-day supply operations.
- **RFP scoring point:** executive visibility, operational command center, audit-aware UI.

### 3. Show full module navigation

- **Click:** left navigation
- **Say:** “Navigation is derived from the authenticated workspace context, so modules appear only when the tenant, role, and feature set allow them.”
- **Business value:** proves role-aware navigation without client-side trust.
- **RFP scoring point:** RBAC, ABAC, tenant isolation, controlled-facility scoping.

### 4. Create or view an internal request

- **Click:** Internal Request
- **Say:** “Requests are departmental, tenant-scoped, and lifecycle-managed. Drafts can be submitted, approved, rejected, or cancelled.”
- **Business value:** turns supply demand into an auditable workflow.
- **RFP scoring point:** internal request lifecycle, workflow governance, department scoping.

### 5. Approve request

- **Click:** request detail actions
- **Say:** “Approvals are server-authorized and leave an audit trail.”
- **Business value:** demonstrates controlled approval gates before stock issue.
- **RFP scoring point:** approval controls, denied-action audit, compliance readiness.

### 6. Show warehouse issue and stock movement

- **Click:** Warehouse Workflows
- **Say:** “Issue is handled as a warehouse action, and stock changes are recorded only by the backend when the issue is posted.”
- **Business value:** proves stock balance integrity and operational traceability.
- **RFP scoring point:** warehouse execution, inventory integrity, immutable audit.

### 7. Show procurement PR/PO

- **Click:** Procurement Center
- **Say:** “Purchase requests are vendor-aware, approval-gated, and can generate purchase orders once approved.”
- **Business value:** shows procurement discipline without faking ERP behavior.
- **RFP scoring point:** procurement approvals, vendor master, PO control, finance readiness.

### 8. Show procure-to-pay invoice intelligence

- **Click:** Invoice Intelligence
- **Say:** “Invoice workflow is governed end to end: extraction state, matching state, exception queue, approval trail, and local export posture are all visible.”
- **Business value:** demonstrates deeper procure-to-pay control than a simple AP inbox.
- **RFP scoring point:** procure-to-pay intelligence, evidence-backed review, export readiness, governance.

### 9. Show receiving and stock increase

- **Click:** Receiving Center
- **Say:** “Receiving is separate from PO issue. Stock increases only when receipt is posted.”
- **Business value:** reinforces proper separation of commitment, shipment, and receipt.
- **RFP scoring point:** receiving controls, inventory integrity, segregation of duties.

### 10. Show evidence and audit trail

- **Click:** Evidence Vault, then Audit Trail
- **Say:** “Sensitive workflow events can be linked to evidence and every critical action is retained in an audit trail.”
- **Business value:** demonstrates governance and post-event traceability.
- **RFP scoring point:** evidence vault, audit trail, compliance readiness.

### 11. Show finance export and integration posture

- **Click:** Finance Export Hub, then Integration Center
- **Say:** “Exports are validation-first, and integration jobs are tracked even when a real ERP connector is not configured yet.”
- **Business value:** proves export-readiness without claiming an ERP handoff that is not configured.
- **RFP scoring point:** finance export readiness, integration monitoring, future connector foundation.

### 12. Show DeviceOps and Offline Sync

- **Click:** DeviceOps Center, then Offline Sync
- **Say:** “Device trust and offline capture are first-class operational concerns. Offline work is reviewed before posting.”
- **Business value:** supports field operations and intermittent connectivity scenarios.
- **RFP scoring point:** barcode/device operations, offline capture, controlled sync.

### 13. Show AI Operations as governed intelligence

- **Click:** AI Operations
- **Say:** “AI is read-only in RC1. It summarizes the live tenant and stays bounded by backend permissions and source records.”
- **Business value:** introduces AI without putting business actions into an ungoverned chat layer.
- **RFP scoring point:** AI governance, human-in-the-loop controls, safe automation posture.

### 14. Show Reports Center

- **Click:** Reports
- **Say:** "Reports are generated by the backend, not the frontend. The frontend submits the report type and format. The backend enforces tenant scope, RBAC, and feature flags, generates rows from live data, and delivers a real CSV or binary PDF file."
- **Click:** Run CSV on any catalog entry, then open the report run from the table and click Download CSV in the drawer.
- **Say:** "This is a real download with correct content-type and tenant-scoped rows. The PDF export uses stdlib-only generation — no external dependencies."
- **Business value:** removes the industry-standard gap of fake reporting dashboards with no export capability.
- **RFP scoring point:** real export delivery, tenant-isolated data, audit-backed report runs, CSV formula-injection protection.

### 15. Switch to Evostel restricted tenant

- **Click:** switch tenant/session context to Evostel LLC
- **Say:** “This tenant is intentionally restricted. Sensitive modules do not appear, and direct API access is denied server-side.”
- **Business value:** proves that UI hiding is backed by backend enforcement.
- **RFP scoring point:** tenant isolation, least privilege, governed access control.

### 16. Show platform admin control plane

- **Click:** open `http://localhost:9899/platform` and enter the platform workspace
- **Say:** “This is the SaaS-owner control plane. It is separate from tenant operations and uses its own authorization surface.”
- **Business value:** demonstrates how OpsTrax can be run as a multi-tenant SaaS product, not just a tenant workspace.
- **RFP scoring point:** platform isolation, SaaS administration, support governance, tenant-plan management.

## Demo Value Summary

This demo proves that OpsTrax is not a toy dashboard. It is a working operational foundation with live controls for requests, stock movement, procurement, receiving, evidence, audit, export posture, device trust, offline review, and governed AI.

## RFP Scoring Advantages

- stronger audit and evidence posture than lightweight procurement tools
- tighter controlled-facility fit than broad ERP suites
- faster operational deployment than large suite implementations
- explicit tenant isolation and restricted-tenant proof
- offline and device workflows that are part of the core product, not an add-on
- governed AI posture that keeps the system safe for regulated environments
- real export delivery (CSV + binary PDF) with formula-injection protection and per-run audit trail — no fake download buttons
