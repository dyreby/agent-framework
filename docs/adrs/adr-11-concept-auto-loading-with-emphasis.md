# ADR-11: Concept Auto-Loading with Emphasis

- **Status:** Accepted
- **Date:** 2026-02-23
- **Amends:** ADR-10 (re-enables concept auto-loading)

## Context

ADR-10 established task-type commands for context management and noted that it "supersedes the approach explored in #82, #113, #115" (concept loading issues). The intent was to move away from explicit concept loading toward task-driven OODA loops.

In practice, two things emerged:

1. **Markers appear naturally** — Users write `[[cf:best-practices]]` in prompts because it's how they think. Ignoring these markers means the LLM sees provenance notation without the referenced content.

2. **Emphasis matters** — When multiple concepts apply, users need a way to signal which matter most for the current task. Repeating a marker (`[[cf:important]] [[cf:important]]`) is a natural way to express "this one really matters here."

ADR-10's task-type commands remain valid for structured workflows (PR review, issue triage). This ADR adds a complementary mechanism for organic concept usage.

## Decision

### Auto-Load from Markers

The collaboration extension parses `[[cf:name]]` markers from:
- System prompt (preamble, session config)
- User prompt (each turn)
- Loaded concept content (recursive)

When a marker is found:
1. Load `concepts/name.md` if it exists
2. Warn if the file is missing (user probably meant to create it)
3. Track the concept in the session

### Reference Counting for Emphasis

Each `[[cf:name]]` occurrence increments a count. Concepts are injected into the system prompt ordered by count (most referenced first).

The framing tells the LLM:
```xml
<loaded-concepts>
Shared mental models—reference frames, not rigid rules.
Ordered by emphasis (most referenced first).

## high-emphasis-concept
...

## lower-emphasis-concept
...
</loaded-concepts>
```

Users boost emphasis by repeating markers in their prompt. This is:
- **Explicit** — the user wrote it multiple times
- **Deterministic** — same references = same order
- **Intuitive** — repetition signals importance

### Manual Control via `/concept`

The `/concept` command lets users adjust emphasis without writing markers:

1. Select a concept from the list
2. If loaded, choose: `+1 (boost)`, `−1 (reduce)`, or `Unload`
3. If not loaded, load with count 1

Decrementing to 0 unloads the concept. The status bar shows loaded concepts with counts.

### Templates for Task Patterns

Task-type workflows (like PR review) move from commands to prompt templates. Instead of `/review-pr 24` executing code that fetches and injects context, `/review-pr 24` expands a template that tells the LLM what to fetch.

Benefits:
- Simpler — no command code, just markdown
- Transparent — user sees exactly what's being asked
- Editable — users can modify templates for their workflow
- LLM-driven — the agent fetches context, enabling OODA at that step

Templates live in `.pi/prompts/`. The `/review-pr` template instructs the LLM to gather PR metadata, diff, and linked issues, then provides the DoD and OODA framing.

## Consequences

### Enables

- Concepts load when referenced, matching user mental model
- Users control emphasis through natural repetition or `/concept`
- Task patterns are transparent and editable templates
- Cleaner extension code (removed 200+ lines)

### Constrains

- Reference counts accumulate per session (no decay)
- No cross-session persistence of emphasis
- Templates require LLM round-trips to gather context (vs. command pre-fetching)

### Amends ADR-10

ADR-10's "supersedes concept loading" is amended. Task-type commands and concept auto-loading are complementary:

- **Task commands** (now templates): structured workflows with known context needs
- **Concept auto-loading**: organic usage where markers appear naturally

The OODA framing from ADR-10 remains — it's now embedded in templates rather than command output.
