import type { ReactNode } from 'react'
import { useLayoutEffect, useState } from 'react'
import { bootstrapOpsPreviewSession } from '../../lib/opsPreviewBootstrap'
import { notifyOpsPreviewReady } from '../../lib/opsBridge'

/** B 端 iframe 预览：先完成 Demo 登录再渲染子页面 */
export function OpsPreviewShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    bootstrapOpsPreviewSession()
    setReady(true)
    // 登录完成后再通知 B 端推送配置，避免首页未挂载时丢事件
    const t = window.setTimeout(() => notifyOpsPreviewReady(), 50)
    return () => window.clearTimeout(t)
  }, [])

  if (!ready) {
    return (
      <div className="ops-preview-boot">
        <p>预览加载中…</p>
      </div>
    )
  }

  return children
}
