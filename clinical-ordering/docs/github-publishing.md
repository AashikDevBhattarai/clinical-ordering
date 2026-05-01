# GitHub Publishing Guide

Use this guide to publish the project cleanly to GitHub.

## Repository Packaging

The repository is structured for review:

- `README.md`: primary entry point.
- `docs/`: architecture, testing, API examples, iteration plan, CI hardening, and reviewer guide.
- `postman/`: importable Postman collection and local environment.
- `.github/workflows/`: CI and CodeQL workflows.
- `.github/dependabot.yml`: dependency update monitoring.
- `docs/artifacts/source-documents/`: supplied Word reference files.
- `docs/assets/screenshots/`: screenshots used for troubleshooting/validation.

## What Not To Commit

The `.gitignore` excludes generated or machine-local files:

- `frontend/node_modules/`
- `frontend/dist/`
- `backend/target/`
- `frontend/.lighthouseci/`
- `reports/`
- `.DS_Store`

Before committing, confirm these are not staged.

## First-Time GitHub Publish

From the project root:

```bash
git init
git add README.md backend frontend docs postman infra scripts tests .github docker-compose.yml .gitignore
git status
git commit -m "Initial clinical ordering system MVP"
git branch -M main
```

Create an empty repository on GitHub named `clinical-ordering-system`, then connect and push:

```bash
git remote add origin https://github.com/<your-github-user>/clinical-ordering-system.git
git push -u origin main
```

## Recommended Repository Settings

After pushing:

- Enable GitHub Actions.
- Enable CodeQL/code scanning if GitHub does not enable it automatically.
- Enable Dependabot alerts and security updates.
- Add branch protection on `main`.
- Require the CI and CodeQL checks before merge.
- Require pull request review before merge.
- Add repository topics: `spring-boot`, `react`, `clinical-workflow`, `jpa`, `cypress`, `github-actions`.

## Optional Secret

The OWASP Dependency-Check job can use an NVD API key to reduce rate-limit risk.

Add this repository secret if available:

- `NVD_API_KEY`

## Suggested Pull Request Flow

For future changes:

```bash
git checkout -b feature/<short-description>
git add .
git commit -m "Describe the change"
git push -u origin feature/<short-description>
```

Open a pull request and verify:

- Backend Maven verify passes.
- Frontend unit/build passes.
- Cypress mocked E2E passes.
- CodeQL passes.
- Dependency scan gates pass.
- Docker build check passes.
