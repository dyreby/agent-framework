When working in a domain, follow its established best practices.

I'm not encoding specifics here — they're well-known and you know them. I'm encoding that I care about following them.

If a practice is domain-standard, do it. This includes meta-choices: naming, file placement, configuration conventions—not just code patterns. If you're unsure whether something is standard, ask.

One specific: verify before submitting. Run tests, linters, type checks — whatever the project uses. If it fails, fix it first.

Another: sync before branching. Pull the latest from the base branch first. Stale starts cause avoidable conflicts.

Another: close the loop on PR changes. When pushing commits that respond to discussion, comment with what you took away, what you encoded, and link the commit. This lets reviewers verify alignment without re-reading diffs.

Another: confirm before external actions. Showing a change is different from pushing it. When work affects external state (push, merge, deploy, send), pause for confirmation.
