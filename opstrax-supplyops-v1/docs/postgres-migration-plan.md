# OpsTrax SupplyOps — Postgres Migration Plan

OpsTrax SupplyOps ships with SQLite as its default database. SQLite is appropriate for:

- Single-instance deployments (demo, small teams, edge nodes)
- Development and CI environments
- Read-heavy workloads on a single host

For multi-instance deployments or write-heavy workloads, Postgres is recommended.

---

## Migration Strategy

OpsTrax uses a thin DB abstraction (`src/db.js`). All queries go through:

```
selectAll(sql, params)
selectOne(sql, params)
execute(sql, params)
insert(table, row)
transaction(handler)
```

Migrating to Postgres requires:

1. Replace `DatabaseSync` from `node:sqlite` with `pg` or `postgres.js` driver
2. Adjust SQL dialect differences (see table below)
3. Update migration runner to use Postgres DDL
4. Update `PRAGMA user_version` tracking to a `schema_version` table row
5. Update `db.exec('BEGIN IMMEDIATE')` → `BEGIN` (Postgres does not have `IMMEDIATE`)

### SQL Dialect Differences

| SQLite | Postgres |
|---|---|
| `PRAGMA user_version` | Replace with `SELECT version FROM schema_version` |
| `INSERT OR IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` |
| `datetime('now')` | `NOW()` or `CURRENT_TIMESTAMP` |
| `AUTOINCREMENT` | `SERIAL` or `GENERATED ALWAYS AS IDENTITY` |
| `COALESCE(SUM(x), 0)` | Same (compatible) |
| `BEGIN IMMEDIATE` | `BEGIN` |

### Environment Variable

```env
# When using Postgres, set this to the connection string:
OPSTRAX_DB_URL=postgresql://user:password@host:5432/opstrax

# Or keep SQLite for demo:
OPSTRAX_DB_PATH=data/opstrax.production.sqlite
```

### Recommended Postgres Configuration

```sql
-- Recommended settings for a fresh Opstrax database
CREATE DATABASE opstrax ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';
CREATE USER opstrax WITH PASSWORD '<strong-password>';
GRANT ALL PRIVILEGES ON DATABASE opstrax TO opstrax;

-- Enable row-level auditing extension (optional)
-- CREATE EXTENSION IF NOT EXISTS pgaudit;
```

---

## Backup & Restore (SQLite)

### Backup

```bash
# Hot backup using SQLite backup API (safe while server is running)
sqlite3 data/opstrax.production.sqlite ".backup data/opstrax.backup.$(date +%Y%m%d%H%M%S).sqlite"

# Or copy the file when server is stopped
cp data/opstrax.production.sqlite /backups/opstrax.$(date +%Y%m%d).sqlite
```

### Restore

```bash
# Stop the server first
cp /backups/opstrax.20260101.sqlite data/opstrax.production.sqlite

# Verify migrations are intact
node scripts/verify-migration.mjs

# Start the server
node server.js
```

### Recommended Backup Schedule

| Frequency | Retention |
|---|---|
| Daily | 30 days |
| Weekly | 12 weeks |
| Monthly | 12 months |

---

## Production DB Health Check

The `/healthz/ready` endpoint queries `schema_migrations` and returns:

```json
{ "ok": true, "service": "opstrax-supplyops", "checks": { "db": "ok" } }
```

If the database is unreachable or no migrations have been applied, it returns HTTP 503:

```json
{ "ok": false, "checks": { "db": "error: ..." } }
```

Wire `/healthz/ready` into your load balancer or container orchestrator liveness probe.
