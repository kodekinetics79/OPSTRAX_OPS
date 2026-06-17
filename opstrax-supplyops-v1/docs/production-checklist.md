# OpsTrax SupplyOps — Production Checklist

Complete this checklist before go-live. Status values: `Ready`, `Configured`, `Verified`, `Verified in validation stack`, `Requires live secrets`, `Blocked`, `Roadmap`.

## Go-Live Matrix

| Area | Status | Proof / note |
|---|---|---|
| Auth / SSO | Blocked | Real tenant OIDC registration, secrets, and callback URLs still need to be wired in the deployment target. |
| Platform Admin | Blocked | Real platform OIDC registration, secrets, and callback URLs still need to be wired in the deployment target. |
| Tenant Workspace | Verified in validation stack | Local RC1 demo and tenant workspace work; production gate stays closed until OIDC is configured. |
| Database / Postgres | Verified in validation stack | `DATABASE_PROVIDER=postgres` and `DATABASE_URL` validated against the production runtime path. |
| Evidence Storage | Verified in validation stack | `EVIDENCE_STORAGE_PROVIDER=s3` with a private bucket and signed URLs validated against MinIO/S3. |
| Security Headers | Verified | `X-Content-Type-Options`, `X-Frame-Options`, CSP, and referrer policy are emitted. |
| Session Security | Configured | `SESSION_SECRET`, `PLATFORM_SESSION_SECRET`, `COOKIE_SECURE=true`. |
| Tenant Isolation | Verified | All service-layer reads and writes are tenant-scoped. |
| RBAC / Entitlements | Verified | Capability checks enforce module access server-side. |
| Audit Logging | Verified | Denied and privileged actions create audit events. |
| Performance Smoke | Verified | `npm run perf-smoke` passes. |
| Browser Smoke | Verified | `npm run browser-smoke` passes for the RC1 shell and core modules. |
| Backup / Restore | Blocked | External backup jobs, restore drill scheduling, and live evidence retention wiring still need deployment ownership. |
| Monitoring / Alerts | Blocked | External alerting, paging, and log shipping still need deployment wiring. |
| ERP Connector | Roadmap | Connector abstraction exists; external ERP credentials and routing still need production setup. |
| OCR / Invoice Capture | Roadmap | Invoice OCR is not part of Phase 3E. |
| CSV / PDF Reports | Roadmap | Export formats are not yet a production deliverable. |

## Environment

- [ ] `NODE_ENV=production`
- [ ] Local RC1 demo remains on `http://localhost:9899`
- [ ] Production-validation stack remains on `http://localhost:9900`
- [ ] `ALLOW_DEV_CONTEXT` is unset
- [ ] `APP_BASE_URL` matches the externally reachable tenant URL
- [ ] `PLATFORM_BASE_URL` matches the externally reachable platform URL
- [ ] `DATABASE_PROVIDER=postgres`
- [ ] `DATABASE_URL` is injected from a secrets manager
- [ ] `SESSION_SECRET` is injected from a secrets manager
- [ ] `PLATFORM_SESSION_SECRET` is injected from a secrets manager
- [ ] `COOKIE_SECURE=true`
- [ ] `COOKIE_SAME_SITE=lax` or `strict`
- [ ] `EVIDENCE_STORAGE_PROVIDER=s3`
- [ ] `S3_BUCKET`
- [ ] `S3_REGION`
- [ ] `.env` files are not committed
- [ ] SQLite runtime files are not deployed to production

## Authentication

- [ ] `AUTH_MODE=oidc`
- [ ] `OIDC_ISSUER`
- [ ] `OIDC_CLIENT_ID`
- [ ] `OIDC_CLIENT_SECRET`
- [ ] `OIDC_REDIRECT_URI`
- [ ] `OIDC_LOGOUT_REDIRECT_URI`
- [ ] `OIDC_SCOPES`
- [ ] `PLATFORM_AUTH_MODE=oidc`
- [ ] `PLATFORM_OIDC_ISSUER`
- [ ] `PLATFORM_OIDC_CLIENT_ID`
- [ ] `PLATFORM_OIDC_CLIENT_SECRET`
- [ ] `PLATFORM_OIDC_REDIRECT_URI`
- [ ] `PLATFORM_OIDC_LOGOUT_REDIRECT_URI`
- [ ] `PLATFORM_OIDC_SCOPES`
- [ ] Tenant and platform redirect URIs exactly match the identity provider registrations
- [ ] OIDC login completes without exposing demo access

## Evidence Storage

- [ ] `EVIDENCE_STORAGE_PROVIDER=s3`
- [ ] `S3_BUCKET`
- [ ] `S3_REGION`
- [ ] `S3_ENDPOINT` if using MinIO or another S3-compatible provider
- [ ] `S3_ACCESS_KEY_ID`
- [ ] `S3_SECRET_ACCESS_KEY`
- [ ] `EVIDENCE_SIGNING_SECRET`
- [ ] Signed URLs are tenant-scoped and expire as expected

## Database

- [ ] PostgreSQL migrations apply cleanly
- [ ] Schema version matches the repository migration set
- [ ] Migration rollback guidance is documented
- [ ] Backups are scheduled outside the app
- [ ] Restore tests are recorded and reviewed

## Observability

- [ ] `GET /healthz` returns 200
- [ ] `GET /healthz/ready` returns 200 only when DB, storage, and auth posture are ready
- [ ] Error correlation IDs are captured in logs
- [ ] Failed auth, export, integration, and job events are monitored
- [ ] Monitoring and alerting runbook exists
- [ ] Support session lifecycle events are captured

## CI / Verification

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run security`
- [ ] `npm run verify-migration`
- [ ] `npm run verify:postgres`
- [ ] `npm run verify:storage`
- [ ] `npm run verify:production-runtime`
- [ ] `npm run go-live-check`
- [ ] `npm run verify:backup-restore` when a real authenticated session cookie is available
- [ ] `npm run perf-smoke`
- [ ] `npm run browser-smoke`

## Launch decision

- [ ] Product is only considered production-ready when auth, Postgres, storage, readiness checks, and validation scripts all pass in the target environment.
- [ ] Do not claim go-live until the external IdP, database, and object storage are wired for the actual deployment target.
