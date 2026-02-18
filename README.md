# Collaboration Framework

I want to collaborate more effectively with people and AI agents.

In my lived experience, most collaboration friction comes from misaligned assumptions, not different conclusions. This is my attempt to encode those assumptions explicitly. Aligning on a shared mental model of what to do, how to do it, and who does what makes the work light.

## The Gap

What someone means and what they say are never quite the same. You've probably felt this gap — the frustration of being misunderstood, or the effort it takes to explain yourself clearly.

I can't perfectly write what I mean, and you can't perfectly interpret what I wrote. But there's something here we can take advantage of: when I observe the result of our actions, I'm the only one who can decide "yes, that's what I meant" or "no, that missed the mark."

This framework is my attempt to model that gap as usefully as possible, knowing it can't be closed entirely. If the framework makes collaboration with me lighter and more productive, I successfully encoded my intent. If it doesn't, the gap between what I meant and what I wrote is showing, and the only way forward is to iterate until the model better captures what I mean.

## The Model

A model encodes assumptions — invariants you take as given so you can reason about something more simply. The right assumptions let you create a simpler model that's actually useful. The wrong assumptions (or too many) make the model collapse under its own weight.

The simplest model I could come up with for collaboration between humans and AI agents starts with a few presuppositions:

- Something exists.
- Distinct things exist (you and me, agent and world).
- Physics is consistent at the scale we operate.
- An agent is an entity capable of acting in the world.

These are models too, with their own assumptions. Non-duality questions whether distinct things exist. Quantum mechanics questions classical consistency. But you can (and probably should!) model a pendulum without accounting for quantum physics, even though the pendulum operates in quantum reality. I'm choosing the level that lets me say something useful about collaboration, not claiming these are ultimately true.

From those presuppositions, I claim six truths that apply to any agent — human or AI:

1. Agents act from internal objectives. This is intent.
2. Agents have internal world models that are incomplete, fallible, and mutable.
3. Agents use their world models to select actions in pursuit of objectives.
4. World input, including from collaborators, is taken as given; what it means is model-derived.
5. Collaboration adds context that agents can't derive alone, including the intent of the collaborator.
6. Expressed intent is lossy. Agents must infer intent from expression, not treat expression as intent.

That sixth truth is where this all leads. Words are models of concepts, and models simplify. Under the assumptions above — all the way back to distinct things existing — this necessarily follows. You're welcome to reject any of those assumptions, but if you do, this framework will be less useful for us when we collaborate.

### Vocabulary

The model uses two terms:

**Concepts** encode what something means to me — principles, preferences, ways of thinking. They're the source of truth.

**Profiles** are concepts compressed for a specific purpose. A profile for a coding agent looks different than a profile for onboarding a teammate — same underlying concepts, different shape.

What isn't mentioned has no preference. If I say "tree," I mean just tree — not secretly hoping for oak. If a concept says nothing about formatting, I have no preference. This keeps the vocabulary tractable — I only encode what I'd push back on.

## Closing the Loop

Because expressed intent is lossy, collaboration needs a correction loop. OODA (Observe, Orient, Decide, Act) is that loop.

```
        ┌──────────────────────────────┐
        │                              │
        ▼                              │
    Observe → Orient → Decide → Act ───┘
                 ▲
                 │
            [concepts]
            [profiles]
```

**Observe**: Notice what happened — feedback, friction, misalignment.

**Orient**: Interpret through your worldview — concepts, principles, mental models. This is where the framework lives.

**Decide**: Choose whether to update your understanding or proceed as-is.

**Act**: Make the change (or don't). The results become new observations.

OODA loops happen at whatever level you want to make a change. Refining this framework is an OODA loop. Collaborating on a coding task is an OODA loop. The structure is the same — what changes is what you're observing and what concepts shape your orientation.

The human is essential at Decide. Only you know if what you observed matches what you intended. An agent can propose, orient, even act — but the decision to accept the result or iterate again is yours. That's the invariant from The Gap: you're the one who closes the loop.

## In Practice

Concepts are freeform markdown files. They're as detailed as they need to be. I iterate on them until they feel right.

Profiles are generated from concepts, compressed for specific purposes. I iterate on them until the context feels right for the job.

There's a practical benefit here: using an LLM to help encode how I think it will interpret my profiles works well when I use that same LLM in the agent. Not perfect, but in practice quite deterministic.

## The Contract

These are the assumptions I'm asking you to accept:

1. You take my six truths as useful working assumptions.
2. You take my word that this framework reflects how I think about these things.

From my end, all these files are correct. The way I read them is the way I intend for them to be read. Beyond that, I can't guarantee you'll interpret them the way I meant. That's the gap — and why we iterate.

## Using This

**For me**: I use this to build an effective agent collaborator. My coding agent loads profiles generated from these concepts, and we collaborate from shared understanding rather than repeated instructions.

**For you**: You can use this to understand how I approach collaboration — under specific profiles, or just as a collection of concepts relevant to the task at hand.

The files aren't just agent context. They're readable documentation of my mental models for specific roles in specific environments.

## Origins

This started as a way to align with a coding agent. I wanted to give it the shared understanding it needed to work the way I do.

Along the way, I realized the same approach applies more broadly. The concepts that help an AI collaborate with me are the same ones that help humans collaborate with me. The framework became agent-agnostic — it's about collaboration, not about agents.

The [RFCs](docs/rfcs/) and [ADRs](docs/adrs/) capture the evolution in detail.

## Building This

I develop this framework with my current agent as a collaborator, treating it like any other codebase.

As the agent improves, the work gets better and iteration gets faster. I participate where I add the most value, which evolves along with the agent.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how this works in practice.

## License

Apache 2.0 — see [LICENSE](LICENSE).
