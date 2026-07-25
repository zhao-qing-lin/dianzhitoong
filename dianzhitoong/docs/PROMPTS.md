# 店职通 · AI 提示词说明

源码位置：`src/lib/ai/prompts/retail-service.ts`  
调用封装：`src/lib/ai/resume.ts`、`src/lib/ai/interview.ts`

---

## 1. 赛道系统基座 `SYSTEM_BASE`

专注中国大学生零售/服务业校招（门店、管培、客服等）。要求输出合法 JSON。

---

## 2. 简历诊断 / JD 匹配 / PDF 解析 / 模拟面试

详见源码中的：

- `DIAGNOSE_PROMPT`
- `MATCH_JD_PROMPT`
- `PARSE_PDF_PROMPT`
- `INTERVIEW_TURN_PROMPT`
- `INTERVIEW_REPORT_PROMPT`

---

## 3. 给后续 Agent 的开发提示词

```
你在维护「店职通」Next.js 项目（仓库内 dianzhitoong/ 目录）。
约束：
1. 第一赛道固定 retail-service（零售/服务业），不要改成互联网岗。
2. 保持闭环：简历诊断、投递看板、模拟面试。
3. AI 调用必须走 src/lib/ai/*；无 OPENAI_API_KEY 时必须降级可用。
4. 所有用户数据按 userId 隔离。
5. 改 Prompt 只改 src/lib/ai/prompts/retail-service.ts，并同步 docs/PROMPTS.md。
6. 对外文档不要写个人姓名、本机绝对路径。
先阅读仓库根 README.md 与 docs/superpowers/specs/ 设计文档，再改代码。
```
