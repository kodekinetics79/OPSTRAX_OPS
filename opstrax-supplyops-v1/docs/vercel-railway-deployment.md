# OpsTrax — Vercel + Railway + Neon Deployment Guide

**Document version:** Neon Postgres Cutover
**Date:** 2026-06-18
**Architecture:** Frontend → Vercel | Backend/API → Railway | Database → Neon Postgres

---

## Architecture overview

```
Browser
  └─ Vercel (static frontend bundle)
       └─ VITE_API_BASE_URL → Railway (Node.js backend + all API routes)
                                   └─ DATABASE_URL → Neon Postgres (pooled)
                                   └─ S3_* → S3-compatible object storage
```

**Separation of concerns:**
- Vercel hosts the compiled frontend bundle only. No server code runs on Vercel.
- Railway runs the Node.js backend: all `/api/` routes, auth, migration runner, session management.
- All secrets live in Railway. Vercel receives only `VITE_*` prefixed public env vars.
- `DATABASE_URL` is a backend secret. It MUST NOT be placed in Vercel.

---

## 1. Neon Postgres setup

### 1.1 Create a Neon project

1. Sign in at neon.tech.
2. Create a new project (e.g. `opstrax-production`).
3. Create a database (e.g. `opstrax`).
4. From the Connection Details panel, select **Pooled connection** and copy the connection string.
   The pooled string looks like:
   ```
   postgresql://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require
   ```

### 1.2 SSL note

Neon requires SSL. OpsTrax auto-detects `sslmode=require` in the connection string and enables SSL automatically — no additional env var needed.

### 1.3 Required Neon database user permissions

The database user must have:
- `CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX` — for the migration runner
- `INSERT`, `UPDATE`, `DELETE`, `SELECT` — for all runtime operations

### 1.4 Migration procedure

Migrations run automatically on server startup. The migration runner applies all pending migrations in order (v1–v28) and records each version in `schema_migrations`. No manual migration step is required.

To verify migration version after first deploy:
```bash
npm run verify-migration
```
Expected output: `[verify-migration] OK All 28 migrations verified.`

---

## 2. Railway backend setup

### 2.1 Deploy the backend

1. Connect your repository to Railway.
2. Set the root directory to the project root (not a subdirectory).
3. Set the start command: `node server.js` (or use the `npm start` script if defined).
4. Railway will assign a public domain, e.g. `opstrax-api.up.railway.app`.

### 2.2 Required Railway environment variables

Set all of these in Railway's "Variables" panel. These are backend secrets — do NOT put them in Vercel.

```
# Runtime
NODE_ENV=production
PORT=<Railway auto-assigns — leave unset to use Railway's $PORT>

# Routing
APP_BASE_URL=https://<your-vercel-frontend-domain>
PLATFORM_BASE_URL=https://<your-vercel-frontend-domain>/platform
API_BASE_URL=https://<your-railway-backend-domain>
ALLOWED_ORIGINS=https://<your-vercel-frontend-domain>

# Database (Neon Postgres — pooled connection string)
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require

# Object storage
EVIDENCE_STORAGE_PROVIDER=s3
S3_BUCKET=<bucket-name>
S3_REGION=<aws-region>
S3_ACCESS_KEY_ID=<iam-key-id>
S3_SECRET_ACCESS_KEY=<iam-secret>
EVIDENCE_SIGNING_SECRET=<random-32-char-string>

# Tenant OIDC
OIDC_ISSUER=<idp-issuer-url>
OIDC_CLIENT_ID=<client-id>
OIDC_CLIENT_SECRET=<client-secret>
OIDC_REDIRECT_URI=https://<vercel-frontend-domain>/auth/oidc/callback
OIDC_LOGOUT_REDIRECT_URI=https://<vercel-frontend-domain>/
OIDC_SCOPES=openid profile email

# Platform OIDC
PLATFORM_OIDC_ISSUER=<platform-idp-issuer>
PLATFORM_OIDC_CLIENT_ID=<platform-client-id>
PLATFORM_OIDC_CLIENT_SECRET=<platform-client-secret>
PLATFORM_OIDC_REDIRECT_URI=https://<vercel-frontend-domain>/platform/auth/oidc/callback
PLATFORM_OIDC_LOGOUT_REDIRECT_URI=https://<vercel-frontend-domain>/platform/
PLATFORM_OIDC_SCOPES=openid profile email

# Sessions
SESSION_SECRET=<random-64-char-hex>
PLATFORM_SESSION_SECRET=<random-64-char-hex>
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax

# OCR (optional — omit to use local mode)
# OCR_PROVIDER=aws_textract
# OCR_ACCESS_KEY=<iam-access-key-id>
# OCR_SECRET_KEY=<iam-secret-access-key>
# OCR_REGION=us-east-1
```

Generate session secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 CORS configuration

`ALLOWED_ORIGINS` must match the exact Vercel frontend origin (including scheme, no trailing slash). The backend reads this to configure CORS for cross-origin API calls from the browser.

Example:
```
ALLOWED_ORIGINS=https://opstrax.vercel.app
```

If you use a custom domain on Vercel, set this to your custom domain.

---

## 3. Vercel frontend setup

### 3.1 Deploy the frontend

1. Connect your repository to Vercel.
2. Set the framework to **Vite** (auto-detected).
3. Set the root directory to `frontend/` if the frontend is in a subdirectory, or the project root if it is not separated.
4. Vercel will assign a public domain, e.g. `opstrax.vercel.app`.

### 3.2 Required Vercel environment variables

Only `VITE_*` prefixed variables belong in Vercel. These are baked into the browser bundle at build time.

```
VITE_API_BASE_URL=https://<your-railway-backend-domain>
VITE_APP_ENV=staging
```

**Critical: Do NOT add any of the following to Vercel:**
- `DATABASE_URL` — backend secret; belongs in Railway only
- `DATABASE_PROVIDER` — backend config; belongs in Railway only
- `SESSION_SECRET` / `PLATFORM_SESSION_SECRET` — backend secrets
- Any `OIDC_*` secret — backend secrets
- Any `S3_*` secret — backend secrets

If `DATABASE_URL` is placed in Vercel, it is exposed to the browser bundle and anyone who can view source. It has no effect on Vercel because no server code runs there.

### 3.3 Build command

Vercel auto-detects Vite. The build command is:
```
npm run build
```

The output directory is `dist/`.

---

## 4. Cross-origin API calls

The browser frontend makes API calls to the Railway backend via `VITE_API_BASE_URL`. The backend must:
1. Set `ALLOWED_ORIGINS` to the Vercel frontend origin.
2. Return `Access-Control-Allow-Origin: https://<vercel-domain>` on all API responses.
3. Include `Access-Control-Allow-Credentials: true` for authenticated routes.

The `OIDC_REDIRECT_URI` and `PLATFORM_OIDC_REDIRECT_URI` must point to the **frontend** domain (Vercel), not the backend (Railway), because the browser lands on the redirect URI after login.

---

## 5. Go-live checklist

After provisioning all env vars:

```bash
# 1. Verify migration v28 applied against Neon
npm run verify-migration

# 2. Verify Postgres connection and data integrity
DATABASE_URL=<neon-url> npm run verify:postgres

# 3. Verify storage connection
npm run verify:storage

# 4. Full go-live check (requires NODE_ENV=production and all env vars set)
NODE_ENV=production npm run go-live-check

# 5. Verify health endpoint
curl https://<railway-backend-domain>/healthz/ready

# 6. Verify demo login is disabled (must return 404)
curl -X POST https://<railway-backend-domain>/api/dev/demo-login
# Expected: {"error":"Not found"}
```

All commands must pass before go-live is authorized.

---

## 6. Neon-specific notes

| Item | Note |
| --- | --- |
| SSL | Required by Neon. Auto-detected from `sslmode=require` in `DATABASE_URL`. |
| Connection pooling | Use the **pooled** connection string from Neon's dashboard. The pooled endpoint routes through Neon's PgBouncer proxy. |
| Connection limit | Neon's pooled endpoint supports higher concurrent connections. The direct endpoint has a lower limit. |
| Idle connections | Neon free-tier projects suspend after 5 minutes of inactivity and resume on the next connection. Railway keep-alive pings can prevent this if needed. |
| Backup | Neon provides point-in-time restore on paid plans. Confirm backup retention period with your Neon plan. |
| Rollback | To roll back a bad migration, restore from Neon's PITR to a branch before the migration was applied, then re-deploy the previous version. |
| Migration re-run | OpsTrax migration runner skips already-applied versions (`schema_migrations` table). Safe to restart after failure. |

---

## 7. Rollback procedure

1. Roll back the Railway deployment to the previous Docker image or commit.
2. If a migration was applied: restore the Neon database to a PITR snapshot before the deployment.
3. Re-deploy the previous version.
4. Run `npm run verify-migration` to confirm the expected version.

Do not run forward migrations against a rolled-back codebase. Migrations are additive-only and not reversible via the migration runner.

---

## 8. Secrets summary — what goes where

| Secret | Railway | Vercel |
| --- | --- | --- |
| `DATABASE_URL` | YES | **NEVER** |
| `DATABASE_PROVIDER` | YES | NO |
| `SESSION_SECRET` | YES | NO |
| `OIDC_CLIENT_SECRET` | YES | NO |
| `S3_SECRET_ACCESS_KEY` | YES | NO |
| `VITE_API_BASE_URL` | NO | YES |
| `VITE_APP_ENV` | NO | YES |

Vercel only receives values that are safe to embed in the browser bundle. Everything else belongs in Railway.
