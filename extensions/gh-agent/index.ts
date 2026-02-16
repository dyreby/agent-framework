/**
 * gh-agent extension
 *
 * Transparently intercepts `gh` commands in bash and runs them
 * with the configured agent identity. The LLM doesn't need to know
 * about this — it just uses `gh` normally.
 *
 * Setup:
 *   1. Add to ~/.pi/agent/settings.json:
 *      { "gh-agent": { "username": "your-github-agent-username" } }
 *   2. Run: GH_CONFIG_DIR=~/.pi/agent/gh-config/{username} gh auth login
 */

import { createBashTool } from "@mariozechner/pi-coding-agent";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readConfig, getSetupCommand } from "./config.ts";
import { executeGhCommand, type GhCommandContext } from "./gh-command.ts";

export default function (pi: ExtensionAPI) {
  const ghCtx: GhCommandContext = {
    pi,
    configDir: "",
    configError: null,
  };

  pi.on("session_start", async (_event, ctx) => {
    const config = readConfig();

    if (!config.ok) {
      ghCtx.configError = config.error;
      ctx.ui.notify(`gh-agent: ${config.error}`, "error");
      return;
    }

    ghCtx.configDir = config.configDir;

    // Verify auth is configured in isolated config dir
    const result = await pi.exec("env", [`GH_CONFIG_DIR=${config.configDir}`, "gh", "auth", "status"]);

    if (result.code !== 0) {
      ghCtx.configError = `Auth not configured. Run: ${getSetupCommand(config.username)}`;
      ctx.ui.notify(`gh-agent: ${ghCtx.configError}`, "error");
      return;
    }

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
