# OpsTrax Go-Live Runbook

This runbook is the operational handoff for staging and go-live. It is deliberately conservative: if a step cannot be verified, treat the release as blocked.

## Target runtime

- Managed Node runtime such as Railway or equivalent
- PostgreSQL 16 or later
- S3-compatible object storage for evidence binaries
- Separate tenant and platform OIDC applications
- External monitoring and alerting outside the app

## Required environment variables

### Core runtime

- `NODE_ENV=production`
- `PORT`
- `APP_BASE_URL`
- `PLATFORM_BASE_URL`
- `DATABASE_PROVIDER=postgres`
- `DATABASE_URL`
- `SESSION_SECRET`
- `PLATFORM_SESSION_SECRET`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=lax` or `strict`
- `EVIDENCE_STORAGE_PROVIDER=s3`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT` if using an S3-compatible service
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `EVIDENCE_SIGNING_SECRET`
- `EVIDENCE_SIGNED_URL_TTL`

### Tenant OIDC

- `AUTH_MODE=oidc`
- `OIDC_ISSUER`
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_REDIRECT_URI`
- `OIDC_LOGOUT_REDIRECT_URI`
- `OIDC_SCOPES`

### Platform OIDC

- `PLATFORM_AUTH_MODE=oidc`
- `PLATFORM_OIDC_ISSUER`
- `PLATFORM_OIDC_CLIENT_ID`
- `PLATFORM_OIDC_CLIENT_SECRET`
- `PLATFORM_OIDC_REDIRECT_URI`
- `PLATFORM_OIDC_LOGOUT_REDIRECT_URI`
- `PLATFORM_OIDC_SCOPES`

## Deployment sequence

1. Provision PostgreSQL and object storage.
2. Register the tenant IdP application.
3. Register the platform IdP application.
4. Inject all secrets from a secrets manager.
5. Deploy the backend.
6. Run migrations.
7. Run `npm run go-live-check`.
8. Verify tenant and platform OIDC sign-in.
9. Verify evidence signed URL access.
10. Verify support-session audit events.
11. Verify feature entitlements and tenant suspension behavior.
12. Run `npm run verify:backup-restore` with a real authenticated session cookie.
13. Capture the release decision and rollback path.

## IdP setup notes

### Tenant IdP

- Issuer URL must be exact.
- Redirect URI must point to the tenant callback route.
- Logout redirect should point to tenant login.
- Map `email` or `preferred_username` to tenant user email.
- Map `sub` to the identity subject.
- Deny unknown or disabled users.

### Platform IdP

- Issuer URL must be exact.
- Redirect URI must point to the platform callback route.
- Logout redirect should point to platform login.
- Map `email` or `preferred_username` to platform admin email.
- Deny unknown or disabled platform users.

## Health checks

- `GET /healthz`
- `GET /healthz/ready`
- Readiness is only green when database, storage, auth, integration, and queue checks are healthy.

## Rollback

1. Stop new deploys.
2. Roll back to the last known good release artifact.
3. Restore the previous database backup if the migration is incompatible.
4. Restore the evidence bucket or prefix if required.
5. Re-run the verification commands.
6. Resume only after auth, health, and data checks are green.

## Incident response basics

- Freeze changes if auth or data isolation is in doubt.
- Revoke compromised sessions.
- Disable the affected IdP application if misuse is suspected.
- Quarantine bad export/integration jobs.
- Capture the request ID, tenant ID, platform user ID, and affected records.
- Preserve logs before making structural changes.
