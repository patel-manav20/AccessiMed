# Workflow Diagram Prompt

Create a polished slide-style workflow diagram for a project called **AccessiMed**.

The audience is open-source developers and technical adopters. The diagram should feel production-ready, clean, modern, and easy to understand quickly. Use a white or very light background, teal and slate accents, restrained rounded containers, subtle shadows, and clear directional arrows. Avoid cartoon styling.

The diagram should show **one main workflow and one optional companion workflow**.

## Main workflow: CLI-first developer loop

Show this path left to right:

1. **Developer installs AccessiMed**
2. **Run `accessimed init`**
3. **Run `accessimed doctor`**
4. **Run `accessimed code test`**
5. **Review severity-scored findings**
6. **Choose remediation mode**
7. **Apply one fix or update code manually**
8. **Review diff in Git**

Use a short label under the flow:

`Local accessibility workflow for developers`

## Optional companion workflow: live website scan

Show this path left to right:

1. **Team enters website URL**
2. **AccessiMed crawls key pages**
3. **Accessibility audit runs**
4. **Issues grouped by severity**
5. **Dashboard and PDF report available**

Use a short label under the flow:

`Optional live URL scan and reporting surface`

## Shared product center

Between the two workflows, place a central AccessiMed product block with these labels:

- WCAG-focused scanning
- Local deterministic mode
- Optional OpenAI and Anthropic guidance
- Reviewable outputs

## Visual callouts

Add small side callouts for:

- `.accessimed.toml`
- CLI workflow
- Git review
- PDF reports
- Optional frontend and API

## Style requirements

- Make the diagram feel like an open-source developer tool, not a hackathon poster
- Keep text short and readable
- Use consistent spacing and alignment
- Make the CLI flow visually dominant
- Render the result as one clean presentation slide
