# Ayush Backend Guide

## Scope completed

Your backend ownership is now implemented as a focused FastAPI service plus a developer CLI. It covers:

- site scan orchestration
- multi-page crawl
- accessibility audit
- SQLite persistence
- PDF report generation
- single-fix and bulk-fix workflows
- severity scoring
- local CLI-based developer remediation workflow
- tests and documentation

## Folder structure

```text
backend/
  app/
    api/
    core/
    db/
    repositories/
    schemas/
    services/
  tests/
docs/
demo-site/
```

This structure stays intentionally small so you can explain it quickly during judging.

## How the backend works

1. `POST /api/v1/scans` accepts a URL.
2. `ScanWorkflow` uses LangGraph to run crawl then audit.
3. `CrawlerService` discovers up to five same-origin pages.
4. `AuditorService` tries Playwright + axe-core first.
5. If browser-based auditing is unavailable, it falls back to deterministic heuristic checks so the demo still works.
6. Findings are stored in SQLite with scan and violation lineage.
7. `ReporterService` writes a PDF report for download.
8. `FixService` creates single or bulk remediations using Anthropic or OpenAI when configured, otherwise a deterministic remediation engine.
9. `accessimed code test` and `accessimed code fix --apply` support a Snyk-style developer workflow for local codebases.

## Why this structure scores well

### Technical Architecture & Depth

- clear separation between API, services, persistence, and workflow orchestration
- async stack with FastAPI, SQLAlchemy async, and concurrent auditing
- LangGraph included for visible orchestration instead of hidden helper calls
- dual workflow story: live website scanning plus developer CLI

### Scalability & Performance

- crawl limit is capped for predictable demo latency
- async requests and concurrent page audits keep scans fast
- SQLite is enough for the hackathon MVP and can be swapped later because storage is isolated behind repository code

### Data Governance & Quality

- scan -> violation -> fix lineage is persisted with foreign keys
- input validation uses Pydantic
- reports, fixes, and errors are stored in a traceable way
- provider keys are optional and used only when configured

### Functionality & Demo

- end-to-end flow works without needing provider credentials
- the browser-based audit path exists for the stronger live demo
- heuristic fallback makes the system resilient if external dependencies fail
- the CLI creates a very defensible developer workflow story

## Demo script for your backend section

1. Start the backend.
2. Run a scan on the demo clinic site or another public healthcare-like page.
3. Show severity-scored violations in the scan response.
4. Download the PDF report.
5. Generate one single fix and show before/after HTML.
6. Generate bulk fixes.
7. Run the CLI against the local demo site and show the developer workflow.

## Honest architectural adjustment

The original context implied automatic GitHub PR patching directly from scanned website DOM snippets. That is too aggressive as a default when the backend does not know the repository structure behind an arbitrary public site. I adjusted the product direction to a Snyk-style workflow:

- live website scan for discovery and reporting
- local CLI for developer remediation workflow
- exact-match file updates only for controlled static demo code

That makes the implementation cleaner and easier to defend in Q&A.

## Commands you will actually use

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
pytest -q
accessimed code test ../demo-site
accessimed code fix ../demo-site --apply
```

## What to say if judges ask about scale

Say that SQLite is the MVP store because it minimizes operational complexity for the demo, but the repository and session layers were isolated so the migration path to PostgreSQL is straightforward. Also mention that the scan workflow is already stateless and async, and that the CLI workflow can fit naturally into IDE and CI pipelines later.
