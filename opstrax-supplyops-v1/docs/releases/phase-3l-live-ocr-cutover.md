# Phase 3L — Live OCR Provider Cutover (AWS Textract)

## Overview

Phase 3L connects the AWS Textract OCR provider to OpsTrax invoice extraction using a native Node.js implementation. No third-party SDK is required. Authentication uses AWS Signature Version 4 (SigV4) built from Node.js `node:crypto` and `node:https`. The implementation runs in a worker thread via the existing sync-rpc bridge pattern so Textract calls can be made synchronously from within SQLite transactions on the main thread.

## What ships

### `src/ocr-textract-worker.js` (new)

- AWS SigV4 signing implemented using `node:crypto` (`createHmac`, `createHash`)
- Textract `AnalyzeExpense` API call over native `node:https`
- `normalizeTextractExpenseResult()` — maps Textract response to OpsTrax proposed fields:
  - `INVOICE_RECEIPT_ID` → `invoice_number`
  - `INVOICE_RECEIPT_DATE` / `ORDER_DATE` → `invoice_date`
  - `VENDOR_NAME` / `NAME` → `vendor_name`
  - `PO_NUMBER` → `po_number`
  - `SUBTOTAL`, `TAX`, `TOTAL`, `AMOUNT_DUE` → numeric fields
  - `DUE_DATE`, `PAYMENT_TERMS`, `CURRENCY`, `ACCOUNT_NUMBER` → metadata fields
  - `LineItemGroups` → `lines[]` array with description, qty, unit_price, line_total, sku_reference
- Confidence normalized from Textract's 0–100 scale to OpsTrax 0–1 scale
- Duplicate mapped keys resolved by keeping the highest-confidence reading
- `provider_run_id` set from `x-amzn-requestid` response header or `ResponseMetadata.RequestId`
- Timeout enforced via `req.setTimeout(timeoutMs)` — never hangs indefinitely
- **No credential values ever appear in responses, error messages, or logs**

### `src/ocr-provider.js` (updated)

- `extractWithAwsTextract()` now uses the sync worker bridge (replaces placeholder stub)
- Lazy-initialized singleton bridge — worker thread created on first Textract call
- Bridge keyed to config — recreated automatically if credentials change at runtime
- `normalizeTextractExpenseResult` re-exported for direct unit testing

### Migration 028 (`db/migrations/028_ocr_evidence_id.sql`)

Adds `evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL` to `invoice_extraction_runs`. Links each extraction run to the evidence document that was submitted to OCR. Enables the audit trail to show exactly which file was passed to Textract.

### Updated `extractVendorInvoice` (`src/services.js`)

Phase 3L restructures extraction into three phases:

**Phase 1 (before transaction):**
- Looks up evidence documents linked to the invoice via `evidence_links`
- Prefers PDF or image MIME types; falls back to most-recent linked document
- Reads document bytes (filesystem) or constructs S3Object reference (S3 mode)
- Calls `extractWithProvider()` via the sync worker bridge — this is the actual Textract HTTP call

**Phase 2 (also before transaction):**
- If provider NOT_CONFIGURED → preflight result = FAILED with safe error message
- If provider CONFIGURED but no evidence document → FAILED with actionable message
- If CONFIGURED + document → real Textract call; result captured before SQLite write

**Phase 3 (inside transaction):**
- Writes extraction run with all results from preflight
- Records `evidence_document_id` for audit
- Updates invoice status (EXTRACTED for success, EXTRACTION_PENDING for failure/pending)
- Creates `EXTRACT_VENDOR_INVOICE` audit log entry

### `scripts/verify-ocr.mjs` (updated)

- Added `--probe` flag for live AWS Textract connectivity test
- Probe sends a signed `AnalyzeExpense` request with a 1-byte dummy document
- A `400 InvalidParameterException` response confirms: endpoint reachable, credentials accepted
- A `403 UnrecognizedClientException` indicates invalid credentials
- Network errors indicate connectivity or firewall issues
- Credentials are never printed — probe uses signing internally only

## Provider configuration

```
OCR_PROVIDER=aws_textract
OCR_ACCESS_KEY=<IAM access key ID>        # stored in secret manager
OCR_SECRET_KEY=<IAM secret access key>    # stored in secret manager
OCR_REGION=us-east-1                      # or your preferred region
OCR_TIMEOUT_MS=30000                      # default 30s
OCR_CONFIDENCE_THRESHOLD=0.7             # fields below this are flagged for review
OCR_REQUIRED=true                         # startup fails if provider not configured
```

### IAM permissions required

The IAM identity used by `OCR_ACCESS_KEY` / `OCR_SECRET_KEY` must have:

```json
{
  "Effect": "Allow",
  "Action": ["textract:AnalyzeExpense"],
  "Resource": "*"
}
```

For S3-backed extraction (when evidence is stored in S3):

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::<evidence-bucket>/*"
}
```

## Security posture

- Credentials are read into the worker thread's `workerData` at bridge creation time
- Worker thread is in-process (same process, different thread) — no IPC serialization to disk
- Credentials are NEVER interpolated into error messages, log lines, or API responses
- `normalizeTextractExpenseResult` is the only output path — it maps field names, never credential values
- Error messages are truncated to 200 characters — no raw provider response bleed-through
- `verify-ocr.mjs --probe` signs the probe internally but never prints signature, key, or secret

## Human review constraints (unchanged from Phase 3K)

- Every extraction run starts as `PENDING_REVIEW` regardless of confidence score
- Proposed values are stored in `proposed_fields_json` — NOT written back to the invoice fields
- `acceptOcrProposedFields` requires explicit human action and creates an audit log entry
- `rejectOcrExtraction` requires a non-empty reason and creates an audit log entry
- No auto-approval, auto-export, auto-matching, or auto-payment from OCR output
- Frontend shows. Backend decides. AI advises. Human approves. Audit records. Admin controls.

## Verdict

| Component | Status |
|---|---|
| AWS Textract adapter (SigV4 + HTTPS) | **Implemented** |
| Textract credential validation | **Live** — NOT_CONFIGURED → FAILED, missing creds → FAILED |
| Evidence document lookup | **Live** — filesystem + S3 both supported |
| Field normalization | **Live** — all standard invoice fields mapped |
| Line item extraction | **Live** — ITEM, QUANTITY, UNIT_PRICE, EXPENSE_ROW, PRODUCT_CODE |
| Human review gate | **Live** — PENDING_REVIEW required before any value is used |
| Audit trail | **Live** — evidence_document_id stored per run |
| `--probe` connectivity test | **Live** — SigV4-signed test call to Textract endpoint |
| Live extraction with real credentials | **Externally blocked** — OCR_ACCESS_KEY and OCR_SECRET_KEY required |
