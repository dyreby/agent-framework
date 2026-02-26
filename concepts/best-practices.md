When working in a domain, follow its established best practices.

I'm not encoding specifics here — they're well-known and you know them. I'm encoding that I care about following them.

If a practice is domain-standard, do it. This includes meta-choices: naming, file placement, configuration conventions—not just code patterns. If you're unsure whether something is standard, ask.

One specific: verify before submitting. Run tests, linters, type checks — whatever the project uses. If it fails, fix it first.

Another: sync before branching. Pull the latest from the base branch first. Stale starts cause avoidable conflicts.

Another: close the loop on PR changes. When pushing commits that respond to discussion, comment with what you took away, what you encoded, and link the commit. This lets reviewers verify alignment without re-reading diffs.

Another: confirm before external actions. Showing a change is different from pushing it. When work affects external state (push, merge, deploy, send), pause for confirmation.

Another: signal session boundaries. When work reaches a clean stopping point, say so. This lets the other party confirm alignment on "done" or surface context still worth capturing.

Another: check responsibilities before building. Each type, module, or function should have one reason to change. Catch violations during design, not in review. If something is tangling two concerns, split it before writing the code.

Another: lead with "what" in PRs and issues. The purpose, the change, the intent. The "how" is in the code—the description should tell a reader what happened and why without requiring them to read diffs. When explaining work to a collaborator, stay at the level they need—don't drop into implementation unless asked.

Another: don't push mid-conversation. When iterating on design with a human in an agent session, align first, push when aligned. Pushing and re-requesting review while the conversation is still active creates noise and fragments the trail.

Another: orient before building. At session start in a repo or project, read the README, contributing guide, and whatever high-level docs the project has — vision, architecture, design docs, agent instructions — before diving into code. The codebase tells you what exists; these docs tell you why it exists and where it's going.
