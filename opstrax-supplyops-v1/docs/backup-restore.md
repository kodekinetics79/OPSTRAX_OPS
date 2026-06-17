# OpsTrax Backup and Restore Readiness

This document covers the backup posture expected for production. It is intentionally honest: backup scheduling and restore operations are external responsibilities.

## PostgreSQL backup

Example logical backup command:

```bash
pg_dump --format=custom --no-owner --no-acl --file=backups/opstrax-$(date +%Y%m%d%H%M%S).dump "$DATABASE_URL"
```

For managed platforms, use the provider's native snapshot or backup workflow in addition to logical exports.

## PostgreSQL restore

Example restore command:

```bash
pg_restore --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" backups/opstrax-YYYYMMDDHHMMSS.dump
```

## Restore drill process

1. Restore a backup into a non-production database.
2. Run migrations or schema validation.
3. Verify tenant isolation, auth posture, and a small set of seeded business flows.
4. Record the result in the backup verification log.

## Evidence storage posture

- Evidence binaries live in S3-compatible object storage in production.
- Evidence metadata remains in PostgreSQL.
- Signed URLs must expire.
- Tenant access is enforced before signed URL issuance.

## Retention and resilience

- RPO target: set by the deployment owner.
- RTO target: set by the deployment owner.
- Backup verification schedule: at least one scheduled restore drill per quarter.
- Keep rollback guidance aligned with the database migration history.

## Tenant restoration considerations

- Restore the database and evidence bucket or prefix together when evidence links matter.
- Validate tenant-scoped access after restore.
- Revoke stale sessions if the restore rolls back user state.
- Re-run readiness checks before opening the environment.

## Current posture

- Backup and restore are documented.
- Verified backup and restore evidence should be recorded before go-live.
- The app does not fake backup success.

## Validation command

When a real authenticated session cookie is available, run:

```bash
GO_LIVE_COOKIE='opstrax_session=...' npm run verify:backup-restore
```

Use a real session from the target environment or an equivalent staging session. Do not use the local demo gate for production validation.
