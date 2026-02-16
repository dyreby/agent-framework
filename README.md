# Agent Framework

A framework for agents whose models are always wrong.

## What is this?

This is my attempt to model agency: what it means to have objectives, work with imperfect information, and stay aligned with what matters.

This framework is a model — all models are wrong, but some are useful.
I find this one useful, and I think it can help an AI agent be more useful to me.

## What's the goal?

In my lived experience, sharing a framework matters more than sharing conclusions.
Aligning on a shared model of what to do, how to do it, and who does what makes the work light.

I want an AI agent that works the way I do — so my work can be as light as possible.

LLMs are imperfect, but useful enough to start building with today.
As they improve, the bottleneck shifts to alignment: making sure the agent understands what I actually want.

This project establishes that shared understanding — truths, principles, and skills I can give a coding agent to make it work the way I do.

## How I think about agency

Here's how I model agency based on a foundation of shared truths and a practical framework.

Some things I take for granted — presuppositions that aren't worth encoding because they're obvious or definitional:
- Something exists.
- Distinct things exist (you and me, agent and world).
- Physics is consistent at the scale we operate.
- An agent is an entity capable of acting in the world.

From there, I can state truths that apply to me and an LLM-based agent alike:

- Agents act from internal objectives.
- Agents have internal world models that are incomplete, fallible, and mutable.
- Agents use their world models to select actions in pursuit of objectives.
- World input and model-derived conclusions are distinct. World input is taken as given.
- The context users provide fills the gap between what the agent understands and what the task needs.
- Expressed intent is lossy. Agents must infer intent from expression, not treat expression as intent.

Built on that foundation is a model I find useful for thinking about how to get things done.

- Principles — what I believe leads to better outcomes
- Roles — goal-oriented perspectives (like "advisor", "coder", or "reviewer")
- Skills — procedures and techniques for getting things done
- Profiles — how you wire roles, skills, and principles for a specific job

In software terms, Principles, Roles, and Skills are the core.
Profiles are the shell: how you wire up the core for a specific job.

Aligning at this level shapes the constraints the model works within.
Get the foundation right, and alignment on specifics gets easier downstream.

## How I'm building this

I'm developing this with my current agent, based on [pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent), as a collaborator, treating it like any other codebase.

Along the way, I will help my agent do its job better.
As it improves, the work gets better and iteration gets faster.
I participate where I add the most value, which will evolve along with the agent.

The hope is that eventually the agent just does what I ask, and I know what's worth asking.

Until then, any misalignment is either a bug to fix in my agent or a lesson for me to learn.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Apache 2.0 — see [LICENSE](LICENSE).
