# Error Handling And Resilience

## Summary

This repository now has an explicit policy for validation, error responses, retries, and circuit breaking.

- Backend validation is authoritative and enforced with Bean Validation on request DTOs.
- Frontend validation is advisory and used to fail fast for obvious user mistakes.
- Backend errors return a stable JSON shape so the UI can render meaningful messages.
- Frontend retries only safe read requests.
- Clinical write actions are never automatically retried.
- A lightweight client-side circuit breaker protects the UI from repeatedly hammering an unavailable API.

## Validation

### Backend

Validation is enforced on all mutating REST endpoints with `@Valid` request DTOs:

- `PatientRequest`
- `OrderRequest`
- `ReportDraftUpdateRequest`
- `ReportFinalizeRequest`
- `ReportAmendRequest`
- `ReportCancelRequest`

Current rules include:

- Required names and MRN for patients
- Character and length constraints for patient identity fields
- Date of birth cannot be in the future
- Valid email formatting when provided
- Required study type, priority, ordering provider, and clinical reason for orders
- Required findings for finalize and amend actions
- Required amendment reason and cancel reason for their respective actions

### Frontend

The React client also performs targeted pre-submit validation for high-value workflows:

- Finalize requires findings
- Amend requires findings and amendment reason
- Cancel requires cancel reason

This improves usability, but the backend remains the source of truth.

## Error Response Contract

The backend returns a consistent JSON structure from `RestExceptionHandler`:

```json
{
  "timestamp": "2026-04-29T13:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cancel reason is required.",
  "errors": {
    "cancelReason": "Cancel reason is required."
  }
}
```

Current mappings:

- `404` for missing resources
- `400` for business rule violations and validation failures
- `400` for malformed JSON bodies
- `500` with `Unexpected server error.` for uncaught server exceptions

The frontend API client surfaces the top-level `message` and preserves field errors for inline form rendering.

## Retry Policy

Retries are intentionally conservative because this is a clinical workflow.

### Automatically Retried

Only idempotent read requests are retried:

- `GET`
- `HEAD`
- `OPTIONS`

Retry conditions:

- Network failure
- Timeout
- `500`
- `502`
- `503`
- `504`

Retry behavior:

- Up to `2` retries after the initial attempt
- Exponential backoff: `200ms`, then `400ms`

### Never Automatically Retried

Clinical write actions are not retried automatically:

- Create patient
- Create order
- Save draft
- Finalize report
- Amend report
- Cancel report

Reason:

- These operations change clinical state
- Blind retries risk duplicate or ambiguous writes
- Safe write retries would require idempotency keys and stronger server-side deduplication

## Circuit Breaker Policy

The frontend API client includes a lightweight circuit breaker for transient API outages.

Behavior:

- Counts consecutive transient failures
- Opens after `3` consecutive transient failures
- While open, fails fast for `5` seconds with:
  - `status: 503`
  - message: `API temporarily unavailable. Please wait a few seconds and try again.`
- Resets after a successful response or a non-transient handled error such as `400`

Why client-side here:

- The current system is a single backend application with no outbound reporting-service network hop
- There is no real downstream integration yet where a server-side circuit breaker would add value
- The UI still benefits from not repeatedly calling a known-unavailable API

## Why There Is No Backend Retry Or Server-Side Circuit Breaker Yet

The current backend is a monolith:

- Order placement and report lifecycle happen in-process
- Persistence is direct JPA/Hibernate, not an external HTTP dependency
- There is no separate remote reporting service to wrap with Resilience4j yet

A senior production design would add server-side retry / circuit breaker only around true remote dependencies such as:

- External reporting adapters
- Event publishing to a broker
- Third-party identity or notification calls

Those controls should live at the integration boundary, not around core domain logic or local database writes.

## Test Coverage

Current implemented coverage includes:

- Backend integration tests for validation and lifecycle synchronization
- Backend advice test for stable `500` payloads
- Frontend API client tests for:
  - field-level validation message surfacing
  - safe read retries
  - no retries for writes
  - circuit breaker fail-fast behavior

## Future Hardening

If this challenge evolves into a multi-service system, the next resilience upgrades should be:

1. Add idempotency keys for mutating clinical actions
2. Introduce server-side Resilience4j around real outbound integrations
3. Emit correlation IDs for tracing across UI and API logs
4. Separate business-rule conflicts from validation with `409 Conflict` where appropriate
5. Add observability for breaker-open rate, retry count, and timeout rate
