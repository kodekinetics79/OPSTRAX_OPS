# OpsTrax SupplyOps

Production-grade local SaaS foundation for enterprise supply operations.

## Current phase

This phase replaces the original placeholder shell with a real local stack:

- Node HTTP server
- SQLite relational database
- Tenant-scoped session resolution
- RBAC and department/facility checks
- Audit logging for critical writes
- Live UI for command center, inventory, requests, purchasing, offline review, labels, finance exports, compliance, and admin

SQLite is acceptable for local development and Phase 0 verification. Postgres is the required production target for the future government-grade deployment path; the service layer is kept narrow so the persistence adapter can change without rewriting business logic.

## Run

```bash
node server.js
```

Open:

```text
http://localhost:8080
```

## Production auth

Set these for SSO/OIDC:

- `OPSTRAX_OIDC_ISSUER`
- `OPSTRAX_OIDC_CLIENT_ID`
- `OPSTRAX_OIDC_CLIENT_SECRET`
- `OPSTRAX_OIDC_REDIRECT_URI`
- `OPSTRAX_BASE_URL`

If those are not set, the app requires SSO or an explicit dev-context override.
If you want the built-in deterministic context for local development or tests, set `OPSTRAX_ALLOW_DEV_CONTEXT=1`.

## AI provider

You do not need an Ollama subscription if you self-host Ollama. I only need the Ollama base URL and model name when we wire AI to it.

## Test

```bash
node --test tests/opstrax.test.mjs
```

## Notes

- The backend owns business logic and permission checks.
- The frontend is UI only and talks to the API.
- SQLite is seeded with production-style test fixtures for two enterprise tenants: IntelliFlow Systems and Evostel LLC.
