# AccessiMed Demo Site

This is the intentionally inaccessible healthcare website used for the developer-workflow demo.

## Purpose

Use this site to demonstrate that AccessiMed can:

1. scan a deployed website
2. find WCAG issues
3. generate remediations
4. scan and fix local source files through the CLI

Use real public websites for scan and report demos. Use this site for code-level workflow demos.

## Recommended demo setup

1. deploy this folder to Vercel or any static host
2. scan the deployed URL with AccessiMed
3. run the local CLI against this folder
4. show the exact file changes made by `accessimed code fix --apply`

Because the site is static and intentionally simple, AccessiMed can safely demonstrate exact-match file remediation here.

## Files

- `index.html`
- `appointments.html`
- `portal.html`
- `styles.css`
- `vercel.json`
