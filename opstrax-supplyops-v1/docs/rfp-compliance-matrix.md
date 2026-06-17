# OpsTrax SupplyOps — RC1 RFP Compliance Matrix

| Requirement / Capability | Support Level | Module / Page | Proof Point | Demo Step | Notes |
|---|---|---|---|---|---|
| SSO readiness | Complete | Auth / startup / shell | OIDC startup checks and auth flow hooks exist | 1 | Production OIDC/SAML still needs customer configuration |
| Tenant isolation | Complete | All modules | `tenant_id` scoped queries and restricted tenant denial | 13 | Server enforces isolation, not only the UI |
| Platform admin control plane isolation | Complete | `/platform`, platform APIs | Separate platform session and platform-only APIs | 15 | Platform users are not tenant-authenticated users |
| RBAC | Complete | `/api/me`, shell, services | Role/capability gating and denied-action audit | 3, 5, 13 | Capability-based checks are server-owned |
| Facility scoping | Complete | Shell + services | Facility-scoped users, items, tasks, and exports | 1, 4, 11 | Visible in `/api/me` scopes and backend filters |
| Department scoping | Complete | Internal Request / Procurement | Requests and approvals are department-aware | 4, 5 | Important for controlled request routing |
| Audit trail | Complete | Audit Trail | Critical actions and denials are logged | 9 | Append-only audit model in the product flow |
| Evidence vault | Complete | Evidence Vault | Linked documents and evidence metadata | 9 | Local demo stores metadata; binaries are future work |
| Inventory control | Complete | Inventory Control | Tenant-scoped items, balances, bins | 2, 6 | Stock changes are server-posted |
| Executive briefing / commercial posture | Complete | Command Center | Executive Briefing and Controlled Facility Advantage panels | 2 | Summarizes operational workload, readiness, and differentiators from real tenant data |
| Warehouse execution | Complete | Warehouse Workflows | Task issue and movement workflow | 6 | Demonstrates operational execution |
| Barcode / device operations | Complete | DeviceOps Center | Device trust and scan validation | 11 | Hardware SDK integration is still roadmap |
| Offline capture / sync | Complete | Offline Sync | Batch review and conflict handling | 11 | Offline replay is validated before posting |
| Procurement approvals | Complete | Procurement Center | PR/PO approval and issue flow | 7 | No external vendor network is claimed in RC1 |
| Supplier governance | Complete | Supplier Governance | Vendor lifecycle, compliance documents, risk posture, waiver-backed exceptions | 7 | Blocked or expired suppliers cannot be used without an approved waiver |
| Contract control | Complete | Contract Repository | Active/expired contracts, renewal alerts, non-contract spend detection | 7 | `INSUFFICIENT_CONTRACT_DATA` is shown when contract evidence is missing |
| Budget control | Complete | Budget Control | Department and cost-center budgets, reservations, consumption, and over-budget exception handling | 7 | Budget enforcement is server-side and audit logged |
| Procure-to-pay intelligence | Complete | Invoice Intelligence | Extraction panel, matching panel, exception queue, approval trail, local export posture | 8 | Live OCR/provider extraction remains `NOT_CONFIGURED` in RC1 |
| Finance exports | Complete | Finance Export Hub | Validation-first export posture | 10 | Finance export readiness report included in Reports Center |
| Enterprise reporting | Complete | Reports Center | 13 tenant + 6 platform reports; real CSV and binary PDF exports; per-run audit trail; tenant-scoped rows | 14 | Formula-injection protected CSV; `%PDF`-magic-byte binary PDF; no client-side fabrication |
| ERP integration foundation | Partial | Integration Center | Job tracking and connector posture | 10 | Real connector not configured in RC1 |
| Compliance readiness | Complete | Compliance Center | Controls, posture, and workflow-linked evidence | 9 | Built into workflows, not a static page |
| AI governance | Complete | AI Operations | Read-only, governed summaries with source records | 12 | AI execution intentionally disabled in RC1 |
| Restricted tenant controls | Complete | Restricted tenant shell/API | Smaller nav and 403 API denial | 13 | Proof that hidden UI is backed by backend enforcement |

## Capability Notes

- **Complete** means the RC1 demo already proves the capability in the shipped product.
- **Partial** means the foundation exists and the user-facing posture is visible, but a production connector or external dependency is not yet wired.
- **Roadmap** means not delivered in RC1 and should not be claimed as present.
