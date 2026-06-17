import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSynchronousWorkerBridge } from './sync-rpc.js';
import { getEvidenceStorageRuntimeSelection } from './runtime-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(__dirname);
const evidenceDir = join(rootDir, 'data', 'evidence');
mkdirSync(evidenceDir, { recursive: true });

function storageMode() {
  return getEvidenceStorageRuntimeSelection().mode;
}

function storageConfig() {
  const runtime = getEvidenceStorageRuntimeSelection();
  return {
    bucket: runtime.bucket,
    region: runtime.region,
    endpoint: runtime.endpoint,
    accessKeyId: runtime.accessKeyId,
    secretAccessKey: runtime.secretAccessKey,
    sessionToken: runtime.sessionToken,
    forcePathStyle: String(runtime.forcePathStyle || '').toLowerCase() === 'true',
    signingSecret: runtime.signingSecret
  };
}

function isStorageConfigured(mode = storageMode()) {
  if (mode === 'filesystem') return true;
  const cfg = storageConfig();
  return Boolean(cfg.bucket && cfg.region);
}

function makeS3Bridge() {
  const cfg = storageConfig();
  if (!cfg.bucket || !cfg.region) {
    throw new Error('Object storage is not configured.');
  }
  const bridge = createSynchronousWorkerBridge(new URL('./evidence-storage-worker.js', import.meta.url), {
    config: cfg
  });
  bridge.request('init', {});
  return bridge;
}

let s3Bridge = null;
function getS3Bridge() {
  if (!s3Bridge) s3Bridge = makeS3Bridge();
  return s3Bridge;
}

function safeName(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export function getEvidenceStorageInfo() {
  const mode = storageMode();
  return {
    mode,
    configured: isStorageConfigured(mode),
    ...(mode === 'filesystem'
      ? { provider: 'filesystem', bucket: null }
      : { provider: 's3', bucket: storageConfig().bucket || null, region: storageConfig().region || null })
  };
}

export function evidenceStorageIsConfigured() {
  return isStorageConfigured();
}

export function ensureEvidenceStorageConfigured() {
  const info = getEvidenceStorageInfo();
  if (!info.configured) {
    const err = new Error('CONFIGURATION_REQUIRED: evidence object storage is not configured');
    err.status = 503;
    err.code = 'CONFIGURATION_REQUIRED';
    throw err;
  }
  return info;
}

export function probeEvidenceStorage() {
  const info = getEvidenceStorageInfo();
  if (!info.configured) {
    const err = new Error('CONFIGURATION_REQUIRED: evidence object storage is not configured');
    err.status = 503;
    err.code = 'CONFIGURATION_REQUIRED';
    throw err;
  }
  if (info.mode === 'filesystem') {
    return { ok: true, provider: 'filesystem', configured: true, reachable: true };
  }
  const result = getS3Bridge().request('ping', {});
  return { ok: true, provider: 's3', configured: true, reachable: true, bucket: result.bucket || info.bucket || null };
}

export function writeEvidenceBinary({ storageMode: requestedMode, storageKey, storedFileName, contentBase64, fileName, mimeType, storePlaceholder = true }) {
  const mode = requestedMode || storageMode();
  const payload = contentBase64 ? String(contentBase64).includes('base64,') ? String(contentBase64).split('base64,')[1] : String(contentBase64) : '';
  if (mode === 'filesystem') {
    const name = storedFileName || `${storageKey || fileName}_${safeName(fileName)}`;
    const filePath = join(evidenceDir, name);
    if (payload) {
      writeFileSync(filePath, Buffer.from(payload, 'base64'));
    } else if (storePlaceholder) {
      writeFileSync(filePath, Buffer.from(`Evidence placeholder for ${fileName}\n`, 'utf8'));
    }
    return { storageMode: 'filesystem', storageKey: name, storedFileName: name, contentLength: existsSync(filePath) ? readFileSync(filePath).length : 0 };
  }
  ensureEvidenceStorageConfigured();
  const key = storageKey || `tenant/${safeName(String(process.env.OPSTRAX_TENANT_SLUG || 'tenant'))}/${safeName(fileName)}_${Date.now().toString(36)}`;
  const result = getS3Bridge().request('put', {
    key,
    contentBase64: payload || (storePlaceholder ? Buffer.from(`Evidence placeholder for ${fileName}\n`, 'utf8').toString('base64') : ''),
    mimeType: mimeType || 'application/octet-stream',
    metadata: { file_name: fileName }
  });
  return { storageMode: 's3', storageKey: key, storedFileName: '', contentLength: result.size || 0 };
}

export function readEvidenceBinary({ storageMode: requestedMode, storageKey, storedFileName, fileName }) {
  const mode = requestedMode || storageMode();
  if (mode === 'filesystem') {
    const filePath = join(evidenceDir, storedFileName || storageKey || `${safeName(fileName)}`);
    if (!existsSync(filePath)) {
      const err = new Error('OBJECT_NOT_FOUND: evidence file missing from local storage');
      err.status = 404;
      err.code = 'OBJECT_NOT_FOUND';
      throw err;
    }
    return {
      content: readFileSync(filePath),
      mimeType: 'application/octet-stream'
    };
  }
  ensureEvidenceStorageConfigured();
  if (!storageKey) {
    const err = new Error('OBJECT_NOT_FOUND: evidence storage key missing');
    err.status = 404;
    err.code = 'OBJECT_NOT_FOUND';
    throw err;
  }
  try {
    const result = getS3Bridge().request('get', { key: storageKey });
    return {
      content: Buffer.from(result.contentBase64, 'base64'),
      mimeType: result.contentType || 'application/octet-stream'
    };
  } catch (error) {
    if (String(error.code || '').includes('NoSuchKey') || /not found/i.test(error.message)) {
      const notFound = new Error('OBJECT_NOT_FOUND: evidence file missing from object storage');
      notFound.status = 404;
      notFound.code = 'OBJECT_NOT_FOUND';
      throw notFound;
    }
    throw error;
  }
}

export function evidenceStorageStatus() {
  const info = getEvidenceStorageInfo();
  return {
    provider: info.provider,
    mode: info.mode,
    status: info.configured ? (info.mode === 'filesystem' ? 'LOCAL_ONLY' : 'CONFIGURED') : 'CONFIGURATION_REQUIRED',
    bucket: info.bucket || null,
    region: info.region || null
  };
}
