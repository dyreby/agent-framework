/**
 * Configuration loading for gh-agent.
 *
 * Uses an isolated gh config directory to avoid token exposure in process args.
 */

import { homedir } from "node:os";
import { join } from "node:path";

/** Isolated gh config directory for agent identity. */
export const GH_CONFIG_DIR = join(homedir(), ".pi", "agent", "gh-config");

/** Setup command for users to run. */
export const SETUP_COMMAND = `GH_CONFIG_DIR="${GH_CONFIG_DIR}" gh auth login`;
