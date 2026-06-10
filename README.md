# 家庭医生小程序 Demo（React）

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 路由 | React Router 7 |
| 状态 | Zustand（localStorage 持久化） |
| 动效 | Framer Motion |
| 图标 | Lucide React |

## 设计方向

- **Bento 栅格布局**：模块以渐变卡片呈现，减少 `wx-cell` 式纵向罗列
- **沉浸式首页**：全宽渐变 Hero + 横向滑动任务/家人卡片
- **玻璃拟态 Tab**：底部悬浮圆角导航
- **用户端无评分/风险标签**：遵循 AGENTS.md 合规要求

## 启动

```bash
cd miniapp
npm install
npm run dev
```

浏览器打开：`http://127.0.0.1:5173`

右上角可切换 **普通用户 / 会员** 演示身份。

## 静态部署

构建产物在 `dist/`，纯前端 + localStorage，无需后端。

```bash
cd miniapp
npm run build
```

### 本机 / 局域网预览（构建后）

```bash
npm run preview:host
```

他人访问终端里显示的 Network 地址（默认端口 `4173`）。

### 上传到静态托管

| 平台 | 操作 |
|------|------|
| **Vercel / Netlify** | 导入仓库，根目录选 `miniapp`，Build=`npm run build`，Output=`dist`（已含 SPA 回退配置） |
| **Nginx / 对象存储** | 上传整个 `dist/` 目录；Nginx 参考 `deploy/nginx.conf` 的 `try_files` |
| **任意静态目录** | 复制 `dist/` 到服务器 Web 根目录，并配置「未知路径 → index.html」 |

> React Router 使用 History 模式，服务器必须对子路径（如 `/profile`）回退到 `index.html`，否则刷新会 404。

## 路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/profile` | 健康档案 |
| `/profile/:section` | 档案子模块 |
| `/records` | 健康记录 |
| `/ai` | 小懂 AI |
| `/mine` | 我的 |
| `/points` `/membership` `/activities` 等 | 子页面 |

## 旧版参考

原 Vanilla JS 实现已移至 `miniapp-legacy/`，仅供对照。
