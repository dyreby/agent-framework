---
description: Review a pull request with OODA framing
---
## Task: Review PR #$1

### Gather Context

Use the `github` tool to fetch:
1. `github "pr view $1 --json title,body,state,author,closingIssuesReferences"` — metadata
2. `github "pr view $1 --json files"` — file change stats
3. `github "pr diff $1"` — the actual diff
4. For any linked issues: `github "issue view <number>"` — full issue details

### Definition of Done

A good review follows this structure:

1. **Verdict**: Lead with the outcome
2. **Understanding**: Show we get the point of this PR — the author should see we understood before we critique
3. **What we like**: Call out what works well
4. **Questions**: Things we're curious about or want clarified
5. **Nits**: Minor suggestions, take-or-leave

### How This Goes (OODA)

**Orient (context alignment)**
If you need more context beyond the gathered data, propose what you think you need. I'll confirm, challenge, or narrow. Iterate until aligned, then fetch.

**Decide (action alignment)**
When ready, call the `github` tool with your `pr review` command. A confirmation modal will show the review—press Enter to execute, or Escape to discuss. If you escape, I'll tell you what's on my mind, you revise, and we iterate until aligned.

Both loops can re-open if new information changes things.
