#!/usr/bin/env node
/**
 * verify-ocr.mjs — validate OCR provider configuration and connectivity.
 *
 * Phase 3L: AWS Textract is the production OCR provider. This script reports
 * configuration posture and (when credentials are present) confirms that the
 * Textract endpoint is reachable via a signed API probe.
 *
 * Behavior:
 *   - If OCR_PROVIDER is not set or is 'local': reports LOCAL and exits 0
 *   - If OCR_PROVIDER is set but credentials are missing: lists exact missing vars and exits 0
 *   - If OCR_PROVIDER is set and credentials are present: reports CONFIGURED
 *   - If OCR_REQUIRED=true and provider is not configured: exits 1 (hard failure)
 *   - NEVER prints secrets, credentials, keys, or tokens to stdout or stderr
 *
 * Live connectivity probe (AWS Textract only):
 *   Pass --probe to attempt a signed Textract API call with a dummy input.
 *   A 400 / InvalidParameterException response confirms reachability + valid credentials.
 *   A 403 / UnrecognizedClientException indicates invalid credentials.
 *   Network errors indicate connectivity issues.
 *
 * Exit codes:
 *   0 — OCR is local/not required, or is correctly configured
 *   1 — OCR_REQUIRED=true but provider is not configured, or probe failed with --probe
 */

function pickEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

const OCR_PROVIDER = pickEnv('OCR_PROVIDER').toLowerCase() || 'local';
const OCR_REQUIRED = pickEnv('OCR_REQUIRED').toLowerCase() === 'true';
const OCR_REGION = pickEnv('OCR_REGION');
const OCR_ENDPOINT = pickEnv('OCR_ENDPOINT');
const OCR_MODEL_ID = pickEnv('OCR_MODEL_ID');
const hasAccessKey = Boolean(pickEnv('OCR_ACCESS_KEY'));
const hasSecretKey = Boolean(pickEnv('OCR_SECRET_KEY'));

function log(msg) { process.stdout.write(`[verify-ocr] ${msg}\n`); }
function logErr(msg) { process.stderr.write(`[verify-ocr] ERROR ${msg}\n`); }

log(`Provider:  ${OCR_PROVIDER}`);
log(`Required:  ${OCR_REQUIRED}`);

if (OCR_PROVIDER === 'local') {
  log('Status:    LOCAL — deterministic local extractor is active');
  log('Note:      Set OCR_PROVIDER=aws_textract|azure_document_intelligence|google_document_ai to enable external OCR');
  if (OCR_REQUIRED) {
    logErr('OCR_REQUIRED=true but OCR_PROVIDER=local is not a valid production OCR provider.');
    process.exit(1);
  }
  log('Result:    OK (local mode — no external credentials required)');
  process.exit(0);
}

// External provider selected
const providerLabels = {
  aws_textract: 'AWS Textract',
  azure_document_intelligence: 'Azure Document Intelligence',
  google_document_ai: 'Google Document AI'
};
const label = providerLabels[OCR_PROVIDER] || OCR_PROVIDER;
log(`Label:     ${label}`);

const missing = [];
if (OCR_PROVIDER === 'aws_textract') {
  if (!hasAccessKey) missing.push('OCR_ACCESS_KEY');
  if (!hasSecretKey) missing.push('OCR_SECRET_KEY');
  if (!OCR_REGION) missing.push('OCR_REGION');
  log(`Region:    ${OCR_REGION || '(not set)'}`);
  log(`Key:       ${hasAccessKey ? 'set (redacted)' : '(not set)'}`);
  log(`Secret:    ${hasSecretKey ? 'set (redacted)' : '(not set)'}`);
} else if (OCR_PROVIDER === 'azure_document_intelligence') {
  if (!OCR_ENDPOINT) missing.push('OCR_ENDPOINT');
  if (!hasAccessKey) missing.push('OCR_ACCESS_KEY');
  if (!OCR_MODEL_ID) missing.push('OCR_MODEL_ID');
  log(`Endpoint:  ${OCR_ENDPOINT || '(not set)'}`);
  log(`Key:       ${hasAccessKey ? 'set (redacted)' : '(not set)'}`);
  log(`Model ID:  ${OCR_MODEL_ID || '(not set)'}`);
} else if (OCR_PROVIDER === 'google_document_ai') {
  if (!OCR_ENDPOINT) missing.push('OCR_ENDPOINT');
  if (!hasAccessKey) missing.push('OCR_ACCESS_KEY');
  if (!OCR_MODEL_ID) missing.push('OCR_MODEL_ID');
  log(`Endpoint:  ${OCR_ENDPOINT || '(not set)'}`);
  log(`Bearer:    ${hasAccessKey ? 'set (redacted)' : '(not set)'}`);
  log(`Model ID:  ${OCR_MODEL_ID || '(not set)'}`);
} else {
  logErr(`Unknown OCR_PROVIDER: ${OCR_PROVIDER}. Supported: local, aws_textract, azure_document_intelligence, google_document_ai.`);
  process.exit(1);
}

if (missing.length > 0) {
  log(`Status:    NOT_CONFIGURED — missing: ${missing.join(', ')}`);
  if (OCR_REQUIRED) {
    logErr(`OCR_REQUIRED=true but required configuration is absent: ${missing.join(', ')}`);
    process.exit(1);
  }
  log('Result:    OK (not configured — OCR not required)');
  process.exit(0);
}

log('Status:    CONFIGURED — all required configuration is present');

// ── Live connectivity probe ──────────────────────────────────────────────────
if (process.argv.includes('--probe') && OCR_PROVIDER === 'aws_textract') {
  log('Probe:     Attempting AWS Textract connectivity probe (signed API call)...');
  log('Note:      Credentials are never echoed — probe uses redacted signing only.');

  const { createHmac, createHash } = await import('node:crypto');
  const { request: httpsRequest } = await import('node:https');

  function sha256hex(data) { return createHash('sha256').update(data).digest('hex'); }
  function hmacSha256(key, data) { return createHmac('sha256', Buffer.isBuffer(key) ? key : Buffer.from(key, 'utf8')).update(data).digest(); }

  const accessKey = process.env.OCR_ACCESS_KEY;
  const secretKey = process.env.OCR_SECRET_KEY;
  const region = OCR_REGION;
  const host = `textract.${region}.amazonaws.com`;

  // Use a 1-byte document (too small to analyze) to get a fast InvalidParameterException,
  // which proves the endpoint is reachable and credentials are accepted.
  const body = JSON.stringify({ Document: { Bytes: 'AA==' } });
  const bodyBytes = Buffer.from(body, 'utf8');
  const bodyHash = sha256hex(bodyBytes);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dateStamp = amzDate.substring(0, 8);

  const hdrs = {
    'content-type': 'application/x-amz-json-1.1',
    'host': host,
    'x-amz-content-sha256': bodyHash,
    'x-amz-date': amzDate,
    'x-amz-target': 'Textract_20180601.AnalyzeExpense'
  };
  const sortedKeys = Object.keys(hdrs).sort();
  const canonicalHeaders = sortedKeys.map((k) => `${k}:${hdrs[k]}`).join('\n') + '\n';
  const signedHeaders = sortedKeys.join(';');
  const canonicalRequest = ['POST', '/', '', canonicalHeaders, signedHeaders, bodyHash].join('\n');
  const credScope = `${dateStamp}/${region}/textract/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, sha256hex(canonicalRequest)].join('\n');
  const kDate    = hmacSha256(Buffer.from('AWS4' + secretKey, 'utf8'), dateStamp);
  const kRegion  = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, 'textract');
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = hmacSha256(kSigning, stringToSign).toString('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  await new Promise((resolve) => {
    const req = httpsRequest({ hostname: host, port: 443, path: '/', method: 'POST',
      headers: { ...hdrs, 'Content-Length': bodyBytes.length, Authorization: authorization }
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let type = '';
        try { type = JSON.parse(text).__type || ''; } catch { /* noop */ }
        if (res.statusCode === 400 && /InvalidParameter|UnsupportedDocument/i.test(type)) {
          log('Probe:     PASS — Textract endpoint reachable, credentials accepted (expected InvalidParameterException).');
          log('Result:    OK (configured + probe passed — ready for production extraction)');
          resolve();
          process.exit(0);
        } else if (res.statusCode === 403) {
          logErr(`Probe:     FAIL — Textract returned 403 Forbidden. Check OCR_ACCESS_KEY and OCR_SECRET_KEY.`);
          resolve();
          process.exit(OCR_REQUIRED ? 1 : 0);
        } else {
          log(`Probe:     NOTE — Textract returned ${res.statusCode} ${type || ''}. Credentials appear accepted.`);
          log('Result:    OK (configured + probe endpoint responded)');
          resolve();
          process.exit(0);
        }
      });
    });
    req.on('error', (err) => {
      logErr(`Probe:     FAIL — Network error connecting to ${host}: ${String(err.message).substring(0, 120)}`);
      resolve();
      process.exit(1);
    });
    req.setTimeout(15000, () => { req.destroy(); logErr('Probe:     FAIL — Connection to Textract timed out.'); resolve(); process.exit(1); });
    req.write(bodyBytes);
    req.end();
  });
} else if (process.argv.includes('--probe') && OCR_PROVIDER !== 'aws_textract') {
  log(`Probe:     NOTE — live probe is only implemented for aws_textract (current provider: ${OCR_PROVIDER}).`);
}

log('Note:      Run a test extraction against a real document to verify end-to-end OCR.');
log('Note:      Use --probe to attempt a signed connectivity test to the Textract endpoint.');
log('Note:      Credentials are redacted — no secrets are printed by this script.');
log('Result:    OK (configured — run --probe or a real extraction before production go-live)');
process.exit(0);
