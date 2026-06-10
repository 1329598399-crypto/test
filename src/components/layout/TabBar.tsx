import { Home, FolderHeart, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'

const tabs = [
  { to: '/', label: '首页', icon: Home },
  { to: '/profile', label: '健康档案', icon: FolderHeart },
  { to: '/mine', label: '我的', icon: UserRound },
]

export function TabBar() {
  return (
    <nav className="relative z-50 shrink-0 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-1">
      <div className="glass soft-shadow flex items-center justify-around rounded-[24px] px-2 py-1.5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition-all',
                isActive
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-muted hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
