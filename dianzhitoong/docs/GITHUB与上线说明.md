# GitHub 能不能当跳板？

## 简短结论

**不能。** GitHub / GitHub Pages **不能**直接跑店职通这种带：

- 登录注册  
- SQLite 数据库  
- PDF 上传  
- AI 接口  

的完整网站。

| 平台 | 能做什么 | 对本项目 |
|------|----------|----------|
| GitHub 仓库 | 存代码、版本管理 | ✅ 推荐用来备份代码 |
| GitHub Pages | 只托管静态网页（HTML/CSS/JS） | ❌ 跑不了 Next.js 服务端 |
| GitHub Actions | 自动构建、部署到别的服务器 | ✅ 可作为「跳板流程」，但还要有真正的运行环境 |

## 正确理解「跳板」

- **GitHub**：代码仓库（备份/协作）  
- **真正给别人打开的地方**：  
  - 方案 A：你家电脑 + Cloudflare Tunnel / cpolar（公网链接）  
  - 或云服务器 / 支持持久磁盘的 PaaS  

把代码推到 GitHub **不会自动变成一个别人能用的网站**。

## 推荐组合（以后）

1. 代码推 GitHub（备份）  
2. 当前先用 **Cloudflare Tunnel** 给朋友试用  
3. 正式后再上云服务器，可用 GitHub Actions 自动部署  
