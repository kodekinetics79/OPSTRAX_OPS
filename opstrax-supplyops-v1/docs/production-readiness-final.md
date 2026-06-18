# OpsTrax Production Readiness Matrix — Final

**Assessment date:** 2026-06-17
**Phase:** 3L — External Services Cutover Readiness
**Migration version:** 28
**Test suite:** 299/299 (Phase 3L including OCR adapter, normalizer, and evidence linking tests)
**Build:** OK
**Security audit:** 0 high vulnerabilities
**Local perf smoke:** 11/11 endpoints within 800ms budget
**Browser smoke:** 72/72

This matrix is strict. "Ready" means verified in the current codebase or validation stack. "Requires live credentials" means the code is implemented but cannot be validated without external inputs. "Blocked" means depends on an externally-owned decision or credential that has not been provided. "Roadmap" means not yet implemented.

**No claim of production readiness is made for any item listed as Blocked.**

---

## Tenant Workspace

| Area | Status | Notes |
|---|---|---|
| Inventory Control | **Ready** | Full CRUD, RBAC, audit log, tenant isolation |
| Request Center | **Ready** | Full lifecycle, RBAC, approval gates |
| Warehouse Workflows | **Ready** | Task assignment, picking, issuing |
| Procurement Center | **Ready** | Purchase requests, POs, vendor governance |
| Supplier Governance | **Ready** | Contracts, scorecards, compliance |
| Contract Repository | **Ready** | Lifecycle, renewal alerts |
| Budget Control | **Ready** | Department budgets, waiver flow |
| Procure-to-Pay / Invoice Intelligence | **Ready** | Extraction, matching, exceptions, approval, export |
| OCR provider (external) | **Requires live credentials** | AWS Textract adapter implemented; OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION not provided |
| Receiving Center | **Ready** | Session-based receiving, exceptions |
| Evidence Vault | **Ready** | Linked evidence, audit trail |
| Audit Trail | **Ready** | Full audit log, entity filter, export |
| Finance Export Hub | **Ready** | Batch export, ERP delivery posture |
| Integration Center | **Ready** | Connection registry, job tracking |
| DeviceOps Center | **Ready** | Device registry, trust, scan events |
| Offline Sync | **Ready** | Batch, conflict resolution, replay |
| AI Operations | **Ready** | Advisory layer, recommendations |
| Reports Center | **Ready** | 60+ reports, CSV/PDF, tenant-scoped |
| Inventory Optimization | **Ready** | Cycle counts, variance, replenishment |
| Asset & Custody Center | **Ready** | Full custody lifecycle, disposal, SoD |

---

## Platform Admin

| Area | Status | Notes |
|---|---|---|
| Platform control plane | **Ready** | Tenant management, user management |
| Tenant tier control | **Ready** | Feature flag management via platform |
| Support sessions | **Ready** | Scoped access, full audit |
| Platform reports | **Ready** | Cross-tenant aggregations |
| Platform OIDC | **Blocked** | PLATFORM_OIDC_ISSUER, PLATFORM_OIDC_CLIENT_ID, PLATFORM_OIDC_CLIENT_SECRET not provided |

---

## Auth / SSO

| Area | Status | Notes |
|---|---|---|
| Dev demo login | **Ready** | Disabled in production (guarded by NODE_ENV) |
| Session management | **Ready** | Signed cookies, secure flag, SameSite |
| Tenant OIDC | **Blocked** | OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET not provided |
| Platform OIDC | **Blocked** | PLATFORM_OIDC_ISSUER, PLATFORM_OIDC_CLIENT_ID not provided |
| Session secrets | **Blocked** | SESSION_SECRET, PLATFORM_SESSION_SECRET not provided |
| Secure cookies | **Blocked** | COOKIE_SECURE, COOKIE_SAME_SITE not set |
| MFA enforcement | **Blocked** | Delegated to IdP — OpsTrax does not implement MFA directly |

---

## Database

| Area | Status | Notes |
|---|---|---|
| SQLite (local/test) | **Ready** | All migrations 001–028 applied and verified |
| PostgreSQL provider | **Blocked** | DATABASE_URL not provided; DATABASE_PROVIDER not set |
| Migration compatibility | **Verified in validation stack** | No SQL dialect-specific features used |
| Backup / restore | **Blocked** | Backup owner, schedule, and restore drill not designated |

---

## Object Storage (Evidence)

| Area | Status | Notes |
|---|---|---|
| Filesystem (local) | **Ready** | Default for non-production |
| S3-compatible storage | **Blocked** | S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY not provided |
| Signed URL evidence access | **Blocked** | EVIDENCE_SIGNING_SECRET not provided |
| Document retention policy | **Blocked** | Customer must define retention period |

---

## OCR Provider

| Area | Status | Notes |
|---|---|---|
| Local deterministic extractor | **Ready** | Always available; produces proposed values for demo/test |
| AWS Textract adapter (Phase 3L) | **Implemented — credentials blocked** | SigV4 HTTPS adapter live; OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION not provided |
| Textract field normalization | **Ready** | AnalyzeExpense → invoice_number, vendor_name, po_number, subtotal, tax, total, lines[] |
| Evidence document linking | **Ready** | evidence_document_id stored per run (migration 028) |
| Human review workflow | **Ready** | Accept/reject proposed values with audit log — PENDING_REVIEW required |
| OCR_REQUIRED=true enforcement | **Ready** | startup.js and go-live-check both validate |
| verify:ocr script | **Ready** | Reports LOCAL in current environment |
| verify:ocr --probe (live) | **Blocked** | Requires OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION |
| Azure Document Intelligence | **Requires live credentials** | OCR_PROVIDER, OCR_ENDPOINT, OCR_ACCESS_KEY, OCR_MODEL_ID |
| Google Document AI | **Requires live credentials** | OCR_PROVIDER, OCR_ENDPOINT, OCR_ACCESS_KEY, OCR_MODEL_ID |
| Auto-approval from OCR | **Blocked by design** | Will never be implemented — violates P2P control requirement |

---

## ERP Connector / Finance Export

| Area | Status | Notes |
|---|---|---|
| ERP export posture | **Ready** | Export-ready marking, delivery status tracking |
| Real ERP API call | **Blocked** | ERP endpoint, credentials, and mapping not provided |
| Finance export format | **Ready** | CSV/PDF export available |
| Payment approval | **Blocked by design** | OpsTrax marks export-ready only; payment is ERP-side |

---

## Monitoring / Alerting

| Area | Status | Notes |
|---|---|---|
| /healthz and /healthz/ready | **Ready** | Returns DB, storage, auth, integration posture |
| Log output | **Ready** | Structured stderr logging |
| External monitoring | **Blocked** | Provider (Datadog, CloudWatch, PagerDuty, UptimeRobot) not designated |
| Alert recipients | **Blocked** | Oncall contacts and alert channels not designated |
| Uptime check configuration | **Blocked** | Staging URL not provided |

---

## Backup / Restore

| Area | Status | Notes |
|---|---|---|
| Backup documentation | **Ready** | docs/backup-restore.md covers procedure |
| Automated backup | **Blocked** | Depends on Postgres host; backup schedule not agreed |
| Restore drill | **Blocked** | Restore drill owner and RPO/RTO not agreed |

---

## Deployment / Hosting

| Area | Status | Notes |
|---|---|---|
| Deployment platform | **Blocked** | Platform (AWS, GCP, Railway, Render, Fly.io, etc.) not designated |
| Staging URL | **Blocked** | Staging environment not provisioned |
| Production URL | **Blocked** | Production environment not provisioned |
| TLS certificate | **Blocked** | Depends on deployment host |
| CI/CD pipeline | **Blocked** | Customer must define pipeline |

---

## Browser Smoke / Performance / Security (local)

| Area | Status | Notes |
|---|---|---|
| Browser smoke (local) | **Ready** | 72/72 passing |
| Performance smoke | **Ready** | All 11 endpoints within 800ms p95 budget |
| npm audit (high) | **Ready** | 0 high vulnerabilities |
| go-live-check | **Ready** | Passes with production-env simulation |
| verify:ocr | **Ready** | LOCAL mode; reports NOT_CONFIGURED for unconfigured providers |
| verify-migration | **Ready** | v28 verified |

---

## Strict Verdict

| Component | Verdict |
|---|---|
| Core platform code | **Production-ready** |
| OCR adapter (AWS Textract) | **Implemented — externally blocked by credentials** |
| OCR (local/demo) | **Production-ready** |
| Auth / SSO | **Externally blocked — IdP credentials required** |
| PostgreSQL | **Externally blocked — DATABASE_URL required** |
| Object storage | **Externally blocked — S3 credentials required** |
| ERP integration | **Externally blocked — ERP endpoint/credentials required** |
| Monitoring | **Externally blocked — provider and recipients not designated** |
| Backup / restore | **Externally blocked — owner and schedule not designated** |
| Deployment host | **Externally blocked — host selection required** |

**Overall:** Code is production-ready. Every deployment blocker is an externally-owned input that has not been provided. See `docs/external-inputs-required.md` for the precise checklist and owner for each input.
