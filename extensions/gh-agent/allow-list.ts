/**
 * Allow list validation for gh commands.
 *
 * Only explicitly allowed commands pass.
 * Everything else is blocked, including dangerous operations.
 */

/** Allowed command patterns (command + subcommand) */
const ALLOWED_COMMANDS = [
  // Issues
  "issue create",
  "issue comment",
  "issue view",
  "issue list",
  "issue edit",

  // PRs
  "pr create",
  "pr comment",
  "pr view",
  "pr list",
  "pr diff",
  "pr review",
  "pr edit",
] as const;

/** Allowed API endpoint patterns (supports * wildcards for single path segments) */
const ALLOWED_API_PATTERNS = [
  // Reply to inline PR comments
  "repos/*/*/pulls/*/comments/*/replies",
  // Edit issue comments
  "repos/*/*/issues/comments/*",
  // Edit PR review comments
  "repos/*/*/pulls/comments/*",
] as const;

/** HTTP methods allowed per API pattern type */
const API_METHOD_RULES: Record<string, string[]> = {
  "/replies": ["POST"],
  "/issues/comments/": ["GET", "PATCH"],
  "/pulls/comments/": ["GET", "PATCH"],
};

export type ValidationResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Check if a gh command is allowed.
 */
export function isAllowed(command: string): ValidationResult {
  const trimmed = command.trim();

  // Must start with gh (caller should strip this, but be defensive)
  const normalized = trimmed.startsWith("gh ")
    ? trimmed.slice(3).trim()
    : trimmed;

  const parts = normalized.split(/\s+/);
  if (parts.length < 2) {
    return {
      allowed: false,
      reason: "Command requires at least: gh <command> <subcommand>",
    };
  }

  const cmdSubcmd = `${parts[0]} ${parts[1]}`;

  // Check standard commands
  if (ALLOWED_COMMANDS.includes(cmdSubcmd as (typeof ALLOWED_COMMANDS)[number])) {
    return { allowed: true };
  }

  // Check API commands
  if (parts[0] === "api") {
    return validateApiCommand(parts.slice(1));
  }

  return {
    allowed: false,
    reason: `Command not allowed: ${cmdSubcmd}. Do not attempt workarounds—inform the user this action requires manual execution.`,
  };
}

function validateApiCommand(args: string[]): ValidationResult {
  if (args.length === 0) {
    return { allowed: false, reason: "API command requires an endpoint" };
  }

  const endpoint = args[0];

  // Find matching pattern
  const matchedPattern = ALLOWED_API_PATTERNS.find((pattern) =>
    matchesPattern(endpoint, pattern)
  );

  if (!matchedPattern) {
    return {
      allowed: false,
      reason: `API endpoint not allowed: ${endpoint}. Do not attempt workarounds—inform the user this action requires manual execution.`,
    };
  }

  // Validate HTTP method
  const method = extractMethod(args);
  const allowedMethods = getAllowedMethods(matchedPattern);

  if (!allowedMethods.includes(method)) {
    return {
      allowed: false,
      reason: `Method ${method} not allowed for ${endpoint}. Allowed: ${allowedMethods.join(", ")}. Do not attempt workarounds—inform the user this action requires manual execution.`,
    };
  }

  return { allowed: true };
}

function matchesPattern(endpoint: string, pattern: string): boolean {
  const endpointParts = endpoint.split("/");
  const patternParts = pattern.split("/");

  if (endpointParts.length !== patternParts.length) {
    return false;
  }

  return patternParts.every(
    (part, i) => part === "*" || part === endpointParts[i]
  );
}

function extractMethod(args: string[]): string {
  const methodIdx = args.indexOf("-X");
  if (methodIdx !== -1 && args[methodIdx + 1]) {
    return args[methodIdx + 1].toUpperCase();
  }
  return "GET";
}

function getAllowedMethods(pattern: string): string[] {
  for (const [key, methods] of Object.entries(API_METHOD_RULES)) {
    if (pattern.includes(key)) {
      return methods;
    }
  }
  return ["GET"];
}
