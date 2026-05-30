import type { AnalysisMode, Scores } from "./types";

const ROAST_SYSTEM_PROMPT = `You are a brutally honest but professional Silicon Valley investor who reviews open-source projects with razor-sharp wit.

Your review style:
- Point out specific, concrete flaws with humor (e.g., "Your README has 37 words, and 52 of them are in the install section")
- Use data to back up your roasts: mention word counts, star counts, missing files
- Never attack the author personally - only roast the project itself
- End with constructive, actionable suggestions
- Be funny but not cruel - the developer should laugh, then fix their project
- Keep it concise: 3-5 sentences of roast + 3-5 bullet-point suggestions

CRITICAL: Write in Chinese. The roast and suggestions must be in Chinese.`;

const INVESTOR_SYSTEM_PROMPT = `You are a top-tier VC partner evaluating open-source projects for investment.

Your evaluation criteria:
- Market size and clarity of the problem being solved
- Competitive landscape: is this project differentiated?
- Technical quality signals (CI/CD, tests, documentation)
- Community health (stars, activity, issue resolution)
- Whether the project description clearly communicates value

Give a YES or NO decision with 3 specific reasons.
Be direct and honest - founders appreciate candor over politeness.

CRITICAL: Write in Chinese.`;

const HIRING_SYSTEM_PROMPT = `You are a tech lead at a major tech company reviewing a candidate's open-source project as part of their internship application.

Evaluate the author based on their repository from these dimensions:
1. Code quality & engineering practices (CI/CD, tests, linting)
2. Documentation skills (README quality, comments)
3. Problem-solving ability (what problem does this solve, how well)
4. Communication skills (can they explain what they built)

Give an estimated internship admission probability (0-100%) and explain why.
Be honest but constructive - candidates appreciate real feedback.

CRITICAL: Write in Chinese.`;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getSystemPrompt(mode: AnalysisMode): string {
  switch (mode) {
    case "roast":
      return ROAST_SYSTEM_PROMPT;
    case "investor":
      return INVESTOR_SYSTEM_PROMPT;
    case "hiring":
      return HIRING_SYSTEM_PROMPT;
    default:
      return ROAST_SYSTEM_PROMPT;
  }
}

function getUserPrompt(
  mode: AnalysisMode,
  summary: string,
  scores: Scores
): string {
  const scoreBlock = `
Scores:
- Overall: ${scores.overall}/100
- Documentation: ${scores.documentation}/100
- Engineering: ${scores.engineering}/100
- Activity: ${scores.activity}/100
- Marketability: ${scores.marketability}/100
`.trim();

  switch (mode) {
    case "roast":
      return `${scoreBlock}

--- Repository Data ---
${summary}

请根据以上数据，对这个开源项目给出毒舌但专业的点评。要求：
1. 3-5句幽默犀利的吐槽（基于具体数据，如README字数、缺失的配置等）
2. 3-5条可操作的改进建议
3. 格式：先输出吐槽段落，然后以"建议："开头列出改进点。`;

    case "investor":
      return `${scoreBlock}

--- Repository Data ---
${summary}

作为投资人，请评估这个项目。要求：
1. 给出 YES/NO 的投资决策
2. 列出3个具体理由
3. 格式：先输出"Decision: YES"或"Decision: NO"，然后输出"Reasons:"罗列理由。`;

    case "hiring":
      return `${scoreBlock}

--- Repository Data ---
${summary}

如果这个项目的作者投递贵公司实习岗位，请评估录取概率。要求：
1. 给出录取概率百分比（0-100%）
2. 从代码质量、文档能力、问题解决能力、沟通能力4个维度各写1句评价
3. 格式：先输出"录取概率: XX%"，然后分维度评价。`;

    default:
      return summary;
  }
}

export function buildChatMessages(
  mode: AnalysisMode,
  summary: string,
  scores: Scores
): ChatMessage[] {
  return [
    { role: "system", content: getSystemPrompt(mode) },
    { role: "user", content: getUserPrompt(mode, summary, scores) },
  ];
}

export async function callDeepSeekApi(
  messages: ChatMessage[],
  apiKey: string,
  baseUrl?: string
): Promise<string> {
  const url = `${baseUrl || "https://api.deepseek.com"}/v1/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 1024,
      temperature: 0.8, // Higher temperature for more creative roast
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg =
      (errorData as { error?: { message?: string } })?.error?.message ||
      `DeepSeek API error: ${response.status}`;
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  return content;
}

// Parse AI response into structured format
export function parseAiResponse(
  text: string,
  mode: AnalysisMode
): { roast: string; suggestions: string[]; verdict: string } {
  switch (mode) {
    case "roast":
      return parseRoastResponse(text);
    case "investor":
      return parseInvestorResponse(text);
    case "hiring":
      return parseHiringResponse(text);
    default:
      return parseRoastResponse(text);
  }
}

function parseRoastResponse(text: string): {
  roast: string;
  suggestions: string[];
  verdict: string;
} {
  // Split at "建议：" marker
  const parts = text.split(/建议[：:]/);
  const roast = parts[0]?.trim() || text;
  const suggestionsText = parts[1]?.trim() || "";

  // Parse numbered/ bullet suggestions
  const suggestions = suggestionsText
    .split(/\n/)
    .map((line) => line.replace(/^[\d]+[\.\、\)]\s*/, "").replace(/^[-*•]\s*/, "").trim())
    .filter((s) => s.length > 0);

  return { roast, suggestions, verdict: "" };
}

function parseInvestorResponse(text: string): {
  roast: string;
  suggestions: string[];
  verdict: string;
} {
  const isYes = /decision[:\s]*yes/i.test(text);
  const isNo = /decision[:\s]*no/i.test(text);
  const verdict = isYes ? "YES" : isNo ? "NO" : "UNDECIDED";

  const reasonsMatch = text.match(
    /reasons?[：:]\s*([\s\S]+)/i
  );
  const reasonsText = reasonsMatch?.[1] || text;
  const suggestions = reasonsText
    .split(/\n/)
    .map((line) => line.replace(/^[\d]+[\.\、\)]\s*/, "").replace(/^[-*•]\s*/, "").trim())
    .filter((s) => s.length > 2);

  return { roast: text.trim(), suggestions, verdict };
}

function parseHiringResponse(text: string): {
  roast: string;
  suggestions: string[];
  verdict: string;
} {
  const probMatch = text.match(/录取概率[：:\s]*(\d+)%/);
  const verdict = probMatch ? `${probMatch[1]}%` : "N/A";

  return { roast: text.trim(), suggestions: [], verdict };
}
