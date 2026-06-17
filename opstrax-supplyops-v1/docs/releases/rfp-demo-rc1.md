# OpsTrax SupplyOps — RFP Demo RC1 Release Note

## Release Summary

This release candidate freezes the scope delivered through Phase 2H. It is intended for repeatable client demonstrations of the current built product and does not add new feature areas.

### Included Modules

- Command Center
- Inventory Control
- Internal Request
- Warehouse Workflows
- Procurement & Purchasing
- Supplier Governance
- Contract Repository
- Budget Control
- Receiving Center
- Evidence Vault
- Audit Trail
- Finance Export Hub
- Integration Center
- DeviceOps Center
- Offline Sync
- AI Operations
- Worker-Safe Mode
- Reports
- Compliance Center
- Admin

### Demo Tenants

- IntelliFlow Systems — full enterprise demo tenant
- Evostel LLC — restricted tenant used for denial-path demos

### Demo Users

- `tenant_intelliflow_systems_user_admin`
- `tenant_intelliflow_systems_user_supervisor`
- `tenant_intelliflow_systems_user_requester`
- `tenant_intelliflow_systems_user_worker`
- `tenant_intelliflow_systems_user_finance`
- `tenant_evostel_user_admin`

### Demo Reset / Reseed

```bash
rm -f data/opstrax.production.sqlite
NODE_ENV=development OPSTRAX_ALLOW_DEV_CONTEXT=1 npm start
```

The database is recreated, migrations are applied, and the deterministic seed is restored on startup.

### Manual Local Demo Access

Open `http://localhost:9899` in a normal browser. The SSO gate remains visible for production safety, but in local workspace mode it also shows **Enter Demo Workspace**. Click that button to enter the seeded IntelliFlow Systems admin workspace without special headers or browser-only tricks.

### Validation Stack

- Local RC1 demo: `http://localhost:9899`
- Production-validation stack: `http://localhost:9900`
- Keep those ports separate during demo rehearsal and runtime validation.

### Rollback

- Code rollback: revert the RC1 commit or switch back to the prior release branch.
- Database rollback: restore the last saved `data/opstrax.production.sqlite` backup, then restart the server.

## Verification Status

- `npm test`: passed, 169/169
- `npm run build`: passed
- `npm run security`: passed, 0 vulnerabilities
- `npm run verify-migration`: passed, schema version 24 verified
- `npm run perf-smoke`: passed
- `npm run browser-smoke`: passed, 53/53 checks and 23 screenshots

### Local Demo Troubleshooting

- If the SSO gate persists, start the app with `NODE_ENV=development OPSTRAX_ALLOW_DEV_CONTEXT=1 npm start`.
- If the demo button is missing, confirm you are not running in production mode.
- If `/api/me` still returns 401 after clicking **Enter Demo Workspace**, clear the browser session cookies and retry the local workspace login.
- If the browser opens but the workspace still looks locked, make sure the local process was started from the same shell with `OPSTRAX_ALLOW_DEV_CONTEXT=1`.

## Known Limitations

- SQLite is demo/local only.
- PostgreSQL is required for production.
- AI provider is not configured; AI is read-only and system-generated in this release.
- ERP dispatch is a foundation/sandbox posture unless a real connector is configured.
- Evidence uses hardened metadata in local workspace mode; production object storage remains a future step.
- Reports CSV/PDF export is live in RC1 and backed by tenant-scoped report runs, CSV, and PDF handlers.
- Worker-Safe Mode is role-dependent.
- Invoice/OCR is not built yet.

## Screenshot Package

The browser smoke flow writes screenshots to `dist/screenshots/`. RC1 produced 20 images covering the auth gate, full shell, every key module, the restricted-tenant nav state, and the procure-to-pay invoice drawer.
