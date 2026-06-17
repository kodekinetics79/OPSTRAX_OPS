#!/usr/bin/env node
/**
 * go-live-check.mjs — validates the production deployment contract before
 * live staging or go-live. It is intentionally strict about production env
 * posture, demo access, and secret exposure.
 */

const baseUrl = (process.env.RUNTIME_BASE_URL || process.env.OPSTRAX_RUNTIME_BASE_URL || 'http://127.0.0.1:9900').replace(/\/$/, '');

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireProductionEnv() {
  assert(env('NODE_ENV') === 'production', 'NODE_ENV=production is required for go-live validation.');
  assert(env('ALLOW_DEV_CONTEXT', 'OPSTRAX_ALLOW_DEV_CONTEXT') !== '1', 'Local demo mode must be disabled for go-live validation.');
  assert(env('DATABASE_PROVIDER', 'OPSTRAX_DB_PROVIDER') === 'postgres', 'DATABASE_PROVIDER=postgres is required.');
  assert(Boolean(env('DATABASE_URL', 'OPSTRAX_DATABASE_URL')), 'DATABASE_URL is required.');
  assert(Boolean(env('APP_BASE_URL', 'OPSTRAX_BASE_URL')), 'APP_BASE_URL is required.');
  assert(Boolean(env('PLATFORM_BASE_URL', 'OPSTRAX_PLATFORM_BASE_URL')), 'PLATFORM_BASE_URL is required.');
  assert(env('AUTH_MODE', 'OPSTRAX_AUTH_MODE') === 'oidc', 'AUTH_MODE=oidc is required.');
  assert(Boolean(env('OIDC_ISSUER', 'OPSTRAX_OIDC_ISSUER')), 'OIDC_ISSUER is required.');
  assert(Boolean(env('OIDC_CLIENT_ID', 'OPSTRAX_OIDC_CLIENT_ID')), 'OIDC_CLIENT_ID is required.');
  assert(Boolean(env('OIDC_CLIENT_SECRET', 'OPSTRAX_OIDC_CLIENT_SECRET')), 'OIDC_CLIENT_SECRET is required.');
  assert(Boolean(env('OIDC_REDIRECT_URI', 'OPSTRAX_OIDC_REDIRECT_URI')), 'OIDC_REDIRECT_URI is required.');
  assert(env('PLATFORM_AUTH_MODE', 'OPSTRAX_PLATFORM_AUTH_MODE') === 'oidc', 'PLATFORM_AUTH_MODE=oidc is required.');
  assert(Boolean(env('PLATFORM_OIDC_ISSUER', 'OPSTRAX_PLATFORM_OIDC_ISSUER')), 'PLATFORM_OIDC_ISSUER is required.');
  assert(Boolean(env('PLATFORM_OIDC_CLIENT_ID', 'OPSTRAX_PLATFORM_OIDC_CLIENT_ID')), 'PLATFORM_OIDC_CLIENT_ID is required.');
  assert(Boolean(env('PLATFORM_OIDC_CLIENT_SECRET', 'OPSTRAX_PLATFORM_OIDC_CLIENT_SECRET')), 'PLATFORM_OIDC_CLIENT_SECRET is required.');
  assert(Boolean(env('PLATFORM_OIDC_REDIRECT_URI', 'OPSTRAX_PLATFORM_OIDC_REDIRECT_URI')), 'PLATFORM_OIDC_REDIRECT_URI is required.');
  assert(Boolean(env('SESSION_SECRET', 'OPSTRAX_SESSION_SECRET')), 'SESSION_SECRET is required.');
  assert(Boolean(env('PLATFORM_SESSION_SECRET', 'OPSTRAX_PLATFORM_SESSION_SECRET')), 'PLATFORM_SESSION_SECRET is required.');
  assert(env('COOKIE_SECURE', 'OPSTRAX_COOKIE_SECURE') === 'true', 'COOKIE_SECURE=true is required.');
  assert(['lax', 'strict'].includes(env('COOKIE_SAME_SITE', 'OPSTRAX_COOKIE_SAME_SITE').toLowerCase()), 'COOKIE_SAME_SITE must be lax or strict.');
  assert(env('EVIDENCE_STORAGE_PROVIDER', 'OPSTRAX_EVIDENCE_STORAGE') === 's3', 'EVIDENCE_STORAGE_PROVIDER=s3 is required.');
  assert(Boolean(env('S3_BUCKET', 'OPSTRAX_EVIDENCE_BUCKET')), 'S3_BUCKET is required.');
  assert(Boolean(env('S3_REGION', 'OPSTRAX_EVIDENCE_REGION')), 'S3_REGION is required.');
  assert(Boolean(env('EVIDENCE_SIGNING_SECRET', 'OPSTRAX_EVIDENCE_SIGNING_SECRET')), 'EVIDENCE_SIGNING_SECRET is required.');
}

async function readJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  return { response, payload };
}

function scanForSecrets(value, trail = 'root') {
  const forbiddenKey = /(secret|password|databaseurl|accesskey|sessiontoken|clientsecret|privatekey)/i;
  const forbiddenValue = /(postgres:\/\/|s3:\/\/|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY|client_secret)/i;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${trail}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      assert(!forbiddenKey.test(key), `Secret-like field exposed at ${trail}.${key}`);
      scanForSecrets(nested, `${trail}.${key}`);
    }
    return;
  }
  if (typeof value === 'string' && forbiddenValue.test(value)) {
    throw new Error(`Secret-like value exposed at ${trail}`);
  }
}

try {
  requireProductionEnv();

  const health = await readJson('/healthz');
  assert(health.response.status === 200, '/healthz must return 200');

  const ready = await readJson('/healthz/ready');
  assert(ready.response.status === 200, '/healthz/ready must return 200 in production');
  assert(ready.payload?.checks?.db === 'ok', 'PostgreSQL must be reachable');
  assert(ready.payload?.checks?.storage === 'ok', 'Object storage must be reachable');
  assert(ready.payload?.checks?.auth === 'ok', 'Auth posture must be configured');
  assert(ready.payload?.checks?.integration === 'ok', 'Integration posture must be healthy');
  assert(ready.payload?.checks?.queue === 'ok', 'Queue posture must be healthy');

  const tenantMe = await readJson('/api/me');
  assert(tenantMe.response.status === 401, '/api/me must remain protected before login');

  const platformMe = await readJson('/api/platform/me');
  assert(platformMe.response.status === 401, '/api/platform/me must remain protected before login');

  const demoLogin = await readJson('/api/dev/demo-login', { method: 'POST' });
  assert(demoLogin.response.status === 404, '/api/dev/demo-login must be unavailable in production');

  const platformDemoLogin = await readJson('/api/platform/dev/demo-login', { method: 'POST' });
  assert(platformDemoLogin.response.status === 404, '/api/platform/dev/demo-login must be unavailable in production');

  const authBootstrap = await readJson('/api/auth/bootstrap');
  const platformAuthBootstrap = await readJson('/api/platform/auth/bootstrap');
  assert(authBootstrap.response.status === 200, '/api/auth/bootstrap must be reachable');
  assert(platformAuthBootstrap.response.status === 200, '/api/platform/auth/bootstrap must be reachable');
  assert(authBootstrap.payload?.mode === 'oidc', 'Tenant auth bootstrap must report OIDC mode');
  assert(platformAuthBootstrap.payload?.mode === 'oidc', 'Platform auth bootstrap must report OIDC mode');
  assert(authBootstrap.payload?.demo_login_enabled === false, 'Tenant demo login must be disabled in production');
  assert(platformAuthBootstrap.payload?.demo_login_enabled === false, 'Platform demo login must be disabled in production');
  scanForSecrets(authBootstrap.payload, 'authBootstrap');
  scanForSecrets(platformAuthBootstrap.payload, 'platformAuthBootstrap');
  scanForSecrets(ready.payload, 'healthReady');

  process.stdout.write(`[go-live-check] OK baseUrl=${baseUrl} ready=${ready.response.status} tenantMe=${tenantMe.response.status} platformMe=${platformMe.response.status}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[go-live-check] ERROR ${error.message}\n`);
  process.exit(1);
}
