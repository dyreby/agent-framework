# ADR-06: Alignment on Intent

- **Status:** Accepted
- **Date:** 2026-02-17
- **RFC:** [RFC-06](../rfcs/rfc-06-alignment.md)
- **Extends:** ADR-05 (Intent-Expression Gap)

## Context

ADR-05 established T-6: expressed intent is lossy. Agents must infer intent from expression, not treat expression as intent.

But T-6 raises a question: *how* should agents infer intent?

Previous approaches used layered abstractions (principles, skills, guidelines) that the agent interprets at runtime. This is fundamentally indeterminate. The same words can be synthesized differently across invocations, models, or contexts.

Meanwhile, a key invariant exists: **the human is the only authority who can verify that the observed result of an action matches their original intention.** This is irreducible: intent originates in the human, expression is lossy, and only the human can close the loop.

If human verification is always required, we don't need perfect runtime interpretation. We need shared understanding before action, deterministic application, and feedback mechanisms.

## Decision

Introduce a **collaborative vocabulary infrastructure** for encoding worldview models that enable effective collaboration.

### Artifacts

**Concepts**: Freeform markdown files encoding what something means to you—principles, personas, preferences. Capture intent without constraint.

```
.agent/
  concepts/
    code-reviewer.md      # a persona
    defensive.md          # a principle
    no-panic.md           # a preference
    ...
```

**Profiles**: Generated context for specific targets (pi, ChatGPT, etc.)—compressed from concepts for runtime use.

```
.agent/
  profiles/
    code-reviewer.md      # generic profile
    pi-code-reviewer.md   # pi-specific profile
    ...
```

### Linking

- **`[[concept-name]]`** references `concepts/concept-name.md`
- **`@profile-name`** references `profiles/profile-name.md`

Profile generation is deterministic: extract all references, dedupe, then include each verbatim before the profile-specific context.

### Two Alignment Loops

**Loop 1: Intent Capture**
- Goal: Capture what you believe
- Artifact: Concept files
- Validation: "Does this capture what I actually think?"

**Loop 2: Profile Generation**
- Goal: Generate minimal profile for a specific purpose
- Artifact: Profile (system prompt, instruction text)
- Validation: "When I use this profile, does it work like I think it should?"

Diagnosing misalignment traces back: Is the profile missing something (Loop 2)? Are the source concepts unclear (Loop 1)?

### Profile Provenance

Profiles include frontmatter:

```markdown
---
model: claude-sonnet-4-20250514
generated: 2026-02-17
---
```

### Runtime Behavior

Users load profiles. The agent receives committed profile text and treats it as shared understanding: deterministic lookup, not runtime interpretation.

```bash
pi --profile code-reviewer
```

### Shareability

Vocabulary is shareable. Like AGENTS.md explains a codebase, concepts explain how you think. Others can adopt them, request personas, or infer patterns.

### Silence as Permission

Concepts capture what matters. What isn't mentioned has no preference.

If a concept specifies "focus on correctness and maintainability" but says nothing about formatting, that's signal: formatting isn't something you care about. The collaborator (human or agent) can use their judgment.

This makes the vocabulary tractable: you only encode what you'd push back on if it went differently. Silence is permission to proceed as the collaborator sees fit.

### Epistemological Stance

The framework is **useful, not true**. It makes no claim that concepts correctly capture intent—T-6 applies even to yourself. The goal is encoding intent as clearly as possible, with honest boundaries about what's known.

The shared invariant:
- Authors can't know if what they wrote will be interpreted as intended
- Users can't know if what was written is missing context
- Even the author doesn't know if they encoded their intent correctly

This isn't a flaw; it's the nature of collaboration under T-6. The framework makes it legible and workable—and every collaboration, whether human-to-agent or human-to-human, is a data point for refining alignment.

## Consequences

- Vocabulary infrastructure: `concepts/` (source of intent) and `profiles/` (generated artifacts)
- All artifacts are freeform markdown—versioned, diffable, auditable
- Profiles are committed, not regenerated; LLM generation isn't deterministic
- Concepts enable rich capture; profiles enable constrained runtime use
- Feedback loops span immediate (session OODA), diagnostic (post-session), and long-term (vocabulary refinement)
- Vocabulary is opt-in; existing workflows unchanged
