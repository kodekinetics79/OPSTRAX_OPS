# Architecture

OpsTrax uses a compact enterprise SaaS architecture:

- React SPA served by Nginx on port 10000.
- ASP.NET Core API on port 8088 with MySQL persistence.
- Node event service on port 8090 for SSE telemetry and AI stubs.
- MySQL 8.4 runs on the Docker network only and is not exposed to the host.

The frontend uses module configuration to render broad product coverage through reusable enterprise components. The API exposes specific operational endpoints plus generic module CRUD endpoints backed by seeded relational data.
