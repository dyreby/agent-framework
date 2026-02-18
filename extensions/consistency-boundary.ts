/**
 * Consistency boundary guardrail.
 *
 * Checks if the user is at a clean consistency boundary before session transitions.
 *
 * Handles:
 * - /new: If concerns exist, surfaces them to the conversation. User and LLM
 *   iterate until aligned, then /new again to proceed.
 * - /bye: Same pattern for exiting pi.
 *
 * Happy path (clean state) is frictionless. Guardrails are collaborative.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

async function gatherState(pi: ExtensionAPI): Promise<{ gitStatus: string; openPRs: string; hasIssues: boolean }> {
  // Check git status
  const gitResult = await pi.exec("git", ["status", "--porcelain"]);
  const hasUncommitted = gitResult.code === 0 && gitResult.stdout.trim().length > 0;
  const gitStatus = hasUncommitted
    ? `Uncommitted changes:\n${gitResult.stdout.trim()}`
    : "";

  // Check open PRs (if gh is available)
  let openPRs = "";
  let hasOpenPRs = false;
  try {
    const prResult = await pi.exec("gh", ["pr", "list", "--author", "@me", "--state", "open", "--json", "number,title,reviewDecision,reviewRequests"]);
    if (prResult.code === 0 && prResult.stdout.trim()) {
      const prs = JSON.parse(prResult.stdout);
      if (prs.length > 0) {
        hasOpenPRs = true;
        const prLines = prs.map((pr: { number: number; title: string; reviewDecision: string; reviewRequests: unknown[] }) => {
          const status = pr.reviewDecision || (pr.reviewRequests?.length ? "REVIEW_REQUESTED" : "NO_REVIEW");
          return `- #${pr.number}: ${pr.title} (${status})`;
        });
        openPRs = `Open PRs:\n${prLines.join("\n")}`;
      }
    }
  } catch {
    // gh not available, that's fine
  }

  return { 
    gitStatus, 
    openPRs, 
    hasIssues: hasUncommitted || hasOpenPRs 
  };
}

function getConversationLength(ctx: { sessionManager: { getBranch: () => Array<{ type: string }> } }): number {
  const branch = ctx.sessionManager.getBranch();
  return branch.filter(entry => entry.type === "message").length;
}

export default function (pi: ExtensionAPI) {
  // Track if user has been warned about concerns this session
  let warnedAboutConcerns = false;

  // Reset warning state on session start
  pi.on("session_start", async () => {
    warnedAboutConcerns = false;
  });

  pi.on("session_before_switch", async (event, ctx) => {
    // Only intercept /new, not /resume
    if (event.reason !== "new") return;

    // Skip if no UI (non-interactive mode)
    if (!ctx.hasUI) return;

    // If we already warned them, let it through
    if (warnedAboutConcerns) {
      warnedAboutConcerns = false; // Reset for next time
      return;
    }

    // Gather state
    const state = await gatherState(pi);
    const conversationLength = getConversationLength(ctx);

    // Clean state and no significant conversation? Just do it.
    if (!state.hasIssues && conversationLength < 4) {
      return;
    }

    // There are concerns - surface them to the conversation
    const concerns: string[] = [];
    if (state.gitStatus) concerns.push(state.gitStatus);
    if (state.openPRs) concerns.push(state.openPRs);
    if (conversationLength >= 4) {
      concerns.push(`This session has ${conversationLength} messages — there may be context that would be lost.`);
    }

    // Mark that we've warned them
    warnedAboutConcerns = true;

    // Inject the concerns into the conversation
    const concernsText = concerns.join("\n\n");
    pi.sendMessage({
      customType: "consistency-boundary",
      content: `Before you start a new session, I want to make sure we're at a clean consistency boundary.\n\n${concernsText}\n\nLet me know if you want to address any of this first, or if you're good to proceed. Run /new again when you're ready.`,
      display: true,
    });

    ctx.ui.notify("Check the conversation for details.", "info");
    return { cancel: true };
  });

  // /bye command - boundary-checked exit
  pi.registerCommand("bye", {
    description: "Exit pi with consistency boundary check",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        ctx.shutdown();
        return;
      }

      // Gather state
      const state = await gatherState(pi);
      const conversationLength = getConversationLength(ctx);

      // Clean state and no significant conversation? Just exit.
      if (!state.hasIssues && conversationLength < 4) {
        ctx.shutdown();
        return;
      }

      // There are concerns - surface them
      const concerns: string[] = [];
      if (state.gitStatus) concerns.push(state.gitStatus);
      if (state.openPRs) concerns.push(state.openPRs);
      if (conversationLength >= 4) {
        concerns.push(`This session has ${conversationLength} messages — there may be context that would be lost.`);
      }

      const concernsText = concerns.join("\n\n");
      
      // For /bye, use a confirm dialog since we can't easily "try again"
      const proceed = await ctx.ui.confirm(
        "Before you go...",
        `${concernsText}\n\nExit anyway?`
      );

      if (proceed) {
        ctx.shutdown();
      } else {
        ctx.ui.notify("Staying in session.", "info");
      }
    },
  });
}
