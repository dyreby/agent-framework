/**
 * gh-agent extension
 *
 * Transparently intercepts `gh` commands in bash and runs them
 * with the configured agent identity. The LLM doesn't need to know
 * about this — it just uses `gh` normally.
 *
 * Setup:
 *   1. gh auth login (for both personal and agent accounts)
 *   2. Configure in ~/.pi/agent/settings.json:
 *      { "gh-agent": { "username": "your-github-agent-username" } }
 */

import { createBashTool } from "@mariozechner/pi-coding-agent";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readConfig } from "./config.ts";
import { executeGhCommand, type GhCommandContext } from "./gh-command.ts";

export default function (pi: ExtensionAPI) {
  const ghCtx: GhCommandContext = {
    pi,
    agentToken: null,
    configError: null,
  };

  pi.on("session_start", async (_event, ctx) => {
    const config = readConfig();

    if (!config.ok) {
      ghCtx.configError = config.error;
      ctx.ui.notify(`gh-agent: ${config.error}`, "error");
      return;
    }

    const result = await pi.exec("gh", ["auth", "token", "-u", config.username]);

    if (result.code !== 0) {
      ghCtx.configError = `Failed to get token for ${config.username}: ${result.stderr}. Run: gh auth login`;
      ctx.ui.notify(`gh-agent: ${ghCtx.configError}`, "error");
      return;
    }

    ghCtx.agentToken = result.stdout.trim();
    ctx.ui.setStatus(
      "gh-agent",
      ctx.ui.theme.fg("success", `gh: ${config.username}`)
    );
  });

  const baseBash = createBashTool(process.cwd(), {});

  pi.registerTool({
    ...baseBash,
    async execute(id, params, signal, onUpdate, ctx) {
      const { command } = params as { command: string };

      if (command.trim().startsWith("gh ")) {
        return executeGhCommand(command, ghCtx, signal);
      }

      return baseBash.execute(id, params, signal, onUpdate, ctx);
    },
  });
}
