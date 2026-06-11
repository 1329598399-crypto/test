import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  // 本地开发用根路径；GitHub Pages（/test/ 仓库）生产构建保留子路径
  base: mode === 'production' ? '/test/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // 与 B 端运营预览 MINIAPP_PREVIEW_BASE 对齐，避免自动换端口导致 iframe 连不上
    strictPort: true,
    host: true,
  },
}))
