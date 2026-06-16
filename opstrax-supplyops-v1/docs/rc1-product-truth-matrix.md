# OpsTrax SupplyOps — RC1 Product Truth Matrix

| Module | Built | DB-backed | API-backed | UI-backed | RBAC enforced | Audit logged | Browser-smoke covered | Demo-ready | Production-ready | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Command Center | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Executive summary, readiness, and work queues are live; prod hardening remains |
| Procurement Center | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Vendor, PR, PO, and exception controls are real; external ERP connector remains foundation |
| Supplier Governance | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Supplier status, compliance docs, and waivers are enforced; real supplier network is not claimed |
| Contract Repository | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Contract controls and leakage detection are live; missing data surfaces as `INSUFFICIENT_CONTRACT_DATA` |
| Budget Control | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Reservations, consumption, and over-budget review are live; production finance integration remains to be hardened |
| Invoice Intelligence | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Extraction, matching, exceptions, and export posture are visible; OCR/provider configuration is still local/demo |
| Compliance & Trust Center | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Controls, risk, access review, and evidence posture are live; production object storage/SSO remain future steps |
| Evidence Vault | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Evidence metadata and links are live; binary object storage and signed URLs are production work |
| Audit Log Explorer | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Critical actions and denied actions are append-only and visible; long-term archive strategy remains production work |
| AI Operations | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | AI is governed and read-only; autonomous execution is intentionally not enabled in RC1 |
| Finance Export Hub | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Validation-first export posture is live; downstream ERP acknowledgments require a real connector |
| Integration Center | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Partial | Job tracking and connector posture are live; no external completion is claimed without a connector |
| Restricted tenant behavior | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Evostel shows reduced navigation and server-side denials; this is a core verified security proof |
| Auth / demo workspace entry | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Local demo entry works in development mode only; production remains SSO-gated |

## Truth Matrix Notes

- **Built** means the module is implemented in the RC1 codebase and available in the shipped release.
- **DB-backed** means the module reads from and writes to persisted tenant-scoped data.
- **API-backed** means the UI is driven by server APIs rather than static mock content.
- **UI-backed** means the module has a working page or drawer surfaced in the commercial shell.
- **Production-ready** means the module is safe enough for RC1 demo and acceptance, but still needs the production hardening items called out elsewhere in the release package.
