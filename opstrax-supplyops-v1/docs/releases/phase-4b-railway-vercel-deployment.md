# Phase 4B — Railway + Vercel Deployment Provisioning

**Date:** 2026-06-18
**Engineer:** OpsTrax Engineering
**Migration version:** 28
**Test suite:** 302/302 (Phase 3L-F baseline — deterministic)
**Build:** OK | **Security:** 0 high | **Perf smoke:** 11/11 | **Browser smoke:** 72/72

---

## Summary

Phase 4B delivered four outcomes:

1. **Neon Postgres live validation** — All 28 migrations applied and verified against the live Neon pooled endpoint. Seed data applied. Cross-tenant isolation confirmed. `verify:postgres` passes: `provider=postgres version=28 seed=present procurement=4`.

2. **Migration runner Postgres compatibility fix** — The `applyMigration()` function used `INSERT OR IGNORE INTO schema_migrations` which was incorrectly translated to a plain `INSERT INTO` (without `ON CONFLICT DO NOTHING`) when run via the Postgres worker bridge, causing a duplicate key error on every run after the first. Fixed in `src/db.js` and the worker's `normalizeSql` catch-all in `src/postgres-db-worker.js`. Migration runner is now idempotent against Neon.

3. **CORS middleware** — Added to `server.js` to support direct Railway backend access from trusted cross-origin clients. `ALLOWED_ORIGINS` env var controls allowed origins. Wildcard is never used. OPTIONS preflight returns 204 with correct headers. No CORS headers set for untrusted origins. Origin allowlist is read lazily on each request (not at module load time) to avoid ESM hoisting ordering issues and to pick up env var changes without restart.

4. **Vercel proxy configuration** — Created `vercel.json` with proxy rewrites for all backend routes (`/api/*`, `/auth/*`, `/platform/auth/*`, `/healthz`) to the Railway backend. The monolithic frontend uses relative URL API calls; Vercel proxies them to Railway, preserving same-origin behavior in the browser. No frontend code changes required. No cross-origin cookie issues. Replace `YOUR_RAILWAY_DOMAIN` placeholder before deploying to Vercel.

---

## 1. Secret rotation

**Action required:** The Neon password was shared in chat during Phase 4B session. Rotate the Neon database password from the Neon dashboard immediately. After rotation:

1. Update `DATABASE_URL` in Railway Variables with the new pooled connection string.
2. Re-run `npm run verify:postgres` against the rotated URL.
3. Confirm `[verify-postgres] OK provider=postgres version=28`.

**Secret scan results (pre-rotation):**

| Pattern | Result |
| --- | --- |
| `git grep -n "npg_"` | CLEAN — no Neon passwords in any committed file |
| `git grep -n "postgresql://"` | CLEAN — only `<placeholder>` examples in docs and local test docker-compose |
| `git grep -n "neondb_owner"` | CLEAN — no real username committed |
| `git grep -n "DATABASE_URL="` | CLEAN — only placeholder examples in docs |
| Neon credentials in code | NONE |

---

## 2. Deployment architecture

```text
Browser
  └─ Vercel (static frontend: index.html, app.js, styles.css)
       └─ /api/*, /auth/*, /platform/auth/*, /healthz → proxy → Railway (Node.js)
                                                               └─ Neon Postgres (pooled, SSL)
                                                               └─ S3-compatible storage (pending)
```

### Why Vercel proxy (not cross-origin)

The frontend (`app.js`) makes all API calls to relative paths (`/api/...`, `/auth/...`). There is no VITE_API_BASE_URL usage in the frontend code. A split deployment without proxy would require updating every fetch call and adding `credentials: 'include'` to all requests — a substantial refactor.

The Vercel proxy approach:

- Requires no frontend code changes
- Preserves same-origin cookie behavior (SameSite=Lax remains correct)
- No browser CORS enforcement (requests are same-origin from the browser's perspective)
- No SameSite=None cookies needed

### vercel.json requirement

Before deploying to Vercel, replace the placeholder in `vercel.json`:

```text
YOUR_RAILWAY_DOMAIN.up.railway.app
```

Replace with your actual Railway domain (e.g., `opstrax-api-production.up.railway.app`).

---

## 3. Railway environment variables

All secrets belong in Railway Variables. Do not put secrets in Vercel.

### Required (deployment-blocking)

```shell
NODE_ENV=production
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://<user>:<password>@<neon-pooler-host>/neondb?channel_binding=require&sslmode=require
APP_BASE_URL=https://<vercel-frontend-domain>
PLATFORM_BASE_URL=https://<vercel-frontend-domain>/platform
API_BASE_URL=https://<railway-backend-domain>
ALLOWED_ORIGINS=https://<vercel-frontend-domain>
COOKIE_SECURE=true
COOKIE_SAME_SITE=Lax
SESSION_SECRET=<random-64-char-hex>
PLATFORM_SESSION_SECRET=<random-64-char-hex>
```

### Still blocked (OIDC, storage, OCR)

```shell
# Tenant OIDC
OIDC_ISSUER=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
OIDC_REDIRECT_URI=https://<vercel-frontend-domain>/auth/oidc/callback
OIDC_LOGOUT_REDIRECT_URI=https://<vercel-frontend-domain>/

# Platform OIDC
PLATFORM_OIDC_ISSUER=
PLATFORM_OIDC_CLIENT_ID=
PLATFORM_OIDC_CLIENT_SECRET=
PLATFORM_OIDC_REDIRECT_URI=https://<vercel-frontend-domain>/platform/auth/oidc/callback

# S3 / evidence storage
EVIDENCE_STORAGE_PROVIDER=s3
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
EVIDENCE_SIGNING_SECRET=

# OCR (optional)
# OCR_PROVIDER=aws_textract
# OCR_ACCESS_KEY=
# OCR_SECRET_KEY=
# OCR_REGION=
```

---

## 4. Vercel environment variables

Only these belong in Vercel:

```shell
VITE_APP_ENV=staging
```

`VITE_API_BASE_URL` is NOT needed because the Vercel proxy rewrites handle routing.

**Forbidden in Vercel:** `DATABASE_URL`, `SESSION_SECRET`, `PLATFORM_SESSION_SECRET`, `OIDC_CLIENT_SECRET`, `S3_SECRET_ACCESS_KEY`, `EVIDENCE_SIGNING_SECRET`, `OCR_SECRET_KEY`.

---

## 5. CORS / cookie behavior

| Scenario | Behavior |
| --- | --- |
| Browser → Vercel (static) | No CORS — same origin |
| Browser → Vercel `/api/*` → Railway (proxy) | No CORS — browser sees Vercel origin; Vercel proxies server-side |
| Direct Railway URL (developer / health check) | CORS enforced — `ALLOWED_ORIGINS` controls which origins get `Access-Control-Allow-Origin` |
| Untrusted origin → Railway direct | CORS headers NOT set — request proceeds but browser blocks cross-origin response |
| Wildcard `*` with credentials | Never used |
| OPTIONS preflight (Railway direct) | 204 with full CORS headers if origin is in `ALLOWED_ORIGINS` |
| Cookie SameSite | `Lax` (same-origin via Vercel proxy) |
| Cookie Secure | `true` in production (auto-detected from HTTPS base URL) |
| Cookie domain | Not explicitly set — scoped to request domain (Vercel domain) |
| Demo login in production | Returns 404 — `isDemoLoginEnabled()` is false when `NODE_ENV=production` |

---

## 6. Neon validation results

| Check | Result |
| --- | --- |
| Connection | OK — Neon pooled endpoint reached |
| SSL | OK — auto-detected from `sslmode=require` |
| Migration version | v28 |
| Seed data | applied |
| Procurement summary | 4 vendors |
| Cross-tenant isolation | confirmed — `tenant_evostel` denied access to `tenant_intelliflow_systems` vendor |
| `verify:postgres` | `[verify-postgres] OK provider=postgres version=28 seed=present procurement=4` |
| `verify-migration` | `[verify-migration] OK All 28 migrations verified.` |

---

## 7. Verification commands run (2026-06-18)

| Command | Result |
| --- | --- |
| `npm test` | 302/302 PASS (verified in this session — all ✔, zero failures) |
| `npm run build` | OK |
| `npm run security` | 0 high vulnerabilities |
| `npm run verify:postgres` | OK — v28, seed=present, procurement=4 |
| `npm run verify-migration` | OK — v28 |
| `npm run perf-smoke` | 11/11 OK (all endpoints within 800ms budget) |
| `npm run browser-smoke` | 72/72 OK |
| `npm run verify:ocr` | OK (LOCAL mode) |
| `npm run go-live-check` | Blocked — `NODE_ENV=production + DATABASE_PROVIDER + OIDC + SESSION_SECRET` required |

---

## 8. Files changed in Phase 4B

| File | Change |
| --- | --- |
| `src/db.js` | SSL auto-detect from `sslmode=require`; migration runner uses `ON CONFLICT DO NOTHING` (idempotent on both SQLite and Postgres) |
| `src/postgres-db-worker.js` | Fixed `$$1` escape in schema_migrations pattern; added catch-all `ON CONFLICT DO NOTHING` for any `INSERT INTO schema_migrations` lacking it; version assertion updated to 28 |
| `scripts/verify-postgres.mjs` | Version assertion updated from 24 to 28 |
| `server.js` | CORS middleware added — `resolveAllowedOrigin()` + OPTIONS preflight handler; never uses wildcard with credentials |
| `vercel.json` | Created — proxy rewrites for `/api/*`, `/auth/*`, `/platform/auth/*`, `/healthz` to Railway; SPA fallback for all other paths |
| `docs/vercel-railway-deployment.md` | Created — full Railway + Vercel + Neon deployment guide |
| `docs/deployment-prep.md` | Updated with Neon/Railway/Vercel architecture |
| `docs/external-deployment-handoff.md` | Named Neon; Railway vs Vercel secrets split; DATABASE_URL placement explicit |
| `docs/production-readiness-final.md` | Neon row: Validated; CORS row: Production-ready |
| `docs/go-live-scorecard.md` | Postgres: Validated; Deployment platform: Selected |
| `docs/releases/phase-4b-railway-vercel-deployment.md` | This document |

---

## 9. Remaining blockers before staging

All code-side work is complete. The following are externally-owned and not provided:

| Blocker | Owner |
| --- | --- |
| Railway backend provisioned and env vars set | Deployment owner |
| Vercel frontend provisioned | Deployment owner |
| `vercel.json` `YOUR_RAILWAY_DOMAIN` placeholder updated | Deployment owner |
| Neon password rotated after chat exposure | Deployment owner |
| `SESSION_SECRET`, `PLATFORM_SESSION_SECRET` generated and set | Deployment owner |
| Tenant OIDC credentials | Deployment owner |
| Platform OIDC credentials | Deployment owner |
| S3 credentials and bucket | Deployment owner |
| `EVIDENCE_SIGNING_SECRET` generated and set | Deployment owner |
| Monitoring provider and alert recipients | Deployment owner |
| Backup schedule and restore drill owner | Deployment owner |

---

## 10. Strict verdict

| Item | Result |
| --- | --- |
| Secret rotation confirmed | **Required — Neon password was shared in chat; rotate before Railway provisioning** |
| Secret scans (git) | **CLEAN — no real credentials committed** |
| Neon Postgres validated after migration fix | **YES — v28, seed=present, isolation confirmed** |
| Railway backend deployment-ready (code) | **YES — pending Railway project provisioning and env vars** |
| Vercel frontend deployment-ready (config) | **YES — pending Railway domain substitution in vercel.json** |
| CORS behavior | **Production-safe — ALLOWED_ORIGINS enforced; wildcard never used** |
| Cookie behavior | **Production-safe — SameSite=Lax, Secure via Vercel proxy** |
| Demo login blocked in production | **YES — returns 404 when NODE_ENV=production** |
| Staging ready | **NO — Railway/Vercel URLs not provisioned; OIDC/S3/secrets not provided** |
| Live production ready | **NO — all external deployment inputs missing** |

**Overall verdict:**

- **Codebase production-deployment ready: yes**
- **Neon validated: yes**
- **Railway/Vercel configuration: ready (pending provisioning)**
- **Staging deployment: externally blocked — deployment owner must provision Railway + Vercel and provide OIDC, S3, session secrets**
- **Live production: externally blocked**
