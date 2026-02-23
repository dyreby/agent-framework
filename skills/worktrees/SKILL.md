---
name: worktrees
description: Manage git worktrees. Use when switching branches or creating new PRs in a repo that's already on a feature branch or has open PRs.
---

# Git Worktree Management

Worktrees let you have multiple working directories from the same repo, each on a different branch.

## Create

```bash
# For a new branch (always branch from fresh main)
git fetch origin main
git worktree add ../{repo}-{identifier} -b {branch-name} origin/main

# For an existing branch
git worktree add ../{repo}-{identifier} {branch-name}
```

**Conventions:**
- Location: sibling directory (same parent as main repo)
- Directory name: `{repo-name}-issue-{N}` or `{repo-name}-{slug}`
- Branch name: `feature/issue-{N}`, `fix/issue-{N}`, or descriptive

## List

```bash
git worktree list
```

## Remove

```bash
git worktree remove ../{repo}-{identifier}
git worktree prune  # clean stale entries
```

## Workflow

1. User says "work on issue 42" or "set me up for feature X"
2. Create worktree in sibling directory
3. `cd` into the new worktree and continue working there
4. Show the path so user can open it in another window if needed

### After PR merges (or work abandoned)

5. Return to main repo directory
6. Remove the worktree: `git worktree remove ../{repo}-{identifier}`
7. Delete the branch if merged: `git branch -d {branch-name}`
8. Prune if needed: `git worktree prune`
