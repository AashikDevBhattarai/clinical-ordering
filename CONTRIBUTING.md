# Contributing

This project uses small, reviewable changes and keeps documentation in sync with behavior.

## Local Checks

Run the relevant checks before opening a pull request:

```bash
cd backend
mvn verify
```

```bash
cd frontend
npm ci
npm run test:unit
npm run build
npm run test:e2e:cypress
```

## Change Guidelines

- Keep controllers thin; put workflow rules in services, especially `ReportWorkflowService`.
- Keep DTO validation authoritative on the backend.
- Do not retry mutating clinical actions automatically.
- Update `docs/api-examples.md` when changing REST contracts.
- Update `docs/iteration-backlog.md` when a change represents a new planned or delivered iteration.
- Add or update tests with behavior changes.

## Pull Request Expectations

- Explain the user-facing or system-facing outcome.
- List validation performed.
- Call out known limitations honestly.
- Avoid mixing unrelated refactors with feature work.
