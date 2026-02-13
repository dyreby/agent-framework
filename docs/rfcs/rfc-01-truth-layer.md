# RFC-01: Truth Layer

- **Status:** Draft
- **Created:** 2026-02-12

## Summary

Establish the Truth layer as the foundational constraint system for the Agent Kernel.
Truths are structural invariants that cannot be overridden by any other layer.

## Motivation

Agents (human or artificial) operate under fundamental constraints:

- They receive incomplete information
- Their internal models are fallible
- They must act despite uncertainty
- Their actions have consequences of varying magnitude

These constraints aren't preferences or guidelines.
They're structural properties of bounded agents operating in complex environments.

The Truth layer codifies these constraints so that all other kernel layers (Values, Roles, Skills, Profiles) operate within them.

## Architecture: Functional Core / Imperative Shell

The kernel follows a functional core / imperative shell architecture.

| Layer | Zone | Function |
|-------|------|----------|
| Truths | Core | Constrain — non-overridable invariants |
| Values | Core | Bias — guiding principles that tilt decisions under uncertainty |
| Roles | Core | Optimize — goal-oriented perspectives |
| Skills | Core | Execute — procedures and preferences for getting things done |
| Profiles | Shell | Wire — select and configure the core for a specific job |

**Core** layers are declarative, composable, and job-independent.
**Shell** wires up the core for a specific job.

Profiles don't override the core — they orchestrate it.

Conflicts resolve top-down: Truths override Values override Roles override Skills.

## Proposal

### What is a Truth?

A Truth is a non-overridable structural constraint.
It describes something that must hold for trustworthy agent behavior, regardless of role, domain, or embodiment.

Truths are not:

- Best practices (those belong in Skills)
- Guiding principles on how to act (those belong in Values)
- Job-specific rules (those belong in Profiles)

### Proposed Truths

**T-1: Model / Observation Distinction**

Agents must distinguish between observed input and internal model content.
Internal model content must not be presented as observed fact.

**T-2: Model Fallibility**

Internal models are incomplete and potentially wrong.
Confidence must scale with available support and stakes.

**T-3: Grounded Claims**

Claims about external state must be traceable to observed input or clearly marked as inference.

**T-4: Rigor Scales with Stakes**

As potential impact increases, rigor, verification, and caution must increase proportionally.

**T-5: Objectives Constrain Optimization**

Agents act relative to explicit goals and constraints.
Optimization must remain aligned with them.

### Applicability

These truths apply equally to:

- Artificial agents (LLM-based or programmatic)
- Human agents
- Hybrid human-AI systems

If a truth only applies to one embodiment type, it does not belong in this project.

### Modification Policy

Truth layer changes require:

1. RFC proposing the change
2. ADR recording the decision
3. Major version increment

This reflects the foundational nature of the layer.

## Open Questions

1. Are five truths the right number, or are some redundant / missing?
2. Is "Objectives Constrain Optimization" (T-5) too abstract?

## References

- Future RFCs will propose Values, Roles, Skills, and Profiles layers.
