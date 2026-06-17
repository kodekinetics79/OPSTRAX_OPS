# Phase 3G — Actual Staging Deployment Wiring + External Integration Validation

## Status

- Local validation passed.
- No live staging URL or real IdP credentials were provided in this turn.
- Staging deployment wiring is blocked on external secrets and a reachable staging environment.

## Missing credentials and deployment inputs

### Staging target

- Staging base URL
- Hosting platform / runtime target
- Deployment secret store or environment injection path

### Tenant IdP

- Issuer URL
- Client ID
- Client secret
- Redirect URI
- Logout redirect URI
- Scope definition
- Claim mapping rules

### Platform IdP

- Issuer URL
- Client ID
- Client secret
- Redirect URI
- Logout redirect URI
- Scope definition
- Role / group mapping rules

### Database and storage

- PostgreSQL connection string
- S3-compatible endpoint
- S3 bucket
- S3 access key ID
- S3 secret access key
- Region
- Path-style requirement if MinIO or equivalent is used

### Operations

- Monitoring destination
- Pager / alert routing
- Backup job ownership
- Restore drill ownership
- Incident response owner

## Validation completed locally

- `npm test`
- `npm run build`
- `npm run security`
- `npm run verify-migration`
- `npm run perf-smoke`
- `npm run browser-smoke`
- `npm run go-live-check` against a mocked production endpoint
- `npm run verify:production-runtime` against a mocked production endpoint
- `npm run verify:backup-restore` against a mocked authenticated posture

## Validation blocked

- Real staging URL validation
- Tenant OIDC login proof
- Platform OIDC login proof
- Postgres validation against staging
- S3 validation against staging
- Backup/restore validation against staging
- Browser smoke against staging

## Notes

- Production local workspace entry remains blocked.
- No secrets are written into docs or logs.
- No false production-ready claim is made.
