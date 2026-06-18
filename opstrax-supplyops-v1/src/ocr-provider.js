/**
 * OCR provider abstraction for invoice/document extraction.
 *
 * Supported providers (OCR_PROVIDER env var):
 *   local                       — deterministic local extractor (default, no credentials required)
 *   aws_textract                — AWS Textract via SigV4 HTTPS (requires OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION)
 *   azure_document_intelligence — Azure Document Intelligence REST API (requires OCR_ENDPOINT, OCR_ACCESS_KEY, OCR_MODEL_ID)
 *   google_document_ai          — Google Document AI REST API (requires OCR_ENDPOINT, OCR_ACCESS_KEY, OCR_MODEL_ID)
 *
 * Provider status values returned to callers:
 *   LOCAL          — local deterministic extractor active (tests/demo)
 *   NOT_CONFIGURED — external provider selected but required credentials/config absent
 *   CONFIGURED     — external provider selected and all required config is present
 *   ERROR          — provider was called but returned an error
 *
 * OCR_REQUIRED=true will cause runStartupOcrCheck() to fail if provider is not configured.
 * Do NOT set OCR_REQUIRED=true without providing credentials.
 *
 * Secrets are NEVER returned to callers — getOcrProviderStatus() deliberately omits them.
 *
 * AWS Textract calls run in a worker thread via the sync-rpc bridge so they can be called
 * from within synchronous SQLite transactions on the main thread (same pattern as S3 evidence storage).
 */

import { createSynchronousWorkerBridge } from './sync-rpc.js';

// Lazy singleton — created on first Textract call, never recreated (config is stable at runtime).
// The bridge is keyed to the config at creation time; restart the process to pick up new credentials.
let _textractBridge = null;
let _textractBridgeConfig = null;

function getTextractBridge(config) {
  const configKey = `${config.region}|${config.accessKey}|${config.secretKey}`;
  if (!_textractBridge || _textractBridgeConfig !== configKey) {
    if (_textractBridge) {
      try { _textractBridge.close(); } catch { /* noop */ }
    }
    _textractBridge = createSynchronousWorkerBridge(
      new URL('./ocr-textract-worker.js', import.meta.url),
      {
        config: {
          region: config.region,
          accessKey: config.accessKey,
          secretKey: config.secretKey,
          timeoutMs: config.timeoutMs
        }
      }
    );
    _textractBridgeConfig = configKey;
  }
  return _textractBridge;
}

// Re-export the normalizer for direct unit-testing without a worker or network.
export { normalizeTextractExpenseResult } from './ocr-textract-worker.js';

function pickEnv(env, ...names) {
  for (const name of names) {
    const value = env[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

export function getOcrRuntimeConfig(env = process.env) {
  const provider = pickEnv(env, 'OCR_PROVIDER').toLowerCase() || 'local';
  return {
    provider,
    region: pickEnv(env, 'OCR_REGION'),
    endpoint: pickEnv(env, 'OCR_ENDPOINT'),
    accessKey: pickEnv(env, 'OCR_ACCESS_KEY'),
    secretKey: pickEnv(env, 'OCR_SECRET_KEY'),
    modelId: pickEnv(env, 'OCR_MODEL_ID'),
    timeoutMs: Number(pickEnv(env, 'OCR_TIMEOUT_MS') || '30000'),
    maxPages: Number(pickEnv(env, 'OCR_MAX_PAGES') || '20'),
    confidenceThreshold: Number(pickEnv(env, 'OCR_CONFIDENCE_THRESHOLD') || '0.7'),
    required: pickEnv(env, 'OCR_REQUIRED').toLowerCase() === 'true'
  };
}

/**
 * Returns safe public status — NO secrets, keys, or endpoints that could leak credentials.
 */
export function getOcrProviderStatus(env = process.env) {
  const config = getOcrRuntimeConfig(env);
  if (config.provider === 'local') {
    return {
      provider: 'local',
      label: 'Local (Deterministic)',
      status: 'LOCAL',
      ready: true,
      message: 'Deterministic local extractor active. Produces proposed values for human review.',
      required: config.required
    };
  }
  const providerLabels = {
    aws_textract: 'AWS Textract',
    azure_document_intelligence: 'Azure Document Intelligence',
    google_document_ai: 'Google Document AI'
  };
  const label = providerLabels[config.provider] || config.provider;
  const missing = [];
  if (config.provider === 'aws_textract') {
    if (!config.accessKey) missing.push('OCR_ACCESS_KEY');
    if (!config.secretKey) missing.push('OCR_SECRET_KEY');
    if (!config.region) missing.push('OCR_REGION');
  } else if (config.provider === 'azure_document_intelligence') {
    if (!config.endpoint) missing.push('OCR_ENDPOINT');
    if (!config.accessKey) missing.push('OCR_ACCESS_KEY');
    if (!config.modelId) missing.push('OCR_MODEL_ID');
  } else if (config.provider === 'google_document_ai') {
    if (!config.endpoint) missing.push('OCR_ENDPOINT');
    if (!config.accessKey) missing.push('OCR_ACCESS_KEY');
    if (!config.modelId) missing.push('OCR_MODEL_ID');
  }
  if (missing.length > 0) {
    return {
      provider: config.provider,
      label,
      status: 'NOT_CONFIGURED',
      ready: false,
      message: `External OCR provider selected but required configuration is absent. Missing: ${missing.join(', ')}.`,
      required: config.required
    };
  }
  return {
    provider: config.provider,
    label,
    status: 'CONFIGURED',
    ready: true,
    message: `${label} is configured. Credentials present. Connect to provider before first production extraction.`,
    required: config.required
  };
}

/**
 * Startup check. Call from runStartupChecks() when OCR_REQUIRED=true.
 * Throws a fatal-style error if the provider is not ready when required.
 */
export function runStartupOcrCheck(env = process.env) {
  const status = getOcrProviderStatus(env);
  if (status.required && !status.ready) {
    throw new Error(
      `[startup] FATAL OCR_REQUIRED=true but OCR provider is not configured: ${status.message}`
    );
  }
  if (status.provider !== 'local') {
    process.stderr.write(
      `[startup] INFO  OCR provider = ${status.provider} status = ${status.status}\n`
    );
  }
}

/**
 * Deterministic local extraction from structured invoice data.
 * Produces proposed fields with high confidence — used in local/test/demo mode.
 * Returns proposed values. Does NOT write to the database.
 */
export function extractWithLocal(invoiceData, lines = []) {
  const confidence = 0.97;
  const proposedLines = lines.map((line) => ({
    description: line.description || '',
    qty: line.qty ?? 0,
    unit_price: line.unit_price ?? 0,
    line_total: line.line_total ?? 0,
    sku_reference: line.sku || line.item_id || null,
    confidence
  }));
  return {
    provider: 'local',
    provider_run_id: `local-${Date.now()}`,
    overall_confidence: confidence,
    proposed_fields: {
      invoice_number: { value: invoiceData.invoice_number || '', confidence },
      invoice_date: { value: invoiceData.invoice_date || '', confidence },
      vendor_name: { value: invoiceData.vendor_name || '', confidence },
      po_number: { value: invoiceData.po_number || invoiceData.purchase_order_id || '', confidence },
      subtotal: { value: invoiceData.subtotal_amount ?? 0, confidence },
      tax: { value: invoiceData.tax_amount ?? 0, confidence },
      total: { value: invoiceData.total_amount ?? 0, confidence },
      lines: proposedLines
    },
    status: 'COMPLETED',
    error: null
  };
}

/**
 * AWS Textract extraction via native HTTPS + SigV4 (no SDK dependency).
 * Runs the actual HTTP call in a worker thread (sync-rpc bridge) so it can be
 * called synchronously from within a SQLite transaction on the main thread.
 *
 * documentRef must be one of:
 *   { documentBase64: '<base64-encoded PDF or image bytes>' }
 *   { s3Bucket: 'bucket', s3Key: 'path/to/invoice.pdf' }
 *   null (→ returns FAILED with actionable message)
 *
 * Returns the standard OpsTrax OCR result shape.
 * Credential values are NEVER included in any returned field.
 */
export function extractWithAwsTextract(config, documentRef) {
  if (!config.accessKey || !config.secretKey || !config.region) {
    return Promise.resolve({
      provider: 'aws_textract',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'FAILED',
      error: 'AWS Textract is not configured. Provide OCR_ACCESS_KEY, OCR_SECRET_KEY, and OCR_REGION.'
    });
  }
  try {
    const bridge = getTextractBridge(config);
    const payload = {};
    if (documentRef?.documentBase64) payload.documentBase64 = documentRef.documentBase64;
    else if (documentRef?.s3Bucket) { payload.s3Bucket = documentRef.s3Bucket; payload.s3Key = documentRef.s3Key; }
    const result = bridge.request('analyzeExpense', payload);
    return Promise.resolve({
      provider: 'aws_textract',
      provider_run_id: result.provider_run_id || '',
      overall_confidence: result.overall_confidence ?? 0,
      proposed_fields: result.proposed_fields || {},
      status: result.status || 'FAILED',
      error: result.error || null
    });
  } catch (err) {
    return Promise.resolve({
      provider: 'aws_textract',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'FAILED',
      error: `AWS Textract: ${String(err.message || '').substring(0, 200)}`
    });
  }
}

/**
 * Azure Document Intelligence REST extraction.
 * Returns structured result; will return status=FAILED with safe error if config is absent.
 */
export async function extractWithAzureDocumentIntelligence(config, documentRef) {
  if (!config.endpoint || !config.accessKey || !config.modelId) {
    return {
      provider: 'azure_document_intelligence',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'FAILED',
      error: 'Azure Document Intelligence is not configured: OCR_ENDPOINT, OCR_ACCESS_KEY, and OCR_MODEL_ID are required.'
    };
  }
  try {
    const analyzeUrl = `${config.endpoint}/documentintelligence/documentModels/${config.modelId}:analyze?api-version=2024-11-30`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs || 30000);
    const response = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.accessKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ urlSource: documentRef }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) {
      const errorText = (await response.text()).substring(0, 200);
      return {
        provider: 'azure_document_intelligence',
        provider_run_id: '',
        overall_confidence: 0,
        proposed_fields: {},
        status: 'FAILED',
        error: `Azure DI returned ${response.status}: ${errorText}`
      };
    }
    const operationLocation = response.headers.get('operation-location') || '';
    return {
      provider: 'azure_document_intelligence',
      provider_run_id: operationLocation.split('/').pop() || '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'PENDING',
      error: null,
      _operationLocation: operationLocation
    };
  } catch (err) {
    return {
      provider: 'azure_document_intelligence',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'FAILED',
      error: `Azure DI error: ${String(err.message || err).substring(0, 200)}`
    };
  }
}

/**
 * Google Document AI REST extraction.
 * Returns structured result; will return status=FAILED with safe error if config is absent.
 */
export async function extractWithGoogleDocumentAI(config, documentRef) {
  if (!config.endpoint || !config.accessKey || !config.modelId) {
    return {
      provider: 'google_document_ai',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'FAILED',
      error: 'Google Document AI is not configured: OCR_ENDPOINT, OCR_ACCESS_KEY, and OCR_MODEL_ID are required.'
    };
  }
  try {
    const processUrl = `${config.endpoint}/v1/${config.modelId}:process`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs || 30000);
    const response = await fetch(processUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rawDocument: { content: documentRef, mimeType: 'application/pdf' } }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) {
      const errorText = (await response.text()).substring(0, 200);
      return {
        provider: 'google_document_ai',
        provider_run_id: '',
        overall_confidence: 0,
        proposed_fields: {},
        status: 'FAILED',
        error: `Google Document AI returned ${response.status}: ${errorText}`
      };
    }
    const data = await response.json();
    return normalizeGoogleDocumentAIResult(data);
  } catch (err) {
    return {
      provider: 'google_document_ai',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'FAILED',
      error: `Google Document AI error: ${String(err.message || err).substring(0, 200)}`
    };
  }
}

function normalizeGoogleDocumentAIResult(data) {
  const doc = data?.document;
  const entities = doc?.entities || [];
  const proposed_fields = {};
  let totalConf = 0, confCount = 0;
  for (const entity of entities) {
    const key = (entity.type || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const value = entity.mentionText || '';
    const conf = entity.confidence ?? 0;
    proposed_fields[key] = { value, confidence: conf };
    totalConf += conf;
    confCount++;
  }
  return {
    provider: 'google_document_ai',
    provider_run_id: data?.humanReviewStatus?.state || '',
    overall_confidence: confCount > 0 ? totalConf / confCount : 0,
    proposed_fields,
    status: 'COMPLETED',
    error: null
  };
}

/**
 * Main dispatcher — calls the correct provider based on config.
 * Synchronous for local; async for external providers.
 * Returns the same shape regardless of provider.
 */
export function extractWithProvider(config, invoiceData, lines = [], documentRef = null) {
  if (config.provider === 'local' || !config.provider) {
    return Promise.resolve(extractWithLocal(invoiceData, lines));
  }
  if (config.provider === 'aws_textract') {
    return extractWithAwsTextract(config, documentRef);
  }
  if (config.provider === 'azure_document_intelligence') {
    return extractWithAzureDocumentIntelligence(config, documentRef);
  }
  if (config.provider === 'google_document_ai') {
    return extractWithGoogleDocumentAI(config, documentRef);
  }
  return Promise.resolve({
    provider: config.provider,
    provider_run_id: '',
    overall_confidence: 0,
    proposed_fields: {},
    status: 'FAILED',
    error: `Unknown OCR provider: ${config.provider}. Supported: local, aws_textract, azure_document_intelligence, google_document_ai.`
  });
}
