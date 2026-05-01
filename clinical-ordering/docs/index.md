# Documentation Index

This repository is organized so a reviewer can understand the project without reading the source code first.

## Start Here

- `README.md`: high-level project overview, local run commands, test commands, and CI summary.
- `docs/reviewer-guide.md`: recommended review path for a hiring manager, lead engineer, or evaluator.
- `docs/iteration-backlog.md`: SDLC-style delivery plan from foundation through enterprise CI hardening and planned CD.
- `docs/project-brief.md`: original scope, assumptions, out-of-scope items, and delivery status.

## Technical Design

- `docs/architecture.md`: backend/frontend architecture, SOLID/design-pattern rationale, persistence profiles, security approach, and assistant boundary.
- `docs/error-handling-and-resilience.md`: validation, exception handling, retry policy, circuit breaker behavior, and resilience tradeoffs.
- `docs/enterprise-ci-hardening.md`: CodeQL, Dependabot, dependency scanning, coverage gate, Docker build checks, and what remains intentionally out of scope.
- `docs/supplied-document-validation.md`: reconciliation of the supplied Word/Postman notes with the implemented repository.

## Testing And API Usage

- `docs/testing-strategy.md`: unit, integration, E2E, Selenium, k6, Lighthouse, CI, and optional Keycloak smoke checks.
- `docs/api-examples.md`: curl/Postman-ready API examples and the end-to-end report lifecycle sequence.
- `postman/clinical-ordering.postman_collection.json`: importable Postman collection.
- `postman/clinical-ordering.local.postman_environment.json`: local Postman environment variables.

## Reference Artifacts

- `docs/artifacts/source-documents/`: original supplied `.docx` reference files.
- `docs/assets/screenshots/`: screenshots used during validation and troubleshooting.

## Recommended Reviewer Flow

1. Read `README.md`.
2. Read `docs/reviewer-guide.md`.
3. Run `frontend` unit/build/Cypress checks or review the GitHub Actions workflows.
4. Review `docs/iteration-backlog.md` to understand the iterative delivery story.
5. Review `docs/enterprise-ci-hardening.md` to understand the corporate-style CI coverage.
