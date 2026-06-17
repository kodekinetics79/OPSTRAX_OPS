# OpsTrax SupplyOps — Phase 3H: Enterprise Reporting & Export Center

## Scope Delivered

- Report definitions catalog (13 tenant reports + 6 platform reports)
- Backend-owned report generation with tenant isolation and RBAC enforcement
- CSV export with formula-injection protection, correct content-type, and safe filenames
- Real binary PDF export using stdlib-only PDF generation (no external dependencies)
- Report run lifecycle: QUEUED → RUNNING → COMPLETED / FAILED / CANCELLED
- Report run audit trail (every run, download, and cancel is audit-logged)
- Denied report access audit event at HTTP route layer
- Platform Admin reporting surface (platform-role gated, separate from tenant API)
- Reports Center UI: KPI strip, grouped report catalog, recent runs table, drawer with preview rows
- Run CSV and Run PDF actions wired to backend — no client-side export logic
- Finance export readiness report column alias fix (`validation_error_count` exposed as `open_error_count`)
- Device trust posture report column qualification fix (ambiguous `name` resolved)
- Seed data: 4 tenant report runs (3 COMPLETED, 1 FAILED with honest reason) + 1 platform run
- `reports` feature flag controls access per tenant (Evostel restricted to fewer report types)

## Data Model (Migration 024)

| Table | Purpose |
|---|---|
| `report_definitions` | Global catalog of available reports (seeded, not tenant-specific) |
| `report_runs` | Per-run record: state, filters, row count, failure reason, output metadata |
| `report_exports` | Persisted export content (CSV text or PDF binary buffer) with SHA-256 checksum |

Run states: `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`

Export formats: `CSV`, `PDF`, `JSON`

## Backend APIs

### Tenant APIs

| Method | Route | Permission |
|---|---|---|
| GET | `/api/reports/summary` | `view_reports` |
| GET | `/api/reports/definitions` | `view_reports` |
| GET | `/api/reports/runs` | `view_reports` |
| POST | `/api/reports/runs` | `run_reports` |
| GET | `/api/reports/runs/:id` | `view_reports` |
| POST | `/api/reports/runs/:id/cancel` | `run_reports` |
| GET | `/api/reports/runs/:id/export.csv` | `view_reports` |
| GET | `/api/reports/runs/:id/export.pdf` | `view_reports` |

### Platform APIs

| Method | Route | Platform Role Required |
|---|---|---|
| GET | `/api/platform/reports/summary` | `VIEW_PLATFORM_REPORTS` |
| GET | `/api/platform/reports/definitions` | `VIEW_PLATFORM_REPORTS` |
| GET | `/api/platform/reports/runs` | `VIEW_PLATFORM_REPORTS` |
| POST | `/api/platform/reports/runs` | `RUN_PLATFORM_REPORTS` |
| GET | `/api/platform/reports/runs/:id` | `VIEW_PLATFORM_REPORTS` |
| POST | `/api/platform/reports/runs/:id/cancel` | `RUN_PLATFORM_REPORTS` |
| GET | `/api/platform/reports/runs/:id/export.csv` | `VIEW_PLATFORM_REPORTS` |
| GET | `/api/platform/reports/runs/:id/export.pdf` | `VIEW_PLATFORM_REPORTS` |

## Tenant Report Catalog

| Category | Report Key | Required Feature |
|---|---|---|
| Operational | inventory_stock_position | inventory_control |
| Operational | low_stock_reorder_risk | inventory_control |
| Operational | warehouse_issue_activity | warehouse_workflows |
| Operational | internal_request_activity | internal_storefront |
| Operational | receiving_activity | receiving_core |
| Operational | procurement_pr_po_activity | procurement_purchasing |
| Operational | offline_sync_conflicts | offline_ops |
| Operational | device_trust_posture | barcode_device_hub |
| Procure-to-Pay | invoice_match_exceptions | procure_to_pay_intelligence |
| Procurement | vendor_performance | supplier_governance |
| Finance | finance_export_readiness | finance_sync_export_hub |
| Compliance | audit_trail_summary | audit_black_box |
| Compliance | evidence_coverage | documents_evidence_vault |

## Platform Report Catalog

| Category | Report Key | Required Capability |
|---|---|---|
| Platform | platform_tenant_summary | VIEW_PLATFORM_SUMMARY |
| Platform | platform_module_entitlement_summary | VIEW_PLATFORM_TENANT_MODULES |
| Platform | platform_usage_summary | VIEW_PLATFORM_TENANT_USAGE |
| Platform | platform_support_sessions_summary | VIEW_PLATFORM_SUPPORT_SESSIONS |
| Platform | platform_audit_summary | VIEW_PLATFORM_AUDIT_EVENTS |
| Platform | platform_security_event_summary | VIEW_PLATFORM_SECURITY_EVENTS |

## CSV Export Behavior

- Content-Type: `text/csv; charset=utf-8`
- File name: `opstrax_{report_key}_{run_no}.csv`
- All values passed through `safeCsvCell()`:
  - Double-quotes escaped as `""`
  - Newlines stripped to space
  - Leading `=`, `+`, `-`, `@`, `\t`, `\r` prefixed with `'` to block spreadsheet formula injection
- Tenant-scoped rows only — no cross-tenant data
- Empty reports produce a valid header row with zero data rows (no error)
- SHA-256 checksum stored per export in `report_exports.checksum_sha256`

## PDF Export Behavior

- Real binary PDF generated using Node.js stdlib only (no external PDF library)
- Content-Type: `application/pdf`
- File name: `opstrax_{report_key}_{run_no}.pdf`
- PDF 1.4 format with Helvetica font, multi-page support
- Magic bytes: `%PDF` at start of buffer — verified in tests
- Content includes: report title, category, run metadata, row data, summary lines
- Long lines wrapped at 96 characters; pages paginated at 48 lines

## Security and Tenant Isolation

- All report data queries include `WHERE tenant_id = ?` binding
- RBAC: `view_reports` required to read, `run_reports` required to generate
- Feature flag: `reports` must be enabled for the tenant
- Reports feature enabled per tenant (Evostel: fewer report types available)
- Platform reports gated to authenticated platform users with specific role capabilities
- Tenant users cannot call platform report APIs (403)
- Denied report access logged as `DENIED_ROUTE_ACCESS` in `audit_logs` at HTTP layer
- Every successful run logged as `RUN_REPORT` in `audit_logs`
- Every download logged as `DOWNLOAD_CSV` or `DOWNLOAD_PDF` in `audit_logs`
- No passwords, secrets, or sensitive internal fields in any report output

## RBAC Assignment

| Role | view_reports | run_reports |
|---|---|---|
| admin | ✅ | ✅ |
| supervisor | ✅ | ✅ |
| finance | ✅ | ✅ |
| requester | ✅ | ✅ |
| worker | ✅ | — |

## Demo Seed Data

| Run ID | Report | Status | Notes |
|---|---|---|---|
| RPT-0001 | Inventory Stock Position | COMPLETED | Stock CSV with real inventory rows |
| RPT-0002 | Procurement PR/PO Activity | COMPLETED | PR/PO summary CSV |
| RPT-0003 | Audit Trail Summary | COMPLETED | Audit event CSV |
| RPT-0004 | Finance Export Readiness | FAILED | Honest failure: `Export validation blocked by unresolved accounting code mismatches.` |
| PRPT-0001 | Tenant Subscription Summary | COMPLETED | Platform report by platform_user_admin |

## Tests Added (Phase 3H)

- CSV export content-type and formula injection protection
- PDF export returns `application/pdf`, `.pdf` filename, non-empty buffer, `%PDF` magic bytes
- Failed report run records honest `failure_reason` and is tenant-isolated
- Denied report access: throws at service layer, returns 403 at HTTP layer, `DENIED_ROUTE_ACCESS` in audit log
- Report run cancel: already-COMPLETED run stays COMPLETED; audit records present
- Finance export readiness: completes without 500 error after column fix
- Platform AUDITOR role can read reports but not run them
- Tenant user cannot access platform report APIs
- Reports page has no dead buttons — `data-action="run-report"`, `data-format="CSV"`, `data-format="PDF"` all backed by real routes
- Phase 3H release doc exists and documents the reporting center

## Browser Smoke Coverage

- Reports nav item visible and renders expected content
- Run report button present; clicking runs a report and opens drawer
- Report drawer exposes: report title, status, rows, exports, audit trail
- CSV download route returns `text/csv` response
- PDF download route returns `application/pdf` response with binary body
- Restricted tenant (Evostel) still sees the Reports module

## Remaining Roadmap Items

- Scheduled reports (table and UI stubs present; execution not wired — labeled roadmap in product)
- Date/time range filters on all reports (partial: `dateFrom`/`dateTo` supported on `internal_request_activity`)
- Facility/department scoped report sub-filters (RBAC scoping applies; per-report filter UI not built)
- Report export to S3 / external delivery (blocked on external storage provider inputs)
- Emailed report delivery (blocked on email provider configuration)

## Commands Run

```
node --check app.js server.js src/reporting.js src/services.js src/db.js src/seed.js tests/opstrax.test.mjs
npm test       → 206/206 pass
npm run build  → OK
npm run security → 0 vulnerabilities
npm run verify-migration → All 24 migrations verified
npm run perf-smoke → All 11 endpoints within 800ms budget
npm run browser-smoke → 58+/58 checks passed
```
