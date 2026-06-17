# OpsTrax Deployment Prep

This note captures the production wiring for the Phase 3E release path. It documents the current runtime split without overstating go-live readiness.

## Runtime targets

- Local RC1 demo: `http://localhost:9899`
- Production-validation stack: `http://localhost:9900`
- Tenant workspace uses the main shell and tenant cookies.
- Platform admin uses `/platform` and platform-only cookies.

## Railway / backend deployment

- Run the Node backend as the primary runtime.
- Set `NODE_ENV=production`.
- Set `PORT` to the platform-provided port.
- Set `DATABASE_PROVIDER=postgres` and `DATABASE_URL=...`.
- Keep SQLite only for local/demo mode.
- Set `EVIDENCE_STORAGE_PROVIDER=s3` and configure S3-compatible evidence storage.
- Keep `ALLOW_DEV_CONTEXT` unset in production.
- Keep the platform admin control plane on the same backend, but with separate session cookies and separate platform OIDC settings.

## Vercel / frontend deployment

- The current RC1 release is validated as a Node-hosted experience.
- Only split the frontend if a later packaging change requires it.
- Do not move auth decisions into the browser.

## Required production environment variables

### Tenant workspace

- `APP_BASE_URL`
- `DATABASE_PROVIDER=postgres`
- `DATABASE_URL`
- `SESSION_SECRET`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=lax` or `strict`
- `AUTH_MODE=oidc`
- `OIDC_ISSUER`
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_REDIRECT_URI`
- `OIDC_LOGOUT_REDIRECT_URI`
- `OIDC_SCOPES`

### Platform admin

- `PLATFORM_BASE_URL`
- `PLATFORM_SESSION_SECRET`
- `PLATFORM_AUTH_MODE=oidc`
- `PLATFORM_OIDC_ISSUER`
- `PLATFORM_OIDC_CLIENT_ID`
- `PLATFORM_OIDC_CLIENT_SECRET`
- `PLATFORM_OIDC_REDIRECT_URI`
- `PLATFORM_OIDC_LOGOUT_REDIRECT_URI`
- `PLATFORM_OIDC_SCOPES`

### Evidence storage

- `EVIDENCE_STORAGE_PROVIDER=s3`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT` if using an S3-compatible service
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_SESSION_TOKEN` if required by the credential strategy
- `S3_FORCE_PATH_STYLE=true` for MinIO/local validation
- `EVIDENCE_SIGNING_SECRET`
- `EVIDENCE_SIGNED_URL_TTL`

## Production validation commands

- `npm run verify-migration`
- `npm run verify:postgres`
- `npm run verify:storage`
- `npm run verify:production-runtime`
- `npm run perf-smoke`
- `npm run browser-smoke`

## Deployment rules

- Do not ship `.env` files.
- Do not ship SQLite runtime files to production.
- Do not allow the local demo gate in production.
- Do not expose secrets in frontend bundles or bootstrap payloads.
- Do not claim production readiness until Postgres, object storage, and real OIDC are configured and verified in the target environment.
