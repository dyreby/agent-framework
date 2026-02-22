# Collaboration Framework

A framework for encoding how I think, so we can work together effectively.

## The Gap

What someone means and what they say are never quite the same. I've felt this: the frustration of being misunderstood, the effort it takes to explain myself clearly. I assume you've felt it too.

Neither of us can perfectly say what we mean. Neither can perfectly interpret what the other said. But we can observe results: I see your reaction to my action and can sense whether my intent came through. You see my reaction to yours. A shared understanding of this dynamic creates space to align on intent before judging the expression. I can't be wrong about what I meant, and neither can you. Getting it across is where we need to help each other out.

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

Concepts are words and phrases we assume mean the same to everyone, and often do, roughly. But exact meaning varies person to person, and this is why the gap exists.

The [`concepts/`](concepts/) files are the clarification I've found my agents need for what each means to me. They work better when I don't overprescribe: if I say tree, I mean just tree, not secretly hoping for an oak. These files change constantly as I work with my agent: the framework in action.

### Iteration

Because expressed intent is lossy, working together needs a correction loop. OODA (Observe, Orient, Decide, Act) provides the structure:

1. **Observe** the result of our actions
2. **Orient** against what we meant (concepts help here)
3. **Decide** if it hit the mark or needs adjustment
4. **Act** accordingly—accept or iterate

This loop runs continuously. The [philosophy](docs/philosophy.md) has the formal treatment.

### In Practice

**In conversation**: I try to find the right level of alignment. When tension rises, it's usually a signal we're at the wrong level—not that we actually disagree. Stepping back often resolves it.

**With my coding agent**: Same approach, just formalized. It loads these concepts and we operate from shared understanding rather than repeated instructions.

**For you**: If we're working together, my hope is this model for how I think helps us orient. And it's where I can say clearly: my intent is to help. Exactly what you think that means I can never know, but I hope it's a good enough place to start the conversation.

## Going Deeper

The [philosophy](docs/philosophy.md) captures the formal grounding: the axioms it rests on and the propositions that follow. It's there if you want to see the reasoning.

## Origins

This project started as a way to work better with a coding agent. I learned along the way that what reduces friction there could be used to reduce friction in any collaboration.

The [RFCs](docs/rfcs/) and [ADRs](docs/adrs/) capture the evolution.

## Building This

I develop this framework with assistance from my coding agent, treating it like any other codebase I collaborate on.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how this works in practice.
