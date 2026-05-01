# Reviewer Guide

This project is packaged as an iterative full-stack delivery, not a one-shot coding exercise.

## What This Demonstrates

- Spring Boot REST API with JPA/Hibernate and clear service boundaries.
- React/Vite frontend for patient intake, echo ordering, and report lifecycle actions.
- Explicit report/order state machine: `DRAFT`, `FINALIZED`, `AMENDED`, `CANCELED`.
- SOLID-oriented structure: thin controllers, service orchestration, mappers, factory, workflow service, and assistant interface.
- Defensive API behavior: DTO validation, global exception handling, stable error response shape.
- Frontend resilience: safe-read retries, no automatic retries for mutating clinical actions, and lightweight circuit breaker.
- Layered testing: backend unit/integration tests, frontend unit tests, Cypress, Selenium, k6, and Lighthouse entry points.
- Enterprise CI hardening: CodeQL, Dependabot, OWASP Dependency-Check, npm audit, JaCoCo gate, and Docker build validation.

## Fast Review Path

1. Read `README.md` for the project summary and commands.
2. Read `docs/project-brief.md` for scope and assumptions.
3. Read `docs/iteration-backlog.md` to see how the project was delivered through iterations.
4. Read `docs/architecture.md` for backend/frontend design decisions.
5. Read `docs/testing-strategy.md` for test coverage and validation strategy.
6. Read `docs/enterprise-ci-hardening.md` for corporate-style CI/security checks.
7. Import the Postman collection from `postman/` if you want to exercise the API manually.

## Main Workflow To Validate

1. Create or select a patient.
2. Place an echocardiogram order.
3. Confirm a draft report is created automatically.
4. Save draft findings.
5. Finalize the report and confirm the linked order becomes `FINALIZED`.
6. Amend the finalized report with a reason and confirm the linked order becomes `AMENDED`.
7. Cancel the report with a reason and confirm the linked order becomes `CANCELED`.

## Senior-Level Tradeoffs

- Authentication is disabled by default to keep local evaluation fast, but a Keycloak-ready OAuth2 resource-server profile is present.
- Assistant text is intentionally deterministic and local. The real LLM adapter is isolated behind `ReportTextAssistant` and remains a later integration step.
- Mutating clinical actions are not automatically retried because duplicate state changes are worse than a visible failure.
- A server-side circuit breaker is deferred because the backend currently has no outbound HTTP dependency to protect.
- CD is documented as planned, not faked, because deployment needs a real target environment, secrets strategy, approval model, rollback plan, and monitoring requirements.

## Local Validation Summary

The current environment can validate frontend and static workflow files. Backend and Docker validations are expected to run in GitHub Actions or on a machine with Java, Maven, and Docker installed.

- Frontend unit tests: `npm run test:unit`
- Frontend build: `npm run build`
- Cypress mocked E2E: `npm run test:e2e:cypress`
- Workflow YAML: `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`
