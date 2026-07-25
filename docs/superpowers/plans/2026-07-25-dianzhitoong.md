# 店职通 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付可运行的 Web MVP：零售/服务业求职闭环（简历诊断、投递看板、模拟面试）。

**Architecture:** Next.js App Router 单体；Prisma+SQLite 作数据壳；`src/lib/ai` 自建 AI 核心（OpenAI 兼容，无 Key 降级）。

**Tech Stack:** Next.js 15、TypeScript、Tailwind CSS、Prisma、SQLite、bcryptjs、zod、OpenAI SDK（兼容模式）

## Global Constraints

- 第一赛道固定为 `retail-service`（优衣库类零售/服务）
- 必须登录才能进 `/app/*`
- AI 无 Key 时必须可演示（降级模式）
- 中文 UI 文案
- 不自动投第三方招聘站

---

## File Map

```
apps/web/                         # 或仓库根目录直接为 Next 应用
  prisma/schema.prisma
  src/app/(marketing)/page.tsx
  src/app/(auth)/login/page.tsx
  src/app/(auth)/register/page.tsx
  src/app/app/layout.tsx
  src/app/app/page.tsx
  src/app/app/resume/page.tsx
  src/app/app/applications/page.tsx
  src/app/app/interview/page.tsx
  src/app/api/auth/*/route.ts
  src/app/api/resumes/*/route.ts
  src/app/api/applications/*/route.ts
  src/app/api/interview/*/route.ts
  src/app/api/ai/**/route.ts
  src/lib/db.ts
  src/lib/auth.ts
  src/lib/ai/client.ts
  src/lib/ai/prompts/retail-service.ts
  src/lib/ai/resume.ts
  src/lib/ai/interview.ts
  src/lib/ai/fallback.ts
  docs/PRODUCT.md
  docs/PROMPTS.md
  README.md
```

---

### Task 1: 脚手架与数据壳

**Files:**
- Create: `package.json`, `prisma/schema.prisma`, `src/lib/db.ts`, auth 相关

- [ ] 初始化 Next.js + Tailwind + Prisma + SQLite
- [ ] 建表 User/Resume/ResumeReview/Application/Interview*
- [ ] 实现注册/登录/登出与 session
- [ ] 验证：注册后能进入 `/app`

### Task 2: 简历模块 + AI 诊断

**Files:**
- Create: resume pages/API, `src/lib/ai/resume.ts`, prompts

- [ ] 简历 CRUD（结构化表单）
- [ ] `diagnose` / `match-jd` API
- [ ] 无 Key 降级报告
- [ ] 验证：保存简历并看到诊断 JSON 渲染

### Task 3: 投递看板

**Files:**
- Create: applications page/API

- [ ] 增删改查 + 状态流转
- [ ] 简易统计
- [ ] 验证：三条记录状态可变

### Task 4: 模拟面试 + 复盘

**Files:**
- Create: interview UI/API, `src/lib/ai/interview.ts`

- [ ] 创建会话、多轮对话、结束生成报告
- [ ] 零售场景题种子
- [ ] 验证：≥5 轮后有复盘

### Task 5: 文档与验收

**Files:**
- Create: `README.md`, `docs/PRODUCT.md`, `docs/PROMPTS.md`

- [ ] 说明文档、开发步骤、完整提示词
- [ ] `npm run build` 通过
- [ ] 手测闭环清单打勾

---

## 执行说明

本计划在同会话内连续执行直至可运行 MVP；细节代码以仓库实际文件为准。
