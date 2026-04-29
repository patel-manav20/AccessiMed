# Testing Summary

## Date

April 25, 2026

## Automated verification

### Backend test suite

Command:

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Result:

```text
9 passed
```

Covered areas:

- health endpoint
- live scan flow
- PDF report download
- single-fix generation
- bulk-fix generation
- local code scan flow
- local single-finding apply flow
- local multi-fix apply flow
- deterministic remediation path

Primary test files:

- [backend/tests/test_api.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/test_api.py)
- [backend/tests/test_local_code.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/test_local_code.py)
- [backend/tests/test_services.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/test_services.py)

### Frontend production build

Command:

```bash
cd frontend
npm run build
```

Result:

- build passed
- compiled React/Vite app successfully

## Live smoke validation

## Backend API

Verified manually against a running backend:

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`
- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

Observed local demo-site scan result:

- pages scanned: `3`
- violations found: `9`

Observed public website result during the latest smoke check:

- site: `https://healthy.kaiserpermanente.org/front-door`
- pages scanned: `5`
- violations found: `23`

## CLI verification

Verified commands:

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
accessimed code fix /tmp/accessimed-one-fix --finding 7 --apply
```

Observed behavior:

- scan prints numbered findings
- terminal severity badges render
- exit code is `1` when findings exist
- single-finding apply updates one real file
- resulting change is reviewable through `git diff`

## Provider validation

Current provider order:

1. `OpenAI`
2. `Anthropic`
3. deterministic fallback

Verified:

- OpenAI key works
- Anthropic key works
- live fallback path works when OpenAI rate-limits

Latest observed live remediation result:

- OpenAI returned `429`
- backend fell back to Anthropic
- remediation returned successfully with `provider=anthropic`

## What is confirmed working

- backend boots cleanly
- frontend builds cleanly
- frontend/backend API contract is aligned
- live website scan flow works
- dashboard-compatible data shape is returned
- PDF reporting works
- AI fix preview generation works
- CLI developer workflow works
- local single-finding file apply works

## Honest boundary

The local auto-apply flow is intentionally conservative and designed for exact-match static HTML updates. That is a good fit for the demo and for controlled code review workflows, but it is not claiming framework-aware source rewriting for arbitrary application architectures.
