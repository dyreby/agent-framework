# RFC-04: Foundation Extension

- **Status:** Accepted
- **Created:** 2026-02-15
- **Extends:** RFC-03 (Foundation Revision)

## Summary

Extend the Foundation from three truths to five, adding two truths that bridge objectives and world models and establish context efficiency as a structural property.

## Motivation

RFC-03 established three truths:
- T-1: Agents act from objectives
- T-2: World models are incomplete, fallible, and mutable
- T-3: World input and conclusions are distinct

Through further analysis, we identified two gaps:

1. **Missing bridge**: T-1 and T-2 are independent claims. Nothing explicitly connects objectives to world models. We assumed agents *use* their world models to pursue objectives, but never stated it.

2. **Missing context claim**: We want to derive "pre-encode understanding to minimize user context" as a consequence, not a principle. But it's not derivable from T-1, T-2, T-3 alone. We need an explicit claim about the relationship between agent understanding and required context.

### The Bridge Problem

To derive "a better world model leads to better outcomes," we need:
- T-1: Agents have objectives
- T-2: Agents have world models
- **Missing**: Agents *use* world models to select actions in pursuit of objectives

Without the bridge, T-1 and T-2 are disconnected. An agent could have objectives and a world model that don't interact.

### The Context Problem

We want "minimize user-provided context" to be structural, not opinion. The ideal: tell the agent *what* you want, not *how* to do it right — that should already be encoded.

To derive this:
- T-2: Models are incomplete (gap always exists between agent understanding and situation requirements)
- **Missing**: The context a user must provide equals this gap

With this claim, the derivation follows: invest in pre-encoded understanding (training, system prompts, skills) to minimize the gap, so users only specify situation-specific goals.

## Proposal

### Extended Truths

**T-1: Objective-Driven Action** (unchanged)
Agents act from internal objectives.

**T-2: Imperfect World Model** (unchanged)
Agents have internal world models that are incomplete, fallible, and mutable.

**T-3: Model-Driven Action** (new)
Agents use their world models to select actions in pursuit of objectives.

- Connects T-1 (objectives) to T-2 (world models)
- Enables derivation: better model → better action selection → higher objective achievement
- This describes the primary deliberative mechanism; reflexes and random exploration exist but don't pursue objectives
- This is structural, not opinion

**T-4: Input Distinction** (renumbered from T-3)
World input and model-derived conclusions are distinct. World input is taken as given.

**T-5: Context Efficiency** (new)
The context a user must provide is the gap between the agent's existing understanding and the situation's requirements.

- Pre-encoded alignment (training, system prompts, skills) reduces this gap
- More capable models with richer world models require less situation-specific input
- Enables "tell me what, not how" — declarative over prescriptive
- Combined with T-2 (incompleteness), investing in pre-encoded understanding is structurally advantaged

### What Changed from RFC-03

| RFC-03 | RFC-04 | Rationale |
|--------|--------|-----------|
| T-1: Objectives | T-1: Objectives | Unchanged |
| T-2: World Model | T-2: Imperfect World Model | Renamed for clarity; content unchanged |
| — | T-3: Model-Driven Action | New; connects objectives to world models |
| T-3: Input Distinction | T-4: Input Distinction | Renumbered |
| — | T-5: Context Efficiency | New; enables "pre-encode understanding" as structural consequence |

### Derived Consequences

These truths enable structural derivations:

**"Better model → better outcomes"**
- T-1: Agent has objectives
- T-2: Agent has (incomplete, fallible) world model
- T-3: Agent uses model to select actions in pursuit of objectives
- Derivation: More accurate model → better predictions → better action selection → higher probability of achieving objectives

**"Pre-encode understanding to minimize user burden"**
- T-2: Models are always incomplete (gap exists)
- T-5: User must fill the gap with context
- Derivation: Reduce the gap through pre-encoded understanding (training, system prompts, skills) → users provide less situation-specific context

**"Declarative over prescriptive"**
- T-5: Gap between agent understanding and situation requirements determines context
- Derivation: If the agent already knows "how to do it right," the user only specifies "what I want" — not step-by-step instructions
- Avoids the X-Y problem at the prompt level: users specify goals, not assumed solutions

### Encoding for LLM Context

The five truths, encoded minimally:

```
## Truths

T-1: Agents act from internal objectives.

T-2: Agents have internal world models that are incomplete, fallible, and mutable.

T-3: Agents use their world models to select actions in pursuit of objectives.

T-4: World input and model-derived conclusions are distinct. World input is taken as given.

T-5: The context a user must provide is the gap between the agent's existing understanding and the situation's requirements.
```

## Discussion

### Why is context efficiency a truth?

It's almost tautological: if an agent doesn't already understand something the situation requires, the user must provide it. But stating it explicitly enables important derivations.

Without T-5, "invest in pre-encoded understanding" is just good advice. With T-5, it's structural: the gap *must* be filled, so reducing the gap through training, system prompts, and skills directly reduces what users must provide.

This also clarifies why more capable models are better in this framework — not because "complex is good," but because richer world models shrink the gap. A model that already knows "how to do things right" only needs the user to say "what I want."

### Why is the bridge a separate truth?

You could argue it's implied — why else would agents have world models if not to pursue objectives? But implications aren't derivations. Making it explicit means downstream reasoning doesn't have to re-derive it.

T-3 describes the primary deliberative mechanism. We acknowledge agents also have reflexes, habits, and random exploration — but these either don't pursue objectives (exploration) or are compressed forms of model-driven action (habits). The truth captures the core loop: objectives + world model → action selection.

### Does the order matter?

The logical flow is:
1. Agents have objectives (why they act)
2. Agents have imperfect world models (what they work with)
3. Agents use models to pursue objectives (how 1 and 2 connect)
4. Input and conclusions are distinct (epistemic grounding)
5. Context fills the understanding gap (efficiency property)

T-3 immediately after T-2 connects objectives to models. T-4 establishes epistemic grounding. T-5 states the context property that, combined with T-2, yields the "pre-encode understanding" derivation.

## Migration

- This RFC extends RFC-03 (not supersedes — the original truths remain)
- ADR-04 will reference this RFC

## References

- RFC-03: Foundation Revision
- ADR-03: Foundation Revision
