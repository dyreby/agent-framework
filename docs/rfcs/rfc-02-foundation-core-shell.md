# RFC-02: Foundation/Core/Shell Structure

- **Status:** Draft
- **Created:** 2026-02-14

## Summary

Replace the "layered architecture" framing with Foundation/Core/Shell.
Rename Values to Principles.

This formalizes the structural understanding that emerged while aligning the README with the project's evolved goals.

## Motivation

RFC-01 established a "layered architecture" with Truths as the "foundational layer."
As the framework evolved, this framing became imprecise:

1. **Truths aren't a layer** — they're invariants, not something you stack on.
   Calling them a "layer" implies they're parallel to Values, Roles, etc.
   They're not. They're the foundation everything else is built on.

2. **Core abstractions aren't stacked** — Values, Roles, Skills are orthogonal.
   They combine in Profiles; they don't layer on each other.

3. **"Values" undersells what they are** — "Principles" better captures
   that these are deliberate beliefs about what leads to better outcomes.

## Proposal

### New Structure: Foundation / Core / Shell

| Zone | Components | Function |
|------|------------|----------|
| Foundation | Truths | What's real and inarguable. Premises and their logical consequences. |
| Core | Principles, Roles, Skills | My model. Orthogonal abstractions that combine. |
| Shell | Profiles | Wiring. Configures the core for a specific job. |

**Foundation** is invariant.
**Core** is my model built on that foundation.
**Shell** is how you wire up the core for a specific job.

### Terminology Change: Values → Principles

"Values" suggests preferences.
"Principles" captures that these are deliberate beliefs about what leads to better outcomes.

Principles are still "where I come in" — the first place my opinion enters the framework.

### What This Supersedes

This RFC supersedes the structural language in RFC-01 and ADR-01:

- "layered architecture" → Foundation/Core/Shell
- "Truth layer" → Truths (foundation)
- "Values" → Principles

The Truths themselves (T-1 through T-4) remain unchanged.

### Modification Policy

Changes to the Foundation/Core/Shell structure require:

1. RFC proposing the change
2. ADR recording the decision

This continues the approach established in RFC-01.

## Context

This RFC formalizes thinking that emerged in PR #10 (Align README with new framework structure).
The README now reflects this structure.
This RFC makes it official.

## References

- [PR #10: Align README with new framework structure](https://github.com/dyreby/agent-framework/pull/10)
- RFC-01: Truth Layer
- ADR-01: Truth Layer
