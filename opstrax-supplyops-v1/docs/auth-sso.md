# OpsTrax Authentication and SSO

OpsTrax uses two separate authentication surfaces:

- tenant workspace auth at `/auth/*`
- platform admin auth at `/platform/*`

The backend owns all auth decisions. The browser only renders the gate and redirects.

## Tenant workspace auth

Production tenant auth is OIDC-based.

Required env vars:

- `AUTH_MODE=oidc`
- `APP_BASE_URL`
- `OIDC_ISSUER`
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_REDIRECT_URI`
- `OIDC_LOGOUT_REDIRECT_URI`
- `OIDC_SCOPES`
- `SESSION_SECRET`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=lax` or `strict`

## Platform admin auth

Platform admin is a separate session and a separate IdP configuration.

Required env vars:

- `PLATFORM_AUTH_MODE=oidc`
- `PLATFORM_BASE_URL`
- `PLATFORM_OIDC_ISSUER`
- `PLATFORM_OIDC_CLIENT_ID`
- `PLATFORM_OIDC_CLIENT_SECRET`
- `PLATFORM_OIDC_REDIRECT_URI`
- `PLATFORM_OIDC_LOGOUT_REDIRECT_URI`
- `PLATFORM_OIDC_SCOPES`
- `PLATFORM_SESSION_SECRET`

## Local demo access

Local demo access is only available when all of the following are true:

- `NODE_ENV !== production`
- `OPSTRAX_ALLOW_DEV_CONTEXT=1`

In that mode, the SSO gate shows **Enter Demo Workspace** for the seeded IntelliFlow Systems workspace. Production never shows that button.

## Startup behavior

- Production startup fails if tenant OIDC is incomplete.
- Production startup fails if platform OIDC is incomplete.
- Production startup fails if secure cookies are not enabled.
- Production startup fails if the local demo gate is enabled.

## Common failure states

- `CONFIGURATION_REQUIRED` means the IdP has not been configured yet.
- `401` from `/api/me` means the session is not authenticated.
- `403` from a protected API means the user is authenticated but lacks permission or scope.
- `503` from login-start routes means the OIDC surface is not configured yet.

## Verification commands

- `npm test`
- `npm run verify-migration`
- `npm run verify:production-runtime`

## Notes

- Tenant and platform cookies are not interchangeable.
- Demo credentials are local-workspace only and never permitted in production.
- The browser must not be trusted for authorization decisions.
