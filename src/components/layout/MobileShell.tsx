import type { ReactNode } from 'react'
import { MiniNavBar } from './MiniNavBar'
import { TabBar } from './TabBar'
import { TopBar } from './TopBar'

interface Props {
  children: ReactNode
  title?: string
  showTab?: boolean
  showBack?: boolean
  onBack?: () => void
  /** 无顶栏，内容顶到安全区（首页等） */
  immersive?: boolean
  /** Tab 页原生导航栏（居中标题、固定高度） */
  nativeNav?: boolean
  navRight?: ReactNode
  mainClassName?: string
}

export function MobileShell({
  children,
  title,
  showTab = true,
  showBack = false,
  onBack,
  immersive = false,
  nativeNav = false,
  navRight,
  mainClassName,
}: Props) {
  return (
    <div className="app-shell relative flex min-h-0 w-full flex-1 flex-col app-mesh">
      {nativeNav && title ? (
        <MiniNavBar title={title} right={navRight} />
      ) : (
        !immersive && <TopBar title={title} showBack={showBack} onBack={onBack} />
      )}
      <main
        id="app-scroll-main"
        className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${
          showTab ? 'safe-bottom' : 'pb-6'
        } ${immersive ? 'immersive-main' : ''} ${mainClassName ?? ''}`}
      >
        {children}
      </main>
      {showTab && <TabBar />}
    </div>
  )
}
