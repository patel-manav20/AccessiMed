# Demo Validation

## Demo surfaces used

### Public website demo

Recommended live-scan targets are listed here:

- [docs/live-demo-sites.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/live-demo-sites.md)

### Local code demo

The developer workflow demo codebase is:

- [demo-site/index.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/index.html)
- [demo-site/appointments.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/appointments.html)
- [demo-site/portal.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/portal.html)

## Validated demo paths

## 1. Frontend scan flow

Validated through the integrated frontend/backend contract:

- website URL input
- scan submission
- dashboard-ready result shape
- report download path
- single-fix preview path

## 2. Backend scan flow

Validated endpoints:

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`

## 3. Developer workflow

Validated commands:

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
accessimed code fix /tmp/accessimed-one-fix --finding 7 --apply
```

That proves:

- local code findings can be surfaced in CLI
- a single finding can be selected
- one exact file change can be written
- the result is reviewable as a normal Git diff

## 4. Local code API workflow

Validated endpoints:

- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

That gives you a future frontend integration path if you want a richer “accept fix” experience later.

## Latest verified numbers

### Local backend smoke

- pages scanned: `3`
- violations found: `9`

### CLI demo-site scan

- findings found: `12`

### Public site smoke

- site: `https://healthy.kaiserpermanente.org/front-door`
- pages scanned: `5`
- violations found: `23`

## What the demo proves well

- AccessiMed can scan live healthcare websites
- findings are severity-scored
- PDF reports are downloadable
- remediation suggestions are available
- developers can run a CLI workflow locally
- developers can apply one concrete fix and review the diff

## What remains intentionally narrow

- local auto-apply is conservative and exact-match based
- it is strongest on static HTML
- it does not claim arbitrary framework-aware source patching yet

That boundary is still acceptable for the current product story because the main goal is to demonstrate a complete, believable workflow from scan to remediation review.
