# OpsTrax Transport Management Solution

Connected transport. Intelligent control. Enterprise execution.

OpsTrax is a runnable enterprise transport management foundation with a React command-center frontend, ASP.NET Core API, MySQL seed database, and Node live events service.

## Run Locally

```bash
cd opstrax-enterprise
cp .env.example .env
chmod +x start-local.sh stop-local.sh reset-local.sh
./start-local.sh
```

## URLs

- Frontend: http://localhost:10000
- Swagger: http://localhost:8088/swagger
- API health: http://localhost:8088/api/health
- Node events health: http://localhost:8090/health

## Demo Credentials

All demo users use `Admin@12345`.

- `admin@opstrax.com`
- `dispatcher@opstrax.com`
- `driver@opstrax.com`
- `mechanic@opstrax.com`
- `customer@opstrax.com`

## Services

- `frontend`: React, Vite, TypeScript, Tailwind, TanStack Query, Axios, Recharts, Lucide.
- `api-dotnet`: .NET 8 Web API with Swagger, CORS, JWT-ready demo auth, generic module APIs, operational endpoints.
- `node-events`: Express + SSE telemetry and AI brief stubs.
- `mysql`: MySQL 8.4, internal Docker network only, initialized with SQL schema and seed data.
