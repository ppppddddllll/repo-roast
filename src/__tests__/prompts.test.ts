import { describe, it, expect } from "vitest";
import { buildChatMessages, parseAiResponse } from "@/lib/prompts";
import { calculateScores, buildRepoSummary } from "@/lib/scorer";
import type { RepoInfo, ReadmeData, CommitStats, IssueStats, EngineeringData } from "@/lib/types";

const mockRepo: RepoInfo = {
  owner: "test", repo: "test", fullName: "test/test",
  stars: 10, forks: 2, openIssues: 1,
  language: "TypeScript", description: "A test repo for testing",
  topics: ["test", "typescript"], createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z", pushedAt: "2024-06-01T00:00:00Z",
  license: "MIT", defaultBranch: "main",
  size: 50, archived: false, fork: false,
};

const mockReadme: ReadmeData = {
  content: "# Test\n\nA test project.\n\n## Install\n\n```\nnpm install\n```\n\n## Contributing",
  length: 200, hasScreenshots: false, hasDemo: false, hasGif: false,
  hasInstallGuide: true, hasQuickStart: false, hasContributing: true,
  hasBadges: false, wordCount: 30, sectionCount: 3,
};

const mockCommits: CommitStats = {
  recentCommitCount: 5, daysSinceLastCommit: 2, totalCommits: 50,
};

const mockIssues: IssueStats = {
  openCount: 1, closedCount: 3, avgCloseTimeHours: 48, recentIssueCount: 4,
};

const mockEngineering: EngineeringData = {
  hasCiCd: false, hasDocker: false, hasTests: false,
  hasLinting: false, hasContributing: false, hasChangelog: false,
  fileCount: 10,
};

describe("buildChatMessages", () => {
  it("returns correct message format for roast mode", () => {
    const scores = calculateScores(mockRepo, mockReadme, mockCommits, mockIssues, mockEngineering);
    const messages = buildChatMessages("roast", "test summary", scores);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
    expect(messages[0].content).toContain("brutally honest");
  });

  it("returns correct message format for investor mode", () => {
    const scores = calculateScores(mockRepo, mockReadme, mockCommits, mockIssues, mockEngineering);
    const messages = buildChatMessages("investor", "test summary", scores);

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toContain("VC");
  });

  it("returns correct message format for hiring mode", () => {
    const scores = calculateScores(mockRepo, mockReadme, mockCommits, mockIssues, mockEngineering);
    const messages = buildChatMessages("hiring", "test summary", scores);

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toContain("internship");
  });
});

describe("parseAiResponse", () => {
  it("parses roast response with suggestions", () => {
    const text = "这个 README 短得像购物小票。\n\n建议：\n1. 加点截图\n2. 写清楚干什么";
    const parsed = parseAiResponse(text, "roast");

    expect(parsed.roast).toContain("购物小票");
    expect(parsed.suggestions.length).toBeGreaterThan(0);
  });

  it("parses investor response", () => {
    const text = "Decision: NO\n\nReasons:\n1. 市场太小\n2. 没有差异化\n3. 文档太差";
    const parsed = parseAiResponse(text, "investor");

    expect(parsed.verdict).toBe("NO");
    expect(parsed.suggestions.length).toBeGreaterThan(0);
  });

  it("parses investor YES response", () => {
    const text = "Decision: YES\nReasons:\n1. Market is huge";
    const parsed = parseAiResponse(text, "investor");

    expect(parsed.verdict).toBe("YES");
  });

  it("parses hiring response", () => {
    const text = "录取概率: 42%\n\n代码质量一般，文档还不错。";
    const parsed = parseAiResponse(text, "hiring");

    expect(parsed.verdict).toBe("42%");
  });
});

describe("buildRepoSummary", () => {
  it("returns non-empty summary", () => {
    const summary = buildRepoSummary(
      mockRepo, mockReadme, mockCommits, mockIssues, mockEngineering
    );
    expect(summary.length).toBeGreaterThan(0);
    expect(summary).toContain("test/test");
    expect(summary).toContain("Stars: 10");
  });
});
