/**
 * Collaboration framework extension.
 *
 * - /concept: Toggle concepts on/off via fuzzy picker
 * - /review-pr: Review a pull request with OODA framing
 * - Injects preamble + active concepts into system prompt
 * - Shows active concepts in status bar
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  getConfigDir,
  getAccountForRepo,
  parseRepoOwner,
} from "./github/identity.ts";

// Find concepts directory relative to this extension
const extensionDir = dirname(import.meta.url.replace("file://", ""));
const repoRoot = join(extensionDir, "..");
const conceptsDir = join(repoRoot, "concepts");

const PREAMBLE = `<collaboration-framework>
[[cf:name]] is a provenance marker — it references a shared concept (concepts/name.md).
Concept names are semantically meaningful. The file contains specifics for alignment conversations.
</collaboration-framework>

Your interpretation of intent is probably wrong. Words are lossy compression—infer what was meant, hold it loosely, verify when stakes are non-trivial.

Apply [[cf:best-practices]].`;

export default function (pi: ExtensionAPI) {
  const activeConcepts = new Set<string>();

  function getAvailableConcepts(): string[] {
    try {
      return readdirSync(conceptsDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));
    } catch {
      return [];
    }
  }

  function updateStatus(ctx: { ui: { setStatus: (id: string, text: string | undefined) => void; theme: { fg: (color: string, text: string) => string } } }) {
    if (activeConcepts.size === 0) {
      ctx.ui.setStatus("concepts", undefined);
    } else {
      const names = [...activeConcepts].sort().join(", ");
      ctx.ui.setStatus("concepts", ctx.ui.theme.fg("success", `concepts: ${names}`));
    }
  }

  // /concept command - toggle concepts on/off
  pi.registerCommand("concept", {
    description: "Toggle concepts on/off",
    handler: async (_args, ctx) => {
      const available = getAvailableConcepts();
      if (available.length === 0) {
        ctx.ui.notify("No concepts found in concepts/", "error");
        return;
      }

      // Build options with active state indicator
      const options = available.map((name) => {
        const active = activeConcepts.has(name);
        return `${active ? "● " : "○ "}${name}`;
      });

      const selected = await ctx.ui.select("Toggle concept:", options);
      if (!selected) return;

      // Extract name (remove indicator prefix)
      const name = selected.slice(2);

      if (activeConcepts.has(name)) {
        activeConcepts.delete(name);
        ctx.ui.notify(`Deactivated: ${name}`, "info");
      } else {
        activeConcepts.add(name);
        ctx.ui.notify(`Activated: ${name}`, "info");
      }

      updateStatus(ctx);
    },
  });

  // /review-pr command - review a pull request
  pi.registerCommand("review-pr", {
    description: "Review a pull request with OODA framing",
    handler: async (args, ctx) => {
      const prNumber = args?.trim();
      if (!prNumber || !/^\d+$/.test(prNumber)) {
        pi.sendUserMessage(
          "Error: `/review-pr` requires a PR number. Usage: `/review-pr 24`"
        );
        return;
      }

      // Detect repo owner for identity switching
      const repoOwnerResult = await pi.exec("git", [
        "remote",
        "get-url",
        "origin",
      ]);
      const repoOwner =
        repoOwnerResult.code === 0
          ? parseRepoOwner(repoOwnerResult.stdout.trim())
          : null;
      const configDir = getConfigDir(getAccountForRepo(repoOwner));

      // Helper to run gh commands with identity
      async function gh(
        command: string
      ): Promise<{ ok: true; stdout: string } | { ok: false; error: string }> {
        const result = await pi.exec("bash", [
          "-c",
          `GH_CONFIG_DIR="${configDir}" gh ${command}`,
        ]);
        if (result.code !== 0) {
          const error = result.stderr.trim() || result.stdout.trim() || "Unknown error";
          return { ok: false, error };
        }
        return { ok: true, stdout: result.stdout };
      }

      // Fetch PR metadata
      const metadataResult = await gh(
        `pr view ${prNumber} --json title,body,state,author,closingIssuesReferences`
      );
      if (!metadataResult.ok) {
        pi.sendUserMessage(
          `Error fetching PR #${prNumber}: ${metadataResult.error}`
        );
        return;
      }

      let metadata: {
        title: string;
        body: string;
        state: string;
        author: { login: string };
        closingIssuesReferences: Array<{ number: number }>;
      };
      try {
        metadata = JSON.parse(metadataResult.stdout);
      } catch {
        pi.sendUserMessage(
          `Error parsing PR metadata: invalid JSON response`
        );
        return;
      }

      // Fetch file change stats
      const filesResult = await gh(`pr view ${prNumber} --json files`);
      if (!filesResult.ok) {
        pi.sendUserMessage(
          `Error fetching PR file stats: ${filesResult.error}`
        );
        return;
      }
      let diffStat: string;
      try {
        const filesData = JSON.parse(filesResult.stdout) as {
          files: Array<{ path: string; additions: number; deletions: number }>;
        };
        const lines = filesData.files.map((f) => {
          const changes = f.additions + f.deletions;
          const plus = "+".repeat(Math.min(f.additions, 20));
          const minus = "-".repeat(Math.min(f.deletions, 20));
          return `${f.path.padEnd(50)} | ${String(changes).padStart(4)} ${plus}${minus}`;
        });
        const totalAdd = filesData.files.reduce((s, f) => s + f.additions, 0);
        const totalDel = filesData.files.reduce((s, f) => s + f.deletions, 0);
        lines.push(
          `${filesData.files.length} files changed, ${totalAdd} insertions(+), ${totalDel} deletions(-)`
        );
        diffStat = lines.join("\n");
      } catch {
        diffStat = "(unable to parse file stats)";
      }

      // Fetch full diff (with truncation)
      const MAX_DIFF_BYTES = 50 * 1024; // 50KB
      const diffResult = await gh(`pr diff ${prNumber}`);
      if (!diffResult.ok) {
        pi.sendUserMessage(`Error fetching PR diff: ${diffResult.error}`);
        return;
      }

      let diff = diffResult.stdout;
      let diffTruncated = false;
      if (Buffer.byteLength(diff, "utf-8") > MAX_DIFF_BYTES) {
        // Truncate at byte boundary, then find last complete line
        const truncated = Buffer.from(diff, "utf-8")
          .subarray(0, MAX_DIFF_BYTES)
          .toString("utf-8");
        const lastNewline = truncated.lastIndexOf("\n");
        diff =
          lastNewline > 0 ? truncated.substring(0, lastNewline) : truncated;
        diffTruncated = true;
      }

      // Fetch linked issue titles
      const linkedIssues: Array<{ number: number; title: string; url: string }> = [];
      for (const issue of metadata.closingIssuesReferences) {
        const issueResult = await gh(
          `issue view ${issue.number} --json title,url`
        );
        if (issueResult.ok) {
          try {
            const issueData = JSON.parse(issueResult.stdout);
            linkedIssues.push({
              number: issue.number,
              title: issueData.title,
              url: issueData.url,
            });
          } catch {
            // Skip malformed issue data
          }
        }
        // Skip issues that fail to fetch (might be in different repo)
      }

      // Build the template
      const linkedIssuesSection =
        linkedIssues.length > 0
          ? linkedIssues
              .map((i) => `- #${i.number}: ${i.title} (${i.url})`)
              .join("\n")
          : "(none)";

      const diffSection = diffTruncated
        ? `${diff}\n\n[Diff truncated at 50KB. Use \`read <path>\` for specific files.]`
        : diff;

      const template = `## Task: Review PR #${prNumber}

### Context

**Title:** ${metadata.title}
**Author:** ${metadata.author.login}
**State:** ${metadata.state}

**Body:**
${metadata.body || "(no description)"}

**Linked Issues:**
${linkedIssuesSection}

**Files Changed:**
\`\`\`
${diffStat}
\`\`\`

**Diff:**
\`\`\`diff
${diffSection}
\`\`\`

### Tools That Help

- \`github "pr view ${prNumber}"\` — metadata, body, status
- \`github "issue view <number>"\` — full issue details if needed
- \`read <path>\` — examine specific files beyond the diff
- \`github "pr diff ${prNumber}"\` — re-fetch diff if needed

### Definition of Done

A good review follows this structure:

1. **Verdict**: First sentence states the outcome (Approve/Request Changes/Comment)
2. **My Understanding**: "My understanding of this PR is that it..." — capture the intent one level up from what changed. The author should see I understood before I critique.
3. **What I Like**: Something genuinely clever, thoughtful, or notable (omit for straightforward PRs)
4. **Questions**: Things I'm curious about or want clarified (omit if none)
5. **Nits**: Minor suggestions, take-or-leave (omit if none)

Always include My Understanding. Include What I Like only when something stands out—don't add fluff for "boring" (good) PRs that do what they say. Use \`###\` headers—provides structure to scan without fragmenting the flow.

### How This Goes (OODA)

**Orient (context alignment)**
Start here. Either propose what additional context you need (I'll confirm, challenge, or narrow), or state that you have enough and why. Make this step visible—it lets me inject context you wouldn't have (related discussions, background decisions) or confirm we're aligned by saying "ok."

**Decide (action alignment)**
When ready, call the \`github\` tool with your \`pr review\` command. A confirmation modal will show the review—press Enter to execute, or Escape to discuss. If you escape, I'll tell you what's on my mind, you revise, and we iterate until aligned.

Both loops can re-open if new information changes things.`;

      pi.sendUserMessage(template);
    },
  });

  // Inject preamble + active concepts into system prompt
  pi.on("before_agent_start", async (event, ctx) => {
    let injection = PREAMBLE;

    if (activeConcepts.size > 0) {
      const conceptContents: string[] = [];
      for (const name of activeConcepts) {
        try {
          const content = readFileSync(join(conceptsDir, `${name}.md`), "utf-8");
          conceptContents.push(`## ${name}\n\n${content}`);
        } catch (e) {
          ctx.ui.notify(`Failed to read concept: ${name}`, "error");
        }
      }

      if (conceptContents.length > 0) {
        injection += `\n\n# Active Concepts\n\n${conceptContents.join("\n\n---\n\n")}`;
      }
    }

    return {
      systemPrompt: event.systemPrompt + "\n\n" + injection,
    };
  });

  // Restore status on session start (concepts don't persist, but status should be clear)
  pi.on("session_start", async (_event, ctx) => {
    updateStatus(ctx);
  });
}
