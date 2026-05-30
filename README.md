# 🔥 RepoRoast — AI 开源项目毒舌评审官

> Paste a GitHub repo URL. Get a brutally honest review in 10 seconds.

<a href="https://github.com/ppppddddllll/repo-roast"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-repo--roast-black?logo=github"></a>
<a href="https://github.com/ppppddddllll/repo-roast/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/ppppddddllll/repo-roast"></a>

---

## 使用说明

### 1. 获取 API Key

需要两个 Key，都是免费的：

| Key | 获取地址 | 说明 |
|-----|----------|------|
| GitHub Token | https://github.com/settings/tokens | 点 "Generate new token (classic)"，勾选 `public_repo`，生成后复制 |
| DeepSeek API Key | https://platform.deepseek.com/api_keys | 注册后点 "创建 API Key"，复制（新用户有免费额度） |

### 2. 安装启动

```bash
# 克隆仓库
git clone https://github.com/ppppddddllll/repo-roast.git
cd repo-roast

# 配置 Key
cp .env.local.example .env.local
# 用记事本打开 .env.local（右键 → 打开方式 → 记事本），按下面格式填入：
# GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
# DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# 安装依赖
npm install

# 启动
npm run dev
```

浏览器打开 `http://localhost:3000`

### 3. 使用

1. 粘贴任意 GitHub 仓库链接，例如 `https://github.com/facebook/react`
2. 选择模式：
   - **毒舌模式** — 幽默犀利点评
   - **投资人模式** — VC 视角 YES/NO
   - **面试官模式** — 录取概率评估
3. 点击 **Roast!**
4. 10 秒内得到分析结果

---

## 功能

| 模式 | 说明 |
|------|------|
| 🔥 **毒舌模式** | 幽默犀利点评，一针见血指出问题 |
| 💰 **投资人模式** | 模拟 VC 评估：YES/NO + 投资理由 |
| 🎓 **面试官模式** | 评估作者录取概率，分维度点评 |

### 评分维度

- **文档质量** — README 长度、截图、安装指南、贡献指南
- **工程质量** — CI/CD、Docker、测试、Linting
- **活跃度** — 近 30 天 commit、Issue 关闭速度
- **市场潜力** — 描述清晰度、Star 数、话题标签

---

## Demo

```text
输入: https://github.com/xxx/yyy

输出:
━━━━━━━━━━━━━━━━━━━━━━━━
Repo Score: 73/100

Documentation:  82  ████████████████░░░░
Engineering:    71  ██████████████░░░░░░
Activity:       65  █████████████░░░░░░░
Marketability:  54  ███████████░░░░░░░░░
━━━━━━━━━━━━━━━━━━━━━━━━

💬 你写的是一个工具，但 README 看起来像刑侦报告。
   潜在用户需要看完 4 个章节才知道项目到底干什么。

📋 建议：
   1. 添加首页截图 — 一张图胜过 200 行说明
   2. 增加 Quick Start — 3 行命令搞定
   3. 缩短介绍部分 — 把"为什么做这个项目"放到最后
```

---

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS v4 + shadcn/ui
- **AI**: DeepSeek API (OpenAI 兼容)
- **数据**: GitHub REST API

---

## License

MIT
