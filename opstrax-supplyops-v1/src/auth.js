import crypto from 'node:crypto';
import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';

const AUTH_COOKIE = 'opstrax_session';
const AUTH_REQUEST_TTL_MS = 10 * 60 * 1000;
const AUTH_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

let discoveryCache = null;

function env(name, fallback = '') {
  const value = process.env[name];
  return value && String(value).trim() ? String(value).trim() : fallback;
}

function mode() {
  return env('OPSTRAX_AUTH_MODE') || (env('OPSTRAX_OIDC_ISSUER') ? 'oidc' : (env('OPSTRAX_ALLOW_DEV_CONTEXT') === '1' ? 'dev' : 'locked'));
}

function isOidcEnabled() {
  return mode() === 'oidc';
}

function isLocalDemoEnabled() {
  return env('NODE_ENV') !== 'production' && env('OPSTRAX_ALLOW_DEV_CONTEXT') === '1' && mode() === 'dev';
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

function requestProto(headers) {
  const forwarded = headers['x-forwarded-proto'] || headers['X-Forwarded-Proto'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return env('OPSTRAX_BASE_URL', '').startsWith('https://') ? 'https' : 'http';
}

function requestBaseUrl(headers) {
  const explicit = env('OPSTRAX_BASE_URL');
  if (explicit) return explicit.replace(/\/$/, '');
  return `${requestProto(headers)}://${requestHost(headers)}`;
}

function authRedirectUri(headers) {
  return env('OPSTRAX_OIDC_REDIRECT_URI', `${requestBaseUrl(headers)}/auth/callback`);
}

async function discovery() {
  const issuer = env('OPSTRAX_OIDC_ISSUER');
  if (!issuer) throw new Error('OIDC issuer is not configured');
  if (discoveryCache?.issuer === issuer && discoveryCache?.expiresAt > Date.now()) return discoveryCache;
  const response = await fetch(`${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error('Unable to load OIDC discovery document');
  const config = await response.json();
  discoveryCache = { ...config, issuer, expiresAt: Date.now() + 60 * 60 * 1000 };
  return discoveryCache;
}

async function jwksForIssuer() {
  const doc = await discovery();
  const response = await fetch(doc.jwks_uri);
  if (!response.ok) throw new Error('Unable to load OIDC JWKS');
  return response.json();
}

function toIsoFromSeconds(seconds) {
  return new Date(seconds * 1000).toISOString();
}

function verifyJwt(jwt, expectedNonce) {
  const [headPart, payloadPart, signaturePart] = String(jwt).split('.');
  if (!headPart || !payloadPart || !signaturePart) throw new Error('Invalid token');
  const header = JSON.parse(Buffer.from(headPart, 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  if (header.alg !== 'RS256' && header.alg !== 'PS256' && header.alg !== 'ES256') throw new Error(`Unsupported JWS algorithm: ${header.alg}`);
  if (payload.iss !== env('OPSTRAX_OIDC_ISSUER')) throw new Error('Invalid issuer');
  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audience.includes(env('OPSTRAX_OIDC_CLIENT_ID'))) throw new Error('Invalid audience');
  if (payload.exp && Date.now() / 1000 >= payload.exp) throw new Error('Token expired');
  if (expectedNonce && payload.nonce !== expectedNonce) throw new Error('Invalid nonce');
  return jwksForIssuer().then(async (jwks) => {
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
    execute('DELETE FROM auth_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL', [now]);
  });
}

export function authMode() {
  return mode();
}

export function authEnabled() {
  return isOidcEnabled();
}

export function getSessionCookie(headers) {
  return parseCookies(headers.cookie || headers.Cookie || '')[AUTH_COOKIE] || '';
}

export function readSession(headers) {
  if (!isOidcEnabled() && !isLocalDemoEnabled()) return null;
  cleanupExpired();
  const sessionId = getSessionCookie(headers);
  if (!sessionId) return null;
  const session = selectOne(
    `SELECT s.*, u.name AS user_name, u.email AS user_email, u.role_key, u.department_id, u.facility_id, u.active
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?`,
    [sessionId, nowIso()]
  );
  if (!session || !session.active) return null;
  return session;
}

export function requireCsrf(headers, session) {
  if (!isOidcEnabled() && String(session?.provider || '') !== 'demo') return;
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

export async function getLoginUrl(headers, returnTo = '/') {
  const issuer = env('OPSTRAX_OIDC_ISSUER');
  if (!issuer) {
    const error = new Error('OIDC is not configured');
    error.status = 503;
    throw error;
  }
  const state = randomToken(24);
  const nonce = randomToken(24);
  const codeVerifier = randomToken(32);
  const codeChallenge = sha256Base64url(codeVerifier);
  const redirectUri = authRedirectUri(headers);
  transaction(() => {
    insert('auth_login_requests', {
      state,
      code_verifier: codeVerifier,
      return_to: returnTo || '/',
      nonce,
      expires_at: toIsoFromSeconds((Date.now() + AUTH_REQUEST_TTL_MS) / 1000)
    });
  });
  const url = new URL((await discovery()).authorization_endpoint);
  url.searchParams.set('client_id', env('OPSTRAX_OIDC_CLIENT_ID'));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', env('OPSTRAX_OIDC_SCOPES', 'openid profile email'));
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export async function completeLogin(headers, query) {
  const issuer = env('OPSTRAX_OIDC_ISSUER');
  if (!issuer) {
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
  const request = selectOne('SELECT * FROM auth_login_requests WHERE state = ? AND expires_at > ?', [state, nowIso()]);
  if (!request) {
    const error = new Error('Login request expired or invalid');
    error.status = 400;
    throw error;
  }
  const doc = await discovery();
  const tokenResponse = await fetch(doc.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: env('OPSTRAX_OIDC_CLIENT_ID'),
      client_secret: env('OPSTRAX_OIDC_CLIENT_SECRET'),
      redirect_uri: authRedirectUri(headers),
      code_verifier: request.code_verifier
    })
  });
  if (!tokenResponse.ok) {
    const error = new Error('OIDC token exchange failed');
    error.status = 502;
    throw error;
  }
  const tokenSet = await tokenResponse.json();
  const claims = await verifyJwt(tokenSet.id_token, request.nonce);
  const email = String(claims.email || claims.preferred_username || '').toLowerCase();
  if (!email) {
    const error = new Error('OIDC identity did not include an email address');
    error.status = 403;
    throw error;
  }
  const displayName = String(claims.name || claims.given_name || email).trim();
  const provider = issuer;
  let identity = selectOne('SELECT * FROM auth_identities WHERE provider = ? AND subject = ?', [provider, String(claims.sub)]);
  if (!identity) {
    const user = selectOne('SELECT * FROM users WHERE lower(email) = ? AND active = 1 ORDER BY tenant_id LIMIT 1', [email]);
    if (!user) {
      const error = new Error('No matching tenant user is mapped to this identity');
      error.status = 403;
      throw error;
    }
    identity = {
      id: newId('identity'),
      tenant_id: user.tenant_id,
      user_id: user.id
    };
    insert('auth_identities', {
      id: identity.id,
      tenant_id: user.tenant_id,
      user_id: user.id,
      provider,
      subject: String(claims.sub),
      email,
      display_name: displayName,
      last_login_at: nowIso()
    });
  } else {
    execute('UPDATE auth_identities SET email = ?, display_name = ?, last_login_at = ? WHERE id = ?', [email, displayName, nowIso(), identity.id]);
  }
  const csrfToken = randomToken(24);
  const sessionId = randomToken(32);
  const sessionExpires = new Date(Date.now() + AUTH_SESSION_TTL_MS).toISOString();
  transaction(() => {
    insert('auth_sessions', {
      id: sessionId,
      tenant_id: identity.tenant_id,
      user_id: identity.user_id,
      provider,
      subject: String(claims.sub),
      email,
      display_name: displayName,
      csrf_token: csrfToken,
      user_agent: String(headers['user-agent'] || headers['User-Agent'] || ''),
      ip_address: String(headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-Ip'] || ''),
      expires_at: sessionExpires
    });
    execute('DELETE FROM auth_login_requests WHERE state = ?', [state]);
  });
  return {
    cookie: cookieHeader(AUTH_COOKIE, sessionId, { maxAge: AUTH_SESSION_TTL_MS / 1000, httpOnly: true, sameSite: 'Lax', secure: requestBaseUrl(headers).startsWith('https://') }),
    returnTo: request.return_to || '/',
    session: selectOne(
      `SELECT s.*, u.name AS user_name, u.role_key, u.department_id, u.facility_id
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [sessionId]
    ),
    csrfToken
  };
}

export function logoutSession(headers) {
  if (!isOidcEnabled() && !isLocalDemoEnabled()) return clearSessionCookie();
  const sessionId = getSessionCookie(headers);
  if (sessionId) {
    transaction(() => {
      execute('UPDATE auth_sessions SET revoked_at = ? WHERE id = ?', [nowIso(), sessionId]);
    });
  }
  return clearSessionCookie();
}

export function getAuthBootstrap() {
  return {
    mode: mode(),
    enabled: isOidcEnabled(),
    login_required: isOidcEnabled() || !isLocalDemoEnabled(),
    demo_login_enabled: isLocalDemoEnabled()
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
    cookie: cookieHeader(AUTH_COOKIE, sessionId, { maxAge: AUTH_SESSION_TTL_MS / 1000, httpOnly: true, sameSite: 'Lax', secure: requestBaseUrl(headers).startsWith('https://') }),
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
