#!/usr/bin/env node
/**
 * verify-ocr.mjs — validate OCR provider configuration and connectivity.
 *
 * Behavior:
 *   - If OCR_PROVIDER is not set or is 'local': reports NOT_CONFIGURED (external) and exits 0
 *   - If OCR_PROVIDER is set to an external provider and credentials are present: reports CONFIGURED
 *   - If OCR_PROVIDER is set but credentials are missing: reports NOT_CONFIGURED and exits 0
 *   - If OCR_REQUIRED=true and provider is not configured: exits 1 (hard failure)
 *   - NEVER prints secrets, credentials, keys, or tokens to stdout or stderr
 *
 * Exit codes:
 *   0 — OCR is local/not required, or is configured (may not yet be connected)
 *   1 — OCR_REQUIRED=true but provider is not configured, or a fatal error occurred
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
log('Note:      Run a test extraction against a real document to verify provider connectivity.');
log('Note:      Credentials are redacted — no secrets are printed by this script.');
log('Result:    OK (configured — connect and test before production go-live)');
process.exit(0);
