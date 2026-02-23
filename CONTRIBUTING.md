# Contributing

This file documents how I evolve the framework with my agent.

## How Concepts Evolve

**Issues capture misalignment.**
When collaboration doesn't feel right, or a concept doesn't land the way I intended, I open an issue.
The issue is The Gap in action: what I observed vs what I meant.

**PRs capture resolution.**
When a concept feels right, it goes in a PR.
The PR is the claim: this now says what I mean.

**RFCs propose structural changes.**
Significant changes to the framework itself (not just concepts) go through [RFCs](docs/rfcs/) first, then get an [ADR](docs/adrs/) once accepted.

Smaller decisions (terminology, minor adjustments) can go directly to ADR.

## Writing Style

Approachable. Plain language. As detailed as it needs to be, no more.

## Extensions

Start each extension with a block comment describing what it does:

```typescript
/**
 * Brief name or purpose.
 *
 * What the extension provides—commands, keybindings, behaviors.
 * Enough context to understand at a glance.
 */
```

This helps with quick scanning when listing extensions.

When adding a new extension, add it to `pi.extensions` in `package.json`.
The manifest is explicit so users know what they're installing.
Installation is through git:

```bash
pi install git:github.com/dyreby/collaboration-framework
```

## For Others

If you're reading this and something doesn't make sense, feel free to open an issue.
I'll do my best to explain my reasoning, and you may help me see something I missed.
