# Clinical Ordering System

This repository contains an MVP clinical ordering system implemented as a small full-stack application:

- `backend/`: Spring Boot REST API with JPA/Hibernate and an H2 in-memory database
- `frontend/`: React/Vite single-page UI for patient, order, and report workflows
- `docs/`: project brief and iteration backlog to show the work as an SDLC-style delivery instead of a one-shot build
- `postman/`: importable Postman collection and local environment for API smoke testing
- `docker-compose.yml`: local infrastructure for PostgreSQL and optional Keycloak
- `scripts/run-local.sh`: simple host-based startup script

## Reviewer Entry Points

- Start here: `docs/index.md`
- Reviewer guide: `docs/reviewer-guide.md`
- GitHub publishing guide: `docs/github-publishing.md`
- Postman collection: `postman/clinical-ordering.postman_collection.json`
- Original supplied artifacts: `docs/artifacts/source-documents/`

## Workflow Covered

1. A doctor searches for an existing patient or creates a new patient.
2. The doctor places an echocardiogram order for that patient.
3. The system automatically creates a draft report tied to the order.
4. Reporting users enter free-text findings and finalize the report.
5. In a later optional iteration, reporting users may generate assistant draft wording for review.
6. A finalized report can be amended or canceled.
7. Report actions synchronize the linked order status.

## Domain Model

- `Patient`
- `StudyOrder`
- `Report`

## Status Lifecycle

- Order statuses: `ORDERED`, `FINALIZED`, `AMENDED`, `CANCELED`
- Report statuses: `DRAFT`, `FINALIZED`, `AMENDED`, `CANCELED`

Rules:

- Creating an order automatically creates a draft report.
- Draft reports can be edited and finalized.
- Only finalized reports can be amended.
- Draft, finalized, or amended reports can be canceled.
- Every report state change updates the linked order state.
- Assistant-generated report text is a draft aid only and must be reviewed before finalization.

Note: the report assistant was added as a later optional iteration. It was not part of the original baseline clinical ordering requirement.

## Local Run

The code is prepared for local execution, but this environment does not currently have a Java runtime or Maven installed, so the backend was not executed here.

### Backend

Requirements:

- Java 17+
- Maven 3.9+

Run:

```bash
cd backend
mvn spring-boot:run
```

The API defaults to `http://localhost:8080/api`.

Profiles:

- Default: H2 in-memory, auth disabled
- `demo`: seeds sample patients and a draft report
- `postgres`: uses PostgreSQL for persistence
- `keycloak`: enables OAuth2 resource-server mode

Examples:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=demo
mvn spring-boot:run -Dspring-boot.run.profiles=postgres,demo
mvn spring-boot:run -Dspring-boot.run.profiles=postgres,keycloak
```

### Frontend

Requirements:

- Node.js 20+

Run:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8080/api`. Override with `VITE_API_BASE_URL` if needed.
If the backend runs with the `keycloak` profile, the frontend can send a bearer token through `VITE_API_BEARER_TOKEN` or a `clinicalOrderingAccessToken` value in browser local storage.

### Quick Evaluation

Host-based:

```bash
./scripts/run-local.sh
```

Infrastructure only:

```bash
docker compose up -d postgres
docker compose --profile auth up -d
```

Then run the backend with `postgres` or `postgres,keycloak` profiles as needed.

Optional Keycloak mode on Windows:

```powershell
docker compose --profile auth up -d postgres keycloak

$keycloakReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        Invoke-RestMethod http://localhost:8081/realms/clinical-ordering/.well-known/openid-configuration | Out-Null
        $keycloakReady = $true
        break
    } catch {
        Start-Sleep -Seconds 2
    }
}
if (-not $keycloakReady) { throw "Keycloak did not become ready on http://localhost:8081" }

cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=postgres,keycloak"
```

Use the demo Keycloak user when calling the secured API:

```powershell
cd C:\work\clinical-ordering
$token = (& .\scripts\keycloak-token.ps1)
Invoke-RestMethod http://localhost:8080/api/patients -Headers @{ Authorization = "Bearer $token" }
```

## Testing

Testing layers now included:

- Backend unit tests for workflow, mapping, factory, and service rules
- Backend integration tests for REST lifecycle and JPA repository behavior
- Backend controller-advice coverage for stable server-error payloads
- Backend integration coverage for report assistant suggestions
- Frontend unit/integration tests with Vitest and Testing Library
- Frontend API client resilience tests for retry, circuit breaker, and validation-message handling
- Cypress browser E2E against mocked API responses
- Selenium live-stack smoke automation
- k6 API performance workload
- Lighthouse CI frontend audit

Run:

```bash
cd backend
mvn test
```

```bash
cd backend
mvn verify
```

```bash
cd frontend
npm install
npm run test:unit
npm run test:e2e:cypress
npm run test:e2e:selenium
npm run test:perf:lighthouse
```

The Cypress and Lighthouse scripts use a local Node server runner instead of `start-server-and-test`, avoiding the `spawn wmic.exe ENOENT` cleanup failure on newer Windows installs.

```bash
k6 run ./tests/performance/api-workflow.js
```

### GitHub Actions

The repository includes `.github/workflows/ci.yml`.

This is captured as Iteration 5 in `docs/iteration-backlog.md` so CI automation is presented as its own SDLC delivery step rather than an afterthought.

It runs on pushes, pull requests, and manual dispatch:

- Backend `mvn -B verify`
- Backend OWASP Dependency-Check with CVSS `>= 7` fail threshold
- Frontend `npm ci`, `npm run test:unit`, and `npm run build`
- Frontend `npm audit --audit-level=high`
- Cypress mocked E2E through `npm run test:e2e:cypress`
- Backend and frontend Docker image build checks
- JaCoCo and frontend build artifacts are uploaded when available

Enterprise hardening adds:

- `.github/workflows/codeql.yml` for CodeQL static analysis
- `.github/dependabot.yml` for Maven, npm, GitHub Actions, Docker, and Docker Compose dependency updates
- A conservative JaCoCo coverage gate in `backend/pom.xml`

CD is planned as Iteration 8, not implemented yet. The next CD step is to push Docker images to GitHub Container Registry, deploy to a selected demo environment, run post-deploy smoke tests, and require GitHub Environment approval. Production deployment remains outside the MVP until hosting, secrets, rollback, monitoring, and compliance requirements are defined.

## Documentation

- Project brief: `docs/project-brief.md`
- Documentation index: `docs/index.md`
- Reviewer guide: `docs/reviewer-guide.md`
- Iteration backlog: `docs/iteration-backlog.md`
- Architecture note: `docs/architecture.md`
- API examples: `docs/api-examples.md`
- Error handling and resilience: `docs/error-handling-and-resilience.md`
- Testing strategy: `docs/testing-strategy.md`
- Enterprise CI hardening: `docs/enterprise-ci-hardening.md`
- Supplied document validation: `docs/supplied-document-validation.md`
- GitHub publishing guide: `docs/github-publishing.md`
- Postman collection guide: `postman/README.md`

## Suggested Next Iterations

- Add role-based authorization and provider/reporting personas
- Track amendment and cancel history as separate audit events
- Replace the single-page React shell with routed clinician/reporting workspaces
- Add Docker image vulnerability scanning, SBOM generation, and image signing
- Implement Iteration 8 CD after a demo environment is selected
