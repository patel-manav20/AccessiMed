# Technical Architecture

This document explains AccessiMed as it should be understood now: a CLI-first open-source package with optional API and frontend companions.

## Core principle

The `backend/` package is the real center of the system.

It contains:

- the installable `accessimed` CLI
- the shared scanning and remediation logic
- the optional FastAPI server
- the tests

The frontend is not the core engine. It is a companion surface layered on top.

## Primary package surface

### CLI entry point

[backend/app/cli.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/cli.py)

Main responsibilities:

- parse user commands
- load `.accessimed.toml`
- select remediation mode
- run scans
- render terminal output
- apply local fixes

Current commands:

- `accessimed init`
- `accessimed config path`
- `accessimed config show`
- `accessimed doctor`
- `accessimed code test`
- `accessimed code fix`

### User configuration

[backend/app/core/user_config.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/core/user_config.py)

Defines the local config file model:

- scan root
- remediation provider
- page limits
- Playwright toggle
- provider model overrides

### Runtime settings

[backend/app/core/config.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/core/config.py)

Defines environment-based runtime settings used by both the CLI and the API.

## Shared service layer

The service layer is intentionally reusable across CLI and HTTP workflows.

### Auditor service

[backend/app/services/auditor.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/auditor.py)

Runs accessibility analysis on HTML content and browser-loaded pages.

### Local code service

[backend/app/services/local_code.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/local_code.py)

This is the key CLI workflow layer.

Responsibilities:

- scan local HTML files
- assign stable finding indexes per run
- generate fixes
- apply one finding or multiple conservative replacements

### Remediation service

[backend/app/services/llm.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/llm.py)

Handles provider-backed fix generation.

Supported modes:

- `local`
  no provider calls
- `auto`
  OpenAI first, Anthropic second
- `openai`
  OpenAI only
- `anthropic`
  Anthropic only

### Deterministic accessibility helpers

[backend/app/services/accessibility.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/accessibility.py)

Provides rule mapping, scoring, reference URLs, and deterministic fix behavior that keeps AccessiMed useful without an LLM.

This layer is important to describe correctly:

- rule detection is aligned with axe/WCAG concepts
- severity mapping is an AccessiMed product decision
- deterministic remediation is an AccessiMed implementation choice for common HTML cases

That means AccessiMed is not claiming to be the standards body. It is building a developer workflow on top of recognized accessibility rules.

## Optional API surface

### FastAPI application

[backend/app/main.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/main.py)

### Routes

[backend/app/api/routes.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/api/routes.py)

The API exposes two kinds of workflows:

1. `live website scan workflow`
2. `local code workflow over HTTP`

Main routes:

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`
- `POST /api/v1/fixes/bulk`
- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

## Optional frontend surface

The frontend lives in `frontend/` and consumes the API.

Main files:

- [frontend/src/pages/AboutPage.jsx](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/pages/AboutPage.jsx)
- [frontend/src/pages/ScanPage.jsx](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/pages/ScanPage.jsx)
- [frontend/src/pages/DashboardPage.jsx](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/pages/DashboardPage.jsx)
- [frontend/src/services/scanService.js](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/services/scanService.js)

Responsibilities:

- collect scan inputs
- show findings
- show AI fix previews
- download PDF reports

## Persistence

The current persistence layer uses SQLite.

Tables:

- `scans`
- `violations`
- `fixes`

Primary files:

- [backend/app/db/models.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/db/models.py)
- [backend/app/repositories/scans.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/repositories/scans.py)

The local CLI workflow does not need the database for basic code scanning. That is a nice property for open-source adoption because developers can use the core tool without starting the web stack.

## External dependencies

### Playwright

Used for browser-based page loading and auditing.

### axe-core

Used for accessibility rule detection.

### OpenAI and Anthropic

Optional providers for richer remediation generation.

## Why this architecture is a good open-source base

The important design win is separation of concerns:

- one installable Python package
- one shared service layer
- CLI-first workflow
- optional API
- optional frontend
- deterministic local mode as a first-class path

That keeps the core useful on its own while leaving room for future IDE integrations, CI adapters, and editor extensions.
