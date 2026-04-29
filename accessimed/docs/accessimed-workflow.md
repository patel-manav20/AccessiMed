# AccessiMed Workflow

This is the simplest way to understand AccessiMed.

## The short version

AccessiMed helps developers find accessibility issues, understand which ones matter most, and turn them into reviewable code changes.

The core workflow is local and CLI-first. The web app is optional.

## The main workflow: local developer loop

### Step 1: configure the project

A developer runs:

```bash
accessimed init
```

This creates `.accessimed.toml`, where the project can choose:

- which folder to scan
- how many pages to inspect
- whether to use deterministic remediation only
- whether to enable OpenAI or Anthropic-backed fix generation

### Step 2: verify setup

The developer runs:

```bash
accessimed doctor
```

This confirms that the local environment is ready.

### Step 3: scan local code

The developer runs:

```bash
accessimed code test
```

AccessiMed scans local HTML files and prints numbered findings in the terminal.

### Step 4: review issues by severity

Each issue is grouped as:

- `Critical`
- `High`
- `Medium`
- `Low`

That helps the developer decide what to fix first.

### Step 5: choose a remediation mode

AccessiMed can work in different ways:

- `local`
  deterministic, no-LLM mode
- `auto`
  OpenAI first, Anthropic second
- `openai`
  OpenAI only
- `anthropic`
  Anthropic only

### Step 6: apply one fix or make the change manually

The developer can run:

```bash
accessimed code fix --finding 7 --apply
```

Or they can read the suggestion and make the edit themselves.

### Step 7: review the result in Git

The file change shows up as a normal working-tree diff.

That means the final handoff stays inside the team’s usual engineering workflow.

## What happens without an LLM

This matters a lot for open source and production cost control.

Even without API keys, AccessiMed can still:

- detect accessibility issues
- score them by severity
- suggest deterministic fixes for common cases
- apply supported conservative fixes in local files

So the tool is useful before any LLM provider is configured.

## The optional workflow: live website scan

The companion web app and API still support a second workflow.

### Step 1

A user enters a public website URL.

### Step 2

AccessiMed crawls a limited number of key pages.

### Step 3

The system runs accessibility auditing and groups issues by severity.

### Step 4

The UI can show findings, fix previews, and downloadable PDF reports.

This is helpful for discovery, presentation, compliance review, and stakeholder sharing.

## The product mental model

The cleanest way to explain AccessiMed now is:

“AccessiMed is an open-source accessibility workflow tool. Its main job is to help developers scan local codebases, prioritize WCAG issues, and create reviewable fixes. The web app is an optional companion for live scans and reporting.”
