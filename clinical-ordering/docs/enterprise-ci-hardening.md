# Enterprise CI Hardening

This iteration extends the challenge-ready CI pipeline toward a typical corporate baseline. It does not claim to be a complete regulated production pipeline, but it covers the core checks reviewers expect to see in a Java/React delivery workflow.

## Implemented Checks

### Build And Test

- Backend `mvn -B verify` runs unit tests, integration tests, packaging checks, and JaCoCo coverage generation.
- Frontend `npm ci`, `npm run test:unit`, and `npm run build` validate a clean install and production build.
- Cypress mocked E2E validates the browser workflow without requiring a live backend.

### Static Analysis

- CodeQL runs for Java/Kotlin and JavaScript/TypeScript in `.github/workflows/codeql.yml`.
- CodeQL uses the `security-and-quality` query suite.
- Results are uploaded to GitHub code scanning when the repository has code scanning available.

### Dependency Security

- Backend OWASP Dependency-Check scans Maven dependencies and fails on CVSS `>= 7`.
- The Dependency-Check job uses `secrets.NVD_API_KEY` when available to reduce NVD rate-limit risk.
- Frontend `npm audit --audit-level=high` fails on high or critical npm advisories.
- Dependabot monitors Maven, npm, GitHub Actions, backend Docker, frontend Docker, and Docker Compose dependencies.

### Coverage Gate

- JaCoCo enforces an initial backend line coverage threshold of `40%`.
- The threshold is intentionally conservative for the first hardening iteration.
- A stronger enterprise target would usually raise this over time and enforce coverage by package or changed lines.

### Container Build Check

- Backend Docker image builds from `backend/Dockerfile`.
- Frontend Docker image builds from `frontend/Dockerfile`.
- CI validates image builds but does not push images to a registry.

## Intentionally Excluded For Now

- Secret scanning configuration, branch protection, required reviews, required status checks, and protected environments are GitHub repository or organization settings rather than source files.
- Docker image vulnerability scanning is not enabled yet; add Trivy, Grype, or the organization-standard scanner before production use.
- SBOM generation and image signing are not enabled yet; add Syft/CycloneDX and Cosign or the organization-standard equivalents.
- License compliance scanning is not enabled yet; add the organization-approved tool because acceptable licenses are policy-specific.
- DAST is not enabled yet because this MVP has no deployed test environment.
- Keycloak authenticated smoke testing is documented for local use but not part of CI yet because it requires a live auth service and test-token strategy.

## How To Raise The Bar Later

- Increase the JaCoCo line coverage gate from `40%` toward the team target.
- Add package-level or changed-line coverage gates.
- Add container vulnerability scanning after Docker image builds.
- Generate and upload SBOM artifacts for backend and frontend images.
- Implement `Iteration 8: Deployment Automation / CD` after a demo environment is selected.
- Turn repository settings into required branch protection checks.
