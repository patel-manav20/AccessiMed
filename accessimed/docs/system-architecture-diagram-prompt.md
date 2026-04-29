# System Architecture Diagram Prompt

Create a clean enterprise-style system architecture diagram for a project named **AccessiMed**.

The audience is open-source developers and maintainers. The result should be presentation-ready, modern, and easy to understand quickly. Use a light background, teal and slate accents, clear arrows, subtle shadows, and readable labels. Avoid clutter and avoid cartoon styling.

Render the output as **one polished slide-style architecture diagram**.

The architecture should make one point obvious: **the installable Python package is the core, and the API/frontend are optional companion surfaces**.

## Main layers to show

### 1. Package and CLI layer

Label this section:

`AccessiMed Python Package`

Include:

- `accessimed init`
- `accessimed doctor`
- `accessimed code test`
- `accessimed code fix`
- `.accessimed.toml`

Optional caption:

`Primary open-source developer workflow`

### 2. Shared application services

Label this section:

`Shared Services`

Include:

- Auditor Service
- Local Code Service
- Fix Service
- Reporter Service
- Crawler Service
- LLM Service
- Deterministic Accessibility Helpers

Show the main local path:

`local codebase -> scan -> severity scoring -> fix generation -> optional file apply`

### 3. Optional API layer

Label this section:

`FastAPI Companion API`

Show these endpoints:

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`
- `POST /api/v1/fixes/bulk`
- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

### 4. Optional frontend layer

Label this section:

`React / Vite Companion Frontend`

Include:

- URL scan page
- dashboard
- fix preview modal
- report download

### 5. Persistence layer

Label this section:

`SQLite Persistence`

Show three tables:

- `scans`
- `violations`
- `fixes`

Note that the CLI local code workflow can operate without the database for basic local scans.

### 6. External integrations

Label this section:

`External Tools and Providers`

Include:

- Playwright
- axe-core
- OpenAI API
- Anthropic API

## Side callouts

Add small, tasteful callouts for:

- deterministic local mode
- optional LLM augmentation
- reviewable Git diff workflow
- optional live URL scans
- future IDE and CI integrations

## Style constraints

- Keep the diagram clean and not overcrowded
- Make the package and CLI layer visually dominant
- Use clear directional arrows
- Prefer grouped layers over scattered icons
- Keep text short enough to be readable on one slide
- Make it feel like a serious technical architecture diagram, not a product landing page
