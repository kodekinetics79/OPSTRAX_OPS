import { parentPort, workerData } from 'node:worker_threads';
import { Client } from 'pg';
import { writeSynchronousWorkerResponse } from './sync-rpc.js';

const controlBuffer = workerData.controlBuffer;
const dataBuffer = workerData.dataBuffer;
const connectionString = workerData.connectionString;
const ssl = workerData.ssl || false;

let client = null;
let currentVersion = 0;
let inTransaction = false;

function withTextNow(sql) {
  return sql
    .replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP::text')
    .replace(/datetime\('now',\s*'utc'\)/gi, 'CURRENT_TIMESTAMP::text')
    .replace(/datetime\('now'\s*,\s*'utc'\)/gi, 'CURRENT_TIMESTAMP::text');
}

function replacePositionalParams(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function normalizeSql(sql) {
  let normalized = String(sql || '').trim();
  normalized = normalized.replace(/^\s*PRAGMA foreign_keys = ON\s*;?\s*$/gim, '');
  normalized = normalized.replace(/\bBEGIN IMMEDIATE;\b/gi, 'BEGIN;');
  normalized = withTextNow(normalized);
  normalized = normalized.replace(/INSERT OR IGNORE INTO\s+/gi, 'INSERT INTO ');
  normalized = normalized.replace(/INSERT OR REPLACE INTO\s+/gi, 'INSERT INTO ');
  normalized = normalized.replace(/PRAGMA user_version\s*=\s*\d+;?/gi, '');
  normalized = normalized.replace(/INSERT INTO\s+schema_migrations\s*\(\s*version\s*\)\s*VALUES\s*\(\s*\$?1?\s*\)/gi, 'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING');
  return normalized;
}

function translateInsertIgnore(sql) {
  const match = sql.match(/^(\s*INSERT\s+INTO\s+[\s\S]+?\)\s*VALUES\s*\([\s\S]+?\))\s*;?\s*$/i);
  if (match && /INSERT OR IGNORE/i.test(sql)) {
    return `${match[1]} ON CONFLICT DO NOTHING`;
  }
  return sql;
}

async function ensureClient() {
  if (client) return client;
  client = new Client({ connectionString, ssl });
  await client.connect();
  const versionResult = await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text
    );
  `);
  const current = await client.query('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations');
  currentVersion = Number(current.rows[0]?.version || 0);
  return client;
}

async function queryAll(sql, params = []) {
  await ensureClient();
  const trimmed = String(sql || '').trim();
  if (/^PRAGMA\s+user_version/i.test(trimmed)) {
    return [{ user_version: currentVersion }];
  }
  if (/^PRAGMA\s+table_info\(/i.test(trimmed)) {
    const table = trimmed.match(/^PRAGMA\s+table_info\((.+)\)/i)?.[1].replace(/['"`]/g, '');
    const result = await client.query(
      `SELECT column_name AS name,
              ordinal_position - 1 AS cid,
              data_type AS type,
              CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END AS notnull,
              column_default AS dflt_value,
              0 AS pk
       FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    return result.rows;
  }
  const normalized = translateInsertIgnore(replacePositionalParams(normalizeSql(trimmed)));
  const result = await client.query(normalized, params);
  return result.rows;
}

async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows[0] || null;
}

async function run(sql, params = []) {
  await ensureClient();
  const trimmed = String(sql || '').trim();
  if (/^PRAGMA\s+user_version\s*=\s*\d+/i.test(trimmed)) {
    const version = Number(trimmed.match(/=\s*(\d+)/)?.[1] || 0);
    currentVersion = version;
    return { changes: 0, lastInsertRowid: null };
  }
  const normalized = translateInsertIgnore(replacePositionalParams(normalizeSql(trimmed)));
  const result = await client.query(normalized, params);
  return {
    changes: result.rowCount ?? 0,
    lastInsertRowid: null
  };
}

async function execSql(sql) {
  await ensureClient();
  const statements = String(sql || '')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    if (/^PRAGMA/i.test(statement)) {
      if (/^PRAGMA\s+user_version/i.test(statement)) {
        const match = statement.match(/=\s*(\d+)/);
        if (match) {
          currentVersion = Number(match[1]);
        }
      }
      continue;
    }
    const normalized = statement.startsWith('PRAGMA user_version')
      ? statement
      : translateInsertIgnore(replacePositionalParams(normalizeSql(statement)));
    if (!normalized) continue;
    await client.query(normalized);
  }
}

async function begin() {
  await ensureClient();
  if (inTransaction) return;
  await client.query('BEGIN;');
  inTransaction = true;
}

async function commit() {
  await ensureClient();
  if (!inTransaction) return;
  await client.query('COMMIT;');
  inTransaction = false;
}

async function rollback() {
  await ensureClient();
  if (!inTransaction) return;
  await client.query('ROLLBACK;');
  inTransaction = false;
}

parentPort.on('message', async ({ method, payload }) => {
  try {
    let result;
    switch (method) {
      case 'init':
        result = { ok: true, version: currentVersion };
        break;
      case 'all':
        result = { ok: true, rows: await queryAll(payload.sql, payload.params || []) };
        break;
      case 'one':
        result = { ok: true, row: await queryOne(payload.sql, payload.params || []) };
        break;
      case 'run':
        result = { ok: true, result: await run(payload.sql, payload.params || []) };
        break;
      case 'exec':
        result = { ok: true, result: await execSql(payload.sql) };
        break;
      case 'begin':
        await begin();
        result = { ok: true };
        break;
      case 'commit':
        await commit();
        result = { ok: true };
        break;
      case 'rollback':
        await rollback();
        result = { ok: true };
        break;
      case 'info':
        result = { ok: true, info: { provider: 'postgres', currentVersion, inTransaction } };
        break;
      default:
        throw new Error(`Unknown postgres worker method: ${method}`);
    }
    writeSynchronousWorkerResponse(controlBuffer, dataBuffer, result, { ok: true });
  } catch (error) {
    writeSynchronousWorkerResponse(controlBuffer, dataBuffer, {
      ok: false,
      message: error.message,
      status: error.status || 500,
      code: error.code || ''
    }, { ok: false, status: 2 });
  }
});
