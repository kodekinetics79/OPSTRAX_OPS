# OpsTrax Platform Admin Control Plane

The Platform Admin control plane is the SaaS-owner surface for managing tenants, plans, entitlements, support sessions, billing posture, security events, and platform audit history.

It is separate from the tenant workspace:

- tenant users authenticate into the tenant shell
- platform users authenticate into `/platform`
- tenant operational data is visible to platform users only through summary/detail APIs that are explicitly permissioned and audited
- no silent impersonation of tenant users is allowed
- platform actions create platform audit events

## Routes

- `/platform`
- `/platform/login`
- `/platform/dashboard`
- `/platform/tenants`
- `/platform/tenants/:id`
- `/platform/subscriptions`
- `/platform/modules`
- `/platform/users`
- `/platform/support`
- `/platform/security`
- `/platform/health`

## APIs

- `GET /api/platform/auth/bootstrap`
- `POST /api/platform/dev/demo-login`
- `POST /api/platform/logout`
- `GET /api/platform/me`
- `GET /api/platform/summary`
- `GET /api/platform/tenants`
- `GET /api/platform/tenants/:id`
- `GET /api/platform/tenants/:id/users`
- `GET /api/platform/tenants/:id/modules`
- `GET /api/platform/tenants/:id/usage`
- `GET /api/platform/tenants/:id/health`
- `GET /api/platform/audit-events`
- `GET /api/platform/security-events`
- `GET /api/platform/billing-events`
- `GET /api/platform/support-sessions`
- `POST /api/platform/support-sessions`
- `POST /api/platform/support-sessions/:id/end`
- `PATCH /api/platform/tenants/:id/subscription`
- `PATCH /api/platform/tenants/:id/plan`
- `PATCH /api/platform/tenants/:id/entitlements`
- `POST /api/platform/tenants/:id/suspend`
- `POST /api/platform/tenants/:id/reactivate`

## Roles

- `PLATFORM_OWNER`
- `PLATFORM_ADMIN`
- `PLATFORM_SUPPORT`
- `PLATFORM_BILLING`
- `PLATFORM_SECURITY`
- `PLATFORM_AUDITOR`

### Plan tiers

- `STARTER`
- `PROFESSIONAL`
- `ENTERPRISE`
- `GOVERNMENT`
- `CUSTOM`

### Support session states

- `REQUESTED`
- `ACTIVE`
- `EXPIRED`
- `REVOKED`
- `DENIED`

## Local demo access

In development only:

```bash
NODE_ENV=development OPSTRAX_ALLOW_DEV_CONTEXT=1 npm start
```

Then open `http://localhost:9899/platform` and click **Enter Platform Workspace**.

Demo identity:

- user: Avery-style platform owner workspace
- session: separate platform cookie
- result: `/api/platform/me` returns the platform owner identity and capabilities

## Production configuration

- `PLATFORM_BASE_URL` must match the externally reachable admin URL.
- `PLATFORM_AUTH_MODE=oidc`
- `PLATFORM_OIDC_ISSUER`
- `PLATFORM_OIDC_CLIENT_ID`
- `PLATFORM_OIDC_CLIENT_SECRET`
- `PLATFORM_OIDC_REDIRECT_URI`
- `PLATFORM_OIDC_LOGOUT_REDIRECT_URI`
- `PLATFORM_SESSION_SECRET`
- `COOKIE_SECURE=true`

Production startup blocks platform access until the platform OIDC settings are complete. The local demo button is never shown in production.

Seeded managed workspaces:

- IntelliFlow Systems
- Northstar Logistics
- Evostel LLC

## Security posture

- production requires real SSO configuration
- production does not allow dev-context login
- tenant cookies do not authenticate the platform surface
- platform cookies do not authenticate tenant APIs
- denied platform actions are audit logged

## Operational posture

- tenant summaries and health snapshots are visible for SaaS-owner operations
- support sessions are tracked and auditable
- billing posture and security posture are separated from tenant workflows
- no platform action is allowed to execute without backend permission checks

## Platform Reporting

Platform reports are available at `/api/platform/reports/*` and are gated to platform-authenticated users only.

| Report | Capability Required |
| --- | --- |
| Tenant Subscription Summary | VIEW_PLATFORM_SUMMARY |
| Tenant Module Entitlement Summary | VIEW_PLATFORM_TENANT_MODULES |
| Tenant Usage Summary | VIEW_PLATFORM_TENANT_USAGE |
| Support Session Summary | VIEW_PLATFORM_SUPPORT_SESSIONS |
| Platform Audit Summary | VIEW_PLATFORM_AUDIT_EVENTS |
| Security Event Summary | VIEW_PLATFORM_SECURITY_EVENTS |

Platform AUDITOR role can read and list all platform report definitions and runs. Platform OWNER and ADMIN roles can generate new platform report runs. Tenant-user cookies cannot call platform report APIs (403).

Every platform report run and download is logged in `platform_audit_events`.
