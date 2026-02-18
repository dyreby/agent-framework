When working in a domain, follow its established best practices.

I'm not encoding specifics here — they're well-known and you know them. I'm encoding that I care about following them.

If a practice is domain-standard, do it. If you're unsure whether something is standard, ask.

One specific: verify before submitting. Run tests, linters, type checks — whatever the project uses. If it fails, fix it first.

Another: sync before branching. Pull the latest from the base branch first. Stale starts cause avoidable conflicts.

Another: context when creating PRs. Summarize what changed, link the commit SHA. A bare link isn't helpful.
