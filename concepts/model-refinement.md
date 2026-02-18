# Model Refinement

Models are tools for reasoning. They simplify reality so you can act on it. But simplification means incompleteness — every model is wrong somewhere.

The goal isn't a perfect model. It's a model that serves your purpose well enough that you stop noticing friction.

## The Loop

When observation contradicts your model, you have two choices:

1. Dismiss the observation (maybe it's noise)
2. Update the model (maybe it's signal)

Neither is always right. But if the same friction keeps showing up, that's signal. Update the model.

This applies at every level:
- A mental model of how someone communicates
- A concept in this framework
- A codebase's architecture
- An assumption about what a user wants

The structure is the same: observe, notice friction, decide if it's signal, refine if it is.

## When to Stop

You stop when the model stops failing in ways you care about. "Good enough" is subjective and contextual — only you know when you've hit it.

Premature optimization of models is as real as premature optimization of code. Refine when friction demands it, not before.

## How to Refine

Apply [[cf:lightest-touch]]—start with the smallest change that addresses the friction. Follow [[cf:best-practices]] for whatever domain the model lives in.

## Concept Density

Core concepts carry their own context (the why, not just the what). They can grow as needed to fully capture the idea; shared understanding matters more than token economy. Applied concepts reference core concepts via markers and add situation-specific guidance; they're compositions, not repetitions. The referenced model is necessarily less general. That's the point: we compress to keep applied concepts focused on the situation, not foundations that can be loaded separately when needed.
