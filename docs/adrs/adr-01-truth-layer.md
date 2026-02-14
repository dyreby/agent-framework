# ADR-01: Truth Layer

- **Status:** Accepted
- **Date:** 2026-02-14
- **RFC:** [RFC-01](../rfcs/rfc-01-truth-layer.md)

## Context

Agents (human or artificial) operate under fundamental structural properties. These properties aren't preferences or guidelines — they're the reality agents must account for.

We needed a foundational layer that describes what agents are, not what they should do.

## Decision

Establish the Truth layer as the foundational layer for the agent kernel.

Truths are structural properties of agents operating in the world. They are:

- Descriptive, not prescriptive
- Independent of role, domain, or agent type
- The foundation that all other layers must account for

### Accepted Truths

**T-1: Agent Definition**
An agent is an entity capable of acting based on an indeterminate world model.

**T-2: Action Consequence**
Actions have effects on the world and the agent.

**T-3: Input Duality**
An agent's model responds to input from the world and the agent.

**T-4: Model Fallibility**
An agent's model is a simplification of the world and necessarily incomplete. All models are wrong; some are useful.

### Versioning

This decision establishes v0.1.0 of the kernel. The 0.x series allows iteration while the foundation is built. Version 1.0.0 will be declared once all core layers are stable.

## Consequences

- All other kernel layers (Values, Roles, Skills, Profiles) operate with awareness of these Truths
- Truth layer changes require RFC, ADR, and major version increment
- Prescriptive principles (Input Integrity, Confidence Calibration, Objective Alignment) are deferred to the Values layer
