# Security Policy

## Supported Version

This is an MVP/code-challenge repository. Security fixes should target the `main` branch.

## Reporting A Vulnerability

Do not open a public issue for sensitive findings. Report privately through the repository owner.

Include:

- Affected component.
- Reproduction steps.
- Expected impact.
- Suggested mitigation, if known.

## Security Controls In This Repository

- Backend DTO validation and global exception handling.
- Optional Keycloak-ready OAuth2 resource-server profile.
- GitHub CodeQL workflow.
- Dependabot version monitoring.
- OWASP Dependency-Check for backend dependencies.
- `npm audit --audit-level=high` for frontend dependencies.
- Docker image build validation.

## Not Yet Implemented

- Production role-based authorization.
- Secret scanning configuration at the organization level.
- Docker image vulnerability scanning.
- SBOM generation and image signing.
- Production deployment and runtime monitoring.
