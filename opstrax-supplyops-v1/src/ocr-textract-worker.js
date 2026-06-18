/**
 * AWS Textract worker thread for invoice extraction.
 *
 * Runs in a Node.js worker thread so the main thread can call Textract
 * synchronously via the sync-rpc Atomics.wait bridge.
 *
 * SECURITY: credentials are read from workerData.config at thread startup
 * and are never echoed in responses, error messages, or logs.
 */
import { parentPort, workerData } from 'node:worker_threads';
import { createHmac, createHash } from 'node:crypto';
import { request as httpsRequest } from 'node:https';
import { writeSynchronousWorkerResponse } from './sync-rpc.js';

// workerData is null when this module is imported directly (e.g., for unit-testing normalizeTextractExpenseResult).
// All worker-thread-specific code is guarded by `if (parentPort)` at the bottom.
const controlBuffer = workerData?.controlBuffer ?? null;
const dataBuffer = workerData?.dataBuffer ?? null;

function sha256hex(data) {
  return createHash('sha256').update(data).digest('hex');
}

function hmacSha256(key, data) {
  return createHmac('sha256', Buffer.isBuffer(key) ? key : Buffer.from(key, 'utf8'))
    .update(data)
    .digest();
}

function buildSigningKey(secretKey, dateStamp, region) {
  const kDate    = hmacSha256(Buffer.from('AWS4' + secretKey, 'utf8'), dateStamp);
  const kRegion  = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, 'textract');
  return hmacSha256(kService, 'aws4_request');
}

/**
 * Build SigV4 authorization header for a Textract AnalyzeExpense POST request.
 * Returns { signedHeaders, authorization }.
 * Credentials are consumed here and never returned to the caller.
 */
function signTextractRequest(host, amzDate, bodyHash, cfg) {
  const dateStamp = amzDate.substring(0, 8);
  const region = cfg.region;

  const canonical_headers_obj = {
    'content-type': 'application/x-amz-json-1.1',
    'host': host,
    'x-amz-content-sha256': bodyHash,
    'x-amz-date': amzDate,
    'x-amz-target': 'Textract_20180601.AnalyzeExpense'
  };

  const sortedKeys = Object.keys(canonical_headers_obj).sort();
  const canonicalHeaders = sortedKeys.map((k) => `${k}:${canonical_headers_obj[k]}`).join('\n') + '\n';
  const signedHeaders = sortedKeys.join(';');

  const canonicalRequest = ['POST', '/', '', canonicalHeaders, signedHeaders, bodyHash].join('\n');

  const credentialScope = `${dateStamp}/${region}/textract/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256hex(canonicalRequest)].join('\n');

  const signingKey = buildSigningKey(cfg.secretKey, dateStamp, region);
  const signature = hmacSha256(signingKey, stringToSign).toString('hex');

  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKey}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ');

  return { signedHeaders: canonical_headers_obj, authorization };
}

/**
 * Normalize a raw Textract AnalyzeExpense response into OpsTrax proposed fields.
 * Confidence values are normalized from Textract's 0–100 scale to 0–1.
 * Exported for direct unit-testing without network calls.
 */
export function normalizeTextractExpenseResult(data, requestId = '') {
  const docs = data?.ExpenseDocuments;
  if (!docs || !docs.length) {
    return {
      provider_run_id: requestId || data?.ResponseMetadata?.RequestId || '',
      overall_confidence: 0,
      proposed_fields: {},
      status: 'COMPLETED',
      error: null
    };
  }

  const FIELD_MAP = {
    INVOICE_RECEIPT_ID: 'invoice_number',
    INVOICE_RECEIPT_DATE: 'invoice_date',
    ORDER_DATE: 'invoice_date',
    VENDOR_NAME: 'vendor_name',
    NAME: 'vendor_name',
    PO_NUMBER: 'po_number',
    SUBTOTAL: 'subtotal',
    TAX: 'tax',
    TOTAL: 'total',
    AMOUNT_DUE: 'total',
    DUE_DATE: 'due_date',
    PAYMENT_TERMS: 'payment_terms',
    CURRENCY: 'currency',
    ACCOUNT_NUMBER: 'account_number'
  };

  const doc = docs[0];
  const proposed_fields = {};
  let totalConf = 0;
  let confCount = 0;

  for (const field of doc.SummaryFields || []) {
    const destKey = FIELD_MAP[field.Type?.Text || ''];
    if (!destKey) continue;
    const rawValue = field.ValueDetection?.Text || '';
    const conf = (field.ValueDetection?.Confidence ?? 0) / 100; // 0–100 → 0–1
    // Keep the highest-confidence reading for duplicate mapped keys
    if (!(destKey in proposed_fields) || conf > proposed_fields[destKey].confidence) {
      proposed_fields[destKey] = { value: rawValue, confidence: conf };
    }
    totalConf += conf;
    confCount++;
  }

  // Coerce currency string values to numbers for standard invoice fields
  for (const key of ['subtotal', 'tax', 'total', 'amount_paid']) {
    if (proposed_fields[key]) {
      const n = parseFloat(String(proposed_fields[key].value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(n)) proposed_fields[key] = { ...proposed_fields[key], value: n };
    }
  }

  // Extract line items from LineItemGroups
  const lines = [];
  for (const group of doc.LineItemGroups || []) {
    for (const li of group.LineItems || []) {
      const line = { description: '', qty: 0, unit_price: 0, line_total: 0, sku_reference: null, confidence: 0 };
      let lc = 0;
      let ln = 0;
      for (const f of li.LineItemExpenseFields || []) {
        const t = f.Type?.Text || '';
        const v = f.ValueDetection?.Text || '';
        const c = (f.ValueDetection?.Confidence ?? 0) / 100;
        lc += c;
        ln++;
        if (t === 'ITEM') line.description = v;
        else if (t === 'QUANTITY') line.qty = parseFloat(v) || 0;
        else if (t === 'UNIT_PRICE') line.unit_price = parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
        else if (t === 'EXPENSE_ROW') line.line_total = parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
        else if (t === 'PRODUCT_CODE') line.sku_reference = v || null;
      }
      line.confidence = ln > 0 ? lc / ln : 0;
      lines.push(line);
    }
  }
  if (lines.length > 0) proposed_fields.lines = lines;

  return {
    provider_run_id: requestId || data?.ResponseMetadata?.RequestId || '',
    overall_confidence: confCount > 0 ? totalConf / confCount : 0,
    proposed_fields,
    status: 'COMPLETED',
    error: null
  };
}

async function analyzeExpense(payload) {
  const cfg = workerData.config || {};

  if (!cfg.accessKey || !cfg.secretKey || !cfg.region) {
    return {
      status: 'FAILED',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      error: 'AWS Textract is not configured. Provide OCR_ACCESS_KEY, OCR_SECRET_KEY, and OCR_REGION.'
    };
  }

  const host = `textract.${cfg.region}.amazonaws.com`;

  let documentBody;
  if (payload.documentBase64) {
    documentBody = { Bytes: payload.documentBase64 };
  } else if (payload.s3Bucket && payload.s3Key) {
    documentBody = { S3Object: { Bucket: payload.s3Bucket, Name: payload.s3Key } };
  } else {
    return {
      status: 'FAILED',
      provider_run_id: '',
      overall_confidence: 0,
      proposed_fields: {},
      error: 'No document provided for Textract extraction. Attach an evidence document to the invoice first.'
    };
  }

  const bodyBytes = Buffer.from(JSON.stringify({ Document: documentBody }), 'utf8');
  const bodyHash = sha256hex(bodyBytes);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const { signedHeaders, authorization } = signTextractRequest(host, amzDate, bodyHash, cfg);
  const timeoutMs = cfg.timeoutMs || 30000;

  return new Promise((resolve) => {
    let settled = false;
    const settle = (result) => {
      if (!settled) { settled = true; resolve(result); }
    };

    const req = httpsRequest(
      {
        hostname: host,
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
          ...signedHeaders,
          'Content-Length': bodyBytes.length,
          Authorization: authorization
        }
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          const requestId = res.headers['x-amzn-requestid'] || '';
          if (res.statusCode !== 200) {
            let errMsg = '';
            try {
              const parsed = JSON.parse(text);
              // Use __type (exception name) — never echo config or credential values
              errMsg = parsed.Message || parsed.message || parsed.__type || `HTTP ${res.statusCode}`;
            } catch {
              errMsg = `HTTP ${res.statusCode}`;
            }
            settle({
              status: 'FAILED',
              provider_run_id: requestId,
              overall_confidence: 0,
              proposed_fields: {},
              error: `AWS Textract: ${String(errMsg).substring(0, 200)}`
            });
          } else {
            try {
              const data = JSON.parse(text);
              const normalized = normalizeTextractExpenseResult(data, requestId);
              settle({ ...normalized, status: 'COMPLETED' });
            } catch {
              settle({
                status: 'FAILED',
                provider_run_id: requestId,
                overall_confidence: 0,
                proposed_fields: {},
                error: 'AWS Textract: response could not be parsed'
              });
            }
          }
        });
        res.on('error', (err) => {
          settle({
            status: 'FAILED',
            provider_run_id: '',
            overall_confidence: 0,
            proposed_fields: {},
            error: `AWS Textract response error: ${String(err.message).substring(0, 200)}`
          });
        });
      }
    );

    req.on('error', (err) => {
      settle({
        status: 'FAILED',
        provider_run_id: '',
        overall_confidence: 0,
        proposed_fields: {},
        error: `AWS Textract request error: ${String(err.message).substring(0, 200)}`
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      settle({
        status: 'FAILED',
        provider_run_id: '',
        overall_confidence: 0,
        proposed_fields: {},
        error: `AWS Textract request timed out after ${timeoutMs}ms`
      });
    });

    req.write(bodyBytes);
    req.end();
  });
}

if (parentPort) parentPort.on('message', async ({ method, payload }) => {
  try {
    let result;
    switch (method) {
      case 'init':
        result = {
          ok: true,
          configured: Boolean(
            workerData.config?.accessKey && workerData.config?.secretKey && workerData.config?.region
          )
        };
        break;
      case 'analyzeExpense':
        result = await analyzeExpense(payload || {});
        break;
      default:
        throw new Error(`Unknown OCR Textract worker method: ${method}`);
    }
    writeSynchronousWorkerResponse(controlBuffer, dataBuffer, result, { ok: true });
  } catch (error) {
    writeSynchronousWorkerResponse(
      controlBuffer,
      dataBuffer,
      { ok: false, message: error.message, status: error.status || 500, code: error.code || '' },
      { ok: false, status: 2 }
    );
  }
});
