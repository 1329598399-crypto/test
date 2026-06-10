import type { ReactNode } from 'react'

interface Props {
  title: string
  right?: ReactNode
}

/** 模拟小程序 Tab 页原生导航栏：固定高度 + 居中标题 */
export function MiniNavBar({ title, right }: Props) {
  return (
    <header className="mini-nav-bar safe-top">
      <div className="mini-nav-bar-inner">
        <div className="mini-nav-bar-slot" aria-hidden />
        <h1 className="mini-nav-bar-title">{title}</h1>
        <div className="mini-nav-bar-slot mini-nav-bar-slot--end">{right}</div>
      </div>
    </header>
  )
}
