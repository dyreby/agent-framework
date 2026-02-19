import { describe, it } from "node:test";
import assert from "node:assert";
import { isAllowed } from "../allow-list.ts";

describe("isAllowed", () => {
  describe("allowed commands", () => {
    it("allows issue create", () => {
      const result = isAllowed("gh issue create --title 'Test'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows issue comment", () => {
      const result = isAllowed("gh issue comment 123 --body 'Comment'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows issue view", () => {
      const result = isAllowed("gh issue view 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows issue list", () => {
      const result = isAllowed("gh issue list");
      assert.strictEqual(result.allowed, true);
    });

    it("allows issue edit", () => {
      const result = isAllowed("gh issue edit 123 --body 'Updated'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr create", () => {
      const result = isAllowed("gh pr create --title 'PR'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr comment", () => {
      const result = isAllowed("gh pr comment 123 --body 'Comment'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr view", () => {
      const result = isAllowed("gh pr view 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr list", () => {
      const result = isAllowed("gh pr list");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr diff", () => {
      const result = isAllowed("gh pr diff 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr review", () => {
      const result = isAllowed("gh pr review 123 --approve");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr edit", () => {
      const result = isAllowed("gh pr edit 123 --body 'Updated'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr status", () => {
      const result = isAllowed("gh pr status");
      assert.strictEqual(result.allowed, true);
    });

    it("allows search prs", () => {
      const result = isAllowed("gh search prs --review-requested=john-agent --state=open");
      assert.strictEqual(result.allowed, true);
    });

    it("allows search issues", () => {
      const result = isAllowed("gh search issues --mentions=john-agent --state=open");
      assert.strictEqual(result.allowed, true);
    });

    it("allows issue close", () => {
      const result = isAllowed("gh issue close 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows issue reopen", () => {
      const result = isAllowed("gh issue reopen 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr close", () => {
      const result = isAllowed("gh pr close 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr reopen", () => {
      const result = isAllowed("gh pr reopen 123");
      assert.strictEqual(result.allowed, true);
    });

    it("allows pr merge", () => {
      const result = isAllowed("gh pr merge 123");
      assert.strictEqual(result.allowed, true);
    });
  });

  describe("blocked commands (dangerous)", () => {
    it("blocks repo delete", () => {
      const result = isAllowed("gh repo delete owner/repo --yes");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks repo create", () => {
      const result = isAllowed("gh repo create my-repo");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks repo edit", () => {
      const result = isAllowed("gh repo edit --visibility private");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks auth commands", () => {
      const result = isAllowed("gh auth logout");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks workflow commands", () => {
      const result = isAllowed("gh workflow run deploy.yml");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks release commands", () => {
      const result = isAllowed("gh release create v1.0.0");
      assert.strictEqual(result.allowed, false);
    });
  });

  describe("API commands", () => {
    it("allows notifications (GET)", () => {
      const result = isAllowed("gh api notifications");
      assert.strictEqual(result.allowed, true);
    });

    it("allows notifications with query params", () => {
      const result = isAllowed("gh api notifications --jq '.[] | select(.reason == \"review_requested\")'");
      assert.strictEqual(result.allowed, true);
    });

    it("allows listing PR review comments (GET)", () => {
      const result = isAllowed("gh api repos/owner/repo/pulls/1/comments");
      assert.strictEqual(result.allowed, true);
    });

    it("allows replying to inline PR comments (POST)", () => {
      const result = isAllowed(
        'gh api repos/owner/repo/pulls/1/comments/123/replies -X POST -f body="Reply"'
      );
      assert.strictEqual(result.allowed, true);
    });

    it("blocks replying to inline PR comments with wrong method", () => {
      const result = isAllowed(
        "gh api repos/owner/repo/pulls/1/comments/123/replies -X DELETE"
      );
      assert.strictEqual(result.allowed, false);
    });

    it("allows editing issue comments (PATCH)", () => {
      const result = isAllowed(
        'gh api repos/owner/repo/issues/comments/123 -X PATCH -f body="Updated"'
      );
      assert.strictEqual(result.allowed, true);
    });

    it("allows viewing issue comments (GET)", () => {
      const result = isAllowed("gh api repos/owner/repo/issues/comments/123");
      assert.strictEqual(result.allowed, true);
    });

    it("blocks deleting issue comments", () => {
      const result = isAllowed(
        "gh api repos/owner/repo/issues/comments/123 -X DELETE"
      );
      assert.strictEqual(result.allowed, false);
    });

    it("allows editing PR review comments (PATCH)", () => {
      const result = isAllowed(
        'gh api repos/owner/repo/pulls/comments/123 -X PATCH -f body="Updated"'
      );
      assert.strictEqual(result.allowed, true);
    });

    it("blocks deleting PR review comments", () => {
      const result = isAllowed(
        "gh api repos/owner/repo/pulls/comments/123 -X DELETE"
      );
      assert.strictEqual(result.allowed, false);
    });

    it("allows requesting reviewers (POST)", () => {
      const result = isAllowed(
        'gh api repos/owner/repo/pulls/59/requested_reviewers -X POST -f reviewers[]="dyreby"'
      );
      assert.strictEqual(result.allowed, true);
    });

    it("blocks requesting reviewers with wrong method", () => {
      const result = isAllowed(
        "gh api repos/owner/repo/pulls/59/requested_reviewers -X DELETE"
      );
      assert.strictEqual(result.allowed, false);
    });

    it("blocks arbitrary API endpoints", () => {
      const result = isAllowed("gh api repos/owner/repo/collaborators");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks admin API endpoints", () => {
      const result = isAllowed("gh api /admin/users");
      assert.strictEqual(result.allowed, false);
    });

    it("blocks GraphQL mutations", () => {
      const result = isAllowed(
        'gh api graphql -f query="mutation { deleteProject }"'
      );
      assert.strictEqual(result.allowed, false);
    });
  });

  describe("edge cases", () => {
    it("handles commands without gh prefix", () => {
      const result = isAllowed("issue create --title 'Test'");
      assert.strictEqual(result.allowed, true);
    });

    it("handles extra whitespace", () => {
      const result = isAllowed("  gh   issue   create  --title 'Test'");
      assert.strictEqual(result.allowed, true);
    });

    it("rejects commands with only one part", () => {
      const result = isAllowed("gh issue");
      assert.strictEqual(result.allowed, false);
    });

    it("rejects empty commands", () => {
      const result = isAllowed("");
      assert.strictEqual(result.allowed, false);
    });

    it("rejects api command without endpoint", () => {
      const result = isAllowed("gh api");
      assert.strictEqual(result.allowed, false);
    });
  });
});
