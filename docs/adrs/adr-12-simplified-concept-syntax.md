# ADR-12: Simplified Concept Reference Syntax

- **Status:** Accepted
- **Date:** 2026-02-23
- **Amends:** ADR-08, ADR-11 (syntax only)

## Context

ADR-08 established `[[cf:name]]` as the syntax for concept references, with rationale:

> "The `cf:` prefix avoids collision with other `[[]]` uses (wikis, Obsidian, etc.)"

ADR-11 continued this syntax for auto-loading and emphasis counting.

In practice:
1. We're not mixing with wiki tooling — the collision concern hasn't materialized
2. The double brackets add visual noise in markdown prose
3. A simpler syntax with backticks reads more naturally

Comparing in prose:

> "Apply [[cf:best-practices]] when working." — markup-heavy, interrupts reading
> 
> "Apply `cf:best-practices` when working." — reads like inline code annotation

## Decision

### Simplified Syntax

Change from `[[cf:name]]` to `` `cf:name` `` (backticks required).

The backticks:
- Provide explicit boundaries (no ambiguity with punctuation)
- Render as inline code in markdown, making references visually distinct
- Are familiar from code/technical writing conventions

The regex `` `cf:([a-zA-Z0-9_-]+)` `` matches the pattern.

### Keyboard Shortcut for Insertion

Add `ctrl+i` shortcut that:
1. Shows concept picker (fuzzy searchable)
2. Inserts `` `cf:name` `` at cursor position

This aids discoverability and handles "can't remember the exact name" cases.

### Preamble Update

Update the system prompt preamble to document the new syntax:

```
`cf:name` is a provenance marker — it references a shared concept (concepts/name.md).
```

## Consequences

### Enables

- Cleaner markdown in prompts and concept files
- Visual distinction via inline code styling
- Quick insertion via shortcut

### Constrains

- Concept names must not contain characters outside `[a-zA-Z0-9_-]`
- Backticks are required (bare `cf:name` won't be recognized)

### Migration

Existing `[[cf:name]]` references in concept files should be updated to `` `cf:name` ``. The old syntax will no longer be recognized.
