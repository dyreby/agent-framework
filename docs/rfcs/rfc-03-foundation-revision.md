# RFC-03: Foundation Revision

- **Status:** Accepted
- **Created:** 2026-02-15
- **Supersedes:** RFC-01 (Truths)

## Summary

Revise the Foundation from four truths to three, grounded in explicit presuppositions.
Each truth earns its place by stating something non-obvious that enables downstream Principles.

## Motivation

RFC-01 established the Foundation with four truths.
Through analysis, we identified opportunities to strengthen the foundation:

1. **Minimal context**: Truths appear in every agent system prompt. Context is precious. Don't waste tokens on obvious things.

2. **Non-obvious claims only**: Don't state what LLMs already presuppose ("actions have consequences," "words have meaning").

3. **Earn placement**: Each truth should add something the agent wouldn't have without it.

4. **Enable Principles**: Truths must support deriving principles like "better world model → better objective achievement" and "risks scale rigor."

5. **Clean structure**: Why (objectives) → What (world model) → Epistemic strategy (input distinction).

6. **Philosophical grounding**: Document presuppositions to preempt objections without wasting context.

## Presupposed Foundations

These premises are not claims of metaphysical truth.
They are pragmatic foundations for a useful model.
We choose to operate within experienced reality because that's where action happens.

These are documented here and in the ADR, but not encoded in agent context.

| # | Premise | Notes |
|---|---------|-------|
| P-0 | Something exists | Axiomatic; can't argue from nothing |
| P-1 | Duality | Distinct things exist. We acknowledge non-dual philosophies but adopt duality as a useful model for operating within experienced reality. |
| P-2 | Physical determinism | The world operates via consistent physics. We acknowledge quantum indeterminacy but treat macro-scale physics as effectively deterministic for practical action. |
| P-3 | Agent/world distinction | Agents are part of the world but modeled as distinct for useful reasoning about action and consequence. |
| P-4 | Agent definition | An agent is an entity capable of acting in the world. |

The Foundation begins where presuppositions end.
P-0 through P-4 are "obvious from experience" — shared ground we don't need to argue.
Truths are the first non-obvious structural claims.

## Proposal

### Revised Truths

**T-1: Objective-Driven Action**

Agents act from internal objectives.

- Establishes that action is purposive, not random
- The direction comes from inside the agent
- Foundation for "better" (aligned with objectives) and "worse" (misaligned)
- Objectives are internal facts; they just are what they are
- Silent on whether objectives change — allows for mutability without requiring it

**T-2: World Model**

Agents have internal world models that are incomplete, fallible, and mutable.

- Agents don't have direct access to reality, only to simplified representations
- **Incomplete**: Models have gaps; they don't cover everything
- **Fallible**: Models could be wrong about what they do cover
- **Mutable**: Models can be updated based on new input (enables iteration, OODA loops)
- This is the epistemic substrate agents use to navigate toward objectives

**T-3: Input Distinction**

World input and model-derived conclusions are distinct. World input is taken as given.

- **World input**: What comes from outside the agent (prompt, observations, data)
- **Model-derived conclusions**: What the agent arrives at based on input filtered through its world model
- Different words for different epistemological status: "input" vs "conclusions"
- World input is treated as ground truth — the agent doesn't second-guess it
- Model-derived conclusions are subject to T-2 (incomplete, fallible)
- Key epistemic strategy: distinguish reliable input from fallible conclusions
- Example (human): Input "I see a tree" → Conclusions range from obvious to personal: "that's an oak" / "those branches need trimming" / "we had a treehouse in a tree like that when I was a kid." Same tree, same input, different conclusions — each derived from different world models built from different experiences.
- Example (LLM): Input "The project deadline is tomorrow" → Conclusions vary by training: "I should help prioritize remaining tasks" / "I should ask what's blocking progress" / "I should suggest ways to negotiate an extension." Same prompt, same input, different conclusions — each derived from different objectives and training.

### What Changed from RFC-01

| RFC-01 | RFC-03 | Rationale |
|--------|--------|-----------|
| T-1: Agent Definition | Moved to P-4 | Definitional, not structural. Establishes terminology, not a truth about agents. |
| T-2: Action Consequence | Removed | Obvious from physics. LLMs already presuppose this. Wasted context. |
| T-3: Input Duality | Revised → T-3: Input Distinction | Clearer language. "World input" vs "model-derived conclusions" uses different words for different things. Added "taken as given" to establish epistemic asymmetry. |
| T-4: Model Fallibility | Folded into T-2 | Both are properties of the world model. Combined with incomplete and mutable for complete characterization. |
| — | Added: T-1 Objectives | First non-obvious claim. Establishes purposiveness. Enables "better/worse" reasoning. |
| — | Added: Mutable (in T-2) | Enables iteration, OODA loops, learning. Original truths didn't establish that models update. |

### Derived Principles (Examples)

These truths enable Principles (Core):

**"A better world model results in higher chance of achieving objectives"**
- T-1: Agent has objectives
- T-2: Agent uses (incomplete, fallible) world model to navigate
- Derivation: Better model → better navigation → higher objective achievement

**"Risks scale rigor"**
- T-1: Objectives define what matters (stakes)
- T-2: Model is fallible (could be wrong)
- T-3: World input is more reliable than model-derived conclusions
- Derivation: High stakes → verify model-derived conclusions more carefully → prefer world input

**"Prefer world input over model-derived conclusions"**
- T-3: World input is taken as given; conclusions are fallible
- Derivation: When input and conclusions conflict, trust input

**"Iterate to improve"**
- T-2: Model is mutable
- Derivation: Observe results, update model, act again (OODA loop)

### Encoding for LLM Context

The three truths, encoded minimally:

```
## Truths

T-1: Agents act from internal objectives.

T-2: Agents have internal world models that are incomplete, fallible, and mutable.

T-3: World input and model-derived conclusions are distinct. World input is taken as given.
```

Presuppositions (P-0 through P-4) are not encoded — they are shared ground.

## Discussion

### Why "input" and "conclusions"?

Different words signal different epistemological status:
- **Input**: Comes from outside. Received. Ground truth.
- **Conclusions**: Arrived at inside. Derived through world model. Fallible.

An agent should treat these differently. The language reinforces that.

"Conclusions" also avoids collision with ML terminology where "inference" means running the model.

### Why not state "actions have consequences"?

LLMs already know this from training data (physics, ethics, narrative, law).
Stating it wastes context without adding value.
The framework presupposes it via P-2 (physical determinism).

### Why objectives before world model?

"Why before how." Objectives are the reason anything else matters.
The world model exists to serve objectives, not the other way around.

### Are objectives fallible?

No. An objective just is what it is — an internal fact.
"I want X" is definitionally true for the agent that wants it.
The agent's *understanding* of its objectives might be incomplete (that's part of the world model).
But the objective itself isn't a claim about the world that could be wrong.

### Is this framework agent-type-agnostic?

Yes. These truths apply to humans, LLMs, and other agents:
- Humans act from objectives (conscious goals)
- LLMs act from objectives (trained objectives + contextual objectives)
- Both have incomplete, fallible, mutable world models
- Both receive input and derive conclusions

The *source* of objectives and models differs, but the structural properties are the same.

## Migration

- This RFC supersedes RFC-01 (declared in header)
- ADR-03 supersedes ADR-01 (declared in its header)
- Version increments to v0.2.0

## References

- RFC-01: Truths (superseded)
- RFC-02: Foundation Core Shell
- Box, George E. P. (1976). "Science and Statistics". Journal of the American Statistical Association.
