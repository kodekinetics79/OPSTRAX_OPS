function pickEnv(env, ...names) {
  for (const name of names) {
    const value = env[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

export function getDatabaseRuntimeSelection(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const requestedProvider = pickEnv(env, 'DATABASE_PROVIDER', 'OPSTRAX_DB_PROVIDER').toLowerCase();
  const defaultProvider = nodeEnv === 'production' ? 'postgres' : 'sqlite';
  const provider = requestedProvider || defaultProvider;
  return {
    provider: provider === 'postgres' ? 'postgres' : 'sqlite',
    nodeEnv,
    requestedProvider,
    databaseUrl: pickEnv(env, 'DATABASE_URL', 'OPSTRAX_DATABASE_URL')
  };
}

export function getTenantOidcRuntimeSelection(env = process.env) {
  return {
    issuer: pickEnv(env, 'OIDC_ISSUER', 'OPSTRAX_OIDC_ISSUER'),
    clientId: pickEnv(env, 'OIDC_CLIENT_ID', 'OPSTRAX_OIDC_CLIENT_ID'),
    clientSecret: pickEnv(env, 'OIDC_CLIENT_SECRET', 'OPSTRAX_OIDC_CLIENT_SECRET'),
    redirectUri: pickEnv(env, 'OIDC_REDIRECT_URI', 'OPSTRAX_OIDC_REDIRECT_URI'),
    logoutRedirectUri: pickEnv(env, 'OIDC_LOGOUT_REDIRECT_URI', 'OPSTRAX_OIDC_LOGOUT_REDIRECT_URI'),
    scopes: pickEnv(env, 'OIDC_SCOPES', 'OPSTRAX_OIDC_SCOPES') || 'openid profile email',
    baseUrl: pickEnv(env, 'APP_BASE_URL', 'OPSTRAX_BASE_URL'),
    mode: pickEnv(env, 'AUTH_MODE', 'OPSTRAX_AUTH_MODE').toLowerCase()
  };
}

export function getPlatformOidcRuntimeSelection(env = process.env) {
  return {
    issuer: pickEnv(env, 'PLATFORM_OIDC_ISSUER', 'OPSTRAX_PLATFORM_OIDC_ISSUER'),
    clientId: pickEnv(env, 'PLATFORM_OIDC_CLIENT_ID', 'OPSTRAX_PLATFORM_OIDC_CLIENT_ID'),
    clientSecret: pickEnv(env, 'PLATFORM_OIDC_CLIENT_SECRET', 'OPSTRAX_PLATFORM_OIDC_CLIENT_SECRET'),
    redirectUri: pickEnv(env, 'PLATFORM_OIDC_REDIRECT_URI', 'OPSTRAX_PLATFORM_OIDC_REDIRECT_URI'),
    logoutRedirectUri: pickEnv(env, 'PLATFORM_OIDC_LOGOUT_REDIRECT_URI', 'OPSTRAX_PLATFORM_OIDC_LOGOUT_REDIRECT_URI'),
    scopes: pickEnv(env, 'PLATFORM_OIDC_SCOPES', 'OPSTRAX_PLATFORM_OIDC_SCOPES') || 'openid profile email',
    baseUrl: pickEnv(env, 'PLATFORM_BASE_URL', 'APP_BASE_URL', 'OPSTRAX_PLATFORM_BASE_URL', 'OPSTRAX_BASE_URL'),
    mode: pickEnv(env, 'PLATFORM_AUTH_MODE', 'OPSTRAX_PLATFORM_AUTH_MODE').toLowerCase()
  };
}

export function getSessionRuntimeSelection(env = process.env) {
  return {
    tenantSecret: pickEnv(env, 'SESSION_SECRET', 'OPSTRAX_SESSION_SECRET'),
    platformSecret: pickEnv(env, 'PLATFORM_SESSION_SECRET', 'OPSTRAX_PLATFORM_SESSION_SECRET'),
    cookieSecure: pickEnv(env, 'COOKIE_SECURE', 'OPSTRAX_COOKIE_SECURE').toLowerCase(),
    cookieSameSite: pickEnv(env, 'COOKIE_SAME_SITE', 'OPSTRAX_COOKIE_SAME_SITE').toLowerCase()
  };
}

export function getEvidenceStorageRuntimeSelection(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const mode = pickEnv(env, 'EVIDENCE_STORAGE_PROVIDER', 'OPSTRAX_EVIDENCE_STORAGE').toLowerCase() || (nodeEnv === 'production' ? 's3' : 'filesystem');
  return {
    mode: mode === 's3' ? 's3' : 'filesystem',
    bucket: pickEnv(env, 'S3_BUCKET', 'OPSTRAX_EVIDENCE_BUCKET'),
    region: pickEnv(env, 'S3_REGION', 'OPSTRAX_EVIDENCE_REGION', 'AWS_REGION'),
    endpoint: pickEnv(env, 'S3_ENDPOINT', 'OPSTRAX_EVIDENCE_ENDPOINT'),
    accessKeyId: pickEnv(env, 'S3_ACCESS_KEY_ID', 'OPSTRAX_EVIDENCE_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID'),
    secretAccessKey: pickEnv(env, 'S3_SECRET_ACCESS_KEY', 'OPSTRAX_EVIDENCE_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY'),
    sessionToken: pickEnv(env, 'S3_SESSION_TOKEN', 'OPSTRAX_EVIDENCE_SESSION_TOKEN', 'AWS_SESSION_TOKEN'),
    forcePathStyle: pickEnv(env, 'S3_FORCE_PATH_STYLE', 'OPSTRAX_EVIDENCE_FORCE_PATH_STYLE').toLowerCase(),
    signingSecret: pickEnv(env, 'EVIDENCE_SIGNING_SECRET', 'OPSTRAX_EVIDENCE_SIGNING_SECRET')
  };
}

export function getOcrRuntimeSelection(env = process.env) {
  const provider = pickEnv(env, 'OCR_PROVIDER').toLowerCase() || 'local';
  return {
    provider,
    region: pickEnv(env, 'OCR_REGION'),
    endpoint: pickEnv(env, 'OCR_ENDPOINT'),
    modelId: pickEnv(env, 'OCR_MODEL_ID'),
    timeoutMs: Number(pickEnv(env, 'OCR_TIMEOUT_MS') || '30000'),
    maxPages: Number(pickEnv(env, 'OCR_MAX_PAGES') || '20'),
    confidenceThreshold: Number(pickEnv(env, 'OCR_CONFIDENCE_THRESHOLD') || '0.7'),
    required: pickEnv(env, 'OCR_REQUIRED').toLowerCase() === 'true',
    hasCredentials: Boolean(pickEnv(env, 'OCR_ACCESS_KEY') || pickEnv(env, 'OCR_SECRET_KEY'))
  };
}
