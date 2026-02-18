/**
 * Collaboration framework extension.
 * 
 * - --profile <name>: Load a profile into the system prompt at session start
 * - get_model tool: Returns current model identifier for profile provenance
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

// Find profiles directory relative to this extension
const extensionDir = dirname(import.meta.url.replace("file://", ""));
const repoRoot = join(extensionDir, "..");
const profilesDir = join(repoRoot, "profiles");

export default function (pi: ExtensionAPI) {
  // Register --profile flag
  pi.registerFlag("profile", {
    description: "Load a collaboration profile into the system prompt",
    type: "string",
  });

  let profileContent: string | null = null;

  async function selectProfile(ctx: Parameters<Parameters<typeof pi.on<"session_start">>[1]>[1]) {
    // Clear previous profile
    profileContent = null;
    ctx.ui.setStatus("profile", undefined);

    // CLI flag takes precedence
    let profileName = pi.getFlag("--profile") as string | undefined;

    // Otherwise, prompt for selection if profiles exist
    if (!profileName && ctx.hasUI) {
      const profiles = readdirSync(profilesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));

      if (profiles.length === 0) return;

      if (profiles.length === 1) {
        profileName = profiles[0];
      } else {
        const selected = await ctx.ui.select("Select profile:", ["(none)", ...profiles]);
        if (!selected || selected === "(none)") return;
        profileName = selected;
      }
    }

    if (!profileName) return;

    const profilePath = join(profilesDir, `${profileName}.md`);
    if (!existsSync(profilePath)) {
      ctx.ui.notify(`Profile not found: ${profilePath}`, "error");
      return;
    }

    profileContent = readFileSync(profilePath, "utf-8");
    ctx.ui.setStatus("profile", ctx.ui.theme.fg("success", `profile: ${profileName}`));
  }

  // Load profile at session start
  pi.on("session_start", async (_event, ctx) => {
    await selectProfile(ctx);
  });

  // Re-prompt on new session
  pi.on("session_switch", async (event, ctx) => {
    if (event.reason === "new") {
      await selectProfile(ctx);
    }
  });

  // Inject profile into system prompt
  pi.on("before_agent_start", async (event, _ctx) => {
    if (!profileContent) return;

    return {
      systemPrompt: event.systemPrompt + "\n\n" + profileContent,
    };
  });

  // Tool to get model info for profile generation
  pi.registerTool({
    name: "get_model",
    label: "Get Model",
    description: "Returns the current model identifier for profile provenance frontmatter",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const model = ctx.model;
      const id = `${model.provider}/${model.id}`;
      const timestamp = new Date().toISOString().split("T")[0];

      return {
        content: [{ type: "text", text: `model: ${id}\ngenerated: ${timestamp}` }],
        details: { provider: model.provider, id: model.id, timestamp },
      };
    },
  });
}
