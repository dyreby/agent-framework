# ADR-09: Truths to Propositions

## Status

Accepted

## Context

The philosophy doc used "Truths" for the six statements derived from presuppositions. This terminology carried epistemological weight I didn't intend—implying universal or absolute truth rather than statements within a model.

The framework's thesis is "all models are wrong, but some are useful." Calling derived statements "truths" contradicts that stance. It also invites misreading: "truth" can connote religious or subjective certainty ("my truth"), which isn't what I mean.

## Decision

Change terminology throughout:

- **Presuppositions → Axioms**: Standard philosophical term for self-evident starting points accepted without proof.
- **Truths → Propositions**: Standard term for statements derived from premises, without claiming universal truth.

Rename `concepts/truths.md` to `concepts/propositions.md` and simplify it to operational insights rather than mirroring all six propositions.

Historical RFCs and ADRs retain original terminology—they capture thinking at the time. This ADR serves as the bridge for readers encountering "truths" in older docs.

## Consequences

- Philosophy doc gains academic rigor and aligns with "false but useful" framing
- Agent concept file becomes more actionable (distilled insights vs. full list)
- Readers of older docs have clear explanation of terminology evolution
