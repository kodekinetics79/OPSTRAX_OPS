#!/usr/bin/env node
/**
 * verify-backup-restore.mjs — read-only backup/restore posture validation.
 * It expects an authenticated session cookie so it can inspect tenant-scoped
 * compliance posture and evidence that backup/restore operations are tracked.
 */

const baseUrl = (process.env.RUNTIME_BASE_URL || process.env.OPSTRAX_RUNTIME_BASE_URL || 'http://127.0.0.1:9900').replace(/\/$/, '');
const sessionCookie = process.env.GO_LIVE_COOKIE || process.env.RUNTIME_COOKIE || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function scanForSecrets(value, trail = 'root') {
  const forbiddenKey = /(secret|password|databaseurl|accesskey|sessiontoken|clientsecret|privatekey)/i;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${trail}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      assert(!forbiddenKey.test(key), `Secret-like field exposed at ${trail}.${key}`);
      scanForSecrets(nested, `${trail}.${key}`);
    }
  }
}

async function readJson(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: sessionCookie ? { cookie: sessionCookie } : {}
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload };
}

try {
  assert(sessionCookie, 'GO_LIVE_COOKIE is required to inspect tenant-scoped backup and restore posture.');
  const posture = await readJson('/api/compliance/availability-posture');
  assert(posture.response.status === 200, '/api/compliance/availability-posture must be reachable with an authenticated session');
  assert(['CONFIGURED', 'VERIFIED'].includes(posture.payload?.posture?.backup?.status), 'Backup posture must be CONFIGURED or VERIFIED');
  assert(['CONFIGURED', 'VERIFIED'].includes(posture.payload?.posture?.restore?.status), 'Restore posture must be CONFIGURED or VERIFIED');

  const backups = await readJson('/api/compliance/backup-records');
  const restores = await readJson('/api/compliance/restore-tests');
  assert(backups.response.status === 200, '/api/compliance/backup-records must be reachable with an authenticated session');
  assert(restores.response.status === 200, '/api/compliance/restore-tests must be reachable with an authenticated session');
  assert((backups.payload?.records || []).length > 0, 'At least one backup record must exist');
  assert((restores.payload?.tests || []).length > 0, 'At least one restore test record must exist');
  scanForSecrets(posture.payload, 'availabilityPosture');
  scanForSecrets(backups.payload, 'backupRecords');
  scanForSecrets(restores.payload, 'restoreTests');

  process.stdout.write(`[verify-backup-restore] OK baseUrl=${baseUrl} backup=${posture.payload.posture.backup.status} restore=${posture.payload.posture.restore.status}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-backup-restore] ERROR ${error.message}\n`);
  process.exit(1);
}
