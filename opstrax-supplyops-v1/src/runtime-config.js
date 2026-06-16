export function getDatabaseRuntimeSelection(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const requestedProvider = String(env.OPSTRAX_DB_PROVIDER || '').trim().toLowerCase();
  const defaultProvider = nodeEnv === 'production' ? 'postgres' : 'sqlite';
  const provider = requestedProvider || defaultProvider;
  return {
    provider: provider === 'postgres' ? 'postgres' : 'sqlite',
    nodeEnv,
    requestedProvider,
    databaseUrl: String(env.DATABASE_URL || env.OPSTRAX_DATABASE_URL || '').trim()
  };
}

export function getEvidenceStorageRuntimeSelection(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const mode = String(env.OPSTRAX_EVIDENCE_STORAGE || '').trim().toLowerCase() || (nodeEnv === 'production' ? 's3' : 'filesystem');
  return {
    mode: mode === 's3' ? 's3' : 'filesystem',
    bucket: String(env.OPSTRAX_EVIDENCE_BUCKET || '').trim(),
    region: String(env.OPSTRAX_EVIDENCE_REGION || env.AWS_REGION || '').trim(),
    signingSecret: String(env.OPSTRAX_EVIDENCE_SIGNING_SECRET || '').trim()
  };
}
