// Types for RepoRoast - AI GitHub Repository Reviewer

export interface RepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  description: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  license: string | null;
  defaultBranch: string;
  size: number;
  archived: boolean;
  fork: boolean;
}

export interface ReadmeData {
  content: string;
  length: number;
  hasScreenshots: boolean;
  hasDemo: boolean;
  hasGif: boolean;
  hasInstallGuide: boolean;
  hasQuickStart: boolean;
  hasContributing: boolean;
  hasBadges: boolean;
  wordCount: number;
  sectionCount: number;
}

export interface CommitStats {
  recentCommitCount: number;
  daysSinceLastCommit: number;
  totalCommits: number;
}

export interface IssueStats {
  openCount: number;
  closedCount: number;
  avgCloseTimeHours: number | null;
  recentIssueCount: number;
}

export interface EngineeringData {
  hasCiCd: boolean;
  hasDocker: boolean;
  hasTests: boolean;
  hasLinting: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  fileCount: number;
}

export interface Scores {
  overall: number;
  documentation: number;
  engineering: number;
  activity: number;
  marketability: number;
}

export type AnalysisMode = "roast" | "investor" | "hiring";

export interface AnalysisResult {
  repoInfo: RepoInfo;
  readme: ReadmeData;
  scores: Scores;
  roast: string;
  suggestions: string[];
  verdict: string;
  mode: AnalysisMode;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}
