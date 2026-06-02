# Deployment Notes

## Local ports

- Frontend: 9702
- API: 8087
- MySQL: 3307

## Production recommendation

Frontend:
- Vercel, Azure Static Web Apps, or containerized Nginx.

API:
- Azure App Service, AWS ECS/Fargate, Render, Railway, or Docker/Kubernetes.

Database:
- Azure Database for MySQL, AWS RDS MySQL, PlanetScale, or managed MySQL.

Document storage:
- Azure Blob, S3, SharePoint, or Google Drive connector depending on target customer.

Identity:
- Microsoft Entra ID first, then SAML/OIDC providers.

AI:
- Keep an AI provider abstraction so customers can use OpenAI, Azure OpenAI, or a private model later.

## Security must-haves before production

- JWT validation
- Tenant isolation in every query
- RBAC permission checks
- Audit middleware
- File virus scanning
- Signed URL document access
- Secrets management
- Database backups
- Error logging
- Rate limiting
- Security headers
- CI/CD pipeline
