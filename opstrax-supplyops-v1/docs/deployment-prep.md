# OpsTrax Deployment Prep

This note captures the deployment shape for the RC1 codebase without claiming production readiness.

## Railway backend/runtime

- Deploy the Node backend as the primary runtime.
- Set `NODE_ENV=production` in Railway.
- Set `PORT` to the platform-provided port.
- Use PostgreSQL and object storage through environment configuration.
- Keep RC1 demo behavior disabled in production by leaving `OPSTRAX_ALLOW_DEV_CONTEXT` unset or `0`.
- Do not ship local SQLite files or local evidence storage with the production deployment.

## Vercel frontend/static shell

- Only use a split frontend deployment if the shell is separated from the backend in a future packaging change.
- The current RC1 release is validated as a Node-hosted experience, so Vercel is optional and not required for the frozen demo path.

## Required environment variables

- `NODE_ENV`
- `PORT`
- `OPSTRAX_BASE_URL`
- `OPSTRAX_DB_PROVIDER`
- `DATABASE_URL` for PostgreSQL runtime
- `OPSTRAX_EVIDENCE_STORAGE`
- `OPSTRAX_EVIDENCE_BUCKET`
- `OPSTRAX_EVIDENCE_REGION`
- `OPSTRAX_EVIDENCE_ENDPOINT`
- `OPSTRAX_EVIDENCE_ACCESS_KEY_ID`
- `OPSTRAX_EVIDENCE_SECRET_ACCESS_KEY`
- `OPSTRAX_EVIDENCE_SIGNED_URL_TTL`
- `OPSTRAX_AUTH_MODE`
- `OPSTRAX_OIDC_ISSUER`
- `OPSTRAX_OIDC_CLIENT_ID`
- `OPSTRAX_OIDC_CLIENT_SECRET`
- `OPSTRAX_OIDC_REDIRECT_URI`

## Blocking production items

- SSO/OIDC must be configured before go-live.
- Production readiness stays blocked until external auth is wired and verified in the target environment.

