import { describe, it } from "node:test";
import assert from "node:assert";
import { containsGhCommand, extractGhCommands, validateGhCommands } from "../gh-command.ts";

describe("containsGhCommand", () => {
  it("detects gh at start of command", () => {
    assert.strictEqual(containsGhCommand("gh pr create"), true);
  });

  it("detects gh after &&", () => {
    assert.strictEqual(containsGhCommand("cd /path && gh pr create"), true);
  });

  it("detects gh after ;", () => {
    assert.strictEqual(containsGhCommand("echo hello; gh issue list"), true);
  });

  it("detects gh after ||", () => {
    assert.strictEqual(containsGhCommand("false || gh pr view 1"), true);
  });

  it("detects gh in subshell", () => {
    assert.strictEqual(containsGhCommand("(gh pr list)"), true);
  });

  it("detects gh in command substitution", () => {
    assert.strictEqual(containsGhCommand("echo $(gh pr view 1 --json number)"), true);
  });

  it("returns false for commands without gh", () => {
    assert.strictEqual(containsGhCommand("cd /path && ls"), false);
  });

  it("returns false for gh substring in other words", () => {
    assert.strictEqual(containsGhCommand("echo spaghetti"), false);
  });
});

describe("extractGhCommands", () => {
  it("extracts single gh command", () => {
    const cmds = extractGhCommands("gh pr create --title 'Test'");
    assert.deepStrictEqual(cmds, ["gh pr create --title 'Test'"]);
  });

  it("extracts gh command after &&", () => {
    const cmds = extractGhCommands("cd /path && gh pr create --title 'Test'");
    assert.deepStrictEqual(cmds, ["gh pr create --title 'Test'"]);
  });

  it("extracts gh command after ;", () => {
    const cmds = extractGhCommands("echo done; gh issue list");
    assert.deepStrictEqual(cmds, ["gh issue list"]);
  });

  it("extracts multiple gh commands", () => {
    const cmds = extractGhCommands("gh pr list && gh issue list");
    assert.deepStrictEqual(cmds, ["gh pr list", "gh issue list"]);
  });

  it("extracts gh command from subshell", () => {
    const cmds = extractGhCommands("(gh pr view 123)");
    assert.deepStrictEqual(cmds, ["gh pr view 123"]);
  });

  it("extracts gh command from command substitution", () => {
    const cmds = extractGhCommands("echo $(gh pr view 1 --json number)");
    assert.deepStrictEqual(cmds, ["gh pr view 1 --json number"]);
  });

  it("returns empty for commands without gh", () => {
    const cmds = extractGhCommands("cd /path && ls");
    assert.deepStrictEqual(cmds, []);
  });
});

describe("validateGhCommands", () => {
  it("allows valid compound command", () => {
    const result = validateGhCommands("cd /path && gh pr create --title 'Test'");
    assert.strictEqual(result.allowed, true);
  });

  it("allows multiple valid gh commands", () => {
    const result = validateGhCommands("gh pr list && gh issue list");
    assert.strictEqual(result.allowed, true);
  });

  it("blocks if any gh command is invalid", () => {
    const result = validateGhCommands("gh pr list && gh repo delete owner/repo");
    assert.strictEqual(result.allowed, false);
  });

  it("blocks dangerous commands in compound statements", () => {
    const result = validateGhCommands("cd /path && gh repo delete owner/repo");
    assert.strictEqual(result.allowed, false);
  });
});
