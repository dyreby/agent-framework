/**
 * Workspace tool for context-switching between repos.
 *
 * Opens a new tmux window in the target repo directory with status bar context,
 * then starts pi with injected context for seamless handoff.
 * Use this to transition from discovery (cross-repo queries) to focused work.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

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
      "Use this to switch context from discovery to focused work on a repo. " +
      'Use "provider/model" format for the model parameter (e.g., "anthropic/claude-opus-4") ' +
      "to avoid ambiguity when the same model name exists across providers. " +
      "Valid models: anthropic/claude-sonnet-4-6, anthropic/claude-opus-4-6. " +
      "Model and thinking level must be agreed with the user before calling — " +
      "suggest if asked, but never assume. The user confirms.",
    parameters: Type.Object({
      repo: Type.String({
        description:
          'Repository in "owner/repo" format (e.g., "dyreby/collaboration-framework")',
      }),
      model: Type.String({
        description:
          'Model to use in "provider/model" format (e.g., "anthropic/claude-opus-4", "anthropic/claude-sonnet-4"). ' +
          "The provider prefix avoids ambiguity when the same model name exists across providers. " +
          "Must be explicitly provided by the user.",
      }),
      thinking: Type.String({
        description:
          'Thinking level: off, minimal, low, medium, high, xhigh. Must be explicitly provided by the user.',
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
      orient: Type.Optional(
        Type.Boolean({
          description:
            "If true, require the agent to orient and check in before starting work. " +
            "Use for open-ended or under-specified tasks where alignment on interpretation matters before tools run.",
        })
      ),
    }),

    async execute(_toolCallId, params, _signal) {
      const { repo, model, thinking, context, prompt, orient } = params as {
        repo: string;
        model: string;
        thinking: string;
        context?: string;
        prompt?: string;
        orient?: boolean;
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

      // Open new tmux window, capturing its index for reliable pane targeting.
      // Window names containing '#' break tmux target syntax when used with
      // send-keys -t, so we target by index instead.
      const result = await pi.exec("tmux", [
        "new-window",
        "-P",
        "-F",
        "#{window_index}",
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

      // Target the new window by index to avoid '#' interpretation in names.
      const windowIndex = result.stdout.trim();
      const windowTarget = `:${windowIndex}`;

      // Build pi command with model and thinking args
      const escapedModel = model.replace(/'/g, "'\\''");
      const escapedThinking = thinking.replace(/'/g, "'\\''");
      const modelArgs = `--model '${escapedModel}' --thinking '${escapedThinking}'`;

      // Build env var prefix:
      // - PI_LOAD_ALL_CONCEPTS: signals collaboration extension to load all concepts
      // - PI_WORKSPACE_ORIENT: signals collaboration extension to require orient check-in
      const envVars = ["PI_LOAD_ALL_CONCEPTS=1"];
      if (orient) envVars.push("PI_WORKSPACE_ORIENT=1");
      const envPrefix = envVars.join(" ");

      // Start pi with context if prompt provided
      if (prompt) {
        // Write prompt to a temp file and pass it via @file syntax.
        // This avoids shell escaping issues and tmux length limits when
        // the prompt carries significant context.
        const promptDir = join(tmpdir(), "pi-workspace");
        await mkdir(promptDir, { recursive: true });
        const promptFile = join(promptDir, `${randomUUID()}.md`);
        await writeFile(promptFile, prompt, "utf8");

        const piCommand = `${envPrefix} pi ${modelArgs} @${promptFile}`;

        const piResult = await pi.exec("tmux", [
          "send-keys",
          "-t",
          windowTarget,
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
              text: `Opened workspace: ${windowName}\nPath: ${repoPath}\nStarted pi with ${model} (thinking: ${thinking}).\n\nSwitch to that tmux window to continue.`,
            },
          ],
        };
      }

      // No prompt — start pi with just model/thinking args
      const piCommandNoPrompt = `${envPrefix} pi ${modelArgs}`;

      const piResultNoPrompt = await pi.exec("tmux", [
        "send-keys",
        "-t",
        windowTarget,
        piCommandNoPrompt,
        "Enter",
      ]);

      if (piResultNoPrompt.code !== 0) {
        return {
          content: [
            {
              type: "text",
              text: `Opened workspace but failed to start pi: ${piResultNoPrompt.stderr}\nWindow: ${windowName}\nPath: ${repoPath}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Opened workspace: ${windowName}\nPath: ${repoPath}\nStarted pi with ${model} (thinking: ${thinking}).\n\nSwitch to that tmux window to continue.`,
          },
        ],
      };
    },
  });
}
