/**
 * gh-agent extension
 *
 * Transparently intercepts `gh` commands in bash and runs them
 * with the configured agent identity. The LLM doesn't need to know
 * about this — it just uses `gh` normally.
 *
 * Setup:
 *   GH_CONFIG_DIR=~/.pi/agent/gh-config gh auth login
 */

import { createBashTool } from "@mariozechner/pi-coding-agent";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { GH_CONFIG_DIR, SETUP_COMMAND } from "./config.ts";
import { executeGhCommand, type GhCommandContext } from "./gh-command.ts";

export default function (pi: ExtensionAPI) {
  const ghCtx: GhCommandContext = {
    pi,
    configDir: GH_CONFIG_DIR,
    configError: null,
  };

  pi.on("session_start", async (_event, ctx) => {
    // Verify auth is configured in isolated config dir
    const result = await pi.exec("env", [`GH_CONFIG_DIR=${GH_CONFIG_DIR}`, "gh", "auth", "status"]);

    if (result.code !== 0) {
      ghCtx.configError = `Agent auth not configured. Run: ${SETUP_COMMAND}`;
      ctx.ui.notify(`gh-agent: ${ghCtx.configError}`, "error");
      return;
    }

    // Extract username from auth status output
    const match = result.stdout.match(/Logged in to github\.com account (\S+)/);
    const username = match?.[1] ?? "agent";

    ctx.ui.setStatus(
      "gh-agent",
      ctx.ui.theme.fg("success", `gh: ${username}`)
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
