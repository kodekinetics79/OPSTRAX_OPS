# OpsTrax Transport Management Solution

**Connected transport. Intelligent control. Enterprise execution.**

This build combines a much richer enterprise React/Vite frontend with the existing .NET API, Node events service, and MySQL scaffold.

## Stack

- Frontend: React + Vite
- API: ASP.NET Core
- Events/Telemetry Service: Node.js
- Database: MySQL inside Docker network only
- Frontend Port: `10000`
- .NET API Port: `8088`
- Node Events Port: `8090`

## Run

```bash
cp .env.example .env
docker compose down --remove-orphans
docker rm -f opstrax-frontend opstrax-dotnet-api opstrax-node-events opstrax-mysql 2>/dev/null || true
docker compose up --build
```

Open:

```text
http://localhost:10000
```

## Important fixes included

- Frontend moved to port `10000`.
- MySQL is not exposed to host ports, so it will not conflict with `3306` or `3307`.
- Removed the bad GitHub dependency named `root` that caused install/build instability.
- Fixed Linux/Docker case-sensitive imports from `@/components/Common/...` to `@/components/common/...`.
- Removed bundled font files and switched the app to Google/system fonts.
- Updated branding from AI Fleet to OpsTrax.

## Current frontend coverage

- Dashboard / Command Center
- Organization, tenants, users, RBAC
- Clients, contracts, customers
- Orders and load management
- Dispatch plans and route planning
- AI dispatch flow
- Fleet vehicles and asset registry
- Driver management, HOS compliance, accidents, violations, insurance, medical/fuel card records
- Telematics, IoT devices, cold chain
- Maintenance work orders and downtime
- Financials, fuel transactions, expense tracking
- Carriers and carrier rates
- Portal bookings/users
- SLA/KPI performance
- Control Tower exceptions and resolution tracking
- Predictive cost and margin analysis
- Audit logs and document management
- Productization / feature packs / feature flags
