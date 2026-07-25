# 开发步骤

1. 进入应用目录 `dianzhitoong/`
2. 配置 `.env`（参考 `.env.example`）
3. `npm install` → `npx prisma db push` → `npm run dev`
4. 改代码后验收：注册登录、简历/PDF、投递看板、模拟面试
5. 发版前执行 `npm run build`

给 AI Agent 的约束见 [PROMPTS.md](./PROMPTS.md)。
