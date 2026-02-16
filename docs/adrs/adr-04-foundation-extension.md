# ADR-04: Foundation Extension

- **Status:** Accepted
- **Date:** 2026-02-16
- **RFC:** [RFC-04](../rfcs/rfc-04-foundation-extension.md)
- **Extends:** ADR-03 (Foundation Revision)

## Context

ADR-03 established three Truths as the Foundation. Through further analysis, we found:

1. **T-1 and T-2 are disconnected**: We have objectives (T-1) and world models (T-2), but nothing explicitly states that agents *use* their world models to pursue objectives. This connection was assumed, not stated.

2. **Context efficiency requires justification**: We want "pre-encode understanding to minimize user context" to be structural, not a preference. But it's not derivable from T-1, T-2, T-3 alone. We need an explicit claim about the relationship between agent understanding and required context.

## Decision

Extend the Foundation from three Truths to five, adding:
- T-3: Model-Driven Action (agents use world models to select actions)
- T-5: Context Efficiency (user context fills the understanding gap)

### Extended Truths (Encoded)

**T-1: Objective-Driven Action**
Agents act from internal objectives.

**T-2: Imperfect World Model**
Agents have internal world models that are incomplete, fallible, and mutable.

**T-3: Model-Driven Action**
Agents use their world models to select actions in pursuit of objectives.

**T-4: Input Distinction**
World input and model-derived conclusions are distinct. World input is taken as given.

**T-5: Context Efficiency**
The context a user must provide is the gap between the agent's existing understanding and the situation's requirements.

### Encoding for LLM Context

```
## Truths

T-1: Agents act from internal objectives.

T-2: Agents have internal world models that are incomplete, fallible, and mutable.

T-3: Agents use their world models to select actions in pursuit of objectives.

T-4: World input and model-derived conclusions are distinct. World input is taken as given.

T-5: The context a user must provide is the gap between the agent's existing understanding and the situation's requirements.
```

### Migration from ADR-03

| ADR-03 | ADR-04 | Rationale |
|--------|--------|-----------|
| T-1: Objectives | T-1: Objectives | Unchanged |
| T-2: World Model | T-2: Imperfect World Model | Renamed for clarity; content unchanged |
| — | T-3: Model-Driven Action | New; connects objectives to world models |
| T-3: Input Distinction | T-4: Input Distinction | Renumbered |
| — | T-5: Context Efficiency | New; enables "pre-encode understanding" derivation |

### Key Derivations Now Possible

**"Better model → better outcomes"**
- T-1 + T-2 + T-3 → more accurate model leads to better action selection

**"Pre-encode understanding to minimize user burden"**
- T-2 + T-5 → since models are incomplete (T-2) and users must fill the gap (T-5), reducing the gap through pre-encoded understanding minimizes what users must provide

**"Declarative over prescriptive"**
- T-5 → if the agent already knows "how to do it right," users only specify "what I want" — not step-by-step instructions

These are now structural consequences within the framework.

## Consequences

- Foundation encoded as five Truths: T-1 through T-5
- Presuppositions remain unchanged (P-0 through P-4, not encoded)
- ADR-03 remains as historical record; this ADR captures current state
- "Pre-encode understanding" is now derivable, not assumed
- The connection between objectives and world models is explicit
