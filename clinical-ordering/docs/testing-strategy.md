# Testing Strategy

## Goal

Use a layered test pyramid so the clinical workflow is validated at multiple confidence levels:

- Unit tests for isolated business rules and mappings
- Integration tests for Spring REST, JPA, and database behavior
- Frontend component and app-flow tests for UI state transitions
- Browser E2E automation for realistic user journeys
- Performance checks for API throughput and frontend quality signals

## Test Matrix

### Backend Unit Tests

Location:

- `backend/src/test/java/**/*Test.java`

Examples:

- `workflow/ReportWorkflowServiceTest`
- `factory/StudyOrderFactoryTest`
- `mapper/PatientMapperTest`
- `mapper/OrderMapperTest`
- `service/PatientServiceTest`

Purpose:

- Validate lifecycle rules in isolation
- Keep business logic deterministic and fast
- Catch mapping / factory regressions without booting Spring

Run:

```bash
cd backend
mvn test
```

### Backend Integration Tests

Location:

- `backend/src/test/java/**/*IT.java`

Examples:

- `ClinicalWorkflowIT`
- `repository/PatientRepositoryIT`

Purpose:

- Validate real REST contract behavior
- Verify JPA persistence and search behavior
- Confirm patient -> order -> report state synchronization end to end
- Confirm assistant suggestions do not mutate report/order lifecycle state

Run:

```bash
cd backend
mvn verify
```

Notes:

- `maven-surefire-plugin` runs unit tests
- `maven-failsafe-plugin` runs integration tests
- JaCoCo generates coverage during `verify`

Coverage output:

- `backend/target/site/jacoco/index.html`

### Frontend Unit / Integration Tests

Location:

- `frontend/src/**/*.test.jsx`

Examples:

- `components/StatusBadge.test.jsx`
- `components/ReportWorkspace.test.jsx`
- `App.test.jsx`
- `api/client.test.js`

Purpose:

- Validate component states and button enablement
- Exercise React-side orchestration with mocked API clients
- Verify client-level retry, timeout/circuit-open behavior, and validation-message normalization
- Catch UI regressions without a running backend

Run:

```bash
cd frontend
npm install
npm run test:unit
```

### Cypress E2E

Location:

- `frontend/tests/cypress/e2e/clinical-workflow.cy.js`

Purpose:

- Run a browser-based happy path through create patient, place order, finalize, amend, and cancel
- Validate the UI with stateful mocked API responses
- Catch broken selectors and browser interaction issues

Run:

```bash
cd frontend
npm install
npm run test:e2e:cypress
```

Notes:

- The npm script builds the frontend before starting `vite preview`.
- Starts `vite preview` automatically on port `4173`
- Does not require the backend because requests are intercepted in Cypress
- Uses `frontend/scripts/run-with-server.mjs` instead of `start-server-and-test`, so Windows cleanup does not depend on the removed `wmic.exe` utility.

### Selenium Smoke Test

Location:

- `frontend/tests/selenium/clinical-ordering.smoke.mjs`

Purpose:

- Validate a live-stack browser workflow against the running application
- Provide an evaluator-friendly automation option that does not depend on Cypress route interception

Prerequisites:

- Frontend running locally, typically on `http://127.0.0.1:5173`
- Backend running with demo data or a manually prepared patient
- A local browser driver / Selenium-compatible browser

Run:

```bash
cd frontend
npm install
npm run test:e2e:selenium
```

Environment variables:

- `SELENIUM_BASE_URL`
- `SELENIUM_BROWSER`

Windows live-stack example:

```powershell
# Terminal 1
cd C:\work\clinical-ordering\backend
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"

# Terminal 2
cd C:\work\clinical-ordering\frontend
npm run dev

# Terminal 3
cd C:\work\clinical-ordering\frontend
npm run test:e2e:selenium
```

If Chrome is not available:

```powershell
$env:SELENIUM_BROWSER = "MicrosoftEdge"
npm run test:e2e:selenium
```

### API Performance Test

Location:

- `tests/performance/api-workflow.js`

Tool:

- `k6`

Purpose:

- Create patients and orders repeatedly
- Finalize reports under concurrent load
- Measure latency and error-rate thresholds

Thresholds:

- Failed request rate `< 2%`
- `p95` request duration `< 750ms`

Run:

```bash
k6 run ./tests/performance/api-workflow.js
```

Environment variables:

- `API_BASE_URL`
- `K6_VUS`
- `K6_DURATION`

### Frontend Performance / Quality Audit

Location:

- `frontend/lighthouserc.json`

Tool:

- Lighthouse CI

Purpose:

- Provide a quick frontend quality gate for performance, accessibility, and best practices

Run:

```bash
cd frontend
npm install
npm run test:perf:lighthouse
```

Default assertions:

- Performance score `>= 0.70` as warning threshold
- Accessibility score `>= 0.85`
- Best-practices score `>= 0.80`

Output:

- `frontend/reports/lighthouseci`

## Recommended QA Flow

1. Run backend unit tests: `cd backend && mvn test`
2. Run backend integration suite: `cd backend && mvn verify`
3. Run frontend unit/integration tests: `cd frontend && npm run test:unit`
4. Run Cypress E2E: `cd frontend && npm run test:e2e:cypress`
5. Run Selenium smoke against the live stack: `cd frontend && npm run test:e2e:selenium`
6. Run performance checks: `k6 run ./tests/performance/api-workflow.js` and `cd frontend && npm run test:perf:lighthouse`

## Postman / Manual API Smoke

Use `docs/api-examples.md` as the authoritative Postman sequence. It covers:

- Get patients with `GET /api/patients?query=...`
- Get orders with `GET /api/orders?patientId=...`
- Get the linked report
- Save draft findings with `PUT /api/reports/{id}/draft`
- Finalize, verify, amend, cancel, then verify final order/report synchronization

This sequence reconciles the supplied `postman.docx` checklist with the implemented REST contract.

## Optional Keycloak Smoke Check

This validates that the API can run as an OAuth2 resource server. It is intentionally a smoke check, not a full login UI.

```powershell
cd C:\work\clinical-ordering
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

In a second terminal:

```powershell
cd C:\work\clinical-ordering
$token = (& .\scripts\keycloak-token.ps1)
Invoke-RestMethod http://localhost:8080/api/patients -Headers @{ Authorization = "Bearer $token" }
```

## GitHub Actions CI

Backlog mapping:

- Planned and delivered as `Iteration 5: GitHub Actions CI Automation`
- Hardened in `Iteration 7: Enterprise CI Hardening`

Location:

- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/dependabot.yml`

Triggers:

- Pushes to `main` and `master`
- Pull requests
- Manual `workflow_dispatch`
- Weekly CodeQL scheduled scan

Jobs:

- Backend Maven Verify: runs `mvn -B verify` with Java 17, Maven dependency caching, integration tests, and JaCoCo coverage enforcement
- Backend Dependency Vulnerability Scan: runs OWASP Dependency-Check and fails on CVSS `>= 7`
- Frontend Unit Tests And Build: runs `npm ci`, `npm run test:unit`, and `npm run build`
- Frontend Dependency Audit: runs `npm audit --audit-level=high`
- Cypress Mocked E2E: runs `npm ci` and `npm run test:e2e:cypress`
- Docker Build Check: builds backend and frontend images without pushing them
- CodeQL: analyzes Java/Kotlin and JavaScript/TypeScript with `security-and-quality` queries

Artifacts:

- Backend Surefire/Failsafe reports
- Backend JaCoCo report from `backend/target/site/jacoco`
- Backend OWASP Dependency-Check reports from `backend/target/dependency-check-report.*`
- Frontend production build from `frontend/dist`
- Cypress screenshots on failure

Enterprise hardening details:

- See `docs/enterprise-ci-hardening.md`

## Current Limitation In This Environment

This Codex environment does not currently have Java, Maven, or Docker installed, so backend Maven tests, OWASP Dependency-Check, and Docker image builds cannot be executed here. Frontend unit tests, frontend production build, npm audit, and Cypress mocked E2E have been executed successfully in this environment.
