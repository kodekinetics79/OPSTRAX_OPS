# Vantelyx CLM - Complete Product Build

Vantelyx CLM is an AI-first Contract Lifecycle Management product foundation designed to satisfy common CLM RFP requirements while adding differentiators around AI intake, playbook-based risk review, obligations, renewals, vendor evidence, reporting, and enterprise integrations.

## What is included

- React + TypeScript + Vite frontend
- Default local port: `9702`
- Premium enterprise UI/UX for CLM workflows
- Local state persistence using browser localStorage
- .NET 8 API starter with in-memory data
- MySQL schema for production-grade persistence planning
- Docker Compose for MySQL, API, and web containers
- RFP coverage and product strategy docs
- Locked branding as **Vantelyx CLM**

## Run frontend locally

From the project root:

```bash
cd /Users/zackkhan/Downloads/vantelyx-clm-suite-complete
npm --prefix client install
npm run dev
```

Open:

```text
http://localhost:9702
```

If you want port 9701:

```bash
npm run dev:9701
```

## Run .NET API locally

You need .NET 8 SDK installed.

```bash
cd /Users/zackkhan/Downloads/vantelyx-clm-suite-complete
npm run api
```

API opens by default at the ASP.NET local URL shown in the terminal.

Key endpoints:

```text
GET  /health
GET  /api/contracts
POST /api/contracts
PATCH /api/contracts/{id}/status
GET  /api/obligations
POST /api/obligations
PATCH /api/obligations/{id}/status
GET  /api/workflows
POST /api/workflows/{id}/approve
GET  /api/vendors
GET  /api/templates
GET  /api/clause-playbook
GET  /api/integrations
GET  /api/audit
POST /api/ai/intake/preview
GET  /api/reports/summary
```

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
http://localhost:9702
```

API:

```text
http://localhost:8087
```

MySQL:

```text
localhost:3307
Database: vantelyx_clm
User: vantelyx_user
Password: vantelyx_password
```

## Frontend modules

- Command Center
- AI Intake
- Request Portal
- Repository
- Contract Workspace
- Workflow Studio
- Obligations
- Renewals
- Vendors
- Risk & Compliance
- Analytics
- Templates & Clause Playbook
- E-Sign & Execution
- Integrations
- Admin & Security
- RFP Coverage

## Important note

The frontend currently runs with local demo data and localStorage persistence so you can click, create records, update statuses, approve workflow steps, add obligations, export CSV, and reset data without needing the backend first.

The API is ready as a starter layer. The next development phase should connect the frontend to the API and then replace the in-memory API store with MySQL via Entity Framework Core or Dapper.
