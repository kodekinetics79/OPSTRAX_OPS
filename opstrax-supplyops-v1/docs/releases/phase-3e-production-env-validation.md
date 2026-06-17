# OpsTrax SupplyOps — Phase 3E Production Environment Validation

## Summary

Phase 3E wires the production environment split for OpsTrax:

- local RC1 demo stays on `http://localhost:9899`
- production-validation stays on `http://localhost:9900`
- tenant workspace auth and platform admin auth are separated
- PostgreSQL is the production database path
- S3-compatible object storage is the production evidence path
- secure cookies and startup validation block unsafe production combinations

## Verified behavior

- `DATABASE_PROVIDER=postgres` and `DATABASE_URL` are recognized by startup validation
- `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and `OIDC_REDIRECT_URI` are required for tenant production auth
- `PLATFORM_OIDC_ISSUER`, `PLATFORM_OIDC_CLIENT_ID`, `PLATFORM_OIDC_CLIENT_SECRET`, and `PLATFORM_OIDC_REDIRECT_URI` are required for platform admin auth
- `SESSION_SECRET` and `PLATFORM_SESSION_SECRET` are required for production sessions
- `COOKIE_SECURE=true` is required in production
- `EVIDENCE_STORAGE_PROVIDER=s3`, `S3_BUCKET`, `S3_REGION`, and `EVIDENCE_SIGNING_SECRET` are required for production evidence binaries
- `ALLOW_DEV_CONTEXT=1` is blocked in production
- local demo access remains available only in non-production mode

## Validation commands

- `npm test`
- `npm run build`
- `npm run security`
- `npm run verify-migration`
- `npm run verify:postgres`
- `npm run verify:storage`
- `npm run verify:production-runtime`
- `npm run perf-smoke`
- `npm run browser-smoke`

## Go-live checklist

| Area | Status | Notes |
|---|---|---|
| Tenant OIDC | Verified | Startup enforces required vars. |
| Platform OIDC | Verified | Startup enforces required vars separately. |
| PostgreSQL runtime | Verified | SQLite remains local/demo only. |
| Evidence storage | Verified | Production requires S3-compatible storage. |
| Secure cookies | Verified | Production rejects insecure cookie settings. |
| Demo access | Verified | Local demo gate stays disabled in production. |
| Readiness checks | Verified | `/healthz/ready` reports missing dependencies honestly. |

## Remaining external configuration

- actual tenant IdP registration
- actual platform IdP registration
- actual production PostgreSQL instance
- actual production S3-compatible bucket
- deployment-specific monitoring and alerting

## Rollback

- revert to the previous RC1 tag if production env wiring needs to be backed out
- keep the local demo path intact for client showcase continuity
