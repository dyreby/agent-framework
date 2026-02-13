# RFC-01: Truth Layer

- **Status:** Draft
- **Created:** 2026-02-12

## Summary

Establish the Truth layer as the foundational layer for an agent's kernel.
Truths are structural properties of agents operating in the world.
They describe what agents are, not what they should do.

## Motivation

Agents (human or artificial) operate under fundamental structural properties:

- They are capable of acting based on indeterminate world models
- Their actions have effects on the world and on themselves
- Their models respond to data from the world and from themselves
- Their models are simplifications and necessarily incomplete

These aren't preferences or guidelines.
They're structural properties of agents operating in the world.

The Truth layer codifies these properties. All other kernel layers operate with awareness of them.

## Architecture: Functional Core / Imperative Shell

The kernel follows a functional core / imperative shell architecture.

| Layer | Zone | Function |
|-------|------|----------|
| Truths | Core | Describe — structural properties of agents operating in the world |
| Values | Core | Guide — principles for operating given those properties |
| Roles | Core | Optimize — goal-oriented perspectives |
| Skills | Core | Execute — procedures and preferences for getting things done |
| Profiles | Shell | Wire — select and configure the core for a specific job |

**Core** layers are declarative, composable, and job-independent.
**Shell** wires up the core for a specific job.

*Note: The full architecture will be documented in a separate ADR once this RFC is accepted.*

## Proposal

### What is a Truth?

A Truth is a structural property of agents operating in the world.
Truths are descriptive, not prescriptive.
They describe what agents are, not what they should do.

Truths are:

- Independent of role, domain, or agent type (human or AI)
- The foundation that Values, Roles, and Skills must account for

Truths are not:

- Guiding principles on how to act (those belong in Values)
- Best practices (those belong in Skills)
- Job-specific rules (those belong in Profiles)

### Proposed Truths

**T-1: Agent Definition**

An agent is an entity capable of acting based on an indeterminate world model.

**T-2: Action Consequences**

Actions have effects on the world and the agent.

**T-3: Data Duality**

The model responds to data from the world and the agent.

**T-4: Model Fallibility**

An agent's model is a simplification of the world and necessarily incomplete. All models are wrong; some are useful.

### Applicability

These truths apply to human and artificial agents alike.

### Deferred to Values Layer

The following principles were considered but are prescriptive rather than structural. They belong in the Values layer as guidance for operating given the Truths:

- **Data Integrity**: Data from the world must not be conflated with data from the agent. (Derived from T-3)
- **Confidence Calibration**: Confidence must scale with available support and stakes. (Derived from T-4)
- **Rigor Scales with Stakes**: As potential impact increases, rigor, verification, and caution must increase proportionally. (Derived from T-2, T-4)
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
