import { ChevronLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

interface Props {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function TopBar({ title = '家庭医生', showBack, onBack }: Props) {
  const navigate = useNavigate()
  const toggleRole = useAppStore((s) => s.toggleRole)
  const role = useAppStore((s) => s.role)
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)

  return (
    <header className="safe-top sticky top-0 z-40 px-4 pb-2 pt-1">
      <div className="glass soft-shadow flex h-12 items-center justify-between rounded-[20px] px-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {showBack && (
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink active:bg-black/5"
              aria-label="返回"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="truncate text-[16px] font-semibold tracking-tight">{title}</h1>
        </div>
        {import.meta.env.DEV && isLoggedIn && (
          <button
            type="button"
            onClick={toggleRole}
            className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-medium text-brand-600"
            title="切换演示身份（仅 Demo）"
          >
            <RefreshCw size={11} />
            {role === 'member' ? '会员模式' : '普通模式'}
          </button>
        )}
      </div>
    </header>
  )
}
