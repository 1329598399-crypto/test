# 网页分享 — 让别人用浏览器访问 Demo

构建产物目录：`miniapp/dist/`（纯静态，无需后端）

```powershell
cd miniapp
npm run build
```

---

## 方式一：Netlify 拖拽（最快，推荐）

适合：产品评审、发给同事/客户一个 https 链接，**约 1 分钟**。

1. 本地执行 `npm run build`
2. 打开 [https://app.netlify.com/drop](https://app.netlify.com/drop)（可用 GitHub / 邮箱注册，免费）
3. 把 **`dist` 整个文件夹** 拖进页面
4. 等待上传完成，会得到类似 `https://random-name-123.netlify.app` 的地址
5. 复制链接发给别人即可

> 子页面刷新已配置 SPA 回退（`public/_redirects` 已打进 dist）。

---

## 方式二：Netlify CLI（可固定域名前缀）

```powershell
cd miniapp
npm run deploy:netlify
```

首次运行会打开浏览器登录 Netlify，按提示完成即可。成功后终端会打印 **Production URL**。

---

## 方式三：Vercel

```powershell
cd miniapp
npm run deploy:vercel
```

首次需登录 Vercel 账号。部署完成后得到 `https://xxx.vercel.app`。

---

## 方式四：仅同一 WiFi / 内网

```powershell
cd miniapp
npm run preview:host
```

把终端里 **Network** 一行（如 `http://192.168.1.8:4173`）发给同网段同事。  
你的电脑需保持运行，关机后链接失效。

---

## 演示账号

| 角色 | 手机号 |
|------|--------|
| 普通用户 | 13800138001 |
| 会员 | 13800138002 |

数据保存在访问者浏览器 localStorage，互不影响。

---

## 更新 Demo 后

改代码 → 重新 `npm run build` → Netlify 拖拽新 dist，或在 Netlify/Vercel 控制台 **Redeploy** / 再跑 CLI 命令。
