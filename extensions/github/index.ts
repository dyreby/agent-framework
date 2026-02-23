/**
 * github extension
 *
 * Identity switching for GitHub operations:
 * - `dyreby/*` repos → gh commands as `john-agent`
 * - All other repos → gh commands as `dyreby`
 *
 * Git identity (user.name, user.email) is handled by the user's global git config.
 * See GIT_IDENTITY in identity.ts for the expected values.
 *
 * No guardrails—trusted user.
 *
 * Setup:
 *   For each account, run:
 *     GH_CONFIG_DIR=~/.pi/agent/gh-config/<username> gh auth login
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
  ACCOUNTS,
  getConfigDir,
  getAuthCommand,
  getAccountForRepo,
  parseRepoOwner,
} from "./identity.ts";
import { createGithubTool, type GhToolContext } from "./gh-command.ts";

/** Communication style injected into system prompt */
const COMMUNICATION_STYLE = `Use "I" for your own perspective. Respond to context, not to people—let the content stand without referencing other parties.`;

/** Instruction to use the github tool for gh commands */
const GITHUB_TOOL_INSTRUCTION = `For GitHub CLI operations (gh commands), use the \`github\` tool instead of bash. The github tool handles identity switching automatically.

Apply [[cf:github-preferences]].`;

export default function (pi: ExtensionAPI) {
  let currentRepoOwner: string | null = null;

  const ghCtx: GhToolContext = {
    pi,
    getConfigDir: () => getConfigDir(getAccountForRepo(currentRepoOwner)),
    getAccount: () => getAccountForRepo(currentRepoOwner),
    authError: null,
  };

  /**
   * Detect repo owner from git remote.
   */
  async function detectRepoOwner(): Promise<string | null> {
    const result = await pi.exec("git", ["remote", "get-url", "origin"]);
    if (result.code !== 0) {
      return null;
    }
    return parseRepoOwner(result.stdout.trim());
  }

  /**
   * Check if an account is authenticated.
   * Uses bash -c for cross-platform compatibility.
   */
  async function checkAuth(account: string): Promise<boolean> {
    const configDir = getConfigDir(account);
    const result = await pi.exec("bash", [
      "-c",
      `GH_CONFIG_DIR="${configDir}" gh auth status`,
    ]);
    return result.code === 0;
  }

  pi.on("session_start", async (_event, ctx) => {
    // Detect repo owner
    currentRepoOwner = await detectRepoOwner();

    // Check both accounts are authenticated
    const [agentAuth, personalAuth] = await Promise.all([
      checkAuth(ACCOUNTS.agent),
      checkAuth(ACCOUNTS.personal),
    ]);

    const missing: string[] = [];
    if (!agentAuth) missing.push(getAuthCommand(ACCOUNTS.agent));
    if (!personalAuth) missing.push(getAuthCommand(ACCOUNTS.personal));

    if (missing.length > 0) {
      ghCtx.authError = `Auth required. Run:\n${missing.join("\n")}`;
      ctx.ui.notify(`github: ${ghCtx.authError}`, "warning");
    }
  });

  // Inject communication style and github tool instruction
  pi.on("before_agent_start", async (event, _ctx) => {
    return {
      systemPrompt:
        event.systemPrompt + `\n\n${COMMUNICATION_STYLE}\n\n${GITHUB_TOOL_INSTRUCTION}`,
    };
  });

  // Register the github tool
  pi.registerTool(createGithubTool(ghCtx));

  // Re-detect repo owner on directory changes (via tool_result for bash cd commands)
  pi.on("tool_result", async (event, _ctx) => {
    if (event.toolName === "bash") {
      const command = (event.input as { command?: string }).command ?? "";
      if (command.includes("cd ")) {
        currentRepoOwner = await detectRepoOwner();
      }
    }
  });
}
