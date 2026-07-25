# 店职通 · 上线部署说明

目标：让别人用浏览器打开你的网站。

---

## 方案怎么选

| 方案 | 适合 | 费用 | 稳定性 |
|------|------|------|--------|
| A. 内网穿透（Cloudflare Tunnel / cpolar） | 先给朋友试用 | 免费/低 | 依赖你家电脑开机 |
| B. 云服务器 Docker（推荐正式上线） | 正式对外 | 约几十元/月 | 高 |
| C. 仅局域网 | 同一 WiFi 同学试用 | 免费 | 仅内网 |

当前技术栈（SQLite + 本地上传 PDF）**更适合 A/B**，不太适合直接丢到纯 Serverless（如默认 Vercel）。

---

## 方案 A：最快公网（本机 + 穿透）

1. 本机双击 `C:\庆林\启动服务.bat`，确认 http://localhost:3000 能开  
2. 安装 [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) 或国内 [cpolar](https://www.cpolar.com/)  
3. 把本地 3000 映射成公网 HTTPS 链接，发给别人即可  

注意：你电脑关机/休眠后，别人就打不开。

---

## 方案 B：云服务器正式上线（推荐）

准备：一台 Linux 云主机（阿里云/腾讯云轻量即可，2核2G 起），开放安全组 **22 / 80 / 443 / 3000**。

### 1. 上传代码到服务器

把 `G:\庆林\杨瑞\dianzhitoong` 整包传到服务器，例如 `/opt/dianzhitoong`。

### 2. 配置环境变量

```bash
cd /opt/dianzhitoong
cp .env.production.example .env.production
# 编辑填入 AUTH_SECRET、OPENAI_API_KEY
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

1. 启动服务后，在本机查局域网 IP（如 `192.168.1.8`）  
2. 同学访问 `http://192.168.1.8:3000`  
3. Windows 防火墙需放行 3000 端口  

---

## 上线检查清单

- [ ] 已更换强随机 `AUTH_SECRET`（不要用开发默认值）  
- [ ] DeepSeek Key 有效、额度够  
- [ ] 能注册/登录  
- [ ] 能上传 PDF / 诊断 / 投递 / 面试  
- [ ] 不要把 `.env` / `.env.production` 发到公开仓库  
