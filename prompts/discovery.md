---
description: Cross-repo discovery - check what needs attention
---
Check what needs my attention across repos. Include:
- Notifications
- PRs where my review is requested
- PRs I authored that have new activity

**Workflow guidance:**
- Use the `github` tool for cross-repo queries (works from any directory)
- Summarize what needs attention, grouped by urgency/type
- When I pick something to work on, offer to open a workspace: `workspace({ repo: "owner/repo", context: "#123" })`
- Work continues in the new tmux window with repo-scoped commands
