/**
 * Collaboration framework extension.
 *
 * - /concept: Toggle concepts on/off via fuzzy picker
 * - Injects preamble + active concepts into system prompt
 * - Shows active concepts in status bar
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";

// Find concepts directory relative to this extension
const extensionDir = dirname(import.meta.url.replace("file://", ""));
const repoRoot = join(extensionDir, "..");
const conceptsDir = join(repoRoot, "concepts");

const PREAMBLE = `<collaboration-framework>
[[cf:name]] is a provenance marker — it references a shared concept (concepts/name.md).
Concept names are semantically meaningful. The file contains specifics for alignment conversations.
</collaboration-framework>

Your interpretation of intent is probably wrong. Words are lossy compression—infer what was meant, hold it loosely, verify when stakes are non-trivial.

Apply [[cf:best-practices]].`;

export default function (pi: ExtensionAPI) {
  const activeConcepts = new Set<string>();

  function getAvailableConcepts(): string[] {
    try {
      return readdirSync(conceptsDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));
    } catch {
      return [];
    }
  }

  function updateStatus(ctx: { ui: { setStatus: (id: string, text: string | undefined) => void; theme: { fg: (color: string, text: string) => string } } }) {
    if (activeConcepts.size === 0) {
      ctx.ui.setStatus("concepts", undefined);
    } else {
      const names = [...activeConcepts].sort().join(", ");
      ctx.ui.setStatus("concepts", ctx.ui.theme.fg("success", `concepts: ${names}`));
    }
  }

  // /concept command - toggle concepts on/off
  pi.registerCommand("concept", {
    description: "Toggle concepts on/off",
    handler: async (_args, ctx) => {
      const available = getAvailableConcepts();
      if (available.length === 0) {
        ctx.ui.notify("No concepts found in concepts/", "error");
        return;
      }

      // Build options with active state indicator
      const options = available.map((name) => {
        const active = activeConcepts.has(name);
        return `${active ? "● " : "○ "}${name}`;
      });

      const selected = await ctx.ui.select("Toggle concept:", options);
      if (!selected) return;

      // Extract name (remove indicator prefix)
      const name = selected.slice(2);

      if (activeConcepts.has(name)) {
        activeConcepts.delete(name);
        ctx.ui.notify(`Deactivated: ${name}`, "info");
      } else {
        activeConcepts.add(name);
        ctx.ui.notify(`Activated: ${name}`, "info");
      }

      updateStatus(ctx);
    },
  });

  // Inject preamble + active concepts into system prompt
  pi.on("before_agent_start", async (event, ctx) => {
    let injection = PREAMBLE;

    if (activeConcepts.size > 0) {
      const conceptContents: string[] = [];
      for (const name of activeConcepts) {
        try {
          const content = readFileSync(join(conceptsDir, `${name}.md`), "utf-8");
          conceptContents.push(`## ${name}\n\n${content}`);
        } catch (e) {
          ctx.ui.notify(`Failed to read concept: ${name}`, "error");
        }
      }

      if (conceptContents.length > 0) {
        injection += `\n\n# Active Concepts\n\n${conceptContents.join("\n\n---\n\n")}`;
      }
    }

    return {
      systemPrompt: event.systemPrompt + "\n\n" + injection,
    };
  });

  // Restore status on session start (concepts don't persist, but status should be clear)
  pi.on("session_start", async (_event, ctx) => {
    updateStatus(ctx);
  });
}
