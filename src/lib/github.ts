import { GITHUB_API_BASE, ACTIVITY_WINDOW_DAYS } from "@/config/site";
import type {
  RepoInfo,
  ReadmeData,
  CommitStats,
  IssueStats,
  EngineeringData,
} from "./types";

// Parse a GitHub URL into owner and repo name
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  const trimmed = url.trim().replace(/\/$/, "");
  const match = trimmed.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// Generic GitHub API request with auth
async function githubFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${GITHUB_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "repo-roast/0.1.0",
      ...options.headers,
    },
  });

  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    const resetTime = res.headers.get("x-ratelimit-reset");
    throw new Error(
      `GitHub API rate limit exceeded${
        resetTime
          ? `. Resets at ${new Date(Number(resetTime) * 1000).toLocaleString()}`
          : ""
      }`
    );
  }

  if (res.status === 404) {
    throw new Error("Repository not found. Check the URL and try again.");
  }

  if (res.status === 401) {
    throw new Error(
      "Invalid GitHub token. Check your GITHUB_TOKEN in .env.local"
    );
  }

  if (!res.ok) {
    throw new Error(
      `GitHub API error: ${res.status} ${res.statusText}`
    );
  }

  return res;
}

// Fetch basic repository information
export async function fetchRepoInfo(
  owner: string,
  repo: string,
  token: string
): Promise<RepoInfo> {
  const res = await githubFetch(`/repos/${owner}/${repo}`, token);
  const data = await res.json();

  return {
    owner: data.owner.login,
    repo: data.name,
    fullName: data.full_name,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    language: data.language,
    description: data.description,
    topics: data.topics || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    license: data.license?.spdx_id || null,
    defaultBranch: data.default_branch,
    size: data.size,
    archived: data.archived,
    fork: data.fork,
  };
}

// Fetch and analyze README content
export async function fetchReadme(
  owner: string,
  repo: string,
  token: string
): Promise<ReadmeData> {
  const res = await githubFetch(`/repos/${owner}/${repo}/readme`, token);
  const data = await res.json();

  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return analyzeReadme(content);
}

// Analyze README content for quality indicators
function analyzeReadme(content: string): ReadmeData {
  const lowerContent = content.toLowerCase();

  const hasScreenshots = /!\[.*\]\(.*\.(png|jpg|jpeg|gif|webp)/i.test(content);
  const hasGif = /!\[.*\]\(.*\.gif/i.test(content);
  const hasSvg = /!\[.*\]\(.*\.svg/i.test(content);

  const hasDemo =
    /demo/i.test(content) ||
    /live demo/i.test(content) ||
    /try it/i.test(content) ||
    /playground/i.test(content) ||
    /codesandbox/i.test(content) ||
    /stackblitz/i.test(content);

  const hasInstallGuide =
    /install/i.test(content) ||
    /npm install/i.test(content) ||
    /pip install/i.test(content) ||
    /go get/i.test(content) ||
    /cargo install/i.test(content);

  const hasQuickStart =
    /quick start/i.test(content) ||
    /getting started/i.test(content) ||
    /quickstart/i.test(content);

  const hasContributing =
    /contribut/i.test(content) ||
    /pull request/i.test(content);

  const hasBadges =
    /!\[.*\]\(https:\/\/img\.shields\.io/i.test(content) ||
    /!\[.*\]\(https:\/\/badge/i.test(content) ||
    /!\[.*\]\(https:\/\/github\.com\/.*\/actions\/workflows/i.test(content);

  const words = content.split(/\s+/);
  const wordCount = words.length;

  const sections = content.match(/^#{1,3}\s+.+$/gm) || [];
  const sectionCount = sections.length;

  return {
    content,
    length: content.length,
    hasScreenshots: hasScreenshots || hasSvg,
    hasDemo,
    hasGif,
    hasInstallGuide,
    hasQuickStart,
    hasContributing,
    hasBadges,
    wordCount,
    sectionCount,
  };
}

// Fetch recent commit activity
export async function fetchCommitStats(
  owner: string,
  repo: string,
  token: string
): Promise<CommitStats> {
  const since = new Date();
  since.setDate(since.getDate() - ACTIVITY_WINDOW_DAYS);

  const sinceIso = since.toISOString();
  const res = await githubFetch(
    `/repos/${owner}/${repo}/commits?since=${sinceIso}&per_page=100`,
    token
  );
  const recentCommits = await res.json();

  let totalCommits = 0;
  try {
    // GitHub API doesn't return total count directly;
    // use the link header to estimate
    const res2 = await githubFetch(
      `/repos/${owner}/${repo}/commits?per_page=1`,
      token
    );
    const linkHeader = res2.headers.get("link");
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        totalCommits = parseInt(lastPageMatch[1], 10);
      }
    }
  } catch {
    totalCommits = recentCommits.length;
  }

  const daysSinceLastCommit = recentCommits.length
    ? Math.floor(
        (Date.now() -
          new Date(recentCommits[0].commit.author.date).getTime()) /
          86400000
      )
    : 999;

  return {
    recentCommitCount: recentCommits.length,
    daysSinceLastCommit,
    totalCommits,
  };
}

// Fetch issue statistics
export async function fetchIssueStats(
  owner: string,
  repo: string,
  token: string
): Promise<IssueStats> {
  const since = new Date();
  since.setDate(since.getDate() - ACTIVITY_WINDOW_DAYS);
  const sinceIso = since.toISOString();

  // Get recently updated issues (both open and closed)
  const res = await githubFetch(
    `/repos/${owner}/${repo}/issues?since=${sinceIso}&state=all&per_page=100`,
    token
  );
  const recentIssues = await res.json();

  const openIssues = recentIssues.filter(
    (i: { state: string; pull_request?: unknown }) =>
      i.state === "open" && !i.pull_request
  );
  const closedIssues = recentIssues.filter(
    (i: { state: string; pull_request?: unknown }) =>
      i.state === "closed" && !i.pull_request
  );

  let avgCloseTimeHours: number | null = null;
  if (closedIssues.length > 0) {
    const closeTimes = closedIssues
      .filter((i: { created_at: string; closed_at: string | null }) => i.closed_at)
      .map(
        (i: { created_at: string; closed_at: string }) =>
          (new Date(i.closed_at).getTime() -
            new Date(i.created_at).getTime()) /
          3600000
      );
    if (closeTimes.length > 0) {
      avgCloseTimeHours =
        closeTimes.reduce((a: number, b: number) => a + b, 0) /
        closeTimes.length;
    }
  }

  return {
    openCount: openIssues.length,
    closedCount: closedIssues.length,
    avgCloseTimeHours,
    recentIssueCount: recentIssues.length,
  };
}

// Check engineering quality indicators
export async function fetchEngineeringData(
  owner: string,
  repo: string,
  token: string
): Promise<EngineeringData> {
  const checks = [
    { path: ".github/workflows", key: "hasCiCd" as const },
    { path: "Dockerfile", key: "hasDocker" as const },
    { path: "tests", key: "hasTests" as const },
    { path: ".eslintrc", key: "hasLinting" as const },
    { path: ".eslintrc.js", key: "hasLinting" as const },
    { path: ".eslintrc.json", key: "hasLinting" as const },
    { path: "eslint.config.js", key: "hasLinting" as const },
    { path: "eslint.config.mjs", key: "hasLinting" as const },
    { path: "CONTRIBUTING.md", key: "hasContributing" as const },
    { path: "CHANGELOG.md", key: "hasChangelog" as const },
  ];

  const result: EngineeringData = {
    hasCiCd: false,
    hasDocker: false,
    hasTests: false,
    hasLinting: false,
    hasContributing: false,
    hasChangelog: false,
    fileCount: 0,
  };

  // Check each path
  for (const check of checks) {
    try {
      const res = await githubFetch(
        `/repos/${owner}/${repo}/contents/${check.path}`,
        token
      );
      if (res.ok) {
        result[check.key] = true;
      }
    } catch {
      // Path doesn't exist, continue
    }
  }

  // Get root directory listing for file count estimate
  try {
    const res = await githubFetch(
      `/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      token
    );
    const data = await res.json();
    result.fileCount = data.tree?.length || 0;
  } catch {
    // Skip if tree fetch fails
  }

  return result;
}
