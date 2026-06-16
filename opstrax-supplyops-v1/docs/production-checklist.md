# OpsTrax SupplyOps — Production Checklist

Complete all items before deploying to production.

---

## Environment

- [ ] `NODE_ENV=production` is set in the deployment environment
- [ ] `OPSTRAX_ALLOW_DEV_CONTEXT` is **not set** (or explicitly `=0`)
- [ ] `PORT` is set to the desired listening port (default: 9899 for local demo; override per deployment)
- [ ] RC1 local demo continues to use `http://localhost:9899`
- [ ] Production-validation stack continues to use `http://localhost:9900`
- [ ] `OPSTRAX_BASE_URL` matches the externally reachable URL (used for OIDC redirect URI)
- [ ] `.env` is **not committed** to version control
- [ ] All secrets are injected via environment variables or a secrets manager (Vault, AWS Secrets Manager, etc.)

## Authentication

- [ ] `OPSTRAX_AUTH_MODE=oidc` (or `OPSTRAX_OIDC_ISSUER` is set)
- [ ] `OPSTRAX_OIDC_CLIENT_ID` is set
- [ ] `OPSTRAX_OIDC_CLIENT_SECRET` is set and stored in a secrets manager
- [ ] `OPSTRAX_OIDC_REDIRECT_URI` exactly matches the redirect URI registered in your IdP
- [ ] OIDC IdP allows only expected redirect URIs (no wildcard)
- [ ] Session TTL (8 hours) is acceptable for your security policy
- [ ] CSRF protection is verified (all POST/PATCH/PUT/DELETE API calls require `X-CSRF-Token`)

## Database

- [ ] `OPSTRAX_DB_PATH` points to a persistent, volume-mounted path (not ephemeral container storage)
- [ ] Daily automated backups are configured and at least one backup verification record exists
- [ ] `node scripts/verify-migration.mjs` passes cleanly against the production DB
- [ ] (Optional) Postgres migration path reviewed if horizontal scaling is required — see `docs/postgres-migration-plan.md`

## Security Headers

- [ ] Verify `X-Content-Type-Options: nosniff` is present on all responses
- [ ] Verify `X-Frame-Options: DENY` is present (prevents clickjacking)
- [ ] Verify `Content-Security-Policy` is tuned for your frontend assets
- [ ] Confirm no `X-Powered-By` or server version headers are exposed
- [ ] TLS termination is handled by a reverse proxy (nginx, Caddy, ALB) — the Node.js server itself does not terminate TLS

## Secrets & Data

- [ ] `npm run security` passes (0 high/critical vulnerabilities)
- [ ] Audit logs confirm no secrets appear in API responses (`/api/me`, `/api/ai/summary`, etc.)
- [ ] Stack traces are **not** returned in 500 responses (`NODE_ENV=production` suppresses them)
- [ ] No hard-coded credentials exist in source files (`grep -r "password\|secret\|token" src/` reviewed)

## Evidence Storage

- [ ] Evidence document metadata is stored in SQLite (always)
- [ ] For binary file storage in production, an S3-compatible bucket is configured:
- [ ] `OPSTRAX_EVIDENCE_STORAGE=s3`
- [ ] `OPSTRAX_EVIDENCE_BUCKET` is set
- [ ] Bucket is private (no public ACL)
- [ ] Signed URL TTL is appropriate (`OPSTRAX_EVIDENCE_SIGNED_URL_TTL`)
- [ ] IAM role / access key has minimal permissions (PutObject, GetObject, DeleteObject on bucket only)
- [ ] SSO configuration is tenant-scoped and shows `CONFIGURATION_REQUIRED` until the provider is configured

## Observability

- [ ] Health endpoint responds: `GET /healthz` → `{"ok":true}`
- [ ] Readiness endpoint responds: `GET /healthz/ready` → `{"ok":true,"checks":{"db":"ok"}}`
- [ ] Structured error logs are captured by your logging platform
- [ ] Uptime monitoring is configured on `/healthz`
- [ ] Alert configured if `/healthz/ready` returns non-200 for >1 minute

## Performance

- [ ] `node scripts/perf-smoke.mjs` passes with p95 < 800ms on all endpoints
- [ ] Reverse proxy connection/request timeout is set (recommended: 30s)
- [ ] Rate limiting is configured at reverse proxy (recommended: 100 req/min per IP for API paths)

## CI/CD

- [ ] `npm run lint` passes (syntax check all source files)
- [ ] `npm test` passes (all tests green)
- [ ] `npm run build` produces a clean `public/bundle.js`
- [ ] `npm run security` passes (0 high/critical npm audit findings)
- [ ] `node scripts/verify-migration.mjs` is run in the deployment pipeline after migration
- [ ] Container image or deployment artifact does **not** include `data/*.sqlite` (DB is volume-mounted)
- [ ] Deployment pipeline does **not** include `.env` or any secret files

## Post-Deployment Verification

- [ ] `GET /healthz` → 200
- [ ] `GET /healthz/ready` → 200
- [ ] Confirm the production-validation stack is checked on port `9900`
- [ ] `GET /api/compliance/auth-config` → tenant-scoped SSO config only
- [ ] OIDC login flow completes end-to-end
- [ ] Admin user can access `/api/me` and sees correct tenant/role/features
- [ ] At least one protected endpoint (e.g. `/api/items`) returns 401/403 when unauthenticated
- [ ] Audit log captures login and at least one approved action

---

## Security Checklist (OWASP Top 10)

| Risk | Mitigation |
|---|---|
| A01 Broken Access Control | RBAC enforced on every route via `capabilitySet()`. Tenant isolation via `tenant_id` on all queries. |
| A02 Cryptographic Failures | OIDC tokens verified with RS256/PS256/ES256. Sessions use `randomToken(32)` (256 bits). |
| A03 Injection | All DB queries use parameterized statements (`db.prepare(sql).get(...params)`). No string concatenation for user input. |
| A04 Insecure Design | Multi-tenant design with hard tenant_id binding. No cross-tenant data leak paths. |
| A05 Security Misconfiguration | Startup checks block dev context in production. Security headers on all responses. |
| A06 Vulnerable Components | `npm run security` enforced in CI (audit-level=high). |
| A07 Auth & Session Failures | PKCE flow. Session TTL 8h. CSRF protection for state-mutating requests. |
| A08 Integrity Failures | Evidence hash/checksum tracked in audit. Migration files are additive-only. |
| A09 Logging & Monitoring | Every denied request is audit-logged. 500 errors logged to stderr with requestId. |
| A10 SSRF | No outbound HTTP from user-supplied URLs. OIDC discovery is pre-configured, not user-supplied. |
