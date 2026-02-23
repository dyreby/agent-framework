# github-preferences

Preferences for GitHub operations in dyreby/* repos:

- **Repo flag**: Always use `--repo owner/repo` explicitly. Don't rely on cwd detection.
- **Branching**: Never commit directly to main. Always create a branch and PR for changes—even small fixes.
- **PR creation**: When creating a PR as john-agent, request dyreby's review.
- **PR updates**: After pushing changes that address review feedback, re-request review.
- **PR comments**: When addressing review feedback, leave a comment summarizing what changed and why.
- **Before merging**: Check for approval status AND inline review comments. Approval doesn't mean "no feedback" — sometimes there are nitpicks or suggestions worth addressing first.
- **Merging**: Always use squash merge (`--squash`).
