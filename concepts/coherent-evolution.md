# Coherent Evolution

A pattern for evolving projects consciously — from stable charter through versioned vision to disposable design. Source of truth: [dyreby/coherent-evolution](https://github.com/dyreby/coherent-evolution).

## The Three Layers

**Charter** is the invariant statement of purpose. It says *why* this project exists. Charter constrains vision.

**Vision** captures how the project serves that purpose today. It says *what* we're building toward. Vision constrains design.

**Design** is everything downstream — architecture, implementation, interfaces. It says *how* we get there.

Charter constrains vision constrains design. Each layer is more stable than the one below it and less stable than the one above.

## What Change Means

The layer where change happens tells you what kind of change it is:

- **Charter changes** → that's a new project. The purpose shifted fundamentally.
- **Vision changes** → that's growth. The project is evolving how it serves its purpose.
- **Design changes** → that's just work. Normal development.

This isn't bureaucracy — it's awareness. Most work lives in design. Occasionally vision evolves. Charter changes are rare and significant.

## Versioning Conventions

In dyreby repos:

- **Charter**: No version number in heading. Git history tracks changes. Changes are rare enough that formal versioning adds noise.
- **Vision**: Major/minor versioning (e.g., "Vision 2.1"). Major bumps for direction shifts, minor for refinements.
- **Software**: Semver. This is design-layer versioning — it follows the ecosystem convention.

## How It Applies

Every dyreby project evolves through these layers, whether the documents are explicit or implicit. When a repo has a `CHARTER.md` and a vision doc, the layers are visible. When it doesn't, they still exist — the charter is just unwritten.

Concepts themselves evolve coherently. The charter of a concept is the problem it addresses. The vision is the model it proposes. The design is the specific wording and structure. Most concept refinement is design-layer work — `cf:concept-alignment` already captures this pattern without naming it.

When evaluating a proposed change, ask which layer it touches. That tells you how much alignment is needed and how carefully to move.
