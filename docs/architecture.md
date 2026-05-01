# Architecture Note

## Intent

The core MVP turns the original spike into a cleaner, more interview-defensible codebase by separating workflow orchestration, mapping, and state-transition rules. A later optional iteration adds an assistive report-text boundary without changing the core clinical lifecycle.

## Design Approach

- Controllers stay thin and delegate to application services.
- Application services orchestrate repositories and domain collaborators.
- Mappers convert entities to API response DTOs and isolate presentation concerns.
- A factory creates `StudyOrder` aggregates with their initial draft `Report`.
- A workflow service owns report lifecycle transitions and the linked order state synchronization.
- A report text assistant is isolated behind an interface so the default deterministic provider can later be replaced by a real LLM integration.

## SOLID-Oriented Choices

### Single Responsibility

- `PatientService`, `OrderService`, and `ReportService` handle use-case orchestration only.
- `PatientMapper`, `OrderMapper`, and `ReportMapper` own DTO conversion.
- `StudyOrderFactory` owns aggregate creation.
- `ReportWorkflowService` owns the lifecycle state machine rules.

### Open/Closed

- The workflow rules are isolated behind `ReportWorkflowService`, so adding new states or branching rules does not require controller changes.
- Security mode is configured through properties and profiles instead of hard-coded behavior.

### Liskov Substitution

- Request DTOs are now explicit per action (`finalize`, `amend`, `cancel`) so each endpoint enforces only the contract it actually needs.

### Interface Segregation

- The API contract avoids one oversized "report action" payload and uses smaller purpose-specific request objects.

### Dependency Inversion

- Higher-level services depend on collaborators such as mappers, factory, lookup service, and workflow service rather than embedding those details directly.
- Time-dependent lifecycle logic depends on an injected `Clock`, making tests deterministic.

## Patterns Used

- Factory Pattern: `StudyOrderFactory`
- Mapper Pattern: `PatientMapper`, `OrderMapper`, `ReportMapper`
- Application Service Pattern: `PatientService`, `OrderService`, `ReportService`
- Domain Workflow / Policy Pattern: `ReportWorkflowService`
- Strategy Pattern: `ReportTextAssistant` with `TemplateReportTextAssistant`
- Configuration-by-Profile Pattern: H2 default, PostgreSQL profile, Keycloak-ready profile

## Persistence Strategy

- Default profile uses H2 for low-friction local development.
- `postgres` profile supports persistent evaluation using Docker Compose.
- The database layer remains JPA/Hibernate so the same domain model works across both modes.

## Security Strategy

- Default local mode leaves auth disabled to reduce setup friction.
- `keycloak` profile switches the API into OAuth2 resource-server mode using a Keycloak issuer.
- The Keycloak profile also sets the JWK set URI so backend startup is less sensitive to Keycloak discovery timing while JWT issuer validation remains configured.
- This keeps auth awareness visible without forcing auth setup for every evaluator.

## Error And Resilience Strategy

- Bean Validation on request DTOs is the authoritative validation layer.
- `RestExceptionHandler` turns business, validation, malformed-body, and unexpected exceptions into a stable JSON error contract.
- The frontend API client preserves field-level errors for inline rendering and normalizes network failures into user-facing messages.
- Automatic retries are limited to safe read requests only.
- Mutating clinical actions are intentionally not retried automatically because they are not idempotent.
- A lightweight client-side circuit breaker prevents the UI from repeatedly hammering an unavailable API.
- A server-side circuit breaker is intentionally deferred until there is a real outbound network integration to protect.

## Later Iteration: LLM / Assistant Strategy

- The original ordering/reporting requirements did not require an LLM.
- A later iteration adds a deliberately conservative and deterministic assistant provider.
- It suggests report wording from patient/order/report context but does not diagnose, finalize, amend, or cancel anything.
- Suggested text must be manually applied into the findings editor and still passes through the normal save/finalize/amend workflow.
- The assistant boundary is `ReportTextAssistant`, so a future OpenAI, Azure OpenAI, local model, or hospital-approved LLM adapter can be added without changing controllers or UI flow.
