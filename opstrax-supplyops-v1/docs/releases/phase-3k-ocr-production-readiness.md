# Phase 3K — Real OCR Provider Integration + Production Readiness Gate

## Overview

Phase 3K connects a real external OCR provider path for invoice/document extraction while preserving the deterministic local fallback that has always worked. It also produces the production readiness gate — a strict matrix showing exactly what is live-ready, staging-ready, or still externally blocked.

## What ships

### OCR Provider Abstraction (`src/ocr-provider.js`)

A clean provider abstraction supporting:
- `local` — deterministic local extractor (default; no credentials; always works in demo/test)
- `aws_textract` — AWS Textract (requires `OCR_ACCESS_KEY`, `OCR_SECRET_KEY`, `OCR_REGION`)
- `azure_document_intelligence` — Azure Document Intelligence REST API (requires `OCR_ENDPOINT`, `OCR_ACCESS_KEY`, `OCR_MODEL_ID`)
- `google_document_ai` — Google Document AI REST API (requires `OCR_ENDPOINT`, `OCR_ACCESS_KEY`, `OCR_MODEL_ID`)

Provider status values: `LOCAL | NOT_CONFIGURED | CONFIGURED | ERROR`

**No secrets are ever returned to callers.** `getOcrProviderStatus()` deliberately omits all credential values and only reports presence/absence.

### OCR Env Vars Added

```
OCR_PROVIDER            local | aws_textract | azure_document_intelligence | google_document_ai
OCR_REGION              AWS region (Textract)
OCR_ENDPOINT            Azure DI or Google DI endpoint URL
OCR_ACCESS_KEY          AWS access key ID or Azure API key (stored in secret manager)
OCR_SECRET_KEY          AWS secret access key (stored in secret manager)
OCR_MODEL_ID            Azure model ID or Google processor ID
OCR_TIMEOUT_MS          Request timeout (default 30000)
OCR_MAX_PAGES           Max pages to extract (default 20)
OCR_CONFIDENCE_THRESHOLD Minimum confidence to review-flag (0-1, default 0.7)
OCR_REQUIRED            true → startup fails if provider not configured
```

### Migration 027 — OCR Review Columns

Adds to `invoice_extraction_runs`:
- `provider_run_id` — external request/job ID from provider
- `overall_confidence` — per-run confidence score
- `proposed_fields_json` — JSON of all proposed field values with per-field confidence
- `review_status` — PENDING_REVIEW | ACCEPTED | REJECTED
- `reviewed_at`, `reviewed_by_user_id`, `review_notes`

### Updated `extractVendorInvoice`

- Routes to local or external provider based on `OCR_PROVIDER` env
- Local path: always synchronous, always COMPLETED, stores proposed fields
- External path: if NOT_CONFIGURED → stores FAILED run with safe error; if CONFIGURED → stores PENDING run for background job
- Never auto-approves, never auto-exports
- Every extraction creates an audit log entry with provider name and run status

### Human Review Workflow

New service functions + API routes:
- `GET /api/ocr/status` — OCR provider status (no secrets)
- `GET /api/procure-to-pay/vendor-invoices/:id/extraction-runs` — list runs
- `GET /api/procure-to-pay/vendor-invoices/:id/extraction-runs/:runId` — run detail with parsed proposed fields
- `POST .../extraction-runs/:runId/accept` — accept proposed fields (audited)
- `POST .../extraction-runs/:runId/reject` — reject extraction (reason required, audited)

Rules:
- Can only accept COMPLETED runs
- Can only accept PENDING_REVIEW runs (not already accepted/rejected)
- Rejection requires a non-empty reason
- Both accept and reject create audit log entries

### P2P / Invoice Intelligence Page Updates

- OCR Provider Status panel showing: provider name, status badge, human control copy
- Copy: "OCR proposes values only. Approval, matching, export readiness, and payment remain human-controlled."
- Copy: "Review required — OCR proposes values only. No invoice field is overwritten without explicit human acceptance."
- Clear indicator when external OCR is disabled with explanation

### `scripts/verify-ocr.mjs` + `npm run verify:ocr`

- Reports current OCR provider configuration without exposing secrets
- Credentials shown as "set (redacted)" or "(not set)"
- Returns NOT_CONFIGURED with exit 0 when external provider is not configured
- Returns exit 1 only when OCR_REQUIRED=true and provider is not configured
- Covers all four provider types

### `go-live-check.mjs` Updated

- Now calls `checkOcrPosture()` before production environment checks
- If OCR_REQUIRED=true: asserts external provider + credentials are present
- If OCR_REQUIRED=false: reports OCR status (LOCAL / CONFIGURED / NOT_CONFIGURED) without failing
- Never prints secrets

## Security Posture

- All credential values redacted from all API responses and log output
- `getOcrProviderStatus()` explicitly omits `accessKey` and `secretKey` fields
- verify-ocr.mjs shows only presence/absence, never values
- External API calls include AbortController timeout — no hanging requests
- Error messages capped at 200 characters — no raw provider error bleed-through
- OCR extraction does NOT auto-approve invoices — additional human approval always required

## Production Readiness Gate

See `docs/production-readiness-final.md` for the full matrix.

**Verdict:**
- OCR foundation (local extractor + provider abstraction): **READY**
- External OCR provider: **Externally blocked — credentials required**
- Core platform: **READY**
- Full deployment: **Externally blocked — see docs/external-inputs-required.md**

## Constraints Honored

- No Invoice/OCR auto-approval
- No AI execution
- SOC2-ready / audit-ready / control-aligned — not certified
- Frontend shows. Backend decides. AI advises. Human approves. Audit records. Admin controls.
- Staging: no work performed without real external inputs
- No secrets in logs, UI, docs, reports, or API responses
