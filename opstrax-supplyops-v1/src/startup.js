/**
 * Startup safety checks — called once before the server begins accepting requests.
 * In production mode, dangerous configuration combinations are fatal.
 * In development mode, warnings are printed but startup continues.
 */

function env(name) {
  return (process.env[name] || '').trim();
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
  const authMode = env('OPSTRAX_AUTH_MODE');
  const oidcIssuer = env('OPSTRAX_OIDC_ISSUER');
  const allowDev = env('OPSTRAX_ALLOW_DEV_CONTEXT');
  const oidcClientId = env('OPSTRAX_OIDC_CLIENT_ID');
  const oidcClientSecret = env('OPSTRAX_OIDC_CLIENT_SECRET');
  const oidcRedirectUri = env('OPSTRAX_OIDC_REDIRECT_URI');
  const dbSelection = getDatabaseRuntimeSelection(process.env);
  const storageSelection = getEvidenceStorageRuntimeSelection(process.env);

  // Determine effective auth mode (mirrors logic in auth.js)
  const effectiveMode =
    authMode || (oidcIssuer ? 'oidc' : allowDev === '1' ? 'dev' : 'locked');

  if (isProduction) {
    if (dbSelection.provider === 'sqlite') {
      fatal('SQLite is not permitted in production. Set OPSTRAX_DB_PROVIDER=postgres and DATABASE_URL.');
    }
    if (!dbSelection.databaseUrl) {
      fatal('DATABASE_URL is required in production for the PostgreSQL runtime.');
    }
    // Dev context is never acceptable in production
    if (allowDev === '1') {
      fatal('OPSTRAX_ALLOW_DEV_CONTEXT=1 is not allowed when NODE_ENV=production. Remove it or set NODE_ENV=development.');
    }
    if (effectiveMode === 'dev') {
      fatal('Auth mode resolved to "dev" in NODE_ENV=production. Set OPSTRAX_AUTH_MODE=oidc or provide OPSTRAX_OIDC_ISSUER.');
    }

    // In production with OIDC, all required OIDC vars must be present
    if (effectiveMode === 'oidc') {
      if (!oidcIssuer) fatal('OPSTRAX_OIDC_ISSUER is required when auth mode is oidc.');
      if (!oidcClientId) fatal('OPSTRAX_OIDC_CLIENT_ID is required when auth mode is oidc.');
      if (!oidcClientSecret) fatal('OPSTRAX_OIDC_CLIENT_SECRET is required when auth mode is oidc.');
      if (!oidcRedirectUri) fatal('OPSTRAX_OIDC_REDIRECT_URI is required when auth mode is oidc.');
    }

    if (storageSelection.mode !== 'filesystem') {
      if (storageSelection.mode !== 's3') fatal('OPSTRAX_EVIDENCE_STORAGE must be set to s3 or filesystem.');
      if (!storageSelection.bucket || !storageSelection.region) fatal('OPSTRAX_EVIDENCE_BUCKET and OPSTRAX_EVIDENCE_REGION are required when evidence storage is s3.');
      if (!storageSelection.signingSecret) fatal('OPSTRAX_EVIDENCE_SIGNING_SECRET is required in production.');
    } else {
      fatal('Filesystem evidence storage is not permitted in production. Configure S3-compatible object storage.');
    }

    // Locked mode in production is acceptable (read-only public demo), but warn
    if (effectiveMode === 'locked') {
      warn('Auth mode is "locked" in production — all requests will use the dev-context fallback is disabled. Ensure this is intentional for your deployment.');
    }
  } else {
    // Development warnings
    if (effectiveMode === 'locked') {
      warn('Auth mode is "locked" — API calls require a pre-seeded session cookie. Set OPSTRAX_ALLOW_DEV_CONTEXT=1 for local development.');
    }
    if (effectiveMode === 'dev') {
      warn('Auth mode is "dev" — user identity is resolved from request headers. Do not use in production.');
    }
    if (effectiveMode === 'oidc' && (!oidcClientId || !oidcClientSecret)) {
      warn('OIDC mode detected but OPSTRAX_OIDC_CLIENT_ID / OPSTRAX_OIDC_CLIENT_SECRET are not set. Auth flows will fail.');
    }
  }

  // Always: warn if OIDC vars are partially configured (easy misconfiguration)
  if (oidcIssuer && !oidcClientId) {
    const msg = 'OPSTRAX_OIDC_ISSUER is set but OPSTRAX_OIDC_CLIENT_ID is missing.';
    if (isProduction) fatal(msg); else warn(msg);
  }
  if (oidcClientId && !oidcIssuer) {
    warn('OPSTRAX_OIDC_CLIENT_ID is set but OPSTRAX_OIDC_ISSUER is missing — OIDC will not be activated.');
  }

  if (!isProduction) {
    process.stderr.write(`[startup] INFO  auth mode = ${effectiveMode}, NODE_ENV = ${process.env.NODE_ENV || 'unset'}\n`);
  }
}
import { getDatabaseRuntimeSelection, getEvidenceStorageRuntimeSelection } from './runtime-config.js';
