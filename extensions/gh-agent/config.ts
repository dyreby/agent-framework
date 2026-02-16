/**
 * Configuration loading for gh-agent.
 *
 * Combines settings-based username with isolated GH_CONFIG_DIR for security.
 * No token in process args, explicit username in settings (no regex parsing).
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SETTINGS_PATH = join(homedir(), ".pi", "agent", "settings.json");
const GH_CONFIG_BASE = join(homedir(), ".pi", "agent", "gh-config");

export type Config =
  | { ok: true; username: string; configDir: string }
  | { ok: false; error: string };

/**
 * Get the GH_CONFIG_DIR path for a given username.
 */
export function getConfigDir(username: string): string {
  return join(GH_CONFIG_BASE, username);
}

/**
 * Get the setup command for a given username.
 */
export function getSetupCommand(username: string): string {
  return `GH_CONFIG_DIR="${getConfigDir(username)}" gh auth login`;
}

/**
 * Read gh-agent configuration from pi settings.
 */
export function readConfig(): Config {
  try {
    const content = readFileSync(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(content);

    const username = settings["gh-agent"]?.username;
    if (!username || typeof username !== "string") {
      return {
        ok: false,
        error: `Add to ${SETTINGS_PATH}: { "gh-agent": { "username": "your-github-agent-username" } }`,
      };
    }

    return { ok: true, username, configDir: getConfigDir(username) };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return {
        ok: false,
        error: `Add to ${SETTINGS_PATH}: { "gh-agent": { "username": "your-github-agent-username" } }`,
      };
    }
    return { ok: false, error: `Failed to read settings: ${err.message}` };
  }
}
