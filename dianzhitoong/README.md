# 店职通 · 应用目录

本目录为可运行的 Next.js 应用。仓库总览与安装说明见上级 [`../README.md`](../README.md)。

## 本地运行

```bash
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

打开 http://localhost:3000

## 生产构建

```bash
npm run build
npm run start
```

## 相关文档

- [产品说明](./docs/PRODUCT.md)
- [部署说明](./docs/DEPLOY.md)
- [AI 提示词](./docs/PROMPTS.md)
