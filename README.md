# Collaboration Framework

A framework for encoding how I think, so we can collaborate effectively.

## The Gap

What someone means and what they say are never quite the same. I've felt this: the frustration of being misunderstood, the effort it takes to explain myself clearly. I assume you've felt it too.

I can't perfectly write what I mean. You can't perfectly interpret what I wrote. But here's what we can use: when I observe the result of our actions, I'm the only one who can decide "yes, that's what I meant" or "no, that missed the mark."

This gap can't be closed—but it can be worked with. That's what this framework is for.

## The Thesis

**Effective collaboration requires alignment at the right level—not more, not less.**

It's hierarchical: *why* → *what* → *how*. And each *how* contains its own why/what/how, all the way down.

At the top sits a shared objective. Below that, agreement on approach. Below that, agreement on implementation. Each level has the same shape: we each say what we think we should do and why, then agree or surface that we don't.

**Over-alignment creates noise.** A junior developer doesn't need the CEO's full strategic context, and couldn't use it. The right level for them is: this feature matters, build it well.

**Under-alignment creates gaps.** A developer who doesn't know *why* a feature matters will make poor tradeoffs when edge cases appear.

**The right level is discovered, not prescribed.** Step back to obvious agreement, then step down until we find where the work lives. That's where it becomes light.

Once we agree on *why*, disagreement on *what* becomes optimization, not conflict. Effort accumulates in the right direction. The *how* is encapsulated; each of us owns our approach within the agreed interface.

Perfect agreement is impossible. The system is designed to iterate and self-correct.

## How It Works

### Concepts

Concepts encode what something means to me: principles, preferences, ways of thinking. They live in [`concepts/`](concepts/) as freeform markdown files.

What isn't mentioned has no preference. If I say "tree," I mean just tree, not secretly hoping for oak. This keeps the vocabulary tractable: I'll try to only say something when silence would mislead.

### Iteration

Because expressed intent is lossy, working together needs a correction loop. I observe the result, decide if it matches what I meant, and either accept or iterate.

### In Practice

**For me**: I use this to work effectively with my coding agent. It loads these concepts, and we operate from shared understanding rather than repeated instructions.

**For you**: You can use this to understand how I think, either through specific concepts relevant to the task or as a collection of mental models.

The files aren't just agent context. They're readable documentation of how I think.

## Going Deeper

The [philosophy](docs/philosophy.md) captures the formal grounding: the presuppositions this model rests on and the truths that follow. You don't need it to work with me, but it's there if you want to see the derivation.

## Origins

This started as a way to work better with a coding agent. Along the way, I realized the same approach applies more broadly. The concepts that help an AI understand me help you understand me too.

The [RFCs](docs/rfcs/) and [ADRs](docs/adrs/) capture the evolution.

## Building This

I develop this framework with assistance from my coding agent, treating it like any other codebase I collaborate on.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how this works in practice.
