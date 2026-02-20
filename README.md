# Collaboration Framework

A framework for encoding how I think, so we can collaborate effectively.

## Why This Exists

Most collaboration friction comes from misaligned assumptions, not different conclusions. When we share a mental model of *what* we're doing, *why* we're doing it, and *how* we'll work together, the work gets lighter.

This framework encodes those assumptions explicitly—not to over-specify, but to align at the right level.

## The Thesis

**Effective collaboration requires alignment at the right level—not more, not less.**

Alignment is hierarchical: *why* → *what* → *how*. And each *how* contains its own why/what/how, all the way down.

At the top sits a shared objective. Below that, agreement on approach. Below that, agreement on implementation. Each level has the same shape: we each say what we think we should do and why, then agree—or surface that we don't.

**Over-alignment fails.** A mail sorter can't align with the CEO's full context—and shouldn't try. The right level for them is: mail matters, sort it well.

**Under-alignment creates friction.** A sorter who doesn't know *why* mail matters will sort poorly when edge cases appear.

**The right level is discovered, not prescribed.** Step back to obvious agreement, then step down until you find where the work lives. That's where you align.

Once aligned on *why*, disagreement on *what* becomes optimization, not conflict. Effort accumulates in the right direction. The *how* is encapsulated—each agent owns their approach within the agreed interface.

Perfect alignment is impossible. The system is designed to iterate and self-correct.

## How It Works

### Concepts

Concepts encode what something means to me—principles, preferences, ways of thinking. They live in [`concepts/`](concepts/) as freeform markdown files.

What isn't mentioned has no preference. If I say "tree," I mean tree—not secretly hoping for oak. This keeps the vocabulary tractable; I only encode what I'd push back on.

### Iteration

Because expressed intent is lossy, collaboration needs a correction loop. I observe the result, decide if it matches what I meant, and either accept or iterate.

You can't close this loop for me. Only I know if the output matches my intent. But you can orient well—and the concepts help you do that.

### In Practice

**For me**: I use this to build an effective agent collaborator. My coding agent loads these concepts, and we collaborate from shared understanding rather than repeated instructions.

**For you**: You can use this to understand how I approach collaboration—either through specific concepts relevant to the task, or as a collection of mental models.

The files aren't just agent context. They're readable documentation of how I think.

## Going Deeper

The [philosophy](docs/philosophy.md) captures the deeper grounding—the gap between expression and intent, the presuppositions this model rests on, and the truths that follow. You don't need it to collaborate effectively, but it's there if you want it.

## Origins

This started as a way to align with a coding agent. Along the way, I realized the same approach applies more broadly. The concepts that help an AI collaborate with me help you collaborate with me too.

The [RFCs](docs/rfcs/) and [ADRs](docs/adrs/) capture the evolution.

## Building This

I develop this framework with my current agent as a collaborator, treating it like any other codebase.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how this works in practice.

## License

Apache 2.0 — see [LICENSE](LICENSE).
