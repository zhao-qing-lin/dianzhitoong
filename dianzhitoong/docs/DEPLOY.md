# 店职通 · 上线部署说明

目标：让其他人用浏览器访问你的服务。

---

## 方案怎么选

| 方案 | 适合 | 费用 | 稳定性 |
|------|------|------|--------|
| A. 内网穿透（Cloudflare Tunnel / cpolar） | 先给朋友试用 | 免费/低 | 依赖本机开机 |
| B. 云服务器 Docker（推荐正式上线） | 正式对外 | 约几十元/月 | 高 |
| C. 仅局域网 | 同一 WiFi 试用 | 免费 | 仅内网 |

当前技术栈（SQLite + 本地上传 PDF）**更适合 A/B**，不太适合直接丢到纯 Serverless（如默认 Vercel）。

---

## 方案 A：最快公网（本机 + 穿透）

1. 本地启动应用，确认 http://localhost:3000 可访问  
2. 安装 [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) 或国内 [cpolar](https://www.cpolar.com/)  
3. 将本机 `3000` 端口映射为公网 HTTPS 链接并分享  

注意：本机关机/休眠后，外网将无法访问。国内网络访问 Cloudflare 可能不稳定。

---

## 方案 B：云服务器正式上线（推荐）

准备：一台 Linux 云主机（2 核 2G 起），开放安全组 **22 / 80 / 443 / 3000**。

### 1. 上传代码

将仓库中的 `dianzhitoong/` 目录部署到服务器，例如 `/opt/dianzhitoong`。

### 2. 配置环境变量

```bash
cd /opt/dianzhitoong
cp .env.production.example .env.production
# 编辑填入 AUTH_SECRET、OPENAI_API_KEY 等
```

### 3. 启动

```bash
docker compose up -d --build
```

浏览器访问：`http://服务器公网IP:3000`

### 4.（可选）绑域名 + HTTPS

用 Nginx / Caddy 反代到 `127.0.0.1:3000`，并申请证书。

---

## 方案 C：同一 WiFi 试用

1. 启动服务后查看本机局域网 IP  
2. 同网设备访问 `http://局域网IP:3000`  
3. 如有系统防火墙，需放行 3000 端口  

---

## 上线检查清单

- [ ] 已更换强随机 `AUTH_SECRET`  
- [ ] 大模型 Key 有效、额度充足  
- [ ] 能注册 / 登录  
- [ ] 能上传 PDF / 诊断 / 投递 / 面试  
- [ ] 不要把 `.env` / `.env.production` 提交到公开仓库  
