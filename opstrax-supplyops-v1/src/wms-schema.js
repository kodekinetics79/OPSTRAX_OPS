import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, execute, selectOne } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationFile = join(dirname(__dirname), 'db', 'migrations', '029_wms_profitability_capacity.sql');
const capacitySyncSql = `
  INSERT INTO wms_capacity_units (
    id, tenant_id, facility_id, bin_id, code, capacity_type, status, zone, created_at, updated_at
  )
  SELECT
    'wms_cu_' || b.id,
    b.tenant_id,
    b.facility_id,
    b.id,
    b.code || '-P01',
    'PALLET_POSITION',
    'AVAILABLE',
    COALESCE(b.zone, ''),
    datetime('now'),
    datetime('now')
  FROM bins b
  WHERE NOT EXISTS (
    SELECT 1 FROM wms_capacity_units cu WHERE cu.tenant_id = b.tenant_id AND cu.bin_id = b.id
  );
`;

export function ensureWmsSchema() {
  const row = selectOne('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations');
  const before = Number(row?.version || 0);
  let applied = false;
  if (before < 29) {
    db.exec(readFileSync(migrationFile, 'utf8'));
    execute('INSERT INTO schema_migrations(version) VALUES (?) ON CONFLICT(version) DO NOTHING', [29]);
    try { db.exec('PRAGMA user_version = 29;'); } catch { /* PostgreSQL adapter ignores PRAGMA */ }
    applied = true;
  }
  db.exec(capacitySyncSql);
  return { applied, version: 29 };
}
