# OpsTrax Observability and Alerting Readiness

OpsTrax emits structured runtime and audit information. External log shipping, alerting, and paging must still be wired by the deployment target.

## Structured log fields

- `requestId`
- `tenantId`
- `platformUserId`
- `userId`
- `eventType`
- `severity`
- `outcome`
- `entityType`
- `entityId`
- `route`
- `method`
- `statusCode`

## Runtime alerts

| Condition | Suggested alert |
|---|---|
| App startup failure | Page immediately |
| `/healthz` failure | Page immediately |
| `/healthz/ready` failure | Page immediately |
| PostgreSQL connection failure | Page immediately |
| Storage connection failure | Page immediately |
| Migration mismatch | Page immediately |
| High latency | Warn, then page if sustained |
| High error rate | Warn, then page if sustained |

## Security alerts

| Condition | Suggested alert |
|---|---|
| Denied privileged access spike | Investigate and page if repeated |
| Failed platform login | Investigate |
| Failed tenant login | Investigate |
| Unknown OIDC user denied | Investigate |
| Support session created or ended | Audit-only unless volume is unusual |
| Feature entitlement changed | Audit and notify platform admin |
| Tenant suspended or reactivated | Audit and notify platform admin |

## Operations alerts

| Condition | Suggested alert |
|---|---|
| Failed export jobs | Investigate and page if repeated |
| Integration job failures | Investigate and page if repeated |
| Offline sync conflicts | Investigate |
| Evidence storage errors | Investigate and page if repeated |
| Invoice / P2P blocker exceptions | Investigate |
| Procurement / receiving exceptions | Investigate |
| Device trust violations | Investigate immediately |

## Current posture

- `/healthz` and `/healthz/ready` exist.
- The application records audit events for sensitive actions.
- External monitoring, alert routing, and retention are still deployment responsibilities.
