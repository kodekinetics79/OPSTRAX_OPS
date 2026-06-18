# Phase 3I: Inventory Optimization Center

**Status:** Complete  
**Migration:** v25 (`025_inventory_optimization.sql`)  
**Feature flag:** `inventory_optimization`  
**Branches:** sprint-10-backend-api-mysql

---

## Overview

Phase 3I delivers a real Inventory Optimization Center covering cycle count workflows, variance control, replenishment planning, ABC classification, inventory accuracy KPIs, and audit-backed stock corrections. All intelligence is driven by live tenant inventory data. No fake stock actions. No auto-adjustments without human approval and audit.

---

## Capabilities Delivered

### Cycle Count Management
- Create cycle count plans in DRAFT state with scope (FULL / CATEGORY / BIN_RANGE / CUSTOM)
- Plan lifecycle: DRAFT → SCHEDULED → IN_PROGRESS → REVIEW_PENDING → APPROVED → POSTED / CANCELLED
- Plans are scoped to a facility; lines reference specific items and bins
- Count sessions track per-line counted qty vs. expected qty; variance is computed on save
- Session lifecycle: OPEN → REVIEW_PENDING → APPROVED → POSTED

### Variance Control
- Variances created automatically when counted qty ≠ expected qty on session line recording
- Severity tiers: BLOCKER (controlled item OR ≥20% variance), WARNING (≥5%), INFO (<5%)
- BLOCKER variances block session approval — cannot approve a session with unresolved BLOCKERs
- Actions: approve, reject, waive (requires non-empty reason), post
- Posting adjusts `stock_balances` and inserts `stock_movements` with movement_type=ADJUSTMENT
- Posting is idempotent — safe to call twice

### Replenishment Intelligence
- `generateReplenishmentRecommendations` analyzes all active items per tenant
- Signals: on-hand vs reorder_point, open PO qty, open requisition demand, 90-day avg daily issue rate, stockout detection
- Recommendation types: REORDER, EXPEDITE_PO, TRANSFER
- Skips items that already have an OPEN rec of the same type (no duplicates)
- States: OPEN → REVIEWED → APPROVED / CONVERTED_TO_REQUEST / DISMISSED / EXPIRED
- Converting a recommendation creates a real `internal_request` + `request_line` in DRAFT state

### ABC Classification
- Score = value_score (0–40) + movement_score (0–40) + criticality_score (0–20)
- A = score ≥60, B = score ≥25, C = <25
- Items with <3 stock movements in 90 days get `insufficient_history=1`, movement_score=0 (honest, not fabricated)
- Recalculation creates an `inventory_optimization_runs` record and is fully audited

### Inventory Accuracy KPIs
- Summary endpoint returns: total_items, items_counted, items_accurate, accuracy_pct, open_variances, blocker_variances, open_reorder_risks, open_stockout_risks
- Daily snapshots stored in `inventory_accuracy_snapshots` (unique per tenant/date)

---

## Data Model

9 new tables in migration v25:

| Table | Purpose |
|---|---|
| `cycle_count_plans` | Count plan headers with lifecycle state |
| `cycle_count_plan_lines` | Items/bins scoped to a plan |
| `cycle_count_sessions` | Execution sessions under a plan |
| `cycle_count_session_lines` | Per-line count results with variance |
| `inventory_variances` | Variance records with severity and resolution state |
| `replenishment_recommendations` | AI-advisory reorder / expedite / transfer signals |
| `inventory_optimization_runs` | Audit records for each generate/recalculate run |
| `inventory_classifications` | ABC classification results per item |
| `inventory_accuracy_snapshots` | Daily accuracy KPI snapshots |

---

## API Endpoints (30 routes)

All routes under `/api/inventory-optimization/` and all enforce:
- Session auth cookie
- Tenant isolation (`WHERE tenant_id = ?` on all queries)
- RBAC capability checks
- Audit log writes for every mutation

**Summary:** `GET /api/inventory-optimization/summary`  
**Plans:** `GET/POST /api/inventory-optimization/cycle-count-plans`, `GET/PATCH /api/inventory-optimization/cycle-count-plans/:id`, `POST /api/inventory-optimization/cycle-count-plans/:id/schedule|start|cancel`  
**Plan lines:** `POST /api/inventory-optimization/cycle-count-plans/:id/lines`, `PATCH /api/inventory-optimization/cycle-count-plans/:id/lines/:lineId`  
**Sessions:** `POST /api/inventory-optimization/cycle-count-plans/:id/sessions`, `GET /api/inventory-optimization/sessions/:id`, `POST /api/inventory-optimization/sessions/:id/lines|submit|approve|post`  
**Variances:** `GET /api/inventory-optimization/variances`, `GET/POST /api/inventory-optimization/variances/:id/approve|reject|waive`  
**Recommendations:** `GET /api/inventory-optimization/replenishment-recommendations`, `POST /api/inventory-optimization/replenishment-recommendations/generate`, `POST /api/inventory-optimization/replenishment-recommendations/:id/approve|dismiss|convert-to-request`  
**Classifications:** `GET /api/inventory-optimization/classifications`, `POST /api/inventory-optimization/classifications/recalculate`

---

## Security & Access Control

### Feature Flag
`inventory_optimization` is granted to full-tier tenants only. Evostel (restricted tier) receives a 403 on all InvOpt endpoints.

### RBAC Capabilities

| Capability | Granted to |
|---|---|
| `view_inventory_optimization` | admin, supervisor, requester, worker, finance |
| `manage_cycle_counts` | admin, supervisor, worker |
| `approve_variances` | admin, supervisor |
| `manage_replenishment` | admin, supervisor |
| `manage_classifications` | admin, supervisor |

### Tenant Isolation
Every query binds `tenant_id` from the resolved session context. Cross-tenant data access is structurally impossible at the query layer.

### Audit Trail
Every mutation writes to `audit_logs` with `action`, `entity_type`, `entity_id`, `tenant_id`, `user_id`, `before_state`, and `after_state`.

---

## Reports Center Integration

4 new report definitions (category: `Inventory Optimization`, `required_feature: inventory_optimization`):

| Report key | Description |
|---|---|
| `inventory_accuracy_summary` | Daily accuracy snapshots — accuracy %, variance counts, reorder risks |
| `cycle_count_variance_report` | All variances with severity, item, session, and status |
| `replenishment_recommendations_report` | Open/reviewed/approved recommendations with priority |
| `abc_classification_report` | All classifications with scores and insufficient_history flag |

All 4 reports support CSV and PDF export via the standard Reports Center export pipeline.

---

## Frontend

Inventory Optimization Center page added to the AI Intelligence navigation group. Visible only when `inventory_optimization` feature is active for the tenant.

Page sections:
- **KPI Strip** — 7 live metrics from the summary endpoint
- **Cycle Count Plans** — plan table with status, scheduled date, facility
- **Variance Review** — variances with severity badges; BLOCKER highlighted
- **Replenishment Recommendations** — recommendations table with Generate button
- **ABC Classification** — item classification table with Recalculate button

All buttons are wired to real API endpoints. Commercial wording is explicit: "Recommendations are reviewable. Stock adjustments require approved posting. Inventory accuracy is audit-backed."

---

## Seed Data (IntelliFlow Systems)

- 2 cycle count plans: CCP-0001 (IN_PROGRESS), CCP-0002 (SCHEDULED)
- 1 session (CCS-0001, REVIEW_PENDING) with 2 lines
- 2 variances: 1 WARNING (−12%), 1 BLOCKER (controlled item, −30%)
- 3 replenishment recommendations: REORDER (HIGH), EXPEDITE_PO (MEDIUM), TRANSFER (REVIEWED/LOW)
- 3 ABC classifications: A, B, C (C has insufficient_history=1)
- 1 accuracy snapshot with 50% accuracy, 2 open variances, 1 blocker

---

## Constraints Enforced

- No AI execution — recommendations are advisory only
- No auto-adjustment — all stock corrections require human approval and explicit post action
- No fake inventory recommendations — all signals derived from live tenant data
- No frontend-only inventory decisions — all logic runs in backend services
- Blocker variances structurally prevent session approval until resolved
- Waiver requires a non-empty reason string (400 if blank)
- Posting is idempotent — checked via `session.posted_at`
- Tenant isolation enforced at every query level
- RBAC enforced at every service call
- All mutations audit-logged

---

## Verification

```
node --check src/inventory-optimization.js src/services.js server.js app.js src/db.js src/seed.js src/reporting.js
npm test        # 230+ tests, all pass
npm run build
npm run security
npm run verify-migration  # expects v25
npm run perf-smoke
npm run browser-smoke
```
