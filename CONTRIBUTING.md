# Contributing to RepoRoast

欢迎贡献！不管你是修 bug、提建议还是加功能，都欢迎。

---

## 怎么贡献

### 提 Issue

1. 先去 [Issues](https://github.com/ppppddddllll/repo-roast/issues) 搜一下有没有人提过同样的问题
2. 没有就点 **New Issue**
3. 写清楚：你遇到了什么、期望是什么、截图/报错信息

### 提 PR

1. Fork 本项目
2. 创建分支：`git checkout -b fix/something`
3. 改代码
4. 确保通过：`npm run lint && npm test && npm run build`
5. 提交 PR，描述你改了什么、为什么改

---

## 项目结构速览

```
src/
├── app/
│   ├── api/analyze/route.ts   # POST 端点，串联数据采集→评分→AI
│   └── page.tsx                # 主页面
├── lib/
│   ├── types.ts                # 类型定义
│   ├── github.ts               # GitHub API 封装
│   ├── scorer.ts               # 评分引擎
│   └── prompts.ts              # AI Prompt 模板 + API 调用
└── components/ui/              # shadcn/ui 组件
```

---

## 本地开发

```bash
npm install
cp .env.local.example .env.local   # 如果没有 .env.local 的话，编辑填入 Key
npm run dev
```

改动前请先跑一遍 lint 和 test：

```bash
npm run lint
npm test
npm run build
```

---

## 代码风格

- TypeScript 严格模式
- 函数式编程，不写 class
- 函数不超过 50 行
- 用 `eslint` 保持一致

---

## 行为准则

- 友好交流，别喷人
- AI 吐槽只针对代码，不针对人
- 本项目适合新手练手，别担心 PR 质量不够好
