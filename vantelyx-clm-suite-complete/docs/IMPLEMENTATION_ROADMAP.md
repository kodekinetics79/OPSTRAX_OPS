# Vantelyx CLM Implementation Roadmap

## Current build status

This package is a strong product foundation and clickable working frontend with a starter .NET API and MySQL schema. It is not yet a production SaaS system.

## Phase 1 - Frontend product shell complete

Included in this build:

- Complete navigation
- Premium UI and layout
- Demo state and localStorage persistence
- Contract creation
- AI intake simulation
- Workflow approval simulation
- Obligation creation and status updates
- Contract status updates
- CSV export
- RFP coverage module

## Phase 2 - API integration

Next engineering work:

1. Add frontend API service layer using `VITE_API_BASE_URL`.
2. Replace localStorage operations with API calls.
3. Add loading, error, optimistic update, and retry patterns.
4. Add API validation and DTO mapping.
5. Add pagination/filtering on repository endpoints.

## Phase 3 - MySQL persistence

Recommended path:

1. Add Entity Framework Core or Dapper.
2. Create migrations from `database/init.sql` model.
3. Replace `InMemoryStore` with database repository classes.
4. Add tenant-aware filtering to every query.
5. Add transaction handling for contract creation + workflow creation.

## Phase 4 - Authentication and RBAC

1. Add JWT/OIDC authentication.
2. Add Microsoft Entra ID support.
3. Add role/permission checks.
4. Add tenant isolation.
5. Add audit event middleware.

## Phase 5 - Document and AI pipeline

1. Add document upload endpoint.
2. Store files in local storage for development, then S3/Azure Blob/SharePoint.
3. Add OCR extraction pipeline.
4. Add AI classification and clause comparison.
5. Add hallucination controls by requiring source citation spans from documents.
6. Add human approval for every AI recommendation.

## Phase 6 - Workflow engine

1. Create workflow definition tables.
2. Add rule builder UI.
3. Support routing by value/risk/category/vendor/data trigger.
4. Add SLA timers and escalation jobs.
5. Add notification connectors.

## Phase 7 - Vendor portal

1. Separate vendor login role.
2. Vendor profile page.
3. Certificate upload.
4. Security questionnaire.
5. Evidence request/response workflow.
6. Expiry alerts.

## Phase 8 - Production hardening

1. Logging and monitoring.
2. Exception handling.
3. Rate limiting.
4. Security headers.
5. Secrets management.
6. Backup/restore.
7. CI/CD.
8. Test suite.
9. Accessibility pass.
10. Performance pass.
