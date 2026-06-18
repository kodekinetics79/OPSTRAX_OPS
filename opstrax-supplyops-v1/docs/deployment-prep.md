# OpsTrax Deployment Prep

**Last updated:** 2026-06-17 (Phase 3L — External Services Cutover Readiness)

This document captures the production wiring for the OpsTrax release path. It documents the current runtime split, staging validation flow, and the remaining go-live blockers without overstating live readiness.

**Phase 3L OCR status:** AWS Textract adapter is fully implemented (SigV4 HTTPS, sync worker bridge, AnalyzeExpense normalization, evidence document linking, human review gate). Credentials are NOT YET PROVIDED. The service runs in LOCAL OCR mode until `OCR_PROVIDER=aws_textract` and credentials are set.

## Runtime targets

- Local RC1 demo: `http://localhost:9899`
- Production-validation stack: `http://localhost:9900`
- Staging URL: not provided yet
- Tenant workspace uses the main shell and tenant cookies.
- Platform admin uses `/platform` and platform-only cookies.
- Local demo access is only available when `NODE_ENV !== production` and `OPSTRAX_ALLOW_DEV_CONTEXT=1`.
- Production never exposes the demo gate or demo login routes.

## Staging deployment target checklist

- [ ] Staging base URL
- [ ] Tenant OIDC issuer/client/secret
- [ ] Platform OIDC issuer/client/secret
- [ ] PostgreSQL connection string
- [ ] S3-compatible storage endpoint, bucket, and keys
- [ ] Session secrets
- [ ] Secure cookie settings
- [ ] Monitoring destination and alert rules
- [ ] Backup job ownership
- [ ] Restore drill ownership
- [ ] OCR provider selection (local is fine; for AWS Textract: `OCR_ACCESS_KEY`, `OCR_SECRET_KEY`, `OCR_REGION`)

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

### Shared runtime

- `NODE_ENV=production`
- `PORT`
- `APP_BASE_URL`
- `PLATFORM_BASE_URL`
- `SESSION_SECRET`
- `PLATFORM_SESSION_SECRET`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=lax` or `strict`
- `DATABASE_PROVIDER=postgres`
- `DATABASE_URL`
- `EVIDENCE_STORAGE_PROVIDER=s3`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT` if using MinIO or another S3-compatible service
- `EVIDENCE_SIGNING_SECRET`

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

## OCR environment variables

### Local mode (default — no external calls)

No env vars needed. `OCR_PROVIDER` is unset or `local`.

### AWS Textract mode (Phase 3L — implemented, credentials required)

- `OCR_PROVIDER=aws_textract`
- `OCR_ACCESS_KEY` — IAM key ID with `textract:AnalyzeExpense` permission
- `OCR_SECRET_KEY` — IAM secret key (store in secret manager; never in code or logs)
- `OCR_REGION` — AWS region (e.g. `us-east-1`)
- `OCR_REQUIRED=true` — optional; causes startup to fail if OCR is unconfigured
- `OCR_CONFIDENCE_THRESHOLD` — optional; default 0.7

**Verification (when configured):** `npm run verify:ocr -- --probe`

### Azure / Google

- `OCR_PROVIDER=azure_document_intelligence` or `google_document_ai`
- `OCR_ENDPOINT` — provider endpoint URL
- `OCR_ACCESS_KEY` — API key or bearer token
- `OCR_MODEL_ID` — model/processor identifier

---

## Production validation commands

- `npm run verify-migration` (expected: v28)
- `npm run verify:ocr` (must pass; `--probe` flag tests live connectivity)
- `npm run verify:postgres`
- `npm run verify:storage`
- `npm run verify:production-runtime`
- `npm run go-live-check`
- `npm run verify:backup-restore` with a real authenticated session cookie when backup/restore posture is being checked
- `npm run perf-smoke`
- `npm run browser-smoke`

## Staging validation flow

1. Deploy the app to staging with production-style configuration.
2. Run database migrations.
3. Run `npm run go-live-check`.
4. Confirm `/healthz` and `/healthz/ready` are green.
5. Verify tenant OIDC login.
6. Verify platform OIDC login.
7. Verify tenant workspace navigation and restricted tenant denial.
8. Verify signed evidence access with a real authenticated session.
9. Verify support-session audit records exist.
10. Verify feature entitlement changes alter visible navigation and API access.
11. Verify backup and restore posture with `npm run verify:backup-restore` using a real authenticated session cookie.
12. Capture the rollback command and restore procedure before go-live.

## Deployment rules

- Do not ship `.env` files.
- Do not ship SQLite runtime files to production.
- Do not allow the local demo gate in production.
- Do not expose secrets in frontend bundles or bootstrap payloads.
- Do not claim production readiness until Postgres, object storage, and real OIDC are configured and verified in the target environment.
