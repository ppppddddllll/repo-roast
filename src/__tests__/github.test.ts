import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "@/lib/github";
import { calculateScores } from "@/lib/scorer";
import type { RepoInfo, ReadmeData, CommitStats, IssueStats, EngineeringData } from "@/lib/types";

describe("parseGitHubUrl", () => {
  it("parses a valid GitHub URL", () => {
    const result = parseGitHubUrl("https://github.com/facebook/react");
    expect(result).toEqual({ owner: "facebook", repo: "react" });
  });

  it("parses URL with trailing slash", () => {
    const result = parseGitHubUrl("https://github.com/vercel/next.js/");
    expect(result).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("returns null for invalid URL", () => {
    expect(parseGitHubUrl("https://gitlab.com/foo/bar")).toBeNull();
    expect(parseGitHubUrl("not a url")).toBeNull();
    expect(parseGitHubUrl("")).toBeNull();
  });

  it("returns null for GitHub URL without repo", () => {
    expect(parseGitHubUrl("https://github.com/facebook")).toBeNull();
  });
});

describe("calculateScores", () => {
  const baseRepo: RepoInfo = {
    owner: "test", repo: "test", fullName: "test/test",
    stars: 100, forks: 10, openIssues: 3,
    language: "TypeScript", description: "A test repo",
    topics: ["test"], createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z", pushedAt: "2024-06-01T00:00:00Z",
    license: "MIT", defaultBranch: "main",
    size: 100, archived: false, fork: false,
  };

  const goodReadme: ReadmeData = {
    content: "# Hello World\n\n![screenshot](img.png)\n\n## Install\n\n```npm install```\n\n## Contributing",
    length: 500, hasScreenshots: true, hasDemo: true, hasGif: false,
    hasInstallGuide: true, hasQuickStart: true, hasContributing: true,
    hasBadges: true, wordCount: 100, sectionCount: 4,
  };

  const goodCommits: CommitStats = {
    recentCommitCount: 15, daysSinceLastCommit: 0, totalCommits: 200,
  };

  const goodIssues: IssueStats = {
    openCount: 2, closedCount: 8, avgCloseTimeHours: 12, recentIssueCount: 10,
  };

  const goodEngineering: EngineeringData = {
    hasCiCd: true, hasDocker: true, hasTests: true,
    hasLinting: true, hasContributing: true, hasChangelog: true,
    fileCount: 100,
  };

  it("returns scores between 0 and 100", () => {
    const scores = calculateScores(
      baseRepo, goodReadme, goodCommits, goodIssues, goodEngineering
    );
    expect(scores.overall).toBeGreaterThanOrEqual(0);
    expect(scores.overall).toBeLessThanOrEqual(100);
    expect(scores.documentation).toBeGreaterThanOrEqual(0);
    expect(scores.documentation).toBeLessThanOrEqual(100);
  });

  it("gives low scores for empty project", () => {
    const emptyReadme: ReadmeData = {
      content: "", length: 0, hasScreenshots: false, hasDemo: false,
      hasGif: false, hasInstallGuide: false, hasQuickStart: false,
      hasContributing: false, hasBadges: false, wordCount: 0, sectionCount: 0,
    };
    const emptyCommits: CommitStats = {
      recentCommitCount: 0, daysSinceLastCommit: 999, totalCommits: 0,
    };
    const emptyIssues: IssueStats = {
      openCount: 0, closedCount: 0, avgCloseTimeHours: null, recentIssueCount: 0,
    };
    const emptyEngineering: EngineeringData = {
      hasCiCd: false, hasDocker: false, hasTests: false,
      hasLinting: false, hasContributing: false, hasChangelog: false,
      fileCount: 0,
    };

    const scores = calculateScores(
      baseRepo, emptyReadme, emptyCommits, emptyIssues, emptyEngineering
    );
    expect(scores.overall).toBeLessThanOrEqual(10);
  });
});

describe("known modules exist", () => {
  it("scorer exports calculateScores", () => {
    expect(typeof calculateScores).toBe("function");
  });
});
