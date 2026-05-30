"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, GitFork, AlertCircle, Code, Calendar, Flame } from "lucide-react";
import type { AnalysisResult, AnalysisMode } from "@/lib/types";

const MODES: { value: AnalysisMode; label: string; desc: string }[] = [
  { value: "roast", label: "毒舌模式", desc: "幽默辣评" },
  { value: "investor", label: "投资人模式", desc: "投不投？" },
  { value: "hiring", label: "面试官模式", desc: "录取概率" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("roast");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url.trim()) return;

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: url.trim(), mode }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "分析失败，请重试");
          return;
        }

        setResult(data);
      } catch {
        setError("网络请求失败，请检查网络连接后重试");
      } finally {
        setLoading(false);
      }
    },
    [url, mode]
  );

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            RepoRoast
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-lg mb-8">
          AI 开源项目毒舌评审官
          <br />
          <span className="text-sm">
            粘贴 GitHub 仓库链接，10 秒获得一份毒舌但专业的评审报告
          </span>
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
          {/* Mode Selector */}
          <div className="flex justify-center gap-2 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  mode === m.value
                    ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/facebook/react"
              className="flex-1 h-12 px-4 rounded-xl border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "分析中..." : "Roast!"}
            </button>
          </div>
        </form>
      </section>

      {/* Results Section */}
      <section className="flex-1 px-4 pb-16 max-w-3xl mx-auto w-full" ref={resultRef}>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {result && <ResultDisplay result={result} />}
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>
          RepoRoast v0.1.0 · Built with Next.js & DeepSeek ·{" "}
          <a
            href="https://github.com/ppppddddllll/repo-roast"
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex items-center gap-4 py-8">
        <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
        <div>
          <p className="font-semibold text-destructive">分析失败</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ result }: { result: AnalysisResult }) {
  const { repoInfo, scores, roast, suggestions, verdict, mode } = result;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Repo Info Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{repoInfo.fullName}</h2>
              {repoInfo.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {repoInfo.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" /> {repoInfo.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" /> {repoInfo.forks.toLocaleString()}
                </span>
                {repoInfo.language && (
                  <span className="flex items-center gap-1">
                    <Code className="w-4 h-4" /> {repoInfo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(repoInfo.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className="text-4xl font-bold text-primary">
                {scores.overall}
              </div>
              <div className="text-xs text-muted-foreground">总分 / 100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "文档质量", score: scores.documentation },
          { label: "工程质量", score: scores.engineering },
          { label: "活跃度", score: scores.activity },
          { label: "市场潜力", score: scores.marketability },
        ].map((item) => (
          <Card key={item.label} className="text-center">
            <CardContent className="py-4">
              <div
                className={`text-2xl font-bold ${
                  item.score >= 70
                    ? "text-green-500"
                    : item.score >= 40
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {item.score}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.label}
              </div>
              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.score >= 70
                      ? "bg-green-500"
                      : item.score >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mode Badge + Verdict */}
      {(verdict || mode) && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            {mode === "roast" ? "毒舌模式" : mode === "investor" ? "投资人模式" : "面试官模式"}
          </Badge>
          {verdict && (
            <Badge
              variant={verdict === "YES" ? "default" : "destructive"}
            >
              {verdict}
            </Badge>
          )}
        </div>
      )}

      <Separator />

      {/* Roast / Analysis Text */}
      <Card>
        <CardContent className="py-6">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
            {roast}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">改进建议</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
