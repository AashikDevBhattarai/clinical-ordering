# Project Brief

## Goal

Build a small clinical ordering system that demonstrates a realistic patient-to-order-to-report workflow for echocardiograms.

## Primary Use Cases

1. A doctor finds or creates a patient.
2. The doctor places an echocardiogram order.
3. The reporting system receives that order and creates a draft report.
4. A reporting user enters findings and finalizes the report.
5. A finalized report can later be amended or canceled.

## Scope For This MVP

- REST API using Spring Boot, JPA, and Hibernate
- In-memory persistence with H2 by default
- Optional PostgreSQL profile for persistent local evaluation
- Optional Keycloak-ready OAuth2 resource-server profile
- React single-page UI
- Core lifecycle management for patients, orders, and reports
- Clear separation between ordering and reporting responsibilities

## Out Of Scope

- Full HL7/FHIR compliance
- Advanced user roles and permissions
- Production-grade audit logging
- Attachment handling, measurements, and structured echo findings
- Real deployment automation
- LLM-generated diagnosis or autonomous report finalization

## Assumptions

- Only one study type is required for the challenge: `ECHOCARDIOGRAM`
- Patient demographics are intentionally lightweight
- Report findings are free text
- Assistant-generated report text is optional and must be reviewed by a clinician
- Finalized reports move to `AMENDED` if changed later, rather than cycling back into draft
- Canceling a report also cancels the linked order

## Later Iteration: Optional Report Assistant

- A later iteration adds an optional report text assistant for draft wording.
- The current assistant implementation uses a deterministic local provider by default.
- It is structured so a real OpenAI, Azure OpenAI, local model, or hospital-approved LLM adapter can be added later.
- Assistant-generated text remains a drafting aid only and must be reviewed by a clinician.

## Resource / Tech Choices

- Backend: Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security, Bean Validation, Hibernate
- Runtime: Java 17
- Database: H2 in-memory by default, PostgreSQL 16 via Docker Compose when persistence is desired
- Frontend: React 18 + Vite 5 + Fetch API
- Styling: Custom CSS
- Test tooling: JUnit/Spring integration tests, Vitest, Cypress, Selenium, k6, Lighthouse CI
- Optional auth tooling: Keycloak 25
- CI tooling: GitHub Actions, CodeQL, Dependabot, OWASP Dependency-Check, npm audit, JaCoCo

## Delivery Status

- Iterations 0 through 6 cover the clinical workflow, hardening, tests, CI automation, and optional deterministic report assistant.
- Iteration 7 adds enterprise CI hardening on top of the pre-existing workflow.
- Iteration 8 is documented as planned CD work because deployment requires a selected environment, secrets strategy, approval policy, rollback plan, and monitoring expectations.
