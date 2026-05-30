import { NextResponse } from "next/server";
import { parseGitHubUrl } from "@/lib/github";
import {
  fetchRepoInfo,
  fetchReadme,
  fetchCommitStats,
  fetchIssueStats,
  fetchEngineeringData,
} from "@/lib/github";
import { calculateScores, buildRepoSummary } from "@/lib/scorer";
import { buildChatMessages, callDeepSeekApi, parseAiResponse } from "@/lib/prompts";
import type { AnalysisMode, ApiError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { repoUrl, mode = "roast" as AnalysisMode } = body;

    // Validate inputs
    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "请提供 GitHub 仓库 URL", code: "MISSING_URL" } as ApiError,
        { status: 400 }
      );
    }

    if (!["roast", "investor", "hiring"].includes(mode)) {
      return NextResponse.json(
        { error: "无效的分析模式", code: "INVALID_MODE" } as ApiError,
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error: "无效的 GitHub URL，格式应为 https://github.com/owner/repo",
          code: "INVALID_URL",
        } as ApiError,
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        {
          error: "未配置 GITHUB_TOKEN，请在 .env.local 中设置",
          code: "MISSING_GITHUB_TOKEN",
        } as ApiError,
        { status: 500 }
      );
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      return NextResponse.json(
        {
          error: "未配置 DEEPSEEK_API_KEY，请在 .env.local 中设置",
          code: "MISSING_DEEPSEEK_KEY",
        } as ApiError,
        { status: 500 }
      );
    }

    const { owner, repo } = parsed;

    // Fetch all data in parallel
    const [repoInfo, readme, commits, issues, engineering] =
      await Promise.all([
        fetchRepoInfo(owner, repo, githubToken),
        fetchReadme(owner, repo, githubToken),
        fetchCommitStats(owner, repo, githubToken),
        fetchIssueStats(owner, repo, githubToken),
        fetchEngineeringData(owner, repo, githubToken),
      ]);

    // Calculate scores
    const scores = calculateScores(repoInfo, readme, commits, issues, engineering);

    // Build summary for AI
    const summary = buildRepoSummary(
      repoInfo,
      readme,
      commits,
      issues,
      engineering
    );

    // Call AI for roast/analysis
    const messages = buildChatMessages(mode, summary, scores);
    const aiText = await callDeepSeekApi(
      messages,
      deepseekKey,
      process.env.DEEPSEEK_BASE_URL
    );

    // Parse AI response
    const { roast, suggestions, verdict } = parseAiResponse(aiText, mode);

    return NextResponse.json({
      repoInfo,
      readme: {
        length: readme.length,
        hasScreenshots: readme.hasScreenshots,
        hasDemo: readme.hasDemo,
        hasGif: readme.hasGif,
        hasInstallGuide: readme.hasInstallGuide,
        hasQuickStart: readme.hasQuickStart,
        hasContributing: readme.hasContributing,
        hasBadges: readme.hasBadges,
        wordCount: readme.wordCount,
        sectionCount: readme.sectionCount,
      },
      scores,
      roast,
      suggestions,
      verdict,
      mode,
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "分析过程中发生未知错误";

    let code = "UNKNOWN_ERROR";
    if (message.includes("rate limit")) code = "RATE_LIMIT";
    else if (message.includes("not found") || message.includes("not Found"))
      code = "NOT_FOUND";
    else if (message.includes("Invalid GitHub token")) code = "INVALID_TOKEN";
    else if (message.includes("DeepSeek")) code = "AI_ERROR";

    return NextResponse.json(
      { error: message, code } as ApiError,
      { status: 500 }
    );
  }
}
