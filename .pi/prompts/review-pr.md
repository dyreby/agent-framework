---
description: Review a pull request with OODA framing
---
## Task: Review PR #$1

Apply [[cf:writing-style]].

### Gather Context

Use the `github` tool to fetch:
1. `github "pr view $1 --json title,body,state,author,closingIssuesReferences"` — metadata
2. `github "pr view $1 --json files"` — file change stats
3. `github "pr diff $1"` — the actual diff
4. For any linked issues: `github "issue view <number>"` — full issue details

### Definition of Done

A good review follows this structure:

1. **Verdict**: First sentence states the outcome (Approve/Request Changes/Comment)
2. **My Understanding**: "My understanding of this PR is that it..." — capture the intent one level up from what changed. The author should see I understood before I critique.
3. **What I Like**: Something genuinely clever, thoughtful, or notable (omit for straightforward PRs)
4. **Questions**: Things I'm curious about or want clarified (omit if none)
5. **Nits**: Minor suggestions, take-or-leave (omit if none)

Always include My Understanding. Include What I Like only when something stands out—don't add fluff for "boring" (good) PRs that do what they say. Use `###` headers for structure.

### How This Goes (OODA)

**Orient (context alignment)**
Start here. Either propose what additional context you need (I'll confirm, challenge, or narrow), or state that you have enough and why. Make this step visible—it lets me inject context you wouldn't have (related discussions, background decisions) or confirm we're aligned by saying "ok."

**Decide (action alignment)**
When ready, call the `github` tool with your `pr review` command. A confirmation modal will show the review—press Enter to execute, or Escape to discuss. If you escape, I'll tell you what's on my mind, you revise, and we iterate until aligned.

Both loops can re-open if new information changes things.
