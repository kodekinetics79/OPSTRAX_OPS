/**
 * Startup safety checks — called once before the server begins accepting requests.
 * In production mode, dangerous configuration combinations are fatal.
 * In development mode, warnings are printed but startup continues.
 */

import {
  getDatabaseRuntimeSelection,
  getEvidenceStorageRuntimeSelection,
  getPlatformOidcRuntimeSelection,
  getSessionRuntimeSelection,
  getTenantOidcRuntimeSelection
} from './runtime-config.js';

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

function warn(msg) {
  process.stderr.write(`[startup] WARN  ${msg}\n`);
}

function fatal(msg) {
  process.stderr.write(`[startup] FATAL ${msg}\n`);
  process.exit(1);
}

export function runStartupChecks() {
  const isProduction = env('NODE_ENV') === 'production';
  const authMode = env('AUTH_MODE', 'OPSTRAX_AUTH_MODE');
  const allowDev = env('ALLOW_DEV_CONTEXT', 'OPSTRAX_ALLOW_DEV_CONTEXT');
  const dbSelection = getDatabaseRuntimeSelection(process.env);
  const storageSelection = getEvidenceStorageRuntimeSelection(process.env);
  const tenantAuthSelection = getTenantOidcRuntimeSelection(process.env);
  const platformAuthSelection = getPlatformOidcRuntimeSelection(process.env);
  const sessionSelection = getSessionRuntimeSelection(process.env);

  // Determine effective auth mode (mirrors logic in auth.js)
  const effectiveMode =
    authMode || (tenantAuthSelection.issuer ? 'oidc' : allowDev === '1' ? 'dev' : 'locked');

  if (isProduction) {
    if (authMode === 'dev') {
      fatal('AUTH_MODE=dev is not permitted in production.');
    }
    if (dbSelection.provider === 'sqlite') {
      fatal('SQLite is not permitted in production. Set DATABASE_PROVIDER=postgres and DATABASE_URL.');
    }
    if (!dbSelection.databaseUrl) {
      fatal('DATABASE_URL is required in production for the PostgreSQL runtime.');
    }
    if (allowDev === '1') {
      fatal('ALLOW_DEV_CONTEXT=1 is not allowed when NODE_ENV=production. Remove it or set NODE_ENV=development.');
    }
    if (!tenantAuthSelection.issuer) fatal('OIDC_ISSUER is required in production for tenant SSO.');
    if (!tenantAuthSelection.clientId) fatal('OIDC_CLIENT_ID is required in production for tenant SSO.');
    if (!tenantAuthSelection.clientSecret) fatal('OIDC_CLIENT_SECRET is required in production for tenant SSO.');
    if (!tenantAuthSelection.redirectUri) fatal('OIDC_REDIRECT_URI is required in production for tenant SSO.');
    if (!platformAuthSelection.issuer) fatal('PLATFORM_OIDC_ISSUER is required in production for platform SSO.');
    if (!platformAuthSelection.clientId) fatal('PLATFORM_OIDC_CLIENT_ID is required in production for platform SSO.');
    if (!platformAuthSelection.clientSecret) fatal('PLATFORM_OIDC_CLIENT_SECRET is required in production for platform SSO.');
    if (!platformAuthSelection.redirectUri) fatal('PLATFORM_OIDC_REDIRECT_URI is required in production for platform SSO.');
    if (!sessionSelection.tenantSecret) fatal('SESSION_SECRET is required in production.');
    if (!sessionSelection.platformSecret) fatal('PLATFORM_SESSION_SECRET is required in production.');
    if (sessionSelection.cookieSecure === 'false') fatal('COOKIE_SECURE cannot be false in production.');
    if (sessionSelection.cookieSameSite === 'none' && sessionSelection.cookieSecure !== 'true') {
      fatal('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true in production.');
    }

    if (storageSelection.mode !== 'filesystem') {
      if (storageSelection.mode !== 's3') fatal('EVIDENCE_STORAGE_PROVIDER must be set to s3 or filesystem.');
      if (!storageSelection.bucket || !storageSelection.region) fatal('S3_BUCKET and S3_REGION are required when evidence storage is s3.');
      if (!storageSelection.signingSecret) fatal('EVIDENCE_SIGNING_SECRET is required in production.');
    } else {
      fatal('Filesystem evidence storage is not permitted in production. Configure S3-compatible object storage.');
    }
  } else {
    // Development warnings
    if (effectiveMode === 'locked') {
      warn('Auth mode is "locked" — API calls require a pre-seeded session cookie. Set OPSTRAX_ALLOW_DEV_CONTEXT=1 for local development.');
    }
    if (effectiveMode === 'dev') {
      warn('Auth mode is "dev" — user identity is resolved from request headers. Do not use in production.');
    }
    if (tenantAuthSelection.issuer && (!tenantAuthSelection.clientId || !tenantAuthSelection.clientSecret)) {
      warn('Tenant OIDC is partially configured. Auth flows will fail until client id/secret are set.');
    }
    if (platformAuthSelection.issuer && (!platformAuthSelection.clientId || !platformAuthSelection.clientSecret)) {
      warn('Platform OIDC is partially configured. Auth flows will fail until platform client id/secret are set.');
    }
  }

  // Always: warn if OIDC vars are partially configured (easy misconfiguration)
  if (tenantAuthSelection.issuer && !tenantAuthSelection.clientId) {
    const msg = 'OIDC_ISSUER is set but OIDC_CLIENT_ID is missing.';
    if (isProduction) fatal(msg); else warn(msg);
  }
  if (tenantAuthSelection.clientId && !tenantAuthSelection.issuer) {
    warn('OIDC_CLIENT_ID is set but OIDC_ISSUER is missing — tenant OIDC will not be activated.');
  }
  if (platformAuthSelection.issuer && !platformAuthSelection.clientId) {
    const msg = 'PLATFORM_OIDC_ISSUER is set but PLATFORM_OIDC_CLIENT_ID is missing.';
    if (isProduction) fatal(msg); else warn(msg);
  }
  if (platformAuthSelection.clientId && !platformAuthSelection.issuer) {
    warn('PLATFORM_OIDC_CLIENT_ID is set but PLATFORM_OIDC_ISSUER is missing — platform OIDC will not be activated.');
  }

  if (!isProduction) {
    process.stderr.write(`[startup] INFO  auth mode = ${effectiveMode}, NODE_ENV = ${process.env.NODE_ENV || 'unset'}\n`);
  }
}
