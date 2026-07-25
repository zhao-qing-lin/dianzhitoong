# 店职通（DianZhiTong）设计规格

> 日期：2026-07-25  
> 状态：已按用户授权定稿（零售/服务业求职方向；其余决策由实现方拍板）  
> 目标：大学生求职轻量闭环 Web 产品（第一赛道：零售/服务业，如优衣库门店/管培）

---

## 1. 产品定位

**一句话**：帮临近毕业的大学生，在零售/服务业校招里「写好简历 → 管住投递 → 练会面试」。

**第一版不做**：大一发展方向全套、自动投招聘网站、语音/视频面试、多赛道同时开工。

**可扩展口子**：`track` 赛道包；未来可加「发展方向」模块而不推翻主架构。

---

## 2. 架构决策（方案 3：数据壳 + 自建 AI 核心）

| 决策 | 选择 | 原因 |
|------|------|------|
| 形态 | Web（Next.js App Router） | 简历编辑与看板适合桌面；一人交付最快 |
| 数据壳 | Prisma + SQLite（本地即跑） | 无需先配云账号即可出成品；接口按「可换 Supabase」抽象 |
| 生产升级 | 可换 PostgreSQL / Supabase | Auth + DB 同构迁移 |
| AI 核心 | `src/lib/ai/*` + Route Handlers | 诊断/模拟面试与 CRUD 解耦，方便换模型与改 Prompt |
| 模型 | OpenAI 兼容 API（可配国内中转） | 强 AI；无 Key 时走规则+模板降级，保证可演示 |
| 鉴权 | 邮箱密码登录（本地会话 Cookie） | 满足「必须登录 + 云端/持久化同步」 |
| 赛道 | `retail-service` 示范包 | 优衣库类：门店销售、储备干部/管培、客服等 |

```
浏览器 Web UI
    ↓
Auth + 业务 API（简历 / 投递 / 面试会话）
    ↓
Prisma 数据壳（SQLite → 可升 Postgres）
    ↓
AI 核心（Prompt + 赛道包 + LLM Client）
    ↓
大模型 API（可选；无 Key 则降级）
```

---

## 3. 用户闭环（MVP）

### 3.1 简历可投
- 创建/编辑结构化简历（基本信息、教育、经历、技能、自我评价）
- 选择目标岗位类型（门店兼职/全职、管培生、客服等）
- 一键「AI 诊断」：打分、硬伤、改写建议、服务业话术示例
- 可粘贴 JD，做「简历 ↔ JD」匹配建议

### 3.2 投递可记
- 投递看板：公司、岗位、渠道、状态、日期、备注
- 状态机：`wishlist → applied → screening → interview → offer → rejected → withdrawn`
- 列表筛选 + 简单统计（进行中/面试中/已结束）

### 3.3 面试可练
- 选择岗位画像 + 面试轮次（一面/二面/终面）
- 多轮文字模拟面试（服务业场景题：服务冲突、销售达成、加班排班、团队协作等）
- 结束后 AI 复盘：表达、岗位匹配、STAR、改进话术

---

## 4. 数据模型（核心表）

- `User`：id, email, passwordHash, name, trackId, createdAt
- `Resume`：id, userId, title, targetRole, contentJson, updatedAt
- `ResumeReview`：id, resumeId, jdText?, resultJson, createdAt
- `Application`：id, userId, company, role, channel, status, appliedAt, nextAction, notes
- `InterviewSession`：id, userId, roleProfile, round, status, createdAt
- `InterviewMessage`：id, sessionId, role(user|assistant|system), content, createdAt
- `InterviewReport`：id, sessionId, resultJson, createdAt

`contentJson` / `resultJson` 存结构化对象，避免过早拆过多列。

---

## 5. AI 核心接口

| 接口 | 用途 |
|------|------|
| `POST /api/ai/resume/diagnose` | 简历诊断 |
| `POST /api/ai/resume/match-jd` | 简历与 JD 匹配 |
| `POST /api/ai/interview/turn` | 模拟面试下一轮 |
| `POST /api/ai/interview/report` | 面试复盘 |

所有 AI 调用：
1. 注入 `tracks/retail-service` 系统提示与题库种子  
2. 要求模型返回可解析 JSON（失败则降级模板）  
3. 记录不落敏感明文到日志  

---

## 6. 页面信息架构

- `/` 产品介绍 + 进入工作台  
- `/login` `/register` 鉴权  
- `/app` 工作台总览（三步进度）  
- `/app/resume` 简历编辑与诊断  
- `/app/applications` 投递看板  
- `/app/interview` 模拟面试  
- `/app/settings` API Key 可选覆盖（开发方便；生产用环境变量）

视觉方向：干净、务实、零售感（暖中性色 + 清晰层级），避免紫渐变模板风。

---

## 7. 非功能要求

- 无 LLM Key 时：核心 CRUD 全可用；AI 返回「规则引擎降级结果」，页面标明「演示模式」  
- 密码哈希存储；会话 Cookie HttpOnly  
- 单用户数据隔离（所有查询带 userId）  
- README 含：安装、环境变量、开发步骤、Prompt 位置  

---

## 8. 成功标准（MVP 验收）

1. 能注册登录并持久化数据（重启不丢）  
2. 能完成一份零售岗简历并得到诊断报告  
3. 能新增/更新至少 3 条投递状态  
4. 能完成一场 ≥5 轮的模拟面试并看到复盘  
5. 文档齐全：说明文档 + 开发步骤 + 系统提示词  

---

## 9. 后续扩展（非本版）

- 大一「发展方向」测评与四年路线  
- 更多赛道包（互联网、教育、金融）  
- 微信小程序壳  
- 语音面试  
- Supabase 云端多端同步