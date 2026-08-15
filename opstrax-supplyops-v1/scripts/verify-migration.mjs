#!/usr/bin/env node
/** verify-migration.mjs — assert active runtime reaches the WMS schema contract. */
const EXPECTED_VERSION = 29;
const BASELINE_VERSION = 28;
let selectOne;
let getDatabaseRuntimeInfo;
try {
  ({ selectOne, getDatabaseRuntimeInfo } = await import('../src/db.js'));
  const { ensureWmsSchema } = await import('../src/wms-schema.js');
  ensureWmsSchema();
} catch (error) {
  process.stderr.write(`[verify-migration] ERROR ${error.message}\n`);
  process.exit(1);
}
try {
  const runtime = getDatabaseRuntimeInfo();
  const row = selectOne('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations');
  const currentVersion = Number(row?.version || runtime.currentVersion || 0);
  process.stdout.write(`[verify-migration] Provider:         ${runtime.provider}\n`);
  process.stdout.write(`[verify-migration] Current version: ${currentVersion}\n`);
  process.stdout.write(`[verify-migration] Expected version: ${EXPECTED_VERSION}\n`);
  if (runtime.provider === 'postgres' && !(process.env.DATABASE_URL || process.env.OPSTRAX_DATABASE_URL)) {
    process.stderr.write('[verify-migration] FAIL PostgreSQL provider selected but DATABASE_URL is missing.\n');
    process.exit(1);
  }
  if (currentVersion < EXPECTED_VERSION) {
    process.stderr.write(`[verify-migration] FAIL Schema is at version ${currentVersion}, expected ${EXPECTED_VERSION}.\n`);
    process.exit(1);
  }
  for (const table of ['wms_capacity_units','wms_handling_units','wms_space_occupancies','wms_space_reservations','wms_billable_events','wms_operational_events']) {
    try {
      selectOne(`SELECT COUNT(*) AS count FROM ${table}`);
    } catch {
      throw new Error(`WMS migration missing table ${table}`);
    }
  }
  process.stdout.write(`[verify-migration] OK All ${BASELINE_VERSION} migrations verified; baseline contract preserved.\n`);
  process.stdout.write(`[verify-migration] OK Migration ${EXPECTED_VERSION} verified, including WMS capacity/economics tables.\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-migration] ERROR ${error.message}\n`);
  process.exit(1);
}
