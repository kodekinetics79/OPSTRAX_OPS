#!/usr/bin/env node
/**
 * verify-migration.mjs — assert that the active database runtime reports the
 * expected schema version and provider posture.
 *
 * Exit 0: all expected migrations have been applied.
 * Exit 1: one or more migrations are missing or the runtime is not configured.
 */

const EXPECTED_VERSION = 20;

let selectOne;
let getDatabaseRuntimeInfo;

try {
  ({ selectOne, getDatabaseRuntimeInfo } = await import('../src/db.js'));
} catch (error) {
  process.stderr.write(`[verify-migration] ERROR ${error.message}\n`);
  process.exit(1);
}

try {
  const runtime = getDatabaseRuntimeInfo();
  const row = selectOne('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations');
  const currentVersion = Number(row?.version || runtime.currentVersion || 0);

  process.stdout.write(`[verify-migration] Provider:       ${runtime.provider}\n`);
  process.stdout.write(`[verify-migration] Current version: ${currentVersion}\n`);
  process.stdout.write(`[verify-migration] Expected version: ${EXPECTED_VERSION}\n`);

  if (runtime.provider === 'postgres' && !(process.env.DATABASE_URL || process.env.OPSTRAX_DATABASE_URL)) {
    process.stderr.write('[verify-migration] FAIL PostgreSQL provider selected but DATABASE_URL is missing.\n');
    process.exit(1);
  }

  if (currentVersion < EXPECTED_VERSION) {
    process.stderr.write(
      `[verify-migration] FAIL Schema is at version ${currentVersion}, expected ${EXPECTED_VERSION}. Run the server once to apply pending migrations.\n`
    );
    process.exit(1);
  }

  const applied = selectOne('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations');
  if (!applied || Number(applied.version || 0) < EXPECTED_VERSION) {
    process.stderr.write('[verify-migration] FAIL schema_migrations version table does not reflect the expected migration set.\n');
    process.exit(1);
  }

  process.stdout.write(`[verify-migration] OK All ${EXPECTED_VERSION} migrations verified.\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-migration] ERROR ${error.message}\n`);
  process.exit(1);
}
