/**
 * Consistency boundary guardrail.
 *
 * Checks if the user is at a clean consistency boundary before session transitions.
 *
 * Handles:
 * - /new: Intercepts new session, checks boundary first
 * - /bye: Exit pi with boundary check (use instead of Ctrl+C for the guardrail)
 *
 * For each:
 * 1. Gathers concrete state (git status, open PRs, pending reviews)
 * 2. Asks the LLM to assess if we're at a clean boundary
 * 3. Presents the assessment and lets the user decide
 *
 * Could extend to /resume, /fork — any transition where
 * "are we at a clean stopping point?" matters.
 */

import { complete, type Message } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { BorderedLoader, serializeConversation, convertToLlm, type SessionEntry } from "@mariozechner/pi-coding-agent";

function getAssessmentPrompt(action: "new session" | "exit"): string {
  const actionDesc = action === "new session" 
    ? "start a new session" 
    : "exit pi";
  
  return `You are assessing whether it's a good time to ${actionDesc}.

The user wants to ${actionDesc}. Before proceeding, evaluate whether they're at a clean consistency boundary.

Consider:
- Uncommitted changes (provided below)
- Open PRs with pending reviews (provided below)
- Any implicit understanding you've built up during this conversation that would be lost

Based on the state provided, give a brief assessment:
- If it's clean: say "Clean boundary. Safe to proceed."
- If there are concerns: list them specifically and concisely (e.g., "You have uncommitted changes in X" or "PR #42 has unaddressed review comments")

Be direct. No preamble. Just the assessment.`;
}

async function gatherState(pi: ExtensionAPI): Promise<{ gitStatus: string; openPRs: string }> {
  // Check git status
  const gitResult = await pi.exec("git", ["status", "--porcelain"]);
  const gitStatus = gitResult.code === 0 && gitResult.stdout.trim()
    ? `Uncommitted changes:\n${gitResult.stdout.trim()}`
    : "No uncommitted changes.";

  // Check open PRs (if gh is available)
  let openPRs = "Unable to check PRs (gh not available or not in a repo).";
  try {
    const prResult = await pi.exec("gh", ["pr", "list", "--author", "@me", "--state", "open", "--json", "number,title,reviewDecision,reviewRequests"]);
    if (prResult.code === 0 && prResult.stdout.trim()) {
      const prs = JSON.parse(prResult.stdout);
      if (prs.length === 0) {
        openPRs = "No open PRs.";
      } else {
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

  return { gitStatus, openPRs };
}

async function getAssessment(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  state: { gitStatus: string; openPRs: string },
  conversationSummary: string,
  action: "new session" | "exit"
): Promise<string | null> {
  if (!ctx.model) {
    return "No model available for assessment.";
  }

  return ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
    const loader = new BorderedLoader(tui, theme, "Assessing session state...");
    loader.onAbort = () => done(null);

    const doAssess = async () => {
      const apiKey = await ctx.modelRegistry.getApiKey(ctx.model!);

      const userMessage: Message = {
        role: "user",
        content: [{
          type: "text",
          text: `## Current State

${state.gitStatus}

${state.openPRs}

## Conversation Summary (what might be lost)

${conversationSummary || "No significant conversation context."}

## Assessment Request

Is this a clean consistency boundary? If not, what are the specific concerns?`
        }],
        timestamp: Date.now(),
      };

      const response = await complete(
        ctx.model!,
        { systemPrompt: getAssessmentPrompt(action), messages: [userMessage] },
        { apiKey, signal: loader.signal }
      );

      if (response.stopReason === "aborted") {
        return null;
      }

      return response.content
        .filter((c): c is { type: "text"; text: string } => c.type === "text")
        .map((c) => c.text)
        .join("\n");
    };

    doAssess()
      .then(done)
      .catch((err) => {
        console.error("Assessment failed:", err);
        done(`Assessment failed: ${err.message}`);
      });

    return loader;
  });
}

function getConversationSummary(ctx: ExtensionContext): string {
  const branch = ctx.sessionManager.getBranch();
  const messages = branch
    .filter((entry): entry is SessionEntry & { type: "message" } => entry.type === "message")
    .map((entry) => entry.message);

  if (messages.length === 0) {
    return "";
  }

  // Get a rough sense of conversation length and topics
  const userMessages = messages.filter(m => m.role === "user");
  const assistantMessages = messages.filter(m => m.role === "assistant");

  return `${userMessages.length} user messages, ${assistantMessages.length} assistant responses in this session.`;
}

export default function (pi: ExtensionAPI) {
  pi.on("session_before_switch", async (event, ctx) => {
    // Only intercept /new, not /resume
    if (event.reason !== "new") return;

    // Skip if no UI (non-interactive mode)
    if (!ctx.hasUI) return;

    // Gather state
    const state = await gatherState(pi);
    const conversationSummary = getConversationSummary(ctx);

    // Quick check: if obviously clean, don't bother with LLM assessment
    const isObviouslyClean =
      state.gitStatus === "No uncommitted changes." &&
      (state.openPRs === "No open PRs." || state.openPRs.includes("Unable to check"));

    if (isObviouslyClean && conversationSummary === "") {
      // Nothing to assess, proceed
      return;
    }

    // Get LLM assessment
    const assessment = await getAssessment(pi, ctx, state, conversationSummary, "new session");

    if (assessment === null) {
      // User cancelled during assessment
      ctx.ui.notify("Cancelled", "info");
      return { cancel: true };
    }

    // Check if assessment indicates clean boundary
    const isClean = assessment.toLowerCase().includes("clean boundary") ||
                    assessment.toLowerCase().includes("safe to start fresh");

    if (isClean) {
      // Clean boundary, proceed without confirmation
      ctx.ui.notify("Clean boundary confirmed.", "info");
      return;
    }

    // Not clean - show assessment and ask for confirmation
    const proceed = await ctx.ui.confirm(
      "Session freshness check",
      `${assessment}\n\nStart fresh anyway?`
    );

    if (!proceed) {
      ctx.ui.notify("Staying in current session.", "info");
      return { cancel: true };
    }

    // User chose to proceed despite concerns
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
      const conversationSummary = getConversationSummary(ctx);

      // Quick check: if obviously clean, just exit
      const isObviouslyClean =
        state.gitStatus === "No uncommitted changes." &&
        (state.openPRs === "No open PRs." || state.openPRs.includes("Unable to check"));

      if (isObviouslyClean && conversationSummary === "") {
        ctx.shutdown();
        return;
      }

      // Get LLM assessment
      const assessment = await getAssessment(pi, ctx, state, conversationSummary, "exit");

      if (assessment === null) {
        ctx.ui.notify("Cancelled", "info");
        return;
      }

      // Check if assessment indicates clean boundary
      const isClean = assessment.toLowerCase().includes("clean boundary") ||
                      assessment.toLowerCase().includes("safe to proceed");

      if (isClean) {
        ctx.shutdown();
        return;
      }

      // Not clean - show assessment and ask for confirmation
      const proceed = await ctx.ui.confirm(
        "Before you go...",
        `${assessment}\n\nExit anyway?`
      );

      if (proceed) {
        ctx.shutdown();
      } else {
        ctx.ui.notify("Staying in session.", "info");
      }
    },
  });
}
