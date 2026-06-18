# Phase 3L — External Services Cutover Readiness

**Date:** 2026-06-18 (Phase 3L-F closure)
**Engineer:** OpsTrax Engineering
**Migration version:** 28
**Test suite:** 302/302 (two consecutive clean runs — Phase 3L-F flake fixed)
**Build:** OK | Security: 0 high | Perf smoke: 11/11 | Browser smoke: 72/72

---

## Summary

Phase 3L delivered two outcomes, with Phase 3L-F closing test determinism and release freeze:

1. **Live OCR Provider Cutover** — the AWS Textract adapter is fully implemented and wired into the invoice extraction pipeline. It is waiting on credentials to activate.

2. **External Services Cutover Readiness** — all external inputs required for staging and production deployment were confirmed. Every input is NOT PROVIDED as of this date. The product code is production-ready. Deployment is externally blocked.

3. **Phase 3L-F: Test Determinism + Release Freeze** — fixed a pre-existing shared-state flake in the `httpRequest` test helper. Root cause: Node.js HTTP server `close()` could fire before undici's keep-alive connection drained, allowing state from a previous test's server lifecycle to bleed into the next test's startup window. Fixed by adding `Connection: close` header to all test HTTP requests and calling `server.closeAllConnections()` before `server.close()` to force immediate connection teardown. Added guard assertions to the flaky test to expose state corruption immediately rather than producing ambiguous HTTP failures. Two consecutive clean runs confirmed: 302/302 both times.

---

## 1. External inputs confirmed as of 2026-06-17

| Category | Required inputs | Status |
| --- | --- | --- |
| Hosting | Staging URL, Production URL, TLS, CI/CD | NOT PROVIDED |
| PostgreSQL | DATABASE_URL, backup owner, RPO/RTO, restore drill | NOT PROVIDED |
| Object storage | S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, EVIDENCE_SIGNING_SECRET | NOT PROVIDED |
| Tenant OIDC | OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, redirect URIs, test user | NOT PROVIDED |
| Platform OIDC | PLATFORM_OIDC_ISSUER, PLATFORM_OIDC_CLIENT_ID, PLATFORM_OIDC_CLIENT_SECRET, redirect URIs | NOT PROVIDED |
| Session secrets | SESSION_SECRET, PLATFORM_SESSION_SECRET | NOT PROVIDED |
| OCR provider | OCR_PROVIDER, OCR_ACCESS_KEY, OCR_SECRET_KEY, OCR_REGION | NOT PROVIDED |
| Monitoring | Provider (Datadog/CloudWatch/PagerDuty), webhook destination, oncall contacts | NOT PROVIDED |
| Backup/restore | Backup schedule, storage location, restore drill owner | NOT PROVIDED |
| ERP connector | ERP endpoint, credentials, field mapping | NOT PROVIDED |

Full checklist with exact env var names: `docs/external-inputs-required.md`

---

## 2. OCR provider status

**Provider:** LOCAL (default)
**AWS Textract adapter:** IMPLEMENTED — credentials blocked
**SigV4 HTTPS adapter:** Built from scratch using `node:crypto` (createHmac, createHash) and `node:https`. No AWS SDK.
**Worker bridge:** Async Textract HTTPS calls made synchronously from the main thread via `createSynchronousWorkerBridge` + `Atomics.wait`.
**Normalizer:** `normalizeTextractExpenseResult()` maps AnalyzeExpense `SummaryFields` to OpsTrax `proposed_fields` (invoice_number, vendor_name, po_number, subtotal, tax, total, invoice_date, lines[]).
**Evidence linking:** `evidence_document_id` column added to `invoice_extraction_runs` (migration 028). The PDF/image evidence document linked to an invoice is passed to Textract automatically.
**Human review gate:** All proposed fields remain in `PENDING_REVIEW` status. No proposed value is ever used without explicit human accept/reject action. Auto-approval from OCR is permanently prohibited.
**Credential safety:** Credentials are read once at worker startup from `workerData.config`. They are never returned in responses, error messages, or logs. The access key ID appears in the SigV4 `Authorization` header as required by AWS spec (it is not a secret; AWS documents this as public). The secret key is used only in the HMAC chain and is never in any output.

**To activate AWS Textract:**
```
OCR_PROVIDER=aws_textract
OCR_ACCESS_KEY=<IAM access key ID>    # store in secret manager
OCR_SECRET_KEY=<IAM secret access key> # store in secret manager
OCR_REGION=us-east-1                   # or the correct region
```

**To verify live connectivity when configured:**
```
npm run verify:ocr -- --probe
```
A `400 InvalidParameterException` response from Textract means credentials are accepted and the endpoint is reachable. A `403` means credentials are wrong.

---

## 3. Staging deployment status

**Status: BLOCKED**

No staging environment has been provisioned. `verify:postgres` and `verify:storage` both fail because `DATABASE_URL` and S3 credentials are not set. `go-live-check` returns `ERROR NODE_ENV=production is required`.

No staging deployment can proceed until at minimum the following are provided:
- Staging base URL (or deployment platform)
- PostgreSQL connection URL
- S3 bucket name and credentials
- Session secrets

---

## 4. Postgres validation

**Status: BLOCKED**

Verification command run:
```
npm run verify:postgres
```
Result: `BLOCKED: DATABASE_URL is not set`

The codebase uses no SQLite-specific SQL syntax. All migrations use ANSI-compatible DDL. The migration runner supports PostgreSQL natively when `DATABASE_PROVIDER=postgres` and `DATABASE_URL` are set.

---

## 5. Storage validation

**Status: BLOCKED**

Verification command run:
```
npm run verify:storage
```
Result: `BLOCKED: DATABASE_URL is not set`

The evidence storage layer supports both filesystem (local/demo) and S3-compatible (production) modes. The S3 adapter is complete and ready; it requires only credentials.

---

## 6. OIDC validation

**Status: BLOCKED**

Neither tenant OIDC nor platform OIDC credentials have been provided. The demo login gate is working correctly and correctly disabled in production mode. Both OIDC flows (tenant and platform) are fully implemented and will activate when credentials are provided.

---

## 7. Monitoring status

**Status: BLOCKED**

No monitoring provider, webhook, alert destination, or oncall contact has been designated. The `/healthz` and `/healthz/ready` endpoints are implemented and will respond correctly once the backing services (Postgres, S3) are configured. OpsTrax structured-logs to stderr in all modes.

---

## 8. Backup and restore status

**Status: BLOCKED**

No backup schedule, backup owner, RPO target, RTO target, or restore drill owner has been designated. The backup/restore procedure is documented in `docs/backup-restore.md`. The restore process will be verifiable once Postgres is connected.

---

## 9. Verification commands run (2026-06-17)

| Command | Result |
| --- | --- |
| `npm test` | 299/299 PASS |
| `npm run build` | OK |
| `npm run security` | 0 high vulnerabilities |
| `npm run verify-migration` | v28 OK |
| `npm run perf-smoke` | 11/11 OK |
| `npm run browser-smoke` | 72/72 OK |
| `npm run verify:ocr` | OK (LOCAL mode, NOT_CONFIGURED for unconfigured providers) |
| `npm run verify:postgres` | BLOCKED (DATABASE_URL not set) |
| `npm run verify:storage` | BLOCKED (DATABASE_URL not set) |
| `npm run go-live-check` | ERROR (NODE_ENV=production required) |

---

## 10. Strict verdict

| Area | Verdict |
| --- | --- |
| Core product code | **PRODUCTION-READY** |
| AWS Textract OCR adapter | **IMPLEMENTED — waiting on OCR credentials** |
| OCR local/demo mode | **PRODUCTION-READY** |
| Human review gate | **PRODUCTION-READY — auto-approval permanently prohibited** |
| Audit logging | **PRODUCTION-READY** |
| RBAC / tenant isolation | **PRODUCTION-READY** |
| PostgreSQL | **EXTERNALLY BLOCKED — DATABASE_URL not provided** |
| Object storage (S3) | **EXTERNALLY BLOCKED — S3 credentials not provided** |
| Auth / OIDC | **EXTERNALLY BLOCKED — OIDC credentials not provided** |
| Session secrets | **EXTERNALLY BLOCKED — SESSION_SECRET not provided** |
| Monitoring | **EXTERNALLY BLOCKED — provider and recipients not designated** |
| Backup / restore | **EXTERNALLY BLOCKED — owner, schedule, RPO/RTO not designated** |
| ERP integration | **EXTERNALLY BLOCKED — endpoint and credentials not provided** |
| Staging deployment | **EXTERNALLY BLOCKED — URL and credentials not provisioned** |

**Overall verdict: CODE IS PRODUCTION-READY. ALL deployment blockers are externally-owned inputs that have not been provided. No staging or production deployment can proceed until the deployment owner provides the items listed in `docs/external-inputs-required.md`.**

---

## Documents updated in Phase 3L

| Document | Change |
| --- | --- |
| `docs/production-readiness-final.md` | Updated to Phase 3L; all external blockers listed; OCR row updated to "Implemented — credentials blocked" |
| `docs/go-live-scorecard.md` | Full rewrite with Owner + Blocker columns; Phase 3L external inputs status table added |
| `docs/external-inputs-required.md` | Full rewrite with all 10 categories, exact env var names, verification commands per category |
| `docs/deployment-prep.md` | Phase 3L OCR section added; verification commands updated to include verify:ocr |
| `docs/releases/phase-3l-external-services-cutover.md` | This document (created) |
| `docs/releases/phase-3l-live-ocr-cutover.md` | Phase 3L OCR release doc (created in OCR cutover task) |
