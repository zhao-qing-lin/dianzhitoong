# 店职通 DianZhiTong

面向大学生的 **零售 / 服务业求职助手**（门店销售、导购、管培、客服等校招场景）。

帮助解决：简历怎么写、投递进度怎么管、面试题怎么练。

**关键词：** 大学生求职、零售校招、服务业面试、简历诊断、模拟面试、投递看板、优衣库类岗位、Next.js

---

## 功能

| 模块 | 说明 |
|------|------|
| 简历可投 | 结构化填写 / 上传 PDF，AI 诊断与 JD 匹配 |
| 投递可记 | 投递看板与状态流转（想投 → 面试 → offer） |
| 面试可练 | 门店场景多轮模拟面试 + 自动复盘 |

第一赛道：零售 / 服务业（可扩展更多行业包）。

---

## 技术栈

- Next.js 15（App Router）+ TypeScript + Tailwind CSS  
- Prisma + SQLite（可升级 Postgres）  
- OpenAI 兼容 API（推荐 DeepSeek）  
- PDF 解析：`unpdf`

---

## 快速开始

```bash
git clone https://github.com/zhao-qing-lin/dianzhitoong.git
cd dianzhitoong/dianzhitoong
cp .env.example .env
# 编辑 .env：填写 AUTH_SECRET、OPENAI_API_KEY、OPENAI_BASE_URL、OPENAI_MODEL
npm install
npx prisma db push
npm run build
npm run start
```

浏览器打开：http://localhost:3000

开发模式可用：`npm run dev`

### 环境变量示例

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="换成随机长字符串"
OPENAI_API_KEY="你的密钥"
OPENAI_BASE_URL="https://api.deepseek.com/v1"
OPENAI_MODEL="deepseek-v4-flash"
```

未配置大模型密钥时，AI 能力会进入演示降级模式，核心流程仍可体验。

---

## 目录结构

```text
dianzhitoong/          # 应用本体
  src/                 # 页面、API、AI 核心
  prisma/              # 数据模型
  docs/                # 产品说明、部署、提示词
docs/superpowers/      # 设计规格与实施计划
```

---

## 部署

见 [`dianzhitoong/docs/DEPLOY.md`](./dianzhitoong/docs/DEPLOY.md)：

- 本机公网试用（Cloudflare Tunnel 等）  
- Docker / 云服务器正式部署  

---

## 文档

- [产品说明](./dianzhitoong/docs/PRODUCT.md)  
- [开发步骤](./dianzhitoong/docs/DEV_STEPS.md)  
- [AI 提示词](./dianzhitoong/docs/PROMPTS.md)  
- [设计规格](./docs/superpowers/specs/2026-07-25-dianzhitoong-design.md)  

---

## 分支

- `main`：稳定主干  
- `feat/dianzhitoong-mvp`：功能开发分支  

---

## License

MIT（若需调整许可，可在仓库中补充 `LICENSE` 文件）。

---

欢迎 Star / Issue / PR。适合作为大学生求职工具、零售服务业校招练习项目，或二次开发的基础脚手架。
