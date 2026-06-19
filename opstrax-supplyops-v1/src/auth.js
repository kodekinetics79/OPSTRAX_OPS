import crypto from 'node:crypto';
import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';
import { getRedisClient } from './redis-client.js';
import {
  getPlatformOidcRuntimeSelection,
  getSessionRuntimeSelection,
  getTenantOidcRuntimeSelection
} from './runtime-config.js';

const AUTH_COOKIE = 'opstrax_session';
const PLATFORM_AUTH_COOKIE = 'opstrax_platform_session';
const AUTH_REQUEST_TTL_MS = 10 * 60 * 1000;
const AUTH_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

let discoveryCache = null;

function env(name, fallback = '') {
  const value = process.env[name];
  return value && String(value).trim() ? String(value).trim() : fallback;
}

function pickEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

function devContextEnabled() {
  return pickEnv('OPSTRAX_ALLOW_DEV_CONTEXT', 'ALLOW_DEV_CONTEXT') === '1';
}

function tenantMode() {
  if (tenantOidcConfig({}).enabled) return 'oidc';
  return devContextEnabled() ? 'dev' : 'locked';
}

function platformMode() {
  if (platformOidcConfig({}).enabled) return 'oidc';
  return devContextEnabled() ? 'dev' : 'locked';
}

export function isLocalDemoEnabled() {
  return env('NODE_ENV') !== 'production' && devContextEnabled();
}

function base64url(buffer) {
  return Buffer.from(buffer).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function sha256Base64url(input) {
  return base64url(crypto.createHash('sha256').update(input).digest());
}

function randomToken(bytes = 32) {
  return base64url(crypto.randomBytes(bytes));
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf('=');
        if (index === -1) return [pair, ''];
        return [pair.slice(0, index), decodeURIComponent(pair.slice(index + 1))];
      })
  );
}

function cookieHeader(name, value, { maxAge, httpOnly = true, sameSite = 'Lax', secure = false, path = '/' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  if (typeof maxAge === 'number') parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parts.join('; ');
}

function requestHost(headers) {
  const forwarded = headers['x-forwarded-host'] || headers['X-Forwarded-Host'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return headers.host || headers.Host || 'localhost:9899';
}

function requestProto(headers, surface = 'tenant') {
  const forwarded = headers['x-forwarded-proto'] || headers['X-Forwarded-Proto'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  const baseUrl = surface === 'platform'
    ? env('PLATFORM_BASE_URL', env('APP_BASE_URL', env('OPSTRAX_PLATFORM_BASE_URL', env('OPSTRAX_BASE_URL', ''))))
    : env('APP_BASE_URL', env('OPSTRAX_BASE_URL', ''));
  return baseUrl.startsWith('https://') ? 'https' : 'http';
}

function requestBaseUrl(headers, surface = 'tenant') {
  const explicit = surface === 'platform'
    ? env('PLATFORM_BASE_URL', env('APP_BASE_URL', env('OPSTRAX_PLATFORM_BASE_URL', env('OPSTRAX_BASE_URL'))))
    : env('APP_BASE_URL', env('OPSTRAX_BASE_URL'));
  if (explicit) return explicit.replace(/\/$/, '');
  return `${requestProto(headers, surface)}://${requestHost(headers)}`;
}

function sessionSecret(surface) {
  const { tenantSecret, platformSecret } = getSessionRuntimeSelection();
  return surface === 'platform'
    ? (platformSecret || 'opstrax-platform-local-session-secret')
    : (tenantSecret || 'opstrax-tenant-local-session-secret');
}

function signValue(value, surface) {
  const signature = crypto.createHmac('sha256', sessionSecret(surface)).update(String(value)).digest();
  return `${value}.${base64url(signature)}`;
}

function unsignValue(value, surface) {
  const raw = String(value || '');
  const separator = raw.lastIndexOf('.');
  if (separator <= 0 || separator === raw.length - 1) return null;
  const payload = raw.slice(0, separator);
  const expected = signValue(payload, surface).slice(payload.length + 1);
  const actualBuffer = Buffer.from(raw.slice(separator + 1));
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return payload;
}

function authRedirectUri(headers) {
  return env('OIDC_REDIRECT_URI', env('OPSTRAX_OIDC_REDIRECT_URI', `${requestBaseUrl(headers)}/auth/oidc/callback`));
}

function platformAuthRedirectUri(headers) {
  return env('PLATFORM_OIDC_REDIRECT_URI', env('OPSTRAX_PLATFORM_OIDC_REDIRECT_URI', `${requestBaseUrl(headers, 'platform')}/platform/auth/oidc/callback`));
}

function tenantLoginStartUrl(headers) {
  return env('OIDC_LOGIN_URL', env('OPSTRAX_OIDC_LOGIN_URL', `${requestBaseUrl(headers)}/auth/login`));
}

function platformLoginStartUrl(headers) {
  return env('PLATFORM_OIDC_LOGIN_URL', env('OPSTRAX_PLATFORM_OIDC_LOGIN_URL', `${requestBaseUrl(headers, 'platform')}/platform/login`));
}

function tenantOidcConfig(headers) {
  const selection = getTenantOidcRuntimeSelection();
  return {
    issuer: selection.issuer,
    clientId: selection.clientId,
    clientSecret: selection.clientSecret,
    redirectUri: selection.redirectUri || authRedirectUri(headers),
    logoutRedirectUri: selection.logoutRedirectUri || tenantLoginStartUrl(headers),
    scopes: selection.scopes || 'openid profile email',
    enabled: Boolean(selection.issuer && selection.clientId && selection.clientSecret)
  };
}

function platformOidcConfig(headers) {
  const selection = getPlatformOidcRuntimeSelection();
  return {
    issuer: selection.issuer,
    clientId: selection.clientId,
    clientSecret: selection.clientSecret,
    redirectUri: selection.redirectUri || platformAuthRedirectUri(headers),
    logoutRedirectUri: selection.logoutRedirectUri || platformLoginStartUrl(headers),
    scopes: selection.scopes || 'openid profile email',
    enabled: Boolean(selection.issuer && selection.clientId && selection.clientSecret)
  };
}

async function discovery(issuer) {
  if (!issuer) throw new Error('OIDC issuer is not configured');
  if (discoveryCache?.issuer === issuer && discoveryCache?.expiresAt > Date.now()) return discoveryCache;
  const response = await fetch(`${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error('Unable to load OIDC discovery document');
  const config = await response.json();
  discoveryCache = { ...config, issuer, expiresAt: Date.now() + 60 * 60 * 1000 };
  return discoveryCache;
}

async function jwksForIssuer(issuer) {
  const doc = await discovery(issuer);
  const response = await fetch(doc.jwks_uri);
  if (!response.ok) throw new Error('Unable to load OIDC JWKS');
  return response.json();
}

function toIsoFromSeconds(seconds) {
  return new Date(seconds * 1000).toISOString();
}

function verifyJwt(jwt, expectedNonce, issuer, clientId) {
  const [headPart, payloadPart, signaturePart] = String(jwt).split('.');
  if (!headPart || !payloadPart || !signaturePart) throw new Error('Invalid token');
  const header = JSON.parse(Buffer.from(headPart, 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  if (header.alg !== 'RS256' && header.alg !== 'PS256' && header.alg !== 'ES256') throw new Error(`Unsupported JWS algorithm: ${header.alg}`);
  if (payload.iss !== issuer) throw new Error('Invalid issuer');
  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audience.includes(clientId)) throw new Error('Invalid audience');
  if (payload.exp && Date.now() / 1000 >= payload.exp) throw new Error('Token expired');
  if (expectedNonce && payload.nonce !== expectedNonce) throw new Error('Invalid nonce');
  return jwksForIssuer(issuer).then(async (jwks) => {
    const key = jwks.keys.find((entry) => entry.kid === header.kid);
    if (!key) throw new Error('JWK not found');
    const publicKey = crypto.createPublicKey({ key, format: 'jwk' });
    const data = Buffer.from(`${headPart}.${payloadPart}`);
    const signature = Buffer.from(signaturePart, 'base64url');
    let verified;
    if (header.alg === 'PS256') {
      verified = crypto.verify('sha256', data, {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
      }, signature);
    } else {
      verified = crypto.verify('sha256', data, publicKey, signature);
    }
    if (!verified) throw new Error('Invalid token signature');
    return payload;
  });
}

function cleanupExpired() {
  transaction(() => {
    const now = nowIso();
    execute('DELETE FROM auth_login_requests WHERE expires_at < ?', [now]);
    execute('DELETE FROM platform_auth_login_requests WHERE expires_at < ?', [now]);
    execute('DELETE FROM auth_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL', [now]);
    execute('DELETE FROM platform_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL', [now]);
  });
}

export function authMode() {
  return tenantMode();
}

export function authEnabled() {
  return Boolean(tenantOidcConfig({}).enabled);
}

// In-process session cache — avoids a DB round-trip on every authenticated request.
// Redis is used as an async backing store for cache population and invalidation.
// Cache TTL is short (60s) so stale sessions are quickly evicted even without
// explicit invalidation (e.g., if the process restarts or Redis is unavailable).
const _sessionCache = new Map();
const _platformSessionCache = new Map();
const SESSION_CACHE_TTL_MS = 60_000;

function _getCached(cache, id) {
  const entry = cache.get(id);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) { cache.delete(id); return undefined; }
  return entry.session;
}

function _setCached(cache, id, session, prefix) {
  cache.set(id, { session, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
  try {
    const redis = getRedisClient();
    if (redis) redis.set(`opstrax:${prefix}:${id}`, JSON.stringify(session), { EX: Math.ceil(SESSION_CACHE_TTL_MS / 1000) }).catch(() => {});
  } catch {}
}

function _invalidateCached(cache, id, prefix) {
  cache.delete(id);
  try {
    const redis = getRedisClient();
    if (redis) redis.del(`opstrax:${prefix}:${id}`).catch(() => {});
  } catch {}
}

export function getSessionCookie(headers) {
  const value = parseCookies(headers.cookie || headers.Cookie || '')[AUTH_COOKIE] || '';
  return unsignValue(value, 'tenant') || '';
}

export function readSession(headers) {
  if (!tenantOidcConfig(headers).enabled && !isLocalDemoEnabled()) return null;
  cleanupExpired();
  const sessionId = getSessionCookie(headers);
  if (!sessionId) return null;
  const cached = _getCached(_sessionCache, sessionId);
  if (cached !== undefined) return cached;
  const session = selectOne(
    `SELECT s.*, u.name AS user_name, u.email AS user_email, u.role_key, u.department_id, u.facility_id, u.active
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?`,
    [sessionId, nowIso()]
  );
  if (!session || !session.active) return null;
  _setCached(_sessionCache, sessionId, session, 'sess');
  return session;
}

export function getPlatformSessionCookie(headers) {
  const value = parseCookies(headers.cookie || headers.Cookie || '')[PLATFORM_AUTH_COOKIE] || '';
  return unsignValue(value, 'platform') || '';
}

export function readPlatformSession(headers) {
  cleanupExpired();
  const sessionId = getPlatformSessionCookie(headers);
  if (!sessionId) return null;
  const cached = _getCached(_platformSessionCache, sessionId);
  if (cached !== undefined) return cached;
  const session = selectOne(
    `SELECT s.*, u.display_name AS user_name, u.email AS user_email, u.role_key, u.active
     FROM platform_sessions s
     JOIN platform_users u ON u.id = s.platform_user_id
     WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?`,
    [sessionId, nowIso()]
  );
  if (!session || !session.active) return null;
  _setCached(_platformSessionCache, sessionId, session, 'platsess');
  return session;
}

async function completeSurfaceLogin(surface, headers, query) {
  const config = surface === 'platform' ? platformOidcConfig(headers) : tenantOidcConfig(headers);
  if (!config.enabled) {
    const error = new Error('OIDC is not configured');
    error.status = 503;
    throw error;
  }
  const state = String(query.state || '');
  const code = String(query.code || '');
  if (!state || !code) {
    const error = new Error('Missing OIDC callback parameters');
    error.status = 400;
    throw error;
  }
  const requestTable = surface === 'platform' ? 'platform_auth_login_requests' : 'auth_login_requests';
  const identityTable = surface === 'platform' ? 'platform_auth_identities' : 'auth_identities';
  const sessionTable = surface === 'platform' ? 'platform_sessions' : 'auth_sessions';
  const request = selectOne(`SELECT * FROM ${requestTable} WHERE state = ? AND expires_at > ?`, [state, nowIso()]);
  if (!request) {
    const error = new Error('Login request expired or invalid');
    error.status = 400;
    throw error;
  }
  const doc = await discovery(config.issuer);
  const tokenResponse = await fetch(doc.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code_verifier: request.code_verifier
    })
  });
  if (!tokenResponse.ok) {
    const error = new Error('OIDC token exchange failed');
    error.status = 502;
    throw error;
  }
  const tokenSet = await tokenResponse.json();
  const claims = await verifyJwt(tokenSet.id_token, request.nonce, config.issuer, config.clientId);
  const email = String(claims.email || claims.preferred_username || '').toLowerCase();
  if (!email) {
    const error = new Error('OIDC identity did not include an email address');
    error.status = 403;
    throw error;
  }
  const displayName = String(claims.name || claims.given_name || email).trim();
  const provider = config.issuer;
  let identity = selectOne(`SELECT * FROM ${identityTable} WHERE provider = ? AND subject = ?`, [provider, String(claims.sub)]);
  if (!identity) {
    if (surface === 'platform') {
      const user = selectOne('SELECT id, email, display_name, role_key, active FROM platform_users WHERE lower(email) = ? AND active = 1 ORDER BY email LIMIT 1', [email]);
      if (!user) {
        const error = new Error('No matching platform user is mapped to this identity');
        error.status = 403;
        throw error;
      }
      identity = { id: newId('platform_identity'), platform_user_id: user.id };
      insert(identityTable, {
        id: identity.id,
        platform_user_id: user.id,
        provider,
        subject: String(claims.sub),
        email,
        display_name: displayName,
        last_login_at: nowIso()
      });
    } else {
      const user = selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE lower(email) = ? AND active = 1 ORDER BY tenant_id LIMIT 1', [email]);
      if (!user) {
        const error = new Error('No matching tenant user is mapped to this identity');
        error.status = 403;
        throw error;
      }
      identity = { id: newId('identity'), tenant_id: user.tenant_id, user_id: user.id };
      insert(identityTable, {
        id: identity.id,
        tenant_id: user.tenant_id,
        user_id: user.id,
        provider,
        subject: String(claims.sub),
        email,
        display_name: displayName,
        last_login_at: nowIso()
      });
    }
  } else {
    execute(`UPDATE ${identityTable} SET email = ?, display_name = ?, last_login_at = ? WHERE id = ?`, [email, displayName, nowIso(), identity.id]);
  }
  const csrfToken = randomToken(24);
  const sessionId = randomToken(32);
  const sessionExpires = new Date(Date.now() + AUTH_SESSION_TTL_MS).toISOString();
  transaction(() => {
    if (surface === 'platform') {
      const user = selectOne('SELECT id, role_key, email, display_name, active FROM platform_users WHERE id = ? AND active = 1', [identity.platform_user_id]);
      if (!user) {
        const error = new Error('Platform user not found for authenticated identity');
        error.status = 403;
        throw error;
      }
      insert(sessionTable, {
        id: sessionId,
        platform_user_id: user.id,
        provider,
        role_key: user.role_key,
        email,
        display_name: displayName,
        csrf_token: csrfToken,
        user_agent: String(headers['user-agent'] || headers['User-Agent'] || ''),
        ip_address: String(headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-Ip'] || ''),
        expires_at: sessionExpires
      });
    } else {
      const user = selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE id = ? AND active = 1', [identity.user_id]);
      if (!user) {
        const error = new Error('Tenant user not found for authenticated identity');
        error.status = 403;
        throw error;
      }
      insert(sessionTable, {
        id: sessionId,
        tenant_id: user.tenant_id,
        user_id: user.id,
        provider,
        subject: String(claims.sub),
        email,
        display_name: displayName,
        csrf_token: csrfToken,
        user_agent: String(headers['user-agent'] || headers['User-Agent'] || ''),
        ip_address: String(headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-Ip'] || ''),
        expires_at: sessionExpires
      });
    }
    execute(`DELETE FROM ${requestTable} WHERE state = ?`, [state]);
  });
  return {
    cookie: cookieHeader(surface === 'platform' ? PLATFORM_AUTH_COOKIE : AUTH_COOKIE, signValue(sessionId, surface), {
      maxAge: AUTH_SESSION_TTL_MS / 1000,
      httpOnly: true,
      sameSite: 'Lax',
      secure: requestBaseUrl(headers, surface).startsWith('https://')
    }),
    returnTo: request.return_to || (surface === 'platform' ? '/platform/dashboard' : '/'),
    session: surface === 'platform'
      ? selectOne(
        `SELECT s.*, u.display_name AS user_name, u.role_key
         FROM platform_sessions s
         JOIN platform_users u ON u.id = s.platform_user_id
         WHERE s.id = ?`,
        [sessionId]
      )
      : selectOne(
        `SELECT s.*, u.name AS user_name, u.role_key, u.department_id, u.facility_id
         FROM auth_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ?`,
        [sessionId]
      ),
    csrfToken
  };
}

export function requireCsrf(headers, session) {
  if (String(session?.provider || '').includes('demo')) return;
  const token = headers['x-csrf-token'] || headers['X-CSRF-Token'];
  if (!token || token !== session.csrf_token) {
    const error = new Error('Invalid CSRF token');
    error.status = 403;
    throw error;
  }
}

export function clearSessionCookie() {
  return cookieHeader(AUTH_COOKIE, '', { maxAge: 0 });
}

export function clearPlatformSessionCookie() {
  return cookieHeader(PLATFORM_AUTH_COOKIE, '', { maxAge: 0 });
}

export async function getLoginUrl(headers, returnTo = '/') {
  const config = tenantOidcConfig(headers);
  if (!config.enabled) {
    const error = new Error('OIDC is not configured');
    error.status = 503;
    throw error;
  }
  const state = randomToken(24);
  const nonce = randomToken(24);
  const codeVerifier = randomToken(32);
  const codeChallenge = sha256Base64url(codeVerifier);
  transaction(() => {
    insert('auth_login_requests', {
      state,
      code_verifier: codeVerifier,
      return_to: returnTo || '/',
      nonce,
      expires_at: toIsoFromSeconds((Date.now() + AUTH_REQUEST_TTL_MS) / 1000)
    });
  });
  const url = new URL((await discovery(config.issuer)).authorization_endpoint);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scopes);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export async function completeLogin(headers, query) {
  return completeSurfaceLogin('tenant', headers, query);
}

export async function getPlatformLoginUrl(headers, returnTo = '/platform/dashboard') {
  const config = platformOidcConfig(headers);
  if (!config.enabled) {
    const error = new Error('OIDC is not configured');
    error.status = 503;
    throw error;
  }
  const state = randomToken(24);
  const nonce = randomToken(24);
  const codeVerifier = randomToken(32);
  const codeChallenge = sha256Base64url(codeVerifier);
  transaction(() => {
    insert('platform_auth_login_requests', {
      state,
      code_verifier: codeVerifier,
      return_to: returnTo || '/platform/dashboard',
      nonce,
      expires_at: toIsoFromSeconds((Date.now() + AUTH_REQUEST_TTL_MS) / 1000)
    });
  });
  const url = new URL((await discovery(config.issuer)).authorization_endpoint);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scopes);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export async function completePlatformLogin(headers, query) {
  return completeSurfaceLogin('platform', headers, query);
}

export function logoutSession(headers) {
  if (!tenantOidcConfig(headers).enabled && !isLocalDemoEnabled()) return clearSessionCookie();
  const sessionId = getSessionCookie(headers);
  if (sessionId) {
    transaction(() => {
      execute('UPDATE auth_sessions SET revoked_at = ? WHERE id = ?', [nowIso(), sessionId]);
    });
    _invalidateCached(_sessionCache, sessionId, 'sess');
  }
  return clearSessionCookie();
}

export function getAuthBootstrap() {
  return {
    mode: tenantMode(),
    enabled: tenantOidcConfig({}).enabled,
    login_required: true,
    demo_login_enabled: isLocalDemoEnabled(),
    login_url: '/auth/login',
    start_url: '/auth/oidc/start',
    callback_url: '/auth/oidc/callback'
  };
}

export function getPlatformAuthBootstrap() {
  return {
    mode: platformMode(),
    enabled: platformOidcConfig({}).enabled,
    login_required: true,
    demo_login_enabled: isLocalDemoEnabled(),
    login_url: '/platform/login',
    start_url: '/platform/auth/oidc/start',
    callback_url: '/platform/auth/oidc/callback'
  };
}

export function isDemoLoginEnabled() {
  return isLocalDemoEnabled();
}

export function createDemoSession(headers, { tenantId, userId } = {}) {
  if (!isLocalDemoEnabled()) {
    const error = new Error('Demo login is not available');
    error.status = 404;
    throw error;
  }
  const tenant = tenantId
    ? selectOne('SELECT id, name, slug, industry, status FROM tenants WHERE id = ?', [tenantId])
    : selectOne(
      `SELECT id, name, slug, industry, status
       FROM tenants
       ORDER BY CASE WHEN name = 'IntelliFlow Systems' THEN 0 WHEN name = 'Evostel LLC' THEN 1 ELSE 2 END, name
       LIMIT 1`
    );
  if (!tenant) {
    const error = new Error('Tenant not found');
    error.status = 404;
    throw error;
  }
  const user = userId
    ? selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE id = ? AND active = 1', [userId])
    : selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? AND role_key = \'admin\' LIMIT 1', [tenant.id])
      ?? selectOne('SELECT id, tenant_id, department_id, facility_id, role_key, name, email, active FROM users WHERE tenant_id = ? ORDER BY role_key LIMIT 1', [tenant.id]);
  if (!user || user.tenant_id !== tenant.id) {
    const error = new Error('User not found for tenant');
    error.status = 404;
    throw error;
  }
  const csrfToken = randomToken(24);
  const sessionId = randomToken(32);
  const sessionExpires = new Date(Date.now() + AUTH_SESSION_TTL_MS).toISOString();
  transaction(() => {
    insert('auth_sessions', {
      id: sessionId,
      tenant_id: tenant.id,
      user_id: user.id,
      provider: 'demo',
      subject: `demo:${tenant.id}:${user.id}`,
      email: user.email,
      display_name: user.name,
      csrf_token: csrfToken,
      user_agent: String(headers['user-agent'] || headers['User-Agent'] || ''),
      ip_address: String(headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-Ip'] || ''),
      expires_at: sessionExpires
    });
  });
  return {
    cookie: cookieHeader(AUTH_COOKIE, signValue(sessionId, 'tenant'), { maxAge: AUTH_SESSION_TTL_MS / 1000, httpOnly: true, sameSite: 'Lax', secure: requestBaseUrl(headers).startsWith('https://') }),
    csrfToken,
    session: selectOne(
      `SELECT s.*, u.name AS user_name, u.role_key, u.department_id, u.facility_id
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [sessionId]
    ),
    auth: getAuthBootstrap()
  };
}

export function createPlatformDemoSession(headers, { userId } = {}) {
  if (!isLocalDemoEnabled()) {
    const error = new Error('Platform demo login is not available');
    error.status = 404;
    throw error;
  }
  const user = userId
    ? selectOne('SELECT id, email, display_name, role_key, active FROM platform_users WHERE id = ? AND active = 1', [userId])
    : selectOne("SELECT id, email, display_name, role_key, active FROM platform_users WHERE role_key = 'PLATFORM_OWNER' AND active = 1 LIMIT 1")
      ?? selectOne("SELECT id, email, display_name, role_key, active FROM platform_users WHERE role_key = 'PLATFORM_ADMIN' AND active = 1 LIMIT 1")
      ?? selectOne('SELECT id, email, display_name, role_key, active FROM platform_users WHERE active = 1 ORDER BY role_key LIMIT 1');
  if (!user) {
    const error = new Error('Platform user not found');
    error.status = 404;
    throw error;
  }
  const csrfToken = randomToken(24);
  const sessionId = randomToken(32);
  const sessionExpires = new Date(Date.now() + AUTH_SESSION_TTL_MS).toISOString();
  transaction(() => {
    insert('platform_sessions', {
      id: sessionId,
      platform_user_id: user.id,
      provider: 'platform-demo',
      role_key: user.role_key,
      email: user.email,
      display_name: user.display_name,
      csrf_token: csrfToken,
      user_agent: String(headers['user-agent'] || headers['User-Agent'] || ''),
      ip_address: String(headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-Ip'] || ''),
      expires_at: sessionExpires
    });
  });
  return {
    cookie: cookieHeader(PLATFORM_AUTH_COOKIE, signValue(sessionId, 'platform'), { maxAge: AUTH_SESSION_TTL_MS / 1000, httpOnly: true, sameSite: 'Lax', secure: requestBaseUrl(headers, 'platform').startsWith('https://') }),
    csrfToken,
    session: selectOne(
      `SELECT s.*, u.display_name AS user_name, u.role_key
       FROM platform_sessions s
       JOIN platform_users u ON u.id = s.platform_user_id
       WHERE s.id = ?`,
      [sessionId]
    ),
    auth: getPlatformAuthBootstrap()
  };
}

export function logoutPlatformSession(headers) {
  if (!platformOidcConfig(headers).enabled && !isLocalDemoEnabled()) return clearPlatformSessionCookie();
  const sessionId = getPlatformSessionCookie(headers);
  if (sessionId) {
    transaction(() => {
      execute('UPDATE platform_sessions SET revoked_at = ? WHERE id = ?', [nowIso(), sessionId]);
    });
    _invalidateCached(_platformSessionCache, sessionId, 'platsess');
  }
  return clearPlatformSessionCookie();
}
