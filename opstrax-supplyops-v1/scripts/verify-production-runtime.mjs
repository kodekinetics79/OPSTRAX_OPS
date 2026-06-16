#!/usr/bin/env node
/**
 * verify-production-runtime.mjs — validates the app container against the
 * production-like runtime path exposed by the validation compose stack.
 */

const baseUrl = (process.env.OPSTRAX_RUNTIME_BASE_URL || 'http://127.0.0.1:9900').replace(/\/$/, '');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();
  return { response, payload: text ? JSON.parse(text) : null };
}

try {
  const health = await readJson('/healthz');
  assert(health.response.status === 200, '/healthz must return 200');

  const ready = await readJson('/healthz/ready');
  assert(ready.response.status === 503, '/healthz/ready should not be green before SSO is configured');
  assert(ready.payload?.checks?.db === 'ok', 'PostgreSQL must be reachable');
  assert(ready.payload?.checks?.storage === 'ok', 'Object storage must be reachable');
  assert(/auth configuration required/i.test(String(ready.payload?.checks?.auth || '')), 'Auth posture should report CONFIGURATION_REQUIRED');

  const me = await readJson('/api/me');
  assert(me.response.status === 401, '/api/me must remain protected in production-like mode');

  process.stdout.write(`[verify-production-runtime] OK baseUrl=${baseUrl} ready=${ready.response.status} me=${me.response.status}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-production-runtime] ERROR ${error.message}\n`);
  process.exit(1);
}
