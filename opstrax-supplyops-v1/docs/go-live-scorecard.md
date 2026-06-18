# OpsTrax Go-Live Scorecard

**Last updated:** 2026-06-17 (Phase 3L — External Services Cutover Readiness)
**Migration version:** 28
**Test suite:** 299/299 (local)
**Build:** OK | **Security:** 0 high | **Perf smoke:** 11/11 | **Browser smoke:** 72/72

Status categories:

- `Ready` — verified in the current codebase or local validation stack
- `Verified in validation stack` — externally validated path confirmed in production-validation run
- `Implemented — credentials blocked` — code is complete; external credentials/config not yet provided
- `Blocked` — depends on an externally-owned decision, credential, or action
- `Roadmap` — not yet implemented

---

| Area | Status | Owner | Blocker |
|---|---|---|---|
| Tenant workspace | Ready | Engineering | — |
| Platform Admin | Ready | Engineering | — |
| Auth / SSO (demo) | Ready | Engineering | — |
| Tenant OIDC | Blocked | Deployment owner | OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET |
| Platform OIDC | Blocked | Deployment owner | PLATFORM_OIDC_ISSUER, PLATFORM_OIDC_CLIENT_ID, PLATFORM_OIDC_CLIENT_SECRET |
| Session secrets | Blocked | Deployment owner | SESSION_SECRET, PLATFORM_SESSION_SECRET |
| Secure cookies | Blocked | Deployment owner | COOKIE_SECURE=true, COOKIE_SAME_SITE |
| PostgreSQL | Blocked | Deployment owner | DATABASE_URL, DATABASE_PROVIDER=postgres |
| Object storage (S3) | Blocked | Deployment owner | S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY |
| Evidence signing | Blocked | Deployment owner | EVIDENCE_SIGNING_SECRET |
| Staging URL | Blocked | Deployment owner | APP_BASE_URL, PLATFORM_BASE_URL |
| Production URL | Blocked | Deployment owner | APP_BASE_URL, PLATFORM_BASE_URL |
| TLS certificate | Blocked | Deployment owner | Depends on host |
| Deployment platform | Blocked | Deployment owner | Host selection (Railway/Render/AWS/GCP) |
| CI/CD pipeline | Blocked | Deployment owner | Pipeline definition |
| OCR provider (local) | Ready | Engineering | — |
| OCR provider (AWS Textract) | Implemented — credentials blocked | Deployment owner | OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION |
| Monitoring / alerts | Blocked | Deployment owner | Provider selection, webhook/email destination |
| Alert recipients | Blocked | Deployment owner | Oncall contacts |
| Backup / restore | Blocked | Deployment owner | Backup owner, schedule, RPO/RTO, restore drill |
| ERP connector | Blocked | Deployment owner | ERP endpoint, credentials, field mapping |
| Tenant isolation | Ready | Engineering | — |
| RBAC / feature entitlements | Ready | Engineering | — |
| Audit logging | Ready | Engineering | — |
| Session security | Ready | Engineering | — |
| CSRF | Ready | Engineering | — |
| Security headers | Ready | Engineering | — |
| Support sessions | Ready | Engineering | — |
| Reports export | Ready | Engineering | — |
| Inventory Optimization | Ready | Engineering | — |
| Asset & Custody | Ready | Engineering | — |
| Procure-to-Pay | Ready | Engineering | — |
| Performance | Ready | Engineering | 11/11 endpoints within budget |
| Browser smoke | Ready | Engineering | 72/72 passing |
| AI execution | Blocked by design | N/A | Advisory-only; no autonomous execution |

---

## Phase 3L external inputs status (as of 2026-06-17)

| Input | Status | Exact missing item |
|---|---|---|
| Staging base URL | NOT PROVIDED | `APP_BASE_URL` not set |
| Postgres connection | NOT PROVIDED | `DATABASE_URL` not set |
| S3 / object storage | NOT PROVIDED | `S3_BUCKET`, `S3_REGION`, credentials not set |
| Tenant OIDC config | NOT PROVIDED | `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` not set |
| Platform OIDC config | NOT PROVIDED | `PLATFORM_OIDC_ISSUER`, `PLATFORM_OIDC_CLIENT_ID`, `PLATFORM_OIDC_CLIENT_SECRET` not set |
| OCR provider config | NOT PROVIDED | `OCR_PROVIDER`, `OCR_ACCESS_KEY`, `OCR_SECRET_KEY`, `OCR_REGION` not set |
| Monitoring destination | NOT PROVIDED | No provider, webhook, or alert recipient designated |
| Backup / restore owner | NOT PROVIDED | No owner, schedule, or RPO/RTO designated |
| Session secrets | NOT PROVIDED | `SESSION_SECRET`, `PLATFORM_SESSION_SECRET` not set |
| Evidence signing secret | NOT PROVIDED | `EVIDENCE_SIGNING_SECRET` not set |

---

## Executive summary

The product code is complete and production-ready. All deployment blockers are externally-owned inputs that have not been provided. No staging validation can proceed until at minimum items 1–3 (URL, database, storage) are provided.

**Next action required:** Deployment owner must provide the staging base URL and production database/storage credentials before any external validation can proceed.
