import { clsx } from 'clsx'
import { Calendar } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ITEM_H = 40

function sheetHost() {
  if (typeof document === 'undefined') return null
  return document.querySelector('.device-content') ?? document.body
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function parseIso(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return { y, m, d }
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplay(value: string) {
  const p = parseIso(value)
  if (!p) return ''
  return `${p.y}年${p.m}月${p.d}日`
}

function WheelColumn({
  items,
  value,
  onChange,
  suffix,
}: {
  items: number[]
  value: number
  onChange: (v: number) => void
  suffix: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const index = Math.max(0, items.indexOf(value))

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = index * ITEM_H
  }, [index, items])

  const snap = () => {
    const el = scrollRef.current
    if (!el) return
    const next = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)))
    el.scrollTop = next * ITEM_H
    if (items[next] !== value) onChange(items[next])
  }

  const onScroll = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(snap, 80)
  }

  return (
    <div className="mobile-date-wheel-col">
      <div ref={scrollRef} className="mobile-date-wheel-scroll no-scrollbar" onScroll={onScroll}>
        <div className="mobile-date-wheel-pad" />
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={clsx('mobile-date-wheel-item', value === item && 'is-active')}
            onClick={() => {
              onChange(item)
              if (scrollRef.current) scrollRef.current.scrollTop = items.indexOf(item) * ITEM_H
            }}
          >
            {item}
            {suffix}
          </button>
        ))}
        <div className="mobile-date-wheel-pad" />
      </div>
    </div>
  )
}

function DatePickerSheet({
  open,
  initial,
  minYear,
  maxYear,
  onClose,
  onConfirm,
}: {
  open: boolean
  initial: { y: number; m: number; d: number } | null
  minYear: number
  maxYear: number
  onClose: () => void
  onConfirm: (iso: string) => void
}) {
  const now = new Date()
  const fallback = {
    y: now.getFullYear() - 30,
    m: 1,
    d: 1,
  }
  const [y, setY] = useState(initial?.y ?? fallback.y)
  const [m, setM] = useState(initial?.m ?? fallback.m)
  const [d, setD] = useState(initial?.d ?? fallback.d)

  useEffect(() => {
    if (!open) return
    const base = initial ?? fallback
    setY(base.y)
    setM(base.m)
    setD(base.d)
  }, [open, initial?.y, initial?.m, initial?.d])

  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear],
  )
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])
  const days = useMemo(() => {
    const max = daysInMonth(y, m)
    return Array.from({ length: max }, (_, i) => i + 1)
  }, [y, m])

  useEffect(() => {
    const max = daysInMonth(y, m)
    if (d > max) setD(max)
  }, [y, m, d])

  if (!open) return null
  const host = sheetHost()
  if (!host) return null

  return createPortal(
    <div className="mobile-date-sheet-root">
      <button type="button" className="mobile-date-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="mobile-date-sheet" role="dialog" aria-modal="true">
        <div className="mobile-date-sheet-handle" />
        <div className="mobile-date-sheet-head">
          <button type="button" className="mobile-date-sheet-cancel" onClick={onClose}>
            取消
          </button>
          <p className="mobile-date-sheet-title">选择出生日期</p>
          <button
            type="button"
            className="mobile-date-sheet-confirm"
            onClick={() => {
              onConfirm(toIso(y, m, d))
              onClose()
            }}
          >
            确定
          </button>
        </div>
        <div className="mobile-date-picker-wheels">
          <WheelColumn items={years} value={y} onChange={setY} suffix="年" />
          <WheelColumn items={months} value={m} onChange={setM} suffix="月" />
          <WheelColumn items={days} value={d} onChange={setD} suffix="日" />
        </div>
      </div>
    </div>,
    host,
  )
}

interface Props {
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  minYear?: number
  maxYear?: number
  className?: string
}

export function MobileDatePickerField({
  value,
  onChange,
  placeholder = '请选择',
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const initial = parseIso(value)

  return (
    <>
      <button
        type="button"
        className={clsx('mobile-date-trigger', !value && 'is-placeholder', className)}
        onClick={() => setOpen(true)}
      >
        <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        <Calendar size={16} className="shrink-0 text-slate-400" />
      </button>
      <DatePickerSheet
        open={open}
        initial={initial}
        minYear={minYear}
        maxYear={maxYear}
        onClose={() => setOpen(false)}
        onConfirm={onChange}
      />
    </>
  )
}
