# Complete Demo Guide

This is the clean walkthrough to use during a live demo. It covers:

- frontend
- backend
- public website scan
- PDF report
- AI fix preview
- CLI developer workflow
- single-finding local apply

## One-sentence product story

AccessiMed helps healthcare teams audit live websites for WCAG issues and helps developers move those findings into reviewable code fixes through a Snyk-style workflow.

## Before the demo

### Backend

```bash
cd /Users/spartan/Documents/GitHub/AccessiMed/backend
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

Open a second terminal:

```bash
cd /Users/spartan/Documents/GitHub/AccessiMed/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### URLs

- frontend: `http://127.0.0.1:5173`
- backend docs: `http://127.0.0.1:8000/api/v1/docs`

## Live website choices

Use one of these for the public scan demo:

1. `https://www.providence.org/`
2. `https://stanfordhealthcare.org/`
3. `https://healthy.kaiserpermanente.org/front-door`
4. `https://www.ucsfhealth.org/`
5. `https://www.mayoclinic.org/`

Shortlist notes are here:

- [docs/live-demo-sites.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/live-demo-sites.md)

## Demo flow

## Part 1: product overview

Start on the landing page.

What to say:

“AccessiMed has two surfaces. First, it scans live healthcare websites and produces severity-scored findings, AI remediation previews, and PDF reports. Second, it gives developers a workflow to review and apply accessibility fixes inside their local codebase.”

## Part 2: website scan

Go to `/scan`.

### Use this input

Primary choice:

`https://www.providence.org/`

Safe fallback:

`https://healthy.kaiserpermanente.org/front-door`

Keep `Max pages` at `5`.

Click `Start Scan`.

### What to show

- progress steps while scanning
- total pages scanned
- total issues
- critical/high/medium/low breakdown
- open dashboard

What to say:

“Here AccessiMed is acting like an external compliance scanner. We crawl a limited number of key pages, run accessibility analysis, and translate the results into an engineering-friendly severity model.”

## Part 3: dashboard review

In the dashboard:

- point out the severity summary cards
- open one finding with `View Details`
- highlight the selector, affected page, and rule guidance

Then click `AI Fix Preview` on one finding.

### What to show in the fix modal

- original code snippet
- fixed code snippet
- explanation
- provider used
- confidence score

What to say:

“Now we’re not just reporting the issue. We’re showing a reviewable remediation suggestion that a developer can copy or move into their own workflow.”

## Part 4: PDF report

Click `Download Report`.

What to say:

“Teams still need shareable evidence for compliance, delivery, or stakeholder review, so the scan can also generate a PDF report.”

## Part 5: developer CLI workflow

Switch to terminal and run the local code workflow on the intentionally inaccessible demo site.

### Scan local code

```bash
cd /Users/spartan/Documents/GitHub/AccessiMed/backend
source .venv/bin/activate
accessimed code test ../demo-site
```

### What to show

- numbered findings
- severity icons
- issue summaries
- exit behavior when findings exist

What to say:

“This is the Snyk-like developer workflow. Instead of only scanning deployed websites, developers can run AccessiMed on their own codebase and get a local list of issues.”

## Part 6: apply one exact fix

Use a safe temp copy so you do not mutate the source demo folder during the presentation:

```bash
rm -rf /tmp/accessimed-demo-run
cp -R /Users/spartan/Documents/GitHub/AccessiMed/demo-site /tmp/accessimed-demo-run
cd /Users/spartan/Documents/GitHub/AccessiMed/backend
source .venv/bin/activate
accessimed code fix /tmp/accessimed-demo-run --finding 7 --apply
```

Then show the resulting change:

```bash
diff -u /Users/spartan/Documents/GitHub/AccessiMed/demo-site/index.html /tmp/accessimed-demo-run/index.html
```

Important note:

- use a fresh temp copy each time
- run `accessimed code test` before choosing a finding number
- after one fix is applied, the finding numbers can change on the next scan
- for the smoothest live demo, use finding `#7` on a fresh copy

What to say:

“This writes a real file change into the working tree. A developer can review it as a normal Git diff, then keep it or discard it. That’s the handoff point into normal engineering review.”

## Optional curl backup commands

If the frontend is unavailable, you can still demo the backend directly.

### Run a scan

```bash
curl -X POST http://127.0.0.1:8000/api/v1/scans \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://healthy.kaiserpermanente.org/front-door","max_pages":5}'
```

### Download a report

```bash
curl -o accessimed-report.pdf http://127.0.0.1:8000/api/v1/scans/<scan-id>/report
```

### Generate one fix

```bash
curl -X POST http://127.0.0.1:8000/api/v1/fixes/single \
  -H 'Content-Type: application/json' \
  -d '{"violation_id":<violation-id>}'
```

### Scan a local codebase over HTTP

```bash
curl -X POST http://127.0.0.1:8000/api/v1/local/code/scan \
  -H 'Content-Type: application/json' \
  -d '{"path":"/Users/spartan/Documents/GitHub/AccessiMed/demo-site"}'
```

### Apply one local finding over HTTP

```bash
curl -X POST http://127.0.0.1:8000/api/v1/local/code/apply \
  -H 'Content-Type: application/json' \
  -d '{"path":"/tmp/accessimed-demo-run","finding_index":7}'
```

## Best order for the live presentation

1. Land on the homepage and explain the two workflows
2. Go to `Scan Website`
3. Scan a public healthcare site
4. Open the dashboard
5. Generate one AI fix preview
6. Download the PDF report
7. Switch to terminal
8. Run `accessimed code test`
9. Apply one finding with `--finding <n> --apply`
10. Show the diff

## Quick speaking version

If you need the short version:

“AccessiMed scans live healthcare websites for WCAG issues, groups results by severity, and generates remediation guidance. Then developers can run our CLI locally, apply one fix at a time, and review the result as a normal Git diff.”
