/**
 * Workspace tool for context-switching between repos.
 *
 * Opens a new tmux window in the target repo directory with status bar context,
 * then starts pi with injected context for seamless handoff.
 * Use this to transition from discovery (cross-repo queries) to focused work.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";

/** Base path for repo checkouts */
const REPOS_BASE = join(homedir(), "repos");

/**
 * Find a repo's local path.
 * Looks in ~/repos/{owner}/{repo}
 */
function findRepoPath(owner: string, repo: string): string | null {
  const path = join(REPOS_BASE, owner, repo);
  return existsSync(path) ? path : null;
}

/**
 * Build tmux window name from repo and optional context.
 */
function buildWindowName(owner: string, repo: string, context?: string): string {
  const base = `${owner}/${repo}`;
  return context ? `${base} ${context}` : base;
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "workspace",
    label: "Workspace",
    description:
      "Open a new tmux window for working on a specific repo. " +
      "Use this to switch context from discovery to focused work on a repo.",
    parameters: Type.Object({
      repo: Type.String({
        description:
          'Repository in "owner/repo" format (e.g., "dyreby/collaboration-framework")',
      }),
      context: Type.Optional(
        Type.String({
          description:
            'Optional context to show in window name (e.g., "#165" for a PR, "fix-bug" for a branch)',
        })
      ),
      prompt: Type.Optional(
        Type.String({
          description:
            "Optional prompt to start pi with in the new window. Use this to inject context about what to work on.",
        })
      ),
    }),

    async execute(_toolCallId, params, _signal) {
      const { repo, context, prompt } = params as {
        repo: string;
        context?: string;
        prompt?: string;
      };

      // Parse owner/repo
      const parts = repo.split("/");
      if (parts.length !== 2) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid repo format: "${repo}". Expected "owner/repo".`,
            },
          ],
          isError: true,
        };
      }
      const [owner, repoName] = parts;

      // Find local path
      const repoPath = findRepoPath(owner, repoName);
      if (!repoPath) {
        return {
          content: [
            {
              type: "text",
              text: `Repo not found locally: ${repo}\nExpected at: ${join(REPOS_BASE, owner, repoName)}\n\nClone it first, or check the path.`,
            },
          ],
          isError: true,
        };
      }

      // Check if we're in tmux
      if (!process.env.TMUX) {
        return {
          content: [
            {
              type: "text",
              text: `Not running in tmux. The workspace tool requires tmux to open new windows.`,
            },
          ],
          isError: true,
        };
      }

      // Build window name
      const windowName = buildWindowName(owner, repoName, context);

      // Open new tmux window
      const result = await pi.exec("tmux", [
        "new-window",
        "-n",
        windowName,
        "-c",
        repoPath,
      ]);

      if (result.code !== 0) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to open tmux window: ${result.stderr}`,
            },
          ],
          isError: true,
        };
      }

      // Start pi with context if prompt provided
      if (prompt) {
        // Escape single quotes in the prompt for shell
        const escapedPrompt = prompt.replace(/'/g, "'\\''");
        const piCommand = `pi --prompt '${escapedPrompt}'`;

        const piResult = await pi.exec("tmux", [
          "send-keys",
          "-t",
          windowName,
          piCommand,
          "Enter",
        ]);

        if (piResult.code !== 0) {
          return {
            content: [
              {
                type: "text",
                text: `Opened workspace but failed to start pi: ${piResult.stderr}\nWindow: ${windowName}\nPath: ${repoPath}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Opened workspace: ${windowName}\nPath: ${repoPath}\nStarted pi with context.\n\nSwitch to that tmux window to continue.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Opened workspace: ${windowName}\nPath: ${repoPath}\n\nSwitch to that tmux window to continue work there.`,
          },
        ],
      };
    },
  });
}
