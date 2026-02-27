/**
 * GitHub tool for executing gh CLI commands with identity switching.
 *
 * Provides a dedicated `github` tool that wraps the gh CLI,
 * automatically setting the correct GH_CONFIG_DIR based on repo owner.
 *
 * Repo-scoped commands (pr, issue, release, etc.) must be run from within
 * the target repository directory. Global commands (search, notifications)
 * work from anywhere. Identity is always determined by cwd.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Type } from "@sinclair/typebox";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import type {
  ExtensionAPI,
  ExtensionContext,
  ToolDefinition,
} from "@mariozechner/pi-coding-agent";
import {
  Container,
  Key,
  matchesKey,
  Text,
  wrapTextWithAnsi,
} from "@mariozechner/pi-tui";
import { getAccountForRepo } from "./identity.ts";

export interface GhToolContext {
  pi: ExtensionAPI;
  getConfigDir: () => string;
  getAccount: () => string;
  /** Repo owner from cwd detection */
  getRepoOwner: () => string | null;
  authError: string | null;
}

export interface GhToolResult {
  content: Array<{ type: "text"; text: string }>;
  details?: { exitCode: number; account?: string };
  isError?: boolean;
}

/** Lock to prevent concurrent confirmation modals */
let confirmationInProgress = false;

/** Commands that don't modify state - skip confirmation */
const READ_ONLY_PATTERNS = [
  /^(pr|issue|release|repo)\s+(list|view|status|diff|checks|ready)/,
  /^auth\s+status/,
  /^api\s+.*--method\s+GET/,
  /^api\s+(?!.*--method)/, // api without --method defaults to GET
  /^search\s+/,
  /^browse\s+/,
];

function isReadOnly(command: string): boolean {
  return READ_ONLY_PATTERNS.some((pattern) => pattern.test(command.trim()));
}

/**
 * Global commands that work from any directory (not repo-scoped).
 * These are cross-repo queries, user-level operations, etc.
 */
const GLOBAL_COMMAND_PATTERNS = [
  /^search\s+/,                    // Cross-repo search
  /^api\s+\/user/,                 // User-level API calls
  /^api\s+\/notifications/,        // Notifications
  /^auth\s+/,                      // Auth management
  /^config\s+/,                    // Config management
  /^status\b/,                     // Cross-repo status
];

function isGlobalCommand(command: string): boolean {
  return GLOBAL_COMMAND_PATTERNS.some((pattern) => pattern.test(command.trim()));
}

// ─────────────────────────────────────────────────────────────────────────────
// Command parsing
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedCommand {
  type: string;
  action: string;
  sections: Array<{ label: string; value: string; multiline?: boolean }>;
}

/**
 * Extract a flag value from command args.
 * Handles: --flag value, --flag "value with spaces", --flag 'value'
 */
function extractFlag(command: string, flag: string): string | undefined {
  // Find --flag position
  const flagPattern = new RegExp(`--${flag}\\s+`);
  const flagMatch = command.match(flagPattern);
  if (!flagMatch || flagMatch.index === undefined) return undefined;

  const valueStart = flagMatch.index + flagMatch[0].length;
  const rest = command.slice(valueStart);

  // Check if value is quoted
  const quoteChar = rest[0];
  if (quoteChar === '"' || quoteChar === "'") {
    // Find matching closing quote (not preceded by backslash)
    let i = 1;
    while (i < rest.length) {
      if (rest[i] === quoteChar && rest[i - 1] !== "\\") {
        return rest.slice(1, i).replace(/\\(.)/g, "$1"); // unescape
      }
      i++;
    }
    // No closing quote found, take everything
    return rest.slice(1);
  }

  // Unquoted: take until whitespace or next flag
  const unquotedMatch = rest.match(/^([^\s]+)/);
  return unquotedMatch ? unquotedMatch[1] : undefined;
}

/**
 * Check if a flag is present (boolean flag).
 */
function hasFlag(command: string, flag: string): boolean {
  return new RegExp(`--${flag}(?:\\s|$)`).test(command);
}

/**
 * Remove a value-taking flag and its argument from a command string.
 * Handles double-quoted, single-quoted, and unquoted values.
 */
function removeFlagWithValue(command: string, flag: string): string {
  const pattern = new RegExp(
    `\\s*--${flag}\\s+(?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\\S+)`
  );
  return command.replace(pattern, "");
}

/**
 * Rewrite --body <value> to --body-file <tmpfile> to avoid shell escaping
 * issues with special characters, quotes, and JSON in body content.
 *
 * Returns the (possibly rewritten) command and a cleanup function to remove
 * the tmp file when done.
 */
async function rewriteBodyToFile(
  command: string
): Promise<{ command: string; cleanup: () => Promise<void> }> {
  const body = extractFlag(command, "body");
  if (body === undefined) {
    return { command, cleanup: async () => {} };
  }

  const dir = await mkdtemp(join(tmpdir(), "pi-gh-"));
  const tmpFile = join(dir, "body.txt");
  await writeFile(tmpFile, body, "utf8");

  const rewritten = removeFlagWithValue(command, "body") + ` --body-file "${tmpFile}"`;

  return {
    command: rewritten,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
}

/**
 * Extract positional argument (e.g., PR/issue number).
 */
function extractPositional(command: string, afterAction: string): string | undefined {
  const pattern = new RegExp(`${afterAction}\\s+(\\d+|[^-\\s]\\S*)`);
  const match = command.match(pattern);
  return match ? match[1] : undefined;
}

/**
 * Parse a gh command into structured sections for display.
 */
function parseCommand(command: string): ParsedCommand {
  const trimmed = command.trim();
  const parts = trimmed.split(/\s+/);
  const type = parts[0] || "unknown";
  const action = parts[1] || "unknown";

  const sections: ParsedCommand["sections"] = [];

  // PR commands
  if (type === "pr") {
    if (action === "create") {
      const title = extractFlag(command, "title");
      const body = extractFlag(command, "body");
      const base = extractFlag(command, "base");
      const draft = hasFlag(command, "draft");

      if (title) sections.push({ label: "Title", value: title });
      if (body) sections.push({ label: "Body", value: body, multiline: true });
      if (base) sections.push({ label: "Base branch", value: base });
      if (draft) sections.push({ label: "Draft", value: "Yes" });

      return { type: "Pull Request", action: "Create", sections };
    }

    if (action === "merge") {
      const prNum = extractPositional(command, "merge");
      const squash = hasFlag(command, "squash");
      const rebase = hasFlag(command, "rebase");
      const method = squash ? "Squash" : rebase ? "Rebase" : "Merge commit";

      if (prNum) sections.push({ label: "PR", value: `#${prNum}` });
      sections.push({ label: "Method", value: method });

      return { type: "Pull Request", action: "Merge", sections };
    }

    if (action === "close") {
      const prNum = extractPositional(command, "close");
      if (prNum) sections.push({ label: "PR", value: `#${prNum}` });
      return { type: "Pull Request", action: "Close", sections };
    }

    if (action === "comment") {
      const prNum = extractPositional(command, "comment");
      const body = extractFlag(command, "body");

      if (prNum) sections.push({ label: "PR", value: `#${prNum}` });
      if (body) sections.push({ label: "Comment", value: body, multiline: true });

      return { type: "Pull Request", action: "Comment", sections };
    }

    if (action === "review") {
      const prNum = extractPositional(command, "review");
      const body = extractFlag(command, "body");
      const approve = hasFlag(command, "approve");
      const requestChanges = hasFlag(command, "request-changes");
      const comment = hasFlag(command, "comment");

      const reviewType = approve
        ? "Approve"
        : requestChanges
          ? "Request changes"
          : comment
            ? "Comment"
            : "Review";

      if (prNum) sections.push({ label: "PR", value: `#${prNum}` });
      sections.push({ label: "Type", value: reviewType });
      if (body) sections.push({ label: "Comment", value: body, multiline: true });

      return { type: "Pull Request", action: "Review", sections };
    }

    if (action === "edit") {
      const prNum = extractPositional(command, "edit");
      const title = extractFlag(command, "title");
      const body = extractFlag(command, "body");

      if (prNum) sections.push({ label: "PR", value: `#${prNum}` });
      if (title) sections.push({ label: "New title", value: title });
      if (body) sections.push({ label: "New body", value: body, multiline: true });

      return { type: "Pull Request", action: "Edit", sections };
    }
  }

  // Issue commands
  if (type === "issue") {
    if (action === "create") {
      const title = extractFlag(command, "title");
      const body = extractFlag(command, "body");
      const labels = extractFlag(command, "label");

      if (title) sections.push({ label: "Title", value: title });
      if (body) sections.push({ label: "Body", value: body, multiline: true });
      if (labels) sections.push({ label: "Labels", value: labels });

      return { type: "Issue", action: "Create", sections };
    }

    if (action === "close") {
      const issueNum = extractPositional(command, "close");
      const reason = extractFlag(command, "reason");

      if (issueNum) sections.push({ label: "Issue", value: `#${issueNum}` });
      if (reason) sections.push({ label: "Reason", value: reason });

      return { type: "Issue", action: "Close", sections };
    }

    if (action === "comment") {
      const issueNum = extractPositional(command, "comment");
      const body = extractFlag(command, "body");

      if (issueNum) sections.push({ label: "Issue", value: `#${issueNum}` });
      if (body) sections.push({ label: "Comment", value: body, multiline: true });

      return { type: "Issue", action: "Comment", sections };
    }

    if (action === "edit") {
      const issueNum = extractPositional(command, "edit");
      const title = extractFlag(command, "title");
      const body = extractFlag(command, "body");

      if (issueNum) sections.push({ label: "Issue", value: `#${issueNum}` });
      if (title) sections.push({ label: "New title", value: title });
      if (body) sections.push({ label: "New body", value: body, multiline: true });

      return { type: "Issue", action: "Edit", sections };
    }
  }

  // Release commands
  if (type === "release") {
    if (action === "create") {
      const tag = extractPositional(command, "create");
      const title = extractFlag(command, "title");
      const notes = extractFlag(command, "notes");
      const draft = hasFlag(command, "draft");
      const prerelease = hasFlag(command, "prerelease");

      if (tag) sections.push({ label: "Tag", value: tag });
      if (title) sections.push({ label: "Title", value: title });
      if (notes) sections.push({ label: "Notes", value: notes, multiline: true });
      if (draft) sections.push({ label: "Draft", value: "Yes" });
      if (prerelease) sections.push({ label: "Prerelease", value: "Yes" });

      return { type: "Release", action: "Create", sections };
    }
  }

  // Fallback: show raw command
  sections.push({ label: "Command", value: `gh ${command}`, multiline: true });
  return { type: "GitHub", action: "Command", sections };
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation modal
// ─────────────────────────────────────────────────────────────────────────────

/** Max height for the modal content area (excluding header/footer) */
const MAX_CONTENT_HEIGHT = 20;

/**
 * Build content lines from parsed sections.
 */
function buildContentLines(
  sections: ParsedCommand["sections"],
  innerWidth: number,
  theme: { fg: (color: string, text: string) => string }
): string[] {
  const lines: string[] = [];

  for (const section of sections) {
    const label = theme.fg("muted", `${section.label}:`);

    if (section.multiline) {
      lines.push(" " + label);
      const wrapped = wrapTextWithAnsi(section.value, innerWidth);
      for (const line of wrapped) {
        lines.push(" " + theme.fg("text", line));
      }
      lines.push("");
    } else {
      lines.push(" " + label + " " + theme.fg("text", section.value));
    }
  }

  return lines;
}

/**
 * Show confirmation modal for a gh command.
 * Returns true if user confirms, false if they want to discuss.
 */
async function showConfirmModal(
  command: string,
  account: string,
  ctx: ExtensionContext
): Promise<boolean> {
  const parsed = parseCommand(command);

  return ctx.ui.custom<boolean>(
    (tui, theme, _kb, done) => {
      let scrollOffset = 0;
      let contentLines: string[] = [];
      let lastWidth = 0;

      return {
        render(width: number): string[] {
          const lines: string[] = [];
          const innerWidth = width - 2;

          // Rebuild content if width changed
          if (width !== lastWidth) {
            contentLines = buildContentLines(parsed.sections, innerWidth, theme);
            lastWidth = width;
            // Reset scroll if content shrunk
            const maxScroll = Math.max(0, contentLines.length - MAX_CONTENT_HEIGHT);
            scrollOffset = Math.min(scrollOffset, maxScroll);
          }

          const needsScroll = contentLines.length > MAX_CONTENT_HEIGHT;
          const maxScroll = Math.max(0, contentLines.length - MAX_CONTENT_HEIGHT);

          // Top border (heavy line for visibility)
          lines.push(theme.fg("accent", "━".repeat(width)));
          lines.push(""); // breathing room

          // Header: "Create Pull Request as john-agent"
          const header = theme.bold(`${parsed.action} ${parsed.type} as ${account}`);
          lines.push(" " + theme.fg("accent", header));
          lines.push("");
          lines.push(""); // extra space before content

          // Scroll indicator (top)
          if (needsScroll && scrollOffset > 0) {
            lines.push(" " + theme.fg("dim", `↑ ${scrollOffset} more lines above`));
          }

          // Visible content
          const visibleLines = contentLines.slice(
            scrollOffset,
            scrollOffset + MAX_CONTENT_HEIGHT
          );
          lines.push(...visibleLines);

          // Scroll indicator (bottom)
          const linesBelow = contentLines.length - scrollOffset - MAX_CONTENT_HEIGHT;
          if (needsScroll && linesBelow > 0) {
            lines.push(" " + theme.fg("dim", `↓ ${linesBelow} more lines below`));
          }

          // Footer
          lines.push("");
          lines.push(""); // extra space before footer
          let footer =
            theme.fg("success", "[Enter]") +
            theme.fg("text", " Looks good  ") +
            theme.fg("warning", "[Esc]") +
            theme.fg("text", " I have questions");
          if (needsScroll) {
            footer += "  " + theme.fg("dim", "[↑↓] Scroll");
          }
          lines.push(" " + footer);
          lines.push(""); // breathing room

          // Bottom border (heavy line for visibility)
          lines.push(theme.fg("accent", "━".repeat(width)));

          return lines;
        },

        invalidate() {
          lastWidth = 0; // Force rebuild on next render
        },

        handleInput(data: string) {
          if (matchesKey(data, Key.enter)) {
            done(true);
          } else if (matchesKey(data, Key.escape)) {
            done(false);
          } else if (matchesKey(data, Key.up)) {
            if (scrollOffset > 0) {
              scrollOffset--;
              tui.requestRender();
            }
          } else if (matchesKey(data, Key.down)) {
            const maxScroll = Math.max(0, contentLines.length - MAX_CONTENT_HEIGHT);
            if (scrollOffset < maxScroll) {
              scrollOffset++;
              tui.requestRender();
            }
          }
        },
      };
    },
    {
      overlay: true,
      overlayOptions: {
        width: "80%",
        minWidth: 60,
        anchor: "center",
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool definition
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create the github tool definition.
 */
export function createGithubTool(ctx: GhToolContext): ToolDefinition {
  return {
    name: "github",
    label: "GitHub",
    description:
      "Execute GitHub CLI (gh) commands. Use this instead of bash for all gh commands. " +
      "Repo-scoped commands (pr, issue, release) require cwd to be in the target repo. " +
      "Global commands (search, status, notifications) work from anywhere. " +
      "Identity is determined by cwd.",
    parameters: Type.Object({
      command: Type.String({
        description:
          "The gh command to run (without the 'gh' prefix). Examples: 'pr create --title \"Fix bug\"', 'issue list', 'pr view 123'",
      }),
    }),

    async execute(
      _toolCallId,
      params,
      signal,
      _onUpdate,
      extCtx
    ): Promise<GhToolResult> {
      const { command } = params as { command: string };
      const { pi, getConfigDir, getAccount, getRepoOwner, authError } = ctx;

      if (authError) {
        return {
          content: [{ type: "text", text: `github: ${authError}` }],
          isError: true,
        };
      }

      const repoFlag = extractFlag(command, "repo");
      const isGlobal = isGlobalCommand(command);

      // Repo-scoped commands: disallow --repo flag, require cwd to be in a GitHub repo
      if (!isGlobal) {
        if (repoFlag) {
          return {
            content: [
              {
                type: "text",
                text: `The --repo flag is not supported. Repo-scoped commands must be run from within the repository directory. Use the workspace tool to open a session in the correct repo, or cd there first.`,
              },
            ],
            isError: true,
          };
        }

        const repoOwner = getRepoOwner();
        if (!repoOwner) {
          return {
            content: [
              {
                type: "text",
                text: `Not in a GitHub repository. Repo-scoped commands (pr, issue, release, etc.) must be run from within a GitHub repo directory. Use the workspace tool to open a session in the correct repo, or cd there first.`,
              },
            ],
            isError: true,
          };
        }
      }

      // Identity always from cwd (for global commands, use default account)
      const account = getAccount();
      const configDir = getConfigDir();

      // Confirm before running commands that modify state
      if (!isReadOnly(command)) {
        // Prevent concurrent confirmation modals - must wait for user feedback
        if (confirmationInProgress) {
          return {
            content: [
              {
                type: "text",
                text: "A GitHub confirmation is already awaiting user feedback. Wait for the user to respond before calling this tool again.",
              },
            ],
            isError: true,
          };
        }

        confirmationInProgress = true;
        let confirmed: boolean;
        try {
          confirmed = await showConfirmModal(
            command,
            account,
            extCtx as ExtensionContext
          );
        } finally {
          confirmationInProgress = false;
        }

        if (!confirmed) {
          return {
            content: [
              {
                type: "text",
                text: "User pressed escape — action cancelled. They want to discuss before proceeding. Ask what's on their mind. Do not attempt this action through other means (e.g., bash).",
              },
            ],
            details: { exitCode: -1, account },
            isError: true,
          };
        }
      }

      // Rewrite --body to --body-file to avoid shell escaping issues
      const { command: safeCommand, cleanup } = await rewriteBodyToFile(command);

      // Execute with the appropriate GH_CONFIG_DIR
      const fullCommand = `GH_CONFIG_DIR="${configDir}" gh ${safeCommand}`;

      let result: Awaited<ReturnType<typeof pi.exec>>;
      try {
        result = await pi.exec("bash", ["-c", fullCommand], { signal });
      } finally {
        await cleanup();
      }

      const output = [result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();

      const header = `[${account}]`;
      const body = output || "(no output)";

      return {
        content: [{ type: "text", text: `${header} ${body}` }],
        details: { exitCode: result.code, account },
        isError: result.code !== 0,
      };
    },
  };
}
