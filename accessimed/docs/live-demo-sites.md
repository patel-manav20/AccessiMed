# Live Demo Site Shortlist

## Date tested

April 25, 2026

Results can vary slightly over time because page structure and crawl paths change, but these were all confirmed against the current AccessiMed backend.

## Best live choices

### 1. Providence

URL:

`https://www.providence.org/`

Observed result:

- pages scanned: `5`
- total violations: `37`

Why it is strong:

- recognizable healthcare brand
- high issue count
- good variety of findings

### 2. Stanford Health Care

URL:

`https://stanfordhealthcare.org/`

Observed result:

- pages scanned: `5`
- total violations: `29`

Why it is strong:

- recognizable healthcare brand
- reliable scan behavior
- good backup if Providence feels too noisy

### 3. Kaiser Permanente

URL:

`https://healthy.kaiserpermanente.org/front-door`

Observed result:

- pages scanned: `5`
- total violations: `23`

Why it is strong:

- very recognizable brand
- stable scan result
- easy to explain in a healthcare demo

### 4. UCSF Health

URL:

`https://www.ucsfhealth.org/`

Observed result:

- pages scanned: `5`
- total violations: `7`

### 5. Mayo Clinic

URL:

`https://www.mayoclinic.org/`

Observed result:

- pages scanned: `5`
- total violations: `6`

## Recommended order for a live demo

### Primary

1. `https://www.providence.org/`
2. `https://stanfordhealthcare.org/`
3. `https://healthy.kaiserpermanente.org/front-door`

### Safe fallback

1. `https://www.ucsfhealth.org/`
2. `https://www.mayoclinic.org/`

## Sites to avoid live

These were blocked or unreliable during testing:

- `https://my.clevelandclinic.org/` -> `403`
- `https://www.hopkinsmedicine.org/` -> `403`
- `https://www.cedars-sinai.org/` -> `403`

## Provider note

AccessiMed currently uses:

- `OpenAI` first
- `Anthropic` fallback
- deterministic fallback last

Practical demo advice:

- use public websites for `scan + dashboard + one fix preview + report`
- use `demo-site/` for the CLI and exact file-change demo

That split gives you the most reliable demo story.
