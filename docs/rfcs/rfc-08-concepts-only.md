# RFC-08: Concepts Only

- **Status:** Draft
- **Created:** 2026-02-18
- **Supersedes:** Profile/concept distinction from RFC-06

## Summary

Remove the profile/concept distinction. All artifacts are concepts. Introduce a preamble convention for the `[[]]` syntax.

## Motivation

### The Profile/Concept Split Adds Friction

RFC-06 established two artifact types:
- **Concepts**: Freeform markdown encoding what something means
- **Profiles**: Generated context compressed from concepts for specific targets

In practice, this distinction creates friction:

1. **Where does something live?** When refining, you ask: is this a concept problem or a profile problem? But the real question is simpler: does this artifact say what I mean?

2. **Profiles are just synthesized concepts.** A profile is a concept that was compressed for a purpose. The compression is valuable; the separate artifact type isn't.

3. **Composability suffers.** The original model assumed profiles are loaded at session start. But the real workflow is dynamic: start clean, toggle concepts on as needed, add meta-concepts (like `model_refinement`) when friction appears.

### Concepts Are Self-Contained

A well-formed concept should be understandable in complete isolation. Paste it into any LLM, it works. This is the test.

The `[[concept-name]]` syntax was originally ambiguous—sometimes meaning "expand this" and sometimes meaning "this was synthesized from." That ambiguity added cognitive load.

Simpler: `[[name]]` always means provenance. It marks "this text was synthesized from the concept called 'name'." The content that follows is complete without needing to dereference.

### Progressive Enhancement

Without tooling, concepts work:
- Copy/paste into any LLM
- Tell the LLM to read `concepts/foo.md`
- `[[]]` markers are human-readable citations

With tooling (pi extension), concepts are convenient:
- Hotkey → picker → toggle concepts on/off
- Context manager UI
- Preamble injected automatically

The framework doesn't depend on tooling. Tooling makes it effortless.

## Proposal

### Remove Profiles Directory

Delete `profiles/`. All artifacts live in `concepts/`.

What were "profiles" become concepts that happen to be synthesized from other concepts. The `[[]]` markers show provenance.

### Clarify `[[]]` Syntax

`[[concept-name]]` marks provenance, not expansion. It means: "this text was influenced by the concept called 'concept-name'."

The content following the marker is the synthesis—complete and standalone. The marker is for:
- Humans reading the file (traceability)
- Tooling (could enable navigation)
- Refinement (if this doesn't land, check the source concept)

### Preamble Convention

A one-line preamble explains the syntax:

```
Per [github.com/dyreby/collaboration-framework]: [[name]] marks a concept called "name". The text that follows is what it means in this context.
```

This preamble is:
- **Injected by the pi extension** automatically
- **Documented in README** for non-pi users to add to their own AGENTS.md
- **Formalized via ADR** once this RFC is accepted (it's stable, shouldn't change)

The link provides provenance for the convention itself. If a user's LLM fetches it automatically, that's on their configuration—we just provide the reference.

### Model Refinement as Meta-Concept

`concepts/model-refinement.md` becomes the meta-concept that unlocks framework knowledge:

- When to read source concepts
- How to diagnose friction (concept-level vs expression-level)
- The refinement loop
- Directory structure and conventions

You don't load this by default. You activate it when friction appears and you need to refine.

### Dynamic Composition

The workflow becomes:

1. Start clean (no concepts loaded)
2. Activate concepts as needed (`collaborate_with_greg`, `code_reviewer`, etc.)
3. Do work
4. Friction appears
5. Activate `model_refinement`
6. Refine—edit concepts, update synthesis
7. Continue or end session

Pi extension enables this with hotkeys and pickers. Without pi, you manually tell the LLM what to read.

## Consequences

- `profiles/` directory removed
- All artifacts are concepts in `concepts/`
- `[[]]` has one meaning: provenance
- Preamble documented in README, injected by pi extension
- Framework works without tooling; tooling adds convenience
- `model_refinement` is the meta-concept for framework knowledge

## Migration

1. Move any content from `profiles/` into `concepts/` (or delete if redundant)
2. Update README with preamble convention
3. Update CONTRIBUTING.md to remove profile references
4. Create ADR-08 once accepted

## References

- RFC-06: Alignment on Intent (established profile/concept distinction)
- ADR-06: Alignment on Intent (current artifact structure)
- Issue #58: Profile synthesis discussion (origin of this refinement)
