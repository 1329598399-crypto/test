import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  className?: string
  gradient?: string
  onClick?: () => void
  span?: '1' | '2'
}

export function BentoCard({ children, className, gradient, onClick, span = '1' }: Props) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={clsx(
        'soft-shadow relative overflow-hidden rounded-[26px] text-left',
        span === '2' && 'col-span-2',
        gradient ? `bg-gradient-to-br ${gradient} text-white` : 'glass',
        onClick &&
          'block w-full cursor-pointer appearance-none border-0 bg-transparent p-0 active:opacity-95',
        className,
      )}
    >
      {children}
    </Comp>
  )
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="mb-3 flex items-end justify-between px-1">
      <h2 className="text-[17px] font-bold tracking-tight text-ink">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-[13px] font-medium text-brand-600"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export function ProgressRing({ value, size = 72 }: { value: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (c * value) / 100
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="white"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  )
}
