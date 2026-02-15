/**
 * GitHub command execution with agent identity.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isAllowed } from "./allow-list.ts";

export interface GhCommandContext {
  pi: ExtensionAPI;
  agentToken: string | null;
  configError: string | null;
}

export interface CommandResult {
  content: Array<{ type: "text"; text: string }>;
  details?: { exitCode: number };
  isError?: boolean;
}

/**
 * Execute a gh command with agent identity.
 */
export async function executeGhCommand(
  command: string,
  ctx: GhCommandContext,
  signal?: AbortSignal
): Promise<CommandResult> {
  const { pi, agentToken, configError } = ctx;

  if (configError) {
    return {
      content: [{ type: "text", text: `gh-agent configuration error: ${configError}` }],
      isError: true,
    };
  }

  if (!agentToken) {
    return {
      content: [{ type: "text", text: "gh-agent: Token not available. Check configuration." }],
      isError: true,
    };
  }

  const validation = isAllowed(command);
  if (!validation.allowed) {
    return {
      content: [{ type: "text", text: `gh-agent: ${validation.reason}` }],
      isError: true,
    };
  }

  const result = await pi.exec("bash", ["-c", command], {
    signal,
    env: { ...process.env, GH_TOKEN: agentToken },
  });

  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .trim();

  return {
    content: [{ type: "text", text: output || "(no output)" }],
    details: { exitCode: result.code },
    isError: result.code !== 0,
  };
}
