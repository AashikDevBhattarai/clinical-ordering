# Iteration Backlog

## Iteration 0: Foundation

Objective: establish the domain, persistence, API boundaries, and UI shell.

Deliverables:

- Project brief and backlog
- Spring Boot project structure
- React/Vite project structure
- Shared workflow assumptions documented

## Iteration 1: Patient + Order Intake

Objective: let a clinician create or retrieve a patient and place an echocardiogram order.

Acceptance criteria:

- Users can search patients by name or MRN
- Users can create a patient with basic demographics
- Users can place an echocardiogram order for a selected patient
- Creating an order persists the order with `ORDERED` status
- Creating an order automatically creates a draft report

## Iteration 2: Reporting Lifecycle

Objective: allow the reporting system to complete the study workflow.

Acceptance criteria:

- Draft reports can store free-text findings
- Draft reports can be finalized
- Finalized reports can be amended with a reason
- Reports can be canceled with a reason
- Every report transition updates the linked order status

## Iteration 3: Hardening

Objective: prepare the MVP for a more realistic environment.

Acceptance criteria:

- REST lifecycle integration tests cover patient creation through report cancelation
- Demo data can be loaded for evaluators without manual data entry
- Input validation is stronger and action-specific
- PostgreSQL can be used as a persistent backing store
- The API is auth-ready for Keycloak / OAuth2 resource-server mode
- The repository includes evaluator-facing run and API documentation

Implemented in this repository:

- PostgreSQL profile and Docker Compose infrastructure
- Optional Keycloak-ready profile with a sample realm import
- REST lifecycle integration tests and workflow unit test
- Duplicate MRN handling and tighter DTO validation
- Architecture note, API examples, and local startup script

## Iteration 4: Test And Resilience Coverage

Objective: broaden confidence around the MVP workflow before adding optional capabilities.

Acceptance criteria:

- Frontend unit tests cover patient, order, report, and recent-order selection behavior
- Backend tests cover stable validation and unexpected-error payloads
- Retry and circuit-breaker behavior is documented and tested at the frontend API boundary
- Cypress, Selenium, k6, and Lighthouse entry points are documented for evaluator runs

Implemented in this repository:

- Frontend app/component/API-client tests
- Backend controller-advice test for stable `500` responses
- Frontend safe-read retry and lightweight circuit-breaker policy
- Testing and resilience documentation

## Iteration 5: GitHub Actions CI Automation

Objective: turn the local QA checklist into repeatable automated verification for reviewers and future changes.

Acceptance criteria:

- CI runs automatically on pushes and pull requests
- CI can also be started manually for evaluator reruns
- Backend verification runs with Java 17 and Maven dependency caching
- Frontend unit tests and production build run in a clean install
- Cypress mocked E2E runs against the production frontend bundle
- Test/build artifacts are retained when useful for review or failure diagnosis

Implemented in this repository:

- `.github/workflows/ci.yml`
- Backend `mvn -B verify` job
- Frontend `npm ci`, `npm run test:unit`, and `npm run build` job
- Cypress mocked E2E job using `npm run test:e2e:cypress`
- JaCoCo, frontend build, and Cypress failure screenshot artifact upload

Future CI/CD expansion:

- See `Iteration 8: Deployment Automation / CD`

## Iteration 6: Optional Report Assistant

Objective: add a basic assistive report-drafting feature without changing the original ordering/reporting lifecycle.

Acceptance criteria:

- Report users can generate draft wording from patient/order/report context
- Assistant output is never saved, finalized, amended, or canceled automatically
- Users must manually apply and review suggestions before continuing the normal workflow
- The assistant is isolated behind an interface so a real LLM adapter can be added later

Implemented in this repository:

- `POST /api/reports/{id}/assist`
- `ReportTextAssistant` interface and deterministic `TemplateReportTextAssistant`
- Reporting UI panel for generating, reviewing, applying, or dismissing suggestions
- API examples and architecture notes for the assistant boundary

Future LLM adapter work:

- Add an OpenAI, Azure OpenAI, or hospital-approved local-model implementation
- Add prompt/version metadata and audit history for generated suggestions
- Add idempotency, rate limiting, PHI/data governance controls, and model-failure fallback behavior

## Iteration 7: Enterprise CI Hardening

Objective: move the CI setup closer to a corporate baseline by adding repeatable security, dependency, coverage, and container-build checks.

Acceptance criteria:

- Static application security testing runs through GitHub CodeQL
- Dependabot monitors Maven, npm, GitHub Actions, Docker, and Docker Compose dependencies
- Backend dependency vulnerability scanning fails CI on high-severity findings
- Frontend dependency audit fails CI on high-severity findings
- Backend coverage has an initial enforced threshold that can be raised over time
- Backend and frontend Docker images build successfully without pushing images
- Documentation explains what is included, what is intentionally excluded, and why

Implemented in this repository:

- `.github/workflows/codeql.yml`
- `.github/dependabot.yml`
- OWASP Dependency-Check job in `.github/workflows/ci.yml`
- `npm audit --audit-level=high` gate in `.github/workflows/ci.yml`
- JaCoCo line-coverage gate in `backend/pom.xml`
- Backend and frontend Dockerfiles plus CI build checks
- Enterprise CI hardening documentation

Current limits:

- Secret scanning, branch protection, required reviewers, and protected environments are repository or organization settings, not files in this codebase.
- Docker image vulnerability scanning, SBOM generation, and image signing are intentionally left as follow-on work.
- The coverage gate starts conservatively at 40 percent line coverage so the first enterprise hardening step is achievable before raising the bar.

## Iteration 8: Deployment Automation / CD

Objective: define the next production-readiness step without deploying blindly before an environment target and approval policy exist.

Planned acceptance criteria:

- Backend and frontend images are pushed to GitHub Container Registry
- A demo environment is selected and documented
- Deployment workflow targets the demo environment only
- GitHub Environments provide a manual approval gate before deployment
- Post-deploy smoke tests verify the application is reachable and the basic clinical workflow still works
- Production deployment remains out of scope for the MVP until hosting, secrets, rollback, monitoring, and compliance requirements are defined

Planned implementation:

- Add a `cd.yml` workflow after the deployment target is chosen
- Publish backend and frontend images to GitHub Container Registry
- Deploy to the demo environment using the environment-specific mechanism
- Run API health checks and a lightweight browser/API smoke test after deployment
- Retain deployment logs and smoke-test artifacts

Why not implemented yet:

- CD requires a real hosting target, registry policy, environment secrets, approval rules, and rollback expectations.
- Implementing a fake deployment would be less valuable than clearly documenting the next iteration.
- The current repository correctly stops at CI and Docker build validation until deployment infrastructure is defined.

## Iteration 9: Follow-On Work

Objective: move from challenge-ready MVP toward production readiness.

Candidate follow-ups:

- Add role-based authorization and provider/reporting personas
- Persist amendment and cancel events as first-class audit history
- Add frontend component tests and end-to-end browser tests
- Add Docker image vulnerability scanning, SBOM generation, and image signing
- Add production-grade rollback, monitoring, and incident-response runbooks
