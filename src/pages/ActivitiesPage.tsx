import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileShell } from '../components/layout/MobileShell'
import {
  type ActivityCatalogItem,
  loadActivityCatalog,
} from '../data/activitiesCatalog'
import {
  activityUiStatus,
  buildWeekDays,
  dateKey,
  daysWithActivities,
  formatHeaderDate,
  slotsForDay,
  STATUS_META,
  type ActivityScheduleSlot,
} from '../lib/activitySchedule'
import { useAppStore } from '../store/useAppStore'

function ActivityTimelineCard({
  slot,
  joined,
  onOpen,
  onJoin,
  featured,
}: {
  slot: ActivityScheduleSlot
  joined: boolean
  onOpen: () => void
  onJoin: () => void
  featured?: boolean
}) {
  const { activity } = slot
  const ui = activityUiStatus(activity.status)
  const meta = STATUS_META[ui]

  if (featured && ui === 'ongoing') {
    return (
      <article className="act-zone-card act-zone-card-featured">
        <button type="button" className="act-zone-card-btn" onClick={onOpen}>
          <div className="act-zone-featured-top">
            <span className="act-zone-range">{slot.rangeLabel}</span>
            <span className={`act-zone-tag ${meta.tagClass}`}>{meta.label}</span>
          </div>
          <h3 className="act-zone-card-title">{activity.name}</h3>
          <p className="act-zone-card-desc">{activity.desc}</p>
          <div className="act-zone-featured-foot">
            <span className="act-zone-meta">
              {activity.location} · +{activity.points} 积分
            </span>
            <span className="act-zone-progress" aria-hidden>
              <svg viewBox="0 0 36 36">
                <circle className="act-zone-progress-track" cx="18" cy="18" r="15" />
                <circle className="act-zone-progress-fill" cx="18" cy="18" r="15" />
              </svg>
            </span>
          </div>
        </button>
        {!joined && activity.status !== 'ENDED' && (
          <button type="button" className="act-zone-inline-join" onClick={onJoin}>
            立即报名
          </button>
        )}
      </article>
    )
  }

  return (
    <article className={`act-zone-card ${meta.cardClass}`}>
      <div className="act-zone-timeline-dot" aria-hidden />
      <button type="button" className="act-zone-card-btn" onClick={onOpen}>
        <div className="act-zone-card-row">
          <span className="act-zone-range">{slot.rangeLabel}</span>
          <span className={`act-zone-tag ${meta.tagClass}`}>{meta.label}</span>
        </div>
        <h3 className="act-zone-card-title">{activity.name}</h3>
        <p className="act-zone-card-sub">
          {activity.location} · {activity.type}
          {joined ? ' · 已报名' : ''}
        </p>
      </button>
    </article>
  )
}

export function ActivitiesPage() {
  const navigate = useNavigate()
  const joined = useAppStore((s) => s.activityJoined)
  const joinActivity = useAppStore((s) => s.joinActivity)
  const showToast = useAppStore((s) => s.showToast)

  const [catalog, setCatalog] = useState<ActivityCatalogItem[]>(() => loadActivityCatalog())
  const [anchor, setAnchor] = useState(() => new Date())
  const [selectedKey, setSelectedKey] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
  })

  useEffect(() => {
    const onUpdated = () => setCatalog(loadActivityCatalog())
    window.addEventListener('fd-ops-catalog-updated', onUpdated)
    return () => window.removeEventListener('fd-ops-catalog-updated', onUpdated)
  }, [])

  const visible = useMemo(
    () => catalog.filter((a) => a.status !== 'ENDED' || a.replay),
    [catalog],
  )

  const weekDays = useMemo(() => buildWeekDays(anchor), [anchor])
  const markedDays = useMemo(() => daysWithActivities(visible), [visible])
  const selectedDate = useMemo(
    () => weekDays.find((d) => d.key === selectedKey)?.dateObj ?? new Date(selectedKey),
    [weekDays, selectedKey],
  )

  const daySlots = useMemo(() => slotsForDay(visible, selectedKey), [visible, selectedKey])
  const featured = daySlots.find((s) => activityUiStatus(s.activity.status) === 'ongoing')
  const restSlots = daySlots.filter((s) => s.activity.id !== featured?.activity.id)

  const isToday = selectedKey === dateKey(new Date())

  return (
    <MobileShell showTab={false} immersive mainClassName="act-zone-main">
      <div className="act-zone-page">
        <header className="act-zone-hero safe-top">
          <div className="act-zone-hero-bar">
            <button type="button" className="act-zone-icon-btn" onClick={() => navigate(-1)} aria-label="返回">
              <ChevronLeft size={22} />
            </button>
            <span className="act-zone-hero-title">活动专区</span>
            <button
              type="button"
              className="act-zone-icon-btn"
              onClick={() => showToast('更多活动筹备中，敬请关注')}
              aria-label="更多"
            >
              <Plus size={22} />
            </button>
          </div>
          <p className="act-zone-date-full">{formatHeaderDate(selectedDate)}</p>
          <h1 className="act-zone-headline">{isToday ? '今日活动' : '当日活动'}</h1>
        </header>

        <div className="act-zone-cal-panel">
          <div className="act-zone-cal-nav">
            <button
              type="button"
              className="act-zone-cal-arrow"
              onClick={() => {
                const d = new Date(anchor)
                d.setDate(d.getDate() - 7)
                setAnchor(d)
              }}
              aria-label="上一周"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="act-zone-cal-month">
              {anchor.getFullYear()}年{anchor.getMonth() + 1}月
            </span>
            <button
              type="button"
              className="act-zone-cal-arrow"
              onClick={() => {
                const d = new Date(anchor)
                d.setDate(d.getDate() + 7)
                setAnchor(d)
              }}
              aria-label="下一周"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="act-zone-week">
            {weekDays.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`act-zone-week-day ${selectedKey === d.key ? 'is-selected' : ''} ${d.isToday ? 'is-today' : ''}`}
                onClick={() => setSelectedKey(d.key)}
              >
                <span className="act-zone-week-dow">{d.dow}</span>
                <span className="act-zone-week-num">{d.date}</span>
                {markedDays.has(d.key) && <span className="act-zone-week-dot" />}
              </button>
            ))}
          </div>
        </div>

        <div className="act-zone-body">
          {daySlots.length === 0 ? (
            <div className="act-zone-empty">
              <p>这一天暂无活动安排</p>
              <p className="act-zone-empty-sub">可切换日期查看其他场次，或关注会员专属活动</p>
              <button type="button" className="act-zone-empty-btn" onClick={() => navigate('/membership')}>
                了解会员活动权益
              </button>
            </div>
          ) : (
            <div className="act-zone-timeline">
              {featured && (
                <ActivityTimelineCard
                  slot={featured}
                  joined={Boolean(joined[featured.activity.id])}
                  featured
                  onOpen={() => navigate(`/activities/${featured.activity.id}`)}
                  onJoin={() => {
                    joinActivity(featured.activity.id)
                    showToast('报名成功，请准时参加')
                  }}
                />
              )}
              {restSlots.map((slot) => (
                <ActivityTimelineCard
                  key={slot.activity.id}
                  slot={slot}
                  joined={Boolean(joined[slot.activity.id])}
                  onOpen={() => navigate(`/activities/${slot.activity.id}`)}
                  onJoin={() => {
                    joinActivity(slot.activity.id)
                    showToast('报名成功，请准时参加')
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
