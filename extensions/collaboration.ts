/**
 * Collaboration framework extension.
 *
 * - /concept: Manage concept emphasis (load, unload, boost, reduce)
 * - alt+c: Insert concept reference at cursor
 * - Auto-loads concepts from `cf:name` markers (recursive)
 * - Injects preamble + loaded concepts into system prompt
 * - Shows loaded concepts in status bar
 *
 * Templates (in .pi/prompts/):
 * - /review-pr <number>: Review a pull request with OODA framing
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

// Find concepts directory relative to this extension
const extensionDir = dirname(import.meta.url.replace("file://", ""));
const repoRoot = join(extensionDir, "..");
const conceptsDir = join(repoRoot, "concepts");

// Regex to match `cf:name` markers (backticks required)
const CONCEPT_MARKER_REGEX = /`cf:([a-zA-Z0-9_-]+)`/g;

/**
 * Parse text for `cf:name` markers and return counts per concept.
 */
function parseConceptMarkers(text: string): Map<string, number> {
  const matches = text.matchAll(CONCEPT_MARKER_REGEX);
  const counts = new Map<string, number>();
  for (const match of matches) {
    const name = match[1];
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
}

/**
 * Load a concept file and return its content, or null if not found.
 */
function loadConceptFile(name: string): string | null {
  const path = join(conceptsDir, `${name}.md`);
  if (!existsSync(path)) {
    return null;
  }
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Recursively load all concepts referenced by markers in the given text.
 * Returns { loaded: Map<name, content>, counts: Map<name, refCount>, missing: Set<name> }.
 */
function loadConceptsRecursively(
  text: string,
  loaded: Map<string, string> = new Map(),
  counts: Map<string, number> = new Map(),
  missing: Set<string> = new Set()
): { loaded: Map<string, string>; counts: Map<string, number>; missing: Set<string> } {
  const markers = parseConceptMarkers(text);

  for (const [name, count] of markers) {
    // Accumulate reference counts
    counts.set(name, (counts.get(name) ?? 0) + count);

    // Skip already processed (prevents cycles, but counts still accumulate)
    if (loaded.has(name) || missing.has(name)) continue;

    const content = loadConceptFile(name);
    if (content === null) {
      missing.add(name);
      continue;
    }

    // Mark as loaded before recursing (prevents cycles)
    loaded.set(name, content);

    // Recursively load concepts referenced within this concept
    loadConceptsRecursively(content, loaded, counts, missing);
  }

  return { loaded, counts, missing };
}

const PREAMBLE = `<collaboration-framework>
\`cf:<name>\` is a provenance marker — it references a shared concept (concepts/<name>.md).
Concept names are semantically meaningful. The file contains specifics for alignment conversations.
</collaboration-framework>

Your interpretation of intent is probably wrong. Words are lossy compression—infer what was meant, hold it loosely, verify when stakes are non-trivial.

Confirm before actions that change external state (git push, GitHub API) or are non-reversible (file deletion).`;

export default function (pi: ExtensionAPI) {
  // Track concepts loaded in this session: name -> reference count
  // Higher count = more emphasis from user
  const sessionConcepts = new Map<string, number>();

  function getAvailableConcepts(): string[] {
    try {
      return readdirSync(conceptsDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));
    } catch {
      return [];
    }
  }

  function updateStatus(ctx: {
    ui: {
      setStatus: (id: string, text: string | undefined) => void;
      theme: { fg: (color: string, text: string) => string };
    };
  }) {
    if (sessionConcepts.size === 0) {
      ctx.ui.setStatus("concepts", undefined);
    } else {
      // Sort by reference count descending, then alphabetically
      const sorted = [...sessionConcepts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([name, count]) => `${name}(${count})`);
      ctx.ui.setStatus(
        "concepts",
        ctx.ui.theme.fg("success", `concepts: ${sorted.join(", ")}`)
      );
    }
  }

  // /concept command - manage concept emphasis
  pi.registerCommand("concept", {
    description: "Manage concept emphasis (load, unload, boost, reduce, all)",
    handler: async (args, ctx) => {
      const available = getAvailableConcepts();
      if (available.length === 0) {
        ctx.ui.notify("No concepts found in concepts/", "error");
        return;
      }

      // /concept all - load every available concept
      if (args.trim().toLowerCase() === "all") {
        let loaded = 0;
        for (const name of available) {
          if (!sessionConcepts.has(name)) {
            sessionConcepts.set(name, 1);
            loaded++;
          }
        }
        updateStatus(ctx);
        ctx.ui.notify(
          loaded > 0
            ? `Loaded ${loaded} concept${loaded > 1 ? "s" : ""} (${available.length} total)`
            : `All ${available.length} concepts already loaded`,
          "info"
        );
        return;
      }

      // Build options with loaded state and count
      const options = available.map((name) => {
        const count = sessionConcepts.get(name);
        if (count !== undefined) {
          return `● ${name} (${count})`;
        }
        return `○ ${name}`;
      });

      const selected = await ctx.ui.select("Select concept:", options);
      if (!selected) return;

      // Extract name (remove indicator prefix and count suffix)
      const name = selected.slice(2).replace(/ \(\d+\)$/, "");
      const currentCount = sessionConcepts.get(name);

      if (currentCount !== undefined) {
        // Concept is loaded - show action menu
        const actions = [
          `+1 (boost)     [${currentCount} → ${currentCount + 1}]`,
          `−1 (reduce)    [${currentCount} → ${currentCount - 1}]`,
          `Unload         [remove entirely]`,
        ];
        const action = await ctx.ui.select(`${name}:`, actions);
        if (!action) return;

        if (action.startsWith("+1")) {
          sessionConcepts.set(name, currentCount + 1);
          ctx.ui.notify(`Boosted: ${name} → ${currentCount + 1}`, "info");
        } else if (action.startsWith("−1")) {
          if (currentCount <= 1) {
            sessionConcepts.delete(name);
            ctx.ui.notify(`Unloaded: ${name}`, "info");
          } else {
            sessionConcepts.set(name, currentCount - 1);
            ctx.ui.notify(`Reduced: ${name} → ${currentCount - 1}`, "info");
          }
        } else {
          sessionConcepts.delete(name);
          ctx.ui.notify(`Unloaded: ${name}`, "info");
        }
      } else {
        // Concept not loaded - just load it
        sessionConcepts.set(name, 1);
        ctx.ui.notify(`Loaded: ${name}`, "info");
      }

      updateStatus(ctx);
    },
  });

  // Inject preamble + auto-loaded concepts into system prompt
  pi.on("before_agent_start", async (event, ctx) => {
    let injection = PREAMBLE;

    // Auto-load concepts from markers in preamble, system prompt, and user prompt
    const allText = `${PREAMBLE}\n${event.systemPrompt}\n${event.prompt}`;
    const { loaded: autoLoaded, counts, missing } = loadConceptsRecursively(allText);

    // Warn about missing concept files
    for (const name of missing) {
      ctx.ui.notify(`Missing concept: ${name}.md`, "warning");
    }

    // Merge auto-loaded counts into session (accumulate references)
    for (const [name, count] of counts) {
      sessionConcepts.set(name, (sessionConcepts.get(name) ?? 0) + count);
    }

    // Build concept contents sorted by reference count (most emphasized first)
    if (sessionConcepts.size > 0) {
      const sorted = [...sessionConcepts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

      const conceptContents: string[] = [];
      for (const [name, count] of sorted) {
        const content = loadConceptFile(name);
        if (content) {
          conceptContents.push(`## ${name}\n\n${content}`);
        }
      }
      if (conceptContents.length > 0) {
        injection += `\n\n<loaded-concepts>
Shared mental models—reference frames, not rigid rules.
Ordered by emphasis (most referenced first).

${conceptContents.join("\n\n---\n\n")}
</loaded-concepts>`;
      }
    }

    updateStatus(ctx);

    return {
      systemPrompt: event.systemPrompt + "\n\n" + injection,
    };
  });

  // Reset session state on session start
  pi.on("session_start", async (_event, ctx) => {
    sessionConcepts.clear();
    updateStatus(ctx);
  });

  // alt+c shortcut - insert concept reference at cursor
  pi.registerShortcut("alt+c", {
    description: "Insert concept reference",
    handler: async (ctx) => {
      const available = getAvailableConcepts();
      if (available.length === 0) {
        ctx.ui.notify("No concepts found in concepts/", "error");
        return;
      }

      const selected = await ctx.ui.select("Insert concept:", available);
      if (selected) {
        ctx.ui.pasteToEditor(`\`cf:${selected}\``);
      }
    },
  });
}
