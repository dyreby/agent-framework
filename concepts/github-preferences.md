# github-preferences

Preferences for GitHub operations in dyreby/* repos:

- **Work from repo directory**: Repo-scoped commands (pr, issue, release) must be run from within the target repo. Use the workspace tool or cd to switch contexts.
- **Branching**: Never commit directly to main. Always create a branch and PR for changes—even small fixes.
- **PR creation**: When creating a PR as john-agent, request dyreby's review.
- **PR updates**: After pushing changes that address review feedback, re-request review.
- **Addressing feedback**: Check *both* PR-level comments (`github pr view --comments`) *and* inline review comments (`github api repos/{owner}/{repo}/pulls/{n}/comments`). Reply to each, summarizing what changed and why. Include the commit SHA.
- **Before merging**: Check for approval status AND inline review comments. Approval doesn't mean "no feedback" — sometimes there are nitpicks or suggestions worth addressing first.
- **Merging**: Always use squash merge (`--squash`).
- **Review timing**: Don't re-request review while still iterating in conversation. The PR should reflect aligned work, not a mid-discussion snapshot.
