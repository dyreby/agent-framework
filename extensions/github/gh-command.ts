/**
 * GitHub tool for executing gh CLI commands with identity switching.
 *
 * Provides a dedicated `github` tool that wraps the gh CLI,
 * automatically setting the correct GH_CONFIG_DIR based on repo owner.
 */

import { Type } from "@sinclair/typebox";
import type { ExtensionAPI, ToolDefinition } from "@mariozechner/pi-coding-agent";

export interface GhToolContext {
  pi: ExtensionAPI;
  getConfigDir: () => string;
  getAccount: () => string;
  authError: string | null;
}

export interface GhToolResult {
  content: Array<{ type: "text"; text: string }>;
  details?: { exitCode: number };
  isError?: boolean;
}

/**
 * Create the github tool definition.
 */
export function createGithubTool(ctx: GhToolContext): ToolDefinition {
  return {
    name: "github",
    label: "GitHub",
    description:
      "Execute GitHub CLI (gh) commands. Use this instead of bash for all gh commands. " +
      "Identity is handled automatically based on repo owner.",
    parameters: Type.Object({
      command: Type.String({
        description:
          "The gh command to run (without the 'gh' prefix). Examples: 'pr create --title \"Fix bug\"', 'issue list', 'pr view 123'",
      }),
    }),

    async execute(
      _toolCallId,
      params,
      signal
    ): Promise<GhToolResult> {
      const { command } = params as { command: string };
      const { pi, getConfigDir, getAccount, authError } = ctx;

      if (authError) {
        return {
          content: [{ type: "text", text: `github: ${authError}` }],
          isError: true,
        };
      }

      // Execute with the appropriate GH_CONFIG_DIR
      const configDir = getConfigDir();
      const fullCommand = `GH_CONFIG_DIR="${configDir}" gh ${command}`;

      const result = await pi.exec("bash", ["-c", fullCommand], { signal });

      const output = [result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();

      const account = getAccount();
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
