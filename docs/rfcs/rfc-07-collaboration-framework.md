# RFC-07: Collaboration Framework

- **Status:** Proposed
- **Created:** 2026-02-17
- **Supersedes:** Versioning established in RFC-01, RFC-03

## Summary

Drop semver versioning and rename the repository from `agent-framework` to `collaboration-framework`.

## Motivation

### Versioning

RFC-01 established v0.1.0 and declared that "Version 1.0.0 will be declared once all core layers are stable." RFC-03 incremented to v0.2.0. But versioning serves external consumers who need stability guarantees—this framework has none.

What we have instead:
- **ADRs** track the evolution of decisions
- **Git history** provides full traceability
- **Profile provenance** (commit + timestamp) traces generated artifacts to their source

Semver adds ceremony without payoff. Drop it.

### Naming

The repository is named `agent-framework`, but RFC-06 established that the framework is agent-agnostic:

> "The framework is agent-agnostic—encoding intent implies something has intent, but the framework doesn't distinguish human from AI."

The framework enables collaboration between:
- Human and agent (on projects, on profiles)
- Human and human (sharing concepts, adopting worldviews)
- Human and self across time (refining understanding through iteration)

The common thread is **collaboration**—joint effort where both parties actively shape the outcome through iteration. The human is always the one closing the loop (the invariant from RFC-06), but the collaborator can be anyone.

`collaboration-framework` captures this. `agent-framework` undersells it.

## Proposal

### Drop Versioning

Remove all references to semver versions (v0.1.0, v0.2.0, etc.) from framework documentation.

Provenance for generated artifacts:
- **For the author**: commit hash (or HEAD—you're always current)
- **For profiles**: embed source commit + generation timestamp in frontmatter (already established in RFC-06)

The profile becomes the versioned artifact, not the framework.

### Rename Repository

Rename `agent-framework` to `collaboration-framework`.

Update references in documentation to reflect the new name.

## Consequences

- No semver versions to maintain or increment
- ADRs remain the record of framework evolution
- Repository name reflects the framework's actual scope
- README and other documentation will need updates (tracked separately)

## Migration

- Existing ADRs/RFCs are immutable; version references remain as historical artifacts
- This RFC supersedes the versioning approach, not the documents themselves
- Rename repository
- Update CONTRIBUTING.md and other documentation (separate issue)

## References

- RFC-01: Truth Layer (established v0.1.0)
- RFC-03: Foundation Revision (established v0.2.0)
- RFC-06: Alignment on Intent (established agent-agnostic stance)
- Issue #7: Define versioning approach
