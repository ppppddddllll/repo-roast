import { SCORE_WEIGHTS } from "@/config/site";
import type {
  RepoInfo,
  ReadmeData,
  CommitStats,
  IssueStats,
  EngineeringData,
  Scores,
} from "./types";

export function calculateScores(
  repoInfo: RepoInfo,
  readme: ReadmeData,
  commits: CommitStats,
  issues: IssueStats,
  engineering: EngineeringData
): Scores {
  const documentation = scoreDocumentation(readme);
  const engineeringScore = scoreEngineering(engineering, repoInfo);
  const activity = scoreActivity(commits, issues, repoInfo);
  const marketability = scoreMarketability(repoInfo, readme);

  const overall = Math.round(
    documentation * SCORE_WEIGHTS.documentation +
    engineeringScore * SCORE_WEIGHTS.engineering +
    activity * SCORE_WEIGHTS.activity +
    marketability * SCORE_WEIGHTS.marketability
  );

  return {
    overall: clamp(overall, 0, 100),
    documentation: clamp(documentation, 0, 100),
    engineering: clamp(engineeringScore, 0, 100),
    activity: clamp(activity, 0, 100),
    marketability: clamp(marketability, 0, 100),
  };
}

// Score README documentation quality
function scoreDocumentation(readme: ReadmeData): number {
  if (readme.length === 0) return 0;

  let score = 0;

  // Basic content existence (40%)
  if (readme.length > 100) score += 8;
  if (readme.length > 500) score += 8;
  if (readme.length > 2000) score += 8;
  if (readme.wordCount > 50) score += 8;
  if (readme.wordCount > 200) score += 8;

  // Visual elements (20%)
  if (readme.hasScreenshots) score += 10;
  if (readme.hasGif) score += 6;
  if (readme.hasBadges) score += 4;

  // Usability (30%)
  if (readme.hasInstallGuide) score += 8;
  if (readme.hasQuickStart) score += 8;
  if (readme.hasDemo) score += 6;
  if (readme.sectionCount >= 2) score += 4;
  if (readme.sectionCount >= 5) score += 4;

  // Community (10%)
  if (readme.hasContributing) score += 6;
  if (readme.wordCount >= 500) score += 4;

  return score;
}

// Score engineering quality
function scoreEngineering(
  engineering: EngineeringData,
  repoInfo: RepoInfo
): number {
  let score = 0;

  if (engineering.hasCiCd) score += 20;
  if (engineering.hasDocker) score += 15;
  if (engineering.hasTests) score += 20;
  if (engineering.hasLinting) score += 10;
  if (engineering.hasContributing) score += 10;
  if (engineering.hasChangelog) score += 5;
  if (engineering.fileCount > 10) score += 10;
  if (engineering.fileCount > 50) score += 5;
  if (repoInfo.license) score += 5;

  return score;
}

// Score project activity and maintenance
function scoreActivity(
  commits: CommitStats,
  issues: IssueStats,
  repoInfo: RepoInfo
): number {
  let score = 0;

  // Commit recency (40%)
  if (commits.daysSinceLastCommit === 0) score += 20;
  else if (commits.daysSinceLastCommit <= 3) score += 15;
  else if (commits.daysSinceLastCommit <= 7) score += 10;
  else if (commits.daysSinceLastCommit <= 30) score += 5;
  else score += 0;

  // Commit frequency (30%)
  if (commits.recentCommitCount >= 30) score += 20;
  else if (commits.recentCommitCount >= 10) score += 15;
  else if (commits.recentCommitCount >= 5) score += 10;
  else if (commits.recentCommitCount >= 1) score += 5;
  else score += 0;

  if (commits.totalCommits >= 100) score += 5;
  else if (commits.totalCommits >= 10) score += 3;

  // Issue handling (30%)
  const totalRecentIssues = issues.openCount + issues.closedCount;
  if (totalRecentIssues > 0) {
    const closeRatio = issues.closedCount / totalRecentIssues;
    if (closeRatio >= 0.7) score += 15;
    else if (closeRatio >= 0.4) score += 10;
    else if (closeRatio >= 0.1) score += 5;

    // Faster close times are better
    if (issues.avgCloseTimeHours !== null) {
      if (issues.avgCloseTimeHours <= 24) score += 10;
      else if (issues.avgCloseTimeHours <= 72) score += 7;
      else if (issues.avgCloseTimeHours <= 168) score += 4;
    }
  } else {
    // No recent issues - possibly stable or abandoned
    if (commits.daysSinceLastCommit < 30) score += 5;
  }

  return score;
}

// Score marketability based on project presentation
function scoreMarketability(repoInfo: RepoInfo, readme: ReadmeData): number {
  let score = 0;

  // Description quality (25%)
  if (repoInfo.description) score += 10;
  if (repoInfo.description && repoInfo.description.length > 30) score += 10;
  if (repoInfo.description && repoInfo.description.length > 100) score += 5;

  // Tags/topics (15%)
  if (repoInfo.topics.length >= 2) score += 5;
  if (repoInfo.topics.length >= 5) score += 5;
  if (repoInfo.topics.length >= 10) score += 5;

  // README first impression (40%)
  // The first 200 chars of README are critical for "marketability"
  const firstParagraph = readme.content.slice(0, 500);
  const hasWhat =
    /what/i.test(firstParagraph) ||
    /is a/i.test(firstParagraph) ||
    /project/i.test(firstParagraph);
  const hasWhy = /why/i.test(firstParagraph) || /problem/i.test(firstParagraph);
  const hasHow =
    /install/i.test(firstParagraph) || /quick/i.test(readme.content.slice(0, 1000));

  if (hasWhat) score += 10;
  if (hasWhy) score += 10;
  if (hasHow) score += 10;
  if (readme.hasScreenshots || readme.hasGif) score += 10;

  // Social proof (20%)
  if (repoInfo.stars >= 10) score += 3;
  if (repoInfo.stars >= 100) score += 4;
  if (repoInfo.stars >= 1000) score += 3;
  if (repoInfo.forks >= 5) score += 3;
  if (repoInfo.forks >= 50) score += 4;
  if (repoInfo.forks >= 500) score += 3;

  return score;
}

// Build a human-readable summary for the AI
export function buildRepoSummary(
  repoInfo: RepoInfo,
  readme: ReadmeData,
  commits: CommitStats,
  issues: IssueStats,
  engineering: EngineeringData
): string {
  return `
Repository: ${repoInfo.fullName}
Description: ${repoInfo.description || "No description"}
Language: ${repoInfo.language || "Unknown"}
Stars: ${repoInfo.stars} | Forks: ${repoInfo.forks} | Open Issues: ${repoInfo.openIssues}
Created: ${repoInfo.createdAt} | Last Push: ${repoInfo.pushedAt}
License: ${repoInfo.license || "None"}
Topics: ${repoInfo.topics.join(", ") || "None"}
Archived: ${repoInfo.archived} | Fork: ${repoInfo.fork}

--- README Analysis ---
Word count: ${readme.wordCount}
Section count: ${readme.sectionCount}
Has screenshots: ${readme.hasScreenshots}
Has GIF/demo: ${readme.hasGif}
Has demo link: ${readme.hasDemo}
Has install guide: ${readme.hasInstallGuide}
Has quick start: ${readme.hasQuickStart}
Has contributing guide: ${readme.hasContributing}
Has badges: ${readme.hasBadges}

--- Engineering ---
CI/CD: ${engineering.hasCiCd ? "Yes" : "No"}
Docker: ${engineering.hasDocker ? "Yes" : "No"}
Tests: ${engineering.hasTests ? "Yes" : "No"}
Linting: ${engineering.hasLinting ? "Yes" : "No"}
Contributing guide: ${engineering.hasContributing ? "Yes" : "No"}
Changelog: ${engineering.hasChangelog ? "Yes" : "No"}
File count: ${engineering.fileCount}

--- Activity (last 30 days) ---
Recent commits: ${commits.recentCommitCount}
Days since last commit: ${commits.daysSinceLastCommit}
Total commits: ${commits.totalCommits}
Recent issues: ${issues.recentIssueCount}
Issues closed: ${issues.closedCount}
Avg close time: ${issues.avgCloseTimeHours ? `${Math.round(issues.avgCloseTimeHours)} hours` : "N/A"}
`.trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
