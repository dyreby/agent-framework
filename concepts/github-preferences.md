# github-preferences

Preferences for GitHub operations in dyreby/* repos:

- **Work from repo directory**: Repo-scoped commands (pr, issue, release) must be run from within the target repo. Use the workspace tool or cd to switch contexts.
- **Branching**: Never commit directly to main. Always create a branch and PR for changes—even small fixes.
- **PR creation**: When creating a PR as john-agent, request dyreby's review.
- **PR updates**: After pushing changes that address review feedback, re-request review.
- **Addressing feedback**: Check *both* PR-level comments (`github pr view --comments`) *and* inline review comments (`github api repos/{owner}/{repo}/pulls/{n}/comments`). Reply to each, summarizing what changed and why. Include the commit SHA.
- **Replying to inline comments**: Use `github api repos/{owner}/{repo}/pulls/{n}/comments --method POST -f body="..." -F in_reply_to={comment_id}` to reply in-thread. Don't use PR-level comments to respond to inline feedback.
- **Before merging**: Check for approval status AND inline review comments. Approval doesn't mean "no feedback" — sometimes there are nitpicks or suggestions worth addressing first.
- **Merging**: Always use squash merge (`--squash`).
- **Body formatting**: Never use `--body` inline for `pr create` or `issue create`. Inline strings don't render `\n` as newlines and the shell interprets backticks. Always write the body to a temp file and pass `--body-file` with a path from `mktemp`.
- **Review timing**: Don't re-request review while still iterating in conversation. The PR should reflect aligned work, not a mid-discussion snapshot.
