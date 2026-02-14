# Contributing

This document defines the collaboration model and governance process for the Agent Framework project.

## A Note on Contributions

I genuinely appreciate anyone willing to engage at this level: questions, challenges, different perspectives.
Dialogue surfaces what we couldn't see alone.

That said, this is my worldview and I'm the one standing behind it.
I'll be thoughtful about what fits, and I'll always explain my reasoning when something doesn't.

## Collaboration Principles

This is how I think software development should work.

### Context Completeness

The repository and project tracking system (issues, PRs, discussions) are the sole source of truth.
All context needed to continue work must be captured there.

Insights from conversations or sessions should be distilled into appropriate artifacts (issues, RFC drafts, PR descriptions) before they become actionable.
No out-of-band knowledge should be required.

### Actor Agnosticism

Human and artificial agent contributors participate through identical channels.
The process doesn't distinguish who typed — only who stands behind it.

Your username on an artifact (commit, review, comment) signals your accountability.
If a change needs human sign-off, that human reviews and approves through standard mechanisms.

### Adjustable Depth

Contributors engage at the level appropriate to the change:

- Approve a PR after reviewing the summary
- Request a risk assessment
- Review line-by-line
- Drill into a specific line of code: "explain this"

The process supports any depth, and your depth can change day to day.
Choosing to engage shallowly on low-stakes changes is not abdication — it's attention allocation.

## Governance

### RFCs (Requests for Comments)

Location: `docs/rfcs/`

RFCs propose significant changes:

- Truth or Value layer modifications
- Structural changes to Roles, Skills, or Profiles
- Governance process changes
- New adapter contracts

Routine additions to Roles, Skills, and Profiles can go through regular PRs.

**Lifecycle:**

1. Draft RFC via pull request
2. Discussion in PR comments
3. Revise based on feedback
4. Merge with `Status: Accepted`
5. Create corresponding ADR

**Format:** `rfc-NN-short-title.md`

### ADRs (Architecture Decision Records)

Location: `docs/adrs/`

ADRs record accepted decisions.
They are the permanent ledger of architectural commitments.

ADRs are immutable.
To change a decision, create a new ADR that supersedes the previous one.

**Format:** `adr-NN-short-title.md`

### Pull Requests

All changes go through pull requests.
Direct commits to the main branch are not permitted.

PR descriptions should provide sufficient context for review.
For non-trivial changes, reference the relevant issue or RFC.

## Writing Style

Match precision to purpose.

**Approachable** — Vision docs, README, high-level explanations.
Use plain language. If someone unfamiliar with software can't follow the idea, simplify.

**Precise** — RFCs, ADRs, technical specifications.
Use specific terms. Nuance matters here; don't sacrifice accuracy for readability.

The goal is clarity at the appropriate level, not uniform tone.

## Versioning

This project uses semantic versioning.
The mapping of version increments to framework layers will be defined via RFC once the layer model is accepted.

## Platform

This project uses GitHub for hosting, issues, and pull requests.
The collaboration principles above apply to any platform with equivalent capabilities.
