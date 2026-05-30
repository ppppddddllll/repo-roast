# 🔥 RepoRoast — AI 开源项目毒舌评审官

> Paste a GitHub repo URL. Get a brutally honest review in 10 seconds.

<a href="https://github.com/ppppddddllll/repo-roast"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-repo--roast-black?logo=github"></a>
<a href="https://github.com/ppppddddllll/repo-roast/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/ppppddddllll/repo-roast"></a>

---

## 从零开始教程

---

### 第 0 步：安装 Node.js

这是运行本项目必需的环境。

1. 打开 https://nodejs.org
2. 点击左边绿色的 **LTS** 按钮，下载安装包（`.msi` 文件）
3. 双击下载的文件，一路点 **Next**，全部保持默认选项，最后点 **Install**
4. 安装完成后，打开 **命令提示符**（按 `Win + R`，输入 `cmd`，回车）

```cmd
node --version
```

如果显示 `v22.x.x` 之类的版本号，说明安装成功。

---

### 第 1 步：获取 API Key

项目需要两个免费 Key，分别用于读取 GitHub 数据和调用 AI。

#### 1.1 GitHub Token

1. 浏览器打开 https://github.com/settings/tokens
2. 点 **Generate new token** → **Generate new token (classic)**
3. **Note** 随便填，比如 `repo-roast`
4. **Expiration** 选 `No expiration`
5. 勾选 `public_repo`（只勾这一个就够了）
6. 拉到页面底部，点绿色的 **Generate token**
7. 页面会显示一串 `ghp_` 开头的字符，**立刻复制保存**（关掉页面就看不到了）

#### 1.2 DeepSeek API Key

1. 浏览器打开 https://platform.deepseek.com/api_keys
2. 点 **创建 API Key**，随便起个名字
3. 复制显示的 `sk-` 开头的 Key

---

### 第 2 步：下载项目

**方法 A：用 Git 克隆（推荐）**

如果你已经装了 Git，打开命令提示符：

```cmd
git clone https://github.com/ppppddddllll/repo-roast.git
```

然后跳到第 3 步。

**方法 B：直接下载 ZIP（没装 Git 也能用）**

1. 浏览器打开 https://github.com/ppppddddllll/repo-roast
2. 点绿色的 **Code** 按钮 → **Download ZIP**
3. 下载完成后解压：
   - 右键 `repo-roast-main.zip` → **全部解压缩**
   - 解压到桌面或你记得住的地方
4. 重命名文件夹：`repo-roast-main` → `repo-roast`

---

### 第 3 步：配置 API Key

1. 打开项目文件夹（如果下载的 ZIP，进 `repo-roast` 文件夹）
2. 找到 `.env.local` 文件
3. 右键 `.env.local` → **打开方式** → **记事本**
4. 把里面的内容改成你第 1 步获取的 Key：

```
GITHUB_TOKEN=ghp_你的GitHub Token
DEEPSEEK_API_KEY=sk-你的DeepSeek Key
```

5. 按 `Ctrl + S` 保存，关掉记事本

---

### 第 4 步：安装依赖

打开命令提示符，进入项目文件夹：

```cmd
cd C:\Users\你的用户名\Desktop\repo-roast
```

（如果你解压到了桌面；如果放在别处，把路径换成对应的）

然后运行：

```cmd
npm install
```

等待 1-2 分钟，屏幕滚动结束后看到光标重新出现，说明安装完成。

---

### 第 5 步：启动

```cmd
npm run dev
```

看到以下输出说明启动成功：

```
▲ Next.js 16.x.x
- Local:         http://localhost:3000
✓ Ready
```

---

### 第 6 步：使用

1. 浏览器打开 `http://localhost:3000`
2. 粘贴任意 GitHub 仓库链接，比如：
   - `https://github.com/facebook/react`
   - `https://github.com/torvalds/linux`
   - 或者你自己的仓库
3. 选择一个模式：
   - **🔥 毒舌模式** — 幽默犀利点评你的项目
   - **💰 投资人模式** — 假装 VC 判断值不值得投
   - **🎓 面试官模式** — 如果是你写的，录取概率多大
4. 点 **Roast!** 按钮
5. 等 10 秒，查看 AI 给你的毒舌评审报告

---

### 常见问题

| 问题 | 解决方法 |
|------|----------|
| `node` 不是内部命令 | Node.js 没装好，回到第 0 步重装 |
| `npm install` 报错 | 检查网络连接，或换国内镜像：`npm config set registry https://registry.npmmirror.com` |
| 页面打开但是分析报错 | 检查 `.env.local` 里的 Key 是否填对了，不能有空格 |
| `GitHub API rate limit exceeded` | 没填 GitHub Token，或者填的是错的 |

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
