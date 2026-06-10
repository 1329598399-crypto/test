import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function buildWeekDays(anchor: Date) {
  const day = anchor.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() + mondayOffset)
  const labels = ['一', '二', '三', '四', '五', '六', '日']
  return labels.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      label,
      date: d.getDate(),
      key: d.toISOString().slice(0, 10),
      isToday: d.toDateString() === new Date().toDateString(),
    }
  })
}

export function WeekCalendar({
  selected,
  onSelect,
}: {
  selected?: string
  onSelect?: (key: string) => void
}) {
  const [anchor, setAnchor] = useState(() => new Date())
  const days = useMemo(() => buildWeekDays(anchor), [anchor])
  const monthLabel = `${anchor.getFullYear()}年${anchor.getMonth() + 1}月`

  return (
    <div className="hr-week-cal">
      <div className="hr-week-cal-head">
        <button type="button" className="hr-week-cal-nav" onClick={() => {
          const d = new Date(anchor)
          d.setDate(d.getDate() - 7)
          setAnchor(d)
        }} aria-label="上一周">
          <ChevronLeft size={18} />
        </button>
        <span className="hr-week-cal-month">{monthLabel}</span>
        <button type="button" className="hr-week-cal-nav" onClick={() => {
          const d = new Date(anchor)
          d.setDate(d.getDate() + 7)
          setAnchor(d)
        }} aria-label="下一周">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="hr-week-cal-row">
        {days.map((d) => (
          <button
            key={d.key}
            type="button"
            className={`hr-week-cal-day ${d.isToday ? 'is-today' : ''} ${selected === d.key ? 'is-selected' : ''}`}
            onClick={() => onSelect?.(d.key)}
          >
            <span className="hr-week-cal-dow">{d.label}</span>
            <span className="hr-week-cal-num">{d.date}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
