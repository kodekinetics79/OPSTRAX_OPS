# OpsTrax Go-Live Scorecard

Status categories:

- `Ready`
- `Verified in validation stack`
- `Requires live secrets`
- `Roadmap`
- `Blocked`

| Area | Status | Notes |
|---|---|---|
| Tenant workspace | Ready | RC1 workspace shell, module surface, and tenant isolation are verified. |
| Platform Admin | Ready | Platform control plane exists and is isolated from tenant auth. |
| Auth / SSO | Requires live secrets | Tenant and platform IdP registration must be completed in the target deployment. |
| Postgres | Verified in validation stack | External PostgreSQL path was validated in the production-validation stack. |
| Evidence storage | Verified in validation stack | S3-compatible evidence storage was validated in the production-validation stack. |
| Session / cookie security | Ready | Secure cookie posture is enforced by startup checks. |
| CSRF | Ready | CSRF tokens are required for risky actions where applicable. |
| Security headers | Ready | Core security headers are emitted by the app. |
| Tenant isolation | Ready | Reads and writes are tenant-scoped. |
| RBAC / feature entitlements | Ready | Permission checks are enforced server-side. |
| Support sessions | Ready | Support sessions are auditable and isolated. |
| Audit logging | Ready | Sensitive and denied actions are recorded. |
| Monitoring / alerts | Requires live secrets | External log shipping and alerting still need deployment wiring. |
| Backup / restore | Requires live secrets | Backup jobs and restore drills must be operationally scheduled. |
| Performance | Verified in validation stack | Performance smoke and browser smoke have passed. |
| Browser smoke | Verified in validation stack | RC1 browser coverage passed on the current shell and module set. |
| ERP connector | Roadmap | Connector abstraction exists; production connector wiring remains. |
| OCR provider | Roadmap | Invoice OCR is not yet a go-live dependency. |
| Reports export | Ready | Tenant report catalog, report runs, CSV export, and PDF export are implemented and audited. |
| AI execution | Blocked | AI remains advisory-only until explicitly enabled with human approval. |

## Executive summary

- The product is release-stable for staging validation.
- Go-live is still blocked on live IdP registration, monitoring, and backup operations.
- No claim of production readiness should be made until those items are verified in the actual deployment environment.
