# RFC-01: Truth Layer

- **Status:** Draft
- **Created:** 2026-02-12

## Summary

Establish the Truth layer as the foundational layer for an agent's kernel.
Truths are structural properties of agents and the reality they operate within — they describe what IS, not what should be done.

## Motivation

Agents (human or artificial) operate under fundamental structural constraints:

- They act upon the world using internal models
- Those models receive both external and internal data
- Those models are necessarily incomplete simplifications of reality
- Their actions have consequences that cannot be fully predicted

These aren't preferences or guidelines.
They're structural properties of agents operating in any environment.

The Truth layer codifies these properties so that all other kernel layers (Values, Roles, Skills, Profiles) operate with awareness of them.

## Architecture: Functional Core / Imperative Shell

The kernel follows a functional core / imperative shell architecture.

| Layer | Zone | Function |
|-------|------|----------|
| Truths | Core | Describe — structural properties of agents and reality |
| Values | Core | Guide — principles for operating given those properties |
| Roles | Core | Optimize — goal-oriented perspectives |
| Skills | Core | Execute — procedures and preferences for getting things done |
| Profiles | Shell | Wire — select and configure the core for a specific job |

**Core** layers are declarative, composable, and job-independent.
**Shell** wires up the core for a specific job.

*Note: The full architecture will be documented in a separate ADR once this RFC is accepted.*

## Proposal

### What is a Truth?

A Truth is a structural property of agents and the reality they operate within.
Truths are descriptive, not prescriptive — they describe what IS, not what agents should do.

Truths are:

- Structural properties that hold regardless of role, domain, or agent type (human or AI)
- Descriptive statements about the nature of agents and reality
- The foundation that Values, Roles, and Skills must account for

Truths are not:

- Guiding principles on how to act (those belong in Values)
- Best practices (those belong in Skills)
- Job-specific rules (those belong in Profiles)

### Proposed Truths

**T-1: Agent Definition**

An agent is an entity that acts upon the world using an internal model.

**T-2: Data Duality**

The model responds to two types of data: external and internal.

**T-3: Model Fallibility**

An agent's model is a simplification of reality and necessarily incomplete. All models are wrong; some are useful.

**T-4: Action Consequences**

Actions affect the world and the agent, in ways that cannot be fully predicted.

### Applicability

These truths apply to human and artificial agents alike.

### Deferred to Values Layer

The following principles were considered but are prescriptive rather than structural. They belong in the Values layer as guidance for operating given the Truths:

- **Data Integrity**: Internally-sourced data must not be conflated with externally-sourced data. (Derived from T-2)
- **Confidence Calibration**: Confidence must scale with available support and stakes. (Derived from T-3)
- **Rigor Scales with Stakes**: As potential impact increases, rigor, verification, and caution must increase proportionally. (Derived from T-3, T-4)
- **Objective Alignment**: Optimization must remain aligned with explicit goals and constraints.

### Modification Policy

Truth layer changes require:

1. RFC proposing the change
2. ADR recording the decision
3. Major version increment

This reflects the foundational nature of the layer.

## References

- Future RFCs will propose Values, Roles, Skills, and Profiles layers.
- Box, George E. P. (1976). "Science and Statistics". Journal of the American Statistical Association.
