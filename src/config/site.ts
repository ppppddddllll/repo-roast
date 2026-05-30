export const SITE_CONFIG = {
  name: "RepoRoast",
  tagline: "AI-Powered GitHub Repository Reviewer",
  description:
    "Paste a GitHub repo URL. Get a brutally honest review in 10 seconds.",
  github: "https://github.com/ppppddddllll/repo-roast",
  version: "0.1.0",
} as const;

export const GITHUB_API_BASE = "https://api.github.com";

export const SCORE_WEIGHTS = {
  documentation: 0.3,
  engineering: 0.25,
  activity: 0.2,
  marketability: 0.25,
} as const;

export const ACTIVITY_WINDOW_DAYS = 30;

export const MODE_LABELS: Record<string, string> = {
  roast: "Roast Mode",
  investor: "Investor Mode",
  hiring: "Hiring Manager Mode",
};
