# RFC-06: Alignment on Intent

- **Status:** Draft
- **Created:** 2026-02-17
- **Extends:** RFC-05 (Intent-Expression Gap)
- **Issue:** #47

## Summary

Introduce a **collaborative vocabulary infrastructure** for encoding worldview models that enable effective collaboration. The framework is agent-agnostic—encoding intent implies something has intent, but the framework doesn't distinguish human from AI. It provides:

1. **Concepts**: Freeform markdown files that encode what something means to you—principles, personas, preferences, whatever you need to capture
2. **Profiles**: Generated context for specific targets—compressed from concepts for use in pi, ChatGPT, etc.

Users define concepts, then work with their preferred LLM to generate profiles for specific targets. At runtime, users load profiles—the agent collaborates from shared understanding, not instructions.

This vocabulary is shareable. Like AGENTS.md explains how a codebase works, your concepts explain how you think—others (human or agent) can adopt them. But misalignment exists on both sides of the text:

- Between your intent and your recorded words
- Between your recorded words and how others interpret them

Contracts align understanding; they can only ever be useful, never right.

The framework is **useful, not true**. It doesn't claim to correctly capture intent—T-6 makes that impossible. It provides a model for encoding intent as clearly as possible, with honest boundaries about what's known and what isn't. What you encode is up to you.

## Motivation

RFC-05 establishes T-6: expressed intent is lossy. The agent must infer intent from expression. But how?

Previous approaches attempted to solve this with layered abstractions—principles, skills, guidelines—that the agent interprets at runtime. This is fundamentally indeterminate. The same words can be synthesized differently across invocations, models, or contexts.

### The Invariant

Consider the limit case: perfect LLMs with complete knowledge. Even then, the human remains essential. Why?

**The human is the only authority who can verify that the observed result of an action, as they interpret it, matches their original intention.**

This is irreducible. Intent originates in the human. Expression is lossy (T-6). Action produces observable results. Only the human can close the loop—"yes, this is what I meant."

### Implication

If human verification is always required, we don't need the agent to perfectly interpret intent at runtime. We need:

1. **Shared understanding** of what matters before action
2. **Deterministic application** of that understanding
3. **Feedback mechanisms** to refine understanding over time

### Reframe: Alignment on Intent

What we're really building is a framework for **aligning on intent**—encoding how you think collaboration should work, in a way that both agents and humans can understand.

There will always be misalignment in collaboration because of T-6. What this framework provides is a way to **encode, refine, and share** your intent so misalignment becomes legible and correctable.

The artifacts serve both audiences. An LLM loads a profile generated from your concepts; a human collaborator reads the same files to understand what you care about. The vocabulary is documentation of how you think—useful whether the reader is silicon or carbon.

## Proposal

### Concepts

**Everything is a concept.** A concept is a freeform markdown file that encodes what something means to you.

Some concepts describe principles (`[[defensive]]`), some describe personas (`[[code-reviewer]]`), some describe preferences (`[[no-panic]]`). The structure is the same—the difference is documentation convention, not a rule the framework enforces.

```markdown
# Code Reviewer

Thorough reviews focused on correctness and maintainability.
Direct but collaborative—suggest improvements, not just problems.

Apply [[defensive]] principles, especially around error handling.
Follow [[best-practices]] for the language being reviewed.

## What I care about

- Correctness: Does this handle edge cases? What could fail?
- Maintainability: Will this be readable in 6 months?
- Test coverage: Are the important paths tested?

## Notes

- John likes a joke at the end of approved PRs
- For Rust, pay extra attention to Result vs panic
- Don't nitpick formatting if there's a formatter configured
```

```markdown
# Defensive

Anticipate failure modes. Handle errors explicitly, surface rather than swallow.

Apply [[validate-inputs]] at boundaries.
[[surface-errors]] rather than swallowing them.
Prefer [[no-panic]] except for true invariant violations.

## Why

Production systems fail. Code that assumes success becomes liability.
Defensive code degrades gracefully and aids debugging.

## Examples

- Use `Result<T, E>` instead of panic
- Validate inputs at system boundaries
- Log errors with context before returning
- Consider what happens if this file doesn't exist
```

**`[[concept]]` references** link to other concepts. Tooling resolves these at profile generation—`[[defensive]]` loads `concepts/defensive.md` and processes it.

**`@profile` references** link to generated profiles. Tooling includes these as-is—`@defensive` includes `profiles/defensive.md` directly.

The difference:
- `[[concept]]` → processed by LLM during generation
- `@profile` → included verbatim (already generated, already validated)

Concepts can be as rich as needed. Write whatever helps capture your intent—principles, rationale, examples, edge cases, notes. There's no token budget; this is documentation of what you believe.

### Concepts vs Profiles

**Concepts** capture intent without constraint. Write as much as needed to be clear about what you mean.

**Profiles** are compressed for a specific target. Given a concept and its resolved references, tooling generates the minimal profile that preserves meaning for that purpose (pi, ChatGPT, etc.).

This separation matters:
- Concepts are auditable—your intent, in full
- Profiles fit runtime constraints (token limits, prompt structure)
- When behavior is wrong, trace back: "What did I say? What got generated? Where's the gap?"

### Two Alignment Loops

The authoring process is decoupled into two distinct OODA loops. Both encode intent, but from different angles.

#### Loop 1: Intent Capture

**Goal**: Capture what you believe—your principles, assumptions, and preferences.

**Artifact**: Concept files (freeform markdown)

**Validation**: "Does this capture what I actually think?"

```
User: "I want to define how I review code"
LLM:  "Let's create a concept for that. What matters to you in code review?"
User: "Correctness, maintainability, and I want to be direct but collaborative"
LLM:  [drafts concepts/code-reviewer.md]
User: "Add something about error handling—I care about that a lot"
LLM:  "Should that be in this concept, or is it a general principle you'd reference?"
User: "General. Make it a separate concept I can reference."
LLM:  [creates concepts/defensive.md, adds [[defensive]] reference to code-reviewer]
```

The LLM helps you capture intent and notice when something should be extracted to a referenced concept. You iterate until the files reflect what you believe.

Concepts are **source of truth**—freeform, as rich as needed, stable artifacts you refine over time.

#### Loop 2: Profile Generation

**Goal**: Generate the minimum required profile for a specific purpose.

**Artifact**: Profile (system prompt, instruction text, etc.)

**Validation**: "When I use this profile, does it work like I think it should?"

The same concept can generate profiles for different targets:
- A system prompt for `pi` (text-based coding agent)
- User instructions for a ChatGPT app
- Context for any other LLM interface

```
User: "Generate a pi profile from [[code-reviewer]]"
LLM:  [loads concepts/code-reviewer.md, resolves [[defensive]] → [[no-panic]], etc.]
LLM:  [generates compressed profile]
User: [uses it, observes behavior]
User: "It's not catching error handling issues"
LLM:  [adjusts profile to emphasize defensive principles]
User: "Better. Export it."
```

Concepts can be large—capture everything. Profiles are compressed—minimal while preserving meaning. The generation step is lossy; you validate that nothing important was lost.

**Diagnosing misalignment**: When runtime behavior doesn't match expectations, trace back:
- Is the profile missing something? → Iterate Loop 2
- Are the source concepts unclear? → Iterate Loop 1

You can always add specificity where it's needed. A concept like [[defensive]] captures the principle; a note in [[code-reviewer]] like "John likes a joke at the end of approved PRs" captures a preference without repeating fundamentals. Encode detail at the layer where it belongs.

### Runtime Behavior

At runtime, users load profiles:

```bash
# Load a profile
pi --profile code-reviewer

# Load multiple profiles
pi --profile code-reviewer --profile security-conscious
```

The agent receives the committed profile and treats it as shared understanding. Same concept, same generated profile, always—deterministic lookup.

The agent isn't following instructions. It's collaborating from a shared worldview.

### Shareability

Concepts can be shared, like AGENTS.md explains a codebase.

```
.agent/
  VOCABULARY.md        # "Here's how I work"
  concepts/
    code-reviewer.md
    defensive.md
    readable.md
    ...
```

**VOCABULARY.md** explains your concepts—their intent, how they relate, how you use them. Others can:

- **Borrow concepts**: "John's [[defensive]] captures what I mean—I'll use it"
- **Request a persona**: "Review my code as John's [[code-reviewer]]"
- **Infer patterns**: An LLM can read your concepts and infer "how John works"

This creates a new kind of collaboration artifact. Not just "here's my code" but "here's how I think about code."

The files aren't just LLM context—they're readable documentation. A human reviewing your concepts learns the same things an agent would: what you prioritize, how you want to engage, what matters to you in this context.

### Silence as Permission

Concepts capture what matters. What isn't mentioned has no preference.

If your [[code-reviewer]] concept specifies "focus on correctness and maintainability" but says nothing about formatting, that's signal: formatting isn't something you care about. The collaborator (human or agent) can use their judgment.

This makes the vocabulary tractable. You don't need to specify everything—only what you'd push back on if it went differently. Silence is permission to proceed as the collaborator sees fit.

### Feedback Loops

#### Immediate (Session OODA)

Within a session, observe results and provide feedback:
- "That's not what I meant"
- "That's exactly right"

This closes the loop for the current interaction.

#### Diagnostic (Post-Session)

After sessions, reflect on misalignment:
- "Was the concept unclear?" → refine concept
- "Did the profile not express it well?" → refine profile
- "Do I need a new concept for this?" → add concept

#### Learnable (Long-Term)

Over time, patterns emerge:
- Concepts get refined through use
- Common concepts become reusable across profiles
- Vocabulary grows to cover recurring concerns

The conversation history is auditable—you can trace how your worldview evolved.

## Data Model

### Structure

All artifacts are freeform markdown files in a flat directory. The filename is the identifier.

```
.agent/
  concepts/
    code-reviewer.md        # a persona
    pair-programmer.md      # another persona
    defensive.md            # a principle
    no-panic.md             # a preference
    best-practices.md
    ...
  profiles/
    code-reviewer.md        # generic profile
    pi-code-reviewer.md     # pi-specific profile
    chatgpt-code-reviewer.md
    ...
```

### References

**`[[concept-name]]`** in any file references `concepts/concept-name.md`. Tooling processes these when generating profiles—the concept content gets incorporated.

**`@profile-name`** in any file references `profiles/profile-name.md`. Tooling includes these verbatim—the profile is already generated and validated.

### What's Committed

- **concepts/**: Source of truth for intent (freeform, unbounded)
- **profiles/**: Generated and committed (not regenerable—LLM generation isn't deterministic)

All artifacts are versioned, diffable, auditable.

## Epistemological Stance

This framework is **useful, not true**.

It makes no claim that concepts correctly capture a person's intent. It can't—T-6 applies even to yourself. You don't know if you encoded your intent correctly. What you *can* do is encode your intent as clearly as possible, whatever that intent is.

### The Shared Invariant

Everyone using this framework agrees:

- **Authors** can't know if what they wrote will be interpreted as intended
- **Users** can't know if what was written is missing context the author would have caught
- **Even the author** doesn't know if they encoded their intent correctly

This isn't a flaw. It's the nature of collaboration under T-6. The framework doesn't fix this—it makes it legible and workable.

### What You Can Do

You can use this to:

1. **Train your agent** to collaborate like you would under specific contexts
2. **Improve alignment over time** through feedback loops
3. **Share your worldview** so others can collaborate with you (or as you would)

The goal isn't correct encoding—that's impossible. The goal is **encoding your intent as clearly as you can** given the constraints. What that intent is, is up to you.

### Why This Works

If the framework were claiming truth, it could be wrong. But it claims utility:

- Concepts are useful if they help you communicate
- Profiles are useful if they enable collaboration you want
- The framework is useful if it helps

If it's not useful, adjust or abandon. No stronger claim is made.

### Borrowing Worldviews

When you load someone else's concept, you accept the invariant:

- They encoded their best understanding
- You're collaborating in their style, not with them
- Gaps may exist that they would have caught

When someone loads your concept:

- You encoded your best understanding
- They're getting your intent as you expressed it
- You retain authority over whether it captures you

This is collaboration at a distance, with honest boundaries.

## Discussion

### Why a flat model?

Everything is a concept. The difference between a "persona" concept like [[code-reviewer]] and a "principle" concept like [[defensive]] is convention, not structure.

Profiles are really just concepts too—freeform markdown files that encode meaning. The model distinguishes them because it's useful for understanding:
- **Concepts**: Human-authored, source of intent
- **Profiles**: LLM-generated from concepts, validated by human, used at runtime

Under the hood, same format. The distinction clarifies the workflow, not the artifact type.

This simplifies the model:
- Two artifact types: concepts (source) and profiles (generated)
- Two linking syntaxes: `[[concept]]` (processed) and `@profile` (included)
- Two directories: `concepts/` and `profiles/`

The distinction between "persona" and "principle" can be explained in documentation, but the framework doesn't enforce it. Some concepts tend to be used as entry points for profile generation (the "persona-like" ones), but that's a usage pattern, not a rule.

The authoring flow:
1. Start with what you need (often a persona like [[code-reviewer]])
2. Notice repeated ideas → extract to referenced concepts
3. Concepts become reusable; entry-point concepts become cleaner

The LLM helps notice when something should be extracted: "You've mentioned 'validate inputs' in several concepts—want to make it a [[validate-inputs]] concept?"

### Meta-profiles

Profiles can reference other profiles with `@profile`. This enables meta-profiles—profiles for improving other profiles.

```markdown
# Improve Coding Profile

Help me iterate on my coding profile.

Current profile:
@coding-profile

When I suggest changes, consider:
- Does this align with [[defensive]] principles?
- Is this specific enough to be useful?
- Am I repeating something already captured elsewhere?
```

When you load `improve-coding-profile` in pi, it has the current `@coding-profile` in context. You discuss changes, iterate, and when satisfied—commit the updated profile.

**Commits are consistency boundaries.** At any commit, everything is stable and coherent. Between commits, you're exploring ideas with the current state as context.

This pattern works because:
- `@coding-profile` includes the profile as-is (already generated)
- You can reason about the profile's content with LLM assistance
- Changes get validated before committing

### Who controls the profiles?

The user does. The framework provides structure (concepts + linking). The user works with their preferred LLM to generate profiles for specific targets.

This is intentional. Different users will express the same concepts differently. The framework enables; it doesn't prescribe.

### How is this different from AGENTS.md?

AGENTS.md explains a codebase to agents. VOCABULARY.md explains *you* to agents (and humans).

They're complementary:
- AGENTS.md: "Here's how this project works"
- VOCABULARY.md: "Here's how I work"

An agent loading both understands the project *and* how you want to collaborate on it.

### What about runtime interpretation?

There is none. The profile is committed text. Same concept, same profile, always.

The LLM's job at runtime is to collaborate from that shared understanding, not to interpret what you might have meant. Interpretation happened at profile generation time, with your validation.

### What if my vocabulary conflicts with a project's?

Load both, let the profiles stack. Or create project-specific concepts that bridge your vocabulary with the project's conventions.

The vocabulary is yours. How you apply it to a project is up to you.

### Can an LLM infer new concepts from existing ones?

Yes. That's part of the value of rich concept data. Given your concepts (with examples and rationale), an LLM can propose:
- "Based on your concepts, here's a [[careful-coder]] persona"
- "Your vocabulary suggests you value X—want to make that a concept?"

The concepts are data for inference. What you commit after validation becomes part of your vocabulary.

## Migration

- This RFC extends RFC-05 (builds on T-6: Intent-Expression Gap)
- Vocabulary is opt-in; existing workflows continue unchanged
- Tooling (concept authoring, profile generation) is a separate concern

## Future Work

- **Tooling**: CLI for concept authoring and profile generation with LLM assistance
- **Sharing**: Vocabulary registries or imports
- **Inference**: LLM-assisted concept generation from existing vocabulary
- **Composition**: Formal semantics for combining concepts/profiles
- **Metrics**: Track vocabulary effectiveness over time

## References

- RFC-05: Intent-Expression Gap
- Issue #47: Constrain how silence is interpreted
- OODA Loop: Boyd's decision cycle (Observe, Orient, Decide, Act)
