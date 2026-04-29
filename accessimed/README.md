# AccessiMed

AccessiMed is an open-source accessibility scanner and remediation CLI for website teams. It is designed for developers who want a local, reviewable workflow for WCAG issues, with an optional companion web app for live URL scans, dashboards, and PDF reporting.

The CLI is the primary product surface now:

- scan local website codebases
- score findings by severity
- generate deterministic fixes without an LLM
- optionally use OpenAI or Anthropic for richer remediation guidance
- apply one fix at a time so the result shows up as a normal Git diff

The frontend and FastAPI app still exist and still work. They are now best understood as companion surfaces around the same core engine.

## Why this is useful

Most accessibility tools stop at reporting. AccessiMed is built to support a developer workflow:

1. run a scan locally
2. review numbered findings
3. choose a remediation mode
4. apply a targeted fix or make the change manually
5. inspect the result in Git

That makes it much closer to a Snyk-style workflow for accessibility than a report-only scanner.

## What works today

### CLI-first workflow

- `accessimed init` creates a project config
- `accessimed doctor` checks setup, providers, and runtime dependencies
- `accessimed code test` scans local static HTML codebases
- `accessimed code fix` generates fixes and can apply one finding or multiple conservative replacements

### Core scanning and remediation

- browser-backed auditing with Playwright
- WCAG-focused rule checks
- severity model: `Critical`, `High`, `Medium`, `Low`
- deterministic remediation fallback that works without API keys
- optional OpenAI and Anthropic support for richer fix suggestions

### Companion app surfaces

- FastAPI backend for live URL scans and local-code HTTP endpoints
- React/Vite frontend for scan input, dashboard review, fix previews, and PDF downloads
- SQLite persistence for scans, findings, and generated fixes
- PDF report generation

## No-key mode

Yes, a meaningful part of AccessiMed works without any LLM at all.

Without API keys, AccessiMed still does the following:

- scans local HTML files
- finds accessibility issues
- assigns severity scores
- generates deterministic remediation suggestions for common issues
- applies conservative file updates for supported exact-match cases

That keeps the tool usable in CI, local development, and open-source setups without burning tokens on every run.

## Rule Provenance And Standards

AccessiMed is not inventing accessibility rules from scratch.

The rule model has two layers:

### 1. Detection layer

For browser-backed scans, AccessiMed uses:

- `axe-core`
- WCAG `2.1 A` and `2.1 AA` tags

That means the underlying rule detection is based on established accessibility standards and a widely used rules engine rather than handwritten checks alone.

### 2. Local deterministic workflow layer

For local code scanning and local fix generation, AccessiMed currently combines:

- rule IDs and rule references aligned to axe/Deque guidance
- severity mapping maintained in AccessiMed
- deterministic fix templates for common HTML issues

Examples:

- `image-alt`
- `label`
- `button-name`
- `link-name`
- `html-has-lang`
- `color-contrast`

Each rule includes:

- a description
- a help text summary
- a reference URL

Those references currently point to Deque University rule documentation and WCAG guidance.

### Important boundary

The deterministic remediation engine is **our implementation layer**, not an official WCAG autopatcher.

So the safe claim is:

- findings are grounded in established accessibility rules
- deterministic fixes are conservative engineering suggestions for common cases
- final review still belongs with the developer

## Repository layout

```text
AccessiMed/
  backend/      Python package, FastAPI app, CLI, tests
  frontend/     Optional React/Vite companion app
  demo-site/    Intentionally inaccessible sample site for examples and testing
  docs/         Workflow notes, architecture docs, demo guides, diagram prompts
```

## Installation

### Requirements

- Python `3.11+`
- Git
- Playwright Chromium for browser-backed auditing

### Recommended: install globally with `pipx`

```bash
pipx install "git+https://github.com/ayushgawai/accessimed.git#subdirectory=backend"
```

If `pipx` is not installed yet:

```bash
python3 -m pip install --user pipx
python3 -m pipx ensurepath
```

After installation, verify:

```bash
accessimed --help
```

Then install the browser runtime once:

```bash
playwright install chromium
```

### Alternative: install with `uv tool`

```bash
uv tool install "git+https://github.com/ayushgawai/accessimed.git#subdirectory=backend"
playwright install chromium
```

### Alternative: clone for local development

```bash
git clone https://github.com/ayushgawai/accessimed.git
cd accessimed/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
playwright install chromium
```

## Quick Start For A New User

This is the most important workflow in this repository.

Imagine you are a developer working in a completely separate website repo. You do **not** need the AccessiMed source code checked out beside your project if you installed the CLI with `pipx` or `uv tool`.

### 1. Open your website project

```bash
cd /path/to/your-website-project
```

### 2. Create the AccessiMed config

```bash
accessimed init
```

That creates `.accessimed.toml` in the current project.

Default file:

```toml
[accessimed]
root = "/absolute/path/to/your-website-project"
remediation_provider = "local"

[scanning]
max_pages = 5
enable_playwright = true

[providers]
# openai_model = "gpt-5"
# anthropic_model = "claude-sonnet-4-20250514"
```

### 3. Verify local setup

```bash
accessimed doctor
```

This checks:

- where the config file was loaded from
- which root directory will be scanned
- whether Playwright is available
- which remediation mode is active
- whether OpenAI or Anthropic credentials are configured

### 4. Scan the codebase

```bash
accessimed code test
```

If you prefer to pass a path directly instead of relying on config:

```bash
accessimed code test /absolute/path/to/your-website-project
```

### 5. Apply one fix

After reviewing the numbered findings:

```bash
accessimed code fix --finding 7 --apply
```

Or with an explicit path:

```bash
accessimed code fix /absolute/path/to/your-website-project --finding 7 --apply
```

### 6. Review the change in Git

```bash
git status
git diff
```

That review step is intentional. AccessiMed is built to generate normal working-tree changes that fit into an existing engineering workflow.

## Example: Use AccessiMed On Another Local Repo

If you installed AccessiMed and want to test it against a separate local site:

```bash
cd /path/to/that-site
accessimed init
accessimed doctor
accessimed code test
accessimed code fix --finding 5 --apply --provider local
git diff
```

This is the same flow a new user should expect in another IDE or repository.

## CLI help

Top-level help:

```bash
accessimed --help
```

Subcommand help:

```bash
accessimed init --help
accessimed doctor --help
accessimed code test --help
accessimed code fix --help
```

## Remediation modes

AccessiMed supports four remediation modes:

- `local`
  Deterministic, no-LLM mode. Best default for open source, CI, and predictable local runs.
- `auto`
  Try OpenAI first, then Anthropic, then fall back to deterministic behavior if generation fails elsewhere in the workflow.
- `openai`
  Only use OpenAI for fix generation.
- `anthropic`
  Only use Anthropic for fix generation.

Set the mode in `.accessimed.toml`:

```toml
[accessimed]
remediation_provider = "local"
```

Or override it for one command:

```bash
accessimed code fix . --finding 7 --apply --provider local
accessimed code fix . --finding 7 --apply --provider auto
```

## Provider Setup

If you want LLM-backed remediation, set environment variables before running the CLI or backend.

Example:

```bash
export ACCESSIMED_OPENAI_API_KEY=...
export ACCESSIMED_ANTHROPIC_API_KEY=...
```

Model overrides:

```bash
export ACCESSIMED_OPENAI_MODEL=gpt-5
export ACCESSIMED_ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

You can also use environment files when running the backend service locally, but the CLI should be documented and understood first as a tool that can be installed and run independently.

## Why The CLI Does Not Prompt For API Keys

AccessiMed is intentionally non-interactive during normal execution.

It reads configuration from:

1. `.accessimed.toml`
2. environment variables
3. command-line flags

That makes it easier to use in:

- local development
- CI jobs
- editor tasks
- future IDE integrations

If you want a guided setup experience, use:

```bash
accessimed init --interactive
```

That setup flow can ask which remediation mode you want:

- `local`
- `auto`
- `openai`
- `anthropic`

and then write the config file for you.

## Example output

```text
AccessiMed code scan for /Users/me/clinic-site
Findings: 11  🔴 2 Critical | 🟠 6 High | 🟡 3 Medium
🔴 Critical 9.4  #6  Image missing alt text
   clinic-site/index.html :: img
🟠 High 7.7  #7  Link missing accessible name
   clinic-site/index.html :: a
```

## Supported Local Workflow Today

The strongest current fit is:

- static HTML sites
- multi-page brochure sites
- healthcare or regulated-content websites
- teams who want reviewable diffs instead of opaque automation

The current local apply behavior is intentionally conservative:

- exact-match replacements when safe
- deterministic fallback logic for common issues
- skips ambiguous replacements instead of making risky edits

## New User Experience

For an open-source user trying AccessiMed for the first time, the intended experience is:

1. install the CLI once
2. open an existing website repo in their own IDE
3. run `accessimed init`
4. run `accessimed doctor`
5. run `accessimed code test`
6. apply one targeted fix
7. review the diff in Git

That flow should work without the user needing to know anything about this repository’s internal layout.

## Optional Web App And API

If you want the live URL scanning surface too, keep using the existing backend and frontend.

### Backend

```bash
cd backend
source .venv/bin/activate
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend docs:

- `http://127.0.0.1:8000/api/v1/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### Main backend routes

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`
- `POST /api/v1/fixes/bulk`
- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

## Tests

Run the backend test suite:

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Current status after the latest CLI-first refactor:

- `12 passed`

## Docs

- [docs/accessimed-workflow.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/accessimed-workflow.md)
- [docs/technical-architecture.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/technical-architecture.md)
- [docs/complete-demo-guide.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/complete-demo-guide.md)
- [docs/testing-summary.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/testing-summary.md)
- [docs/workflow-diagram-prompt.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/workflow-diagram-prompt.md)
- [docs/system-architecture-diagram-prompt.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/system-architecture-diagram-prompt.md)

## Near-term roadmap

- richer deterministic fix coverage beyond common HTML issues
- framework-aware remediation for React and Next.js
- IDE integration
- CI annotations and SARIF-style output
- optional editor extension

## Honest boundaries

AccessiMed is already useful, but it is not pretending to be magic.

Today it is best described as:

- production-shaped CLI ergonomics
- strong deterministic local workflow
- optional LLM augmentation
- optional companion app

It is not yet:

- a complete codemod engine for every framework
- a full legal compliance certification product
- an IDE extension today

That said, the current structure is a good base to open-source and grow.
