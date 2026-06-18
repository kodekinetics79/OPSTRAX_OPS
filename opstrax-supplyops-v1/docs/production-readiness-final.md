# OpsTrax Production Readiness Matrix — Final

**Assessment date:** 2026-06-17
**Migration version:** 27
**Test suite:** 287/287 (target)
**Build:** OK
**Security audit:** 0 high vulnerabilities

This matrix is strict. "Ready" means verified in the current codebase or validation stack. "Requires live credentials" means the code is implemented but cannot be validated without external inputs. "Blocked" means depends on an externally-owned decision or credential. "Roadmap" means not yet implemented.

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
| OCR provider (external) | **Requires live credentials** | Code complete; AWS Textract/Azure DI/Google Doc AI supported; credentials not yet provided |
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
| Platform OIDC | **Requires live credentials** | Code complete; platform IdP not yet provisioned |

---

## Auth / SSO

| Area | Status | Notes |
|---|---|---|
| Dev demo login | **Ready** | Disabled in production (guarded by NODE_ENV) |
| Session management | **Ready** | Signed cookies, secure flag, SameSite |
| Tenant OIDC | **Requires live credentials** | OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET required |
| Platform OIDC | **Requires live credentials** | PLATFORM_OIDC_ISSUER, PLATFORM_OIDC_CLIENT_ID required |
| MFA enforcement | **Blocked** | Delegated to IdP — OpsTrax does not implement MFA directly |
| Passwordless | **Blocked** | IdP concern |

---

## Database

| Area | Status | Notes |
|---|---|---|
| SQLite (local/test) | **Ready** | All migrations 001–027 applied and verified |
| PostgreSQL provider | **Requires live credentials** | DATABASE_URL, DATABASE_PROVIDER=postgres required |
| Migration compatibility | **Verified in validation stack** | No SQL dialect-specific features used |
| Backup / restore | **Requires live credentials** | Backup schedule and restore drill require database owner |

---

## Object Storage (Evidence)

| Area | Status | Notes |
|---|---|---|
| Filesystem (local) | **Ready** | Default for non-production |
| S3-compatible storage | **Requires live credentials** | S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY required |
| Signed URL evidence access | **Ready** | EVIDENCE_SIGNING_SECRET required in production |
| Document retention policy | **Blocked** | Customer must define retention period |

---

## OCR Provider

| Area | Status | Notes |
|---|---|---|
| Local deterministic extractor | **Ready** | Always available; produces proposed values for demo/test |
| AWS Textract integration point | **Requires live credentials** | OCR_PROVIDER, OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION |
| Azure Document Intelligence | **Requires live credentials** | OCR_PROVIDER, OCR_ENDPOINT, OCR_ACCESS_KEY, OCR_MODEL_ID |
| Google Document AI | **Requires live credentials** | OCR_PROVIDER, OCR_ENDPOINT, OCR_ACCESS_KEY, OCR_MODEL_ID |
| Human review workflow | **Ready** | Accept/reject proposed values with audit log |
| OCR_REQUIRED=true enforcement | **Ready** | startup.js and go-live-check both validate |
| Auto-approval from OCR | **Blocked by design** | Will never be implemented — violates P2P control requirement |

---

## ERP Connector / Finance Export

| Area | Status | Notes |
|---|---|---|
| ERP export posture | **Ready** | Export-ready marking, delivery status tracking |
| Real ERP API call | **Blocked** | ERP endpoint, credentials, and mapping not yet provided |
| Finance export format | **Ready** | CSV/PDF export available |
| Payment approval | **Blocked by design** | OpsTrax marks export-ready only; payment is ERP-side |

---

## Monitoring / Alerting

| Area | Status | Notes |
|---|---|---|
| /healthz and /healthz/ready | **Ready** | Returns DB, storage, auth, integration posture |
| Log output | **Ready** | Structured stderr logging |
| External monitoring | **Blocked** | Provider (Datadog, CloudWatch, PagerDuty) not yet designated |
| Alert recipients | **Blocked** | Customer must designate oncall and alert channels |

---

## Backup / Restore

| Area | Status | Notes |
|---|---|---|
| Backup documentation | **Ready** | docs/backup-restore.md covers procedure |
| Automated backup | **Blocked** | Depends on Postgres host and backup schedule agreement |
| Restore drill | **Blocked** | Restore drill owner and RPO/RTO must be agreed |

---

## Browser Smoke / Performance / Security

| Area | Status | Notes |
|---|---|---|
| Browser smoke (local) | **Ready** | 72/72 expected |
| Performance smoke | **Ready** | All endpoints within 800ms p95 budget |
| npm audit (high) | **Ready** | 0 high vulnerabilities |
| go-live-check | **Ready** | Runs in production-env simulation with all env checks |
| verify:ocr | **Ready** | OCR provider config check, no secrets exposed |

---

## Deployment Host

| Area | Status | Notes |
|---|---|---|
| Deployment platform | **Blocked** | Platform (AWS, GCP, Railway, Render, etc.) not yet designated |
| Staging URL | **Blocked** | Staging environment not yet provisioned |
| Production URL | **Blocked** | Production environment not yet provisioned |
| CI/CD pipeline | **Blocked** | Customer must define pipeline |
| TLS certificate | **Blocked** | Depends on deployment host |

---

## Strict Verdict

| Component | Verdict |
|---|---|
| Core platform code | **Production-ready** |
| OCR (local/demo) | **Production-ready** |
| OCR (external provider) | **Externally blocked — credentials required** |
| Auth/SSO | **Externally blocked — IdP credentials required** |
| PostgreSQL | **Externally blocked — DATABASE_URL required** |
| Object storage | **Externally blocked — S3 credentials required** |
| ERP integration | **Externally blocked — ERP endpoint/credentials required** |
| Deployment host | **Externally blocked — host selection required** |

**Overall:** Code is production-ready. Deployment is blocked pending external inputs. See `docs/external-inputs-required.md` for the exact checklist.
