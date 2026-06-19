# OpsTrax Go-Live Scorecard

**Last updated:** 2026-06-18 (Phase 4B — Railway + Vercel Deployment Provisioning)
**Migration version:** 28
**Test suite:** 302/302 (local — Phase 3L-F)
**Build:** OK | **Security:** 0 high | **Perf smoke:** 11/11 | **Browser smoke:** 72/72
**Neon Postgres:** VALIDATED — v28, seed=present, procurement=4, cross-tenant isolation confirmed

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
| PostgreSQL (Neon) | **Validated** | Engineering | v28 verified on live Neon — seed=present, isolation confirmed |
| Object storage (S3) | Blocked | Deployment owner | S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY |
| Evidence signing | Blocked | Deployment owner | EVIDENCE_SIGNING_SECRET |
| Staging URL | Blocked | Deployment owner | APP_BASE_URL, PLATFORM_BASE_URL not provisioned |
| Production URL | Blocked | Deployment owner | APP_BASE_URL, PLATFORM_BASE_URL not provisioned |
| TLS certificate | Provided by platform | Railway / Vercel | Auto-provisioned on deploy |
| Deployment platform | **Selected** | Engineering | Railway (backend) + Vercel (frontend proxy) |
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

## Phase 4B deployment inputs status (as of 2026-06-18)

| Input | Status | Exact missing item |
|---|---|---|
| Deployment platform | **SELECTED** | Railway (backend) + Vercel (frontend) |
| Postgres (Neon) | **VALIDATED** | v28 on live Neon — seed=present, isolation confirmed |
| CORS middleware | **IMPLEMENTED** | `ALLOWED_ORIGINS` env var controls allowed origins |
| vercel.json proxy | **CREATED** | Replace `YOUR_RAILWAY_DOMAIN` placeholder before deploy |
| Staging base URL | NOT PROVIDED | Railway + Vercel URLs not yet provisioned |
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

Neon Postgres is live and validated (v28). Deployment platform is selected (Railway + Vercel). CORS and proxy configuration are in place. Remaining blockers are externally-owned: Railway/Vercel URLs not yet provisioned, OIDC credentials, S3, session secrets, and monitoring not provided.

**Next action required:** Provision Railway backend and Vercel frontend, update `vercel.json` with the Railway domain, then provide OIDC credentials and S3 storage to unblock staging.
