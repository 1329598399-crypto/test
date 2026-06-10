import type { ActivityCatalogItem } from '../data/activitiesCatalog'

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export interface ActivityScheduleSlot {
  activity: ActivityCatalogItem
  start: Date
  end: Date
  startLabel: string
  endLabel: string
  rangeLabel: string
}

export interface WeekDayItem {
  key: string
  dow: string
  date: number
  dateObj: Date
  isToday: boolean
}

/** 解析活动 time 字段，如 06/12 14:00 */
export function parseActivityTime(time: string, year = new Date().getFullYear()): Date | null {
  const m = time.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/)
  if (!m) return null
  return new Date(year, Number(m[1]) - 1, Number(m[2]), Number(m[3]), Number(m[4]))
}

function padTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function toScheduleSlot(activity: ActivityCatalogItem): ActivityScheduleSlot | null {
  const start = parseActivityTime(activity.time)
  if (!start) return null
  const end = new Date(start.getTime() + 90 * 60 * 1000)
  return {
    activity,
    start,
    end,
    startLabel: padTime(start),
    endLabel: padTime(end),
    rangeLabel: `${padTime(start)} - ${padTime(end)}`,
  }
}

export function dateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildWeekDays(anchor: Date): WeekDayItem[] {
  const day = anchor.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(anchor)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(anchor.getDate() + mondayOffset)
  const todayKey = dateKey(new Date())

  return WEEK_LABELS.map((dow, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = dateKey(d)
    return {
      key,
      dow,
      date: d.getDate(),
      dateObj: d,
      isToday: key === todayKey,
    }
  })
}

export function formatHeaderDate(d: Date) {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`
}

export type ActivityUiStatus = 'done' | 'ongoing' | 'upcoming'

export function activityUiStatus(status: ActivityCatalogItem['status']): ActivityUiStatus {
  if (status === 'ENDED') return 'done'
  if (status === 'ONGOING') return 'ongoing'
  return 'upcoming'
}

export const STATUS_META: Record<
  ActivityUiStatus,
  { label: string; tagClass: string; cardClass: string }
> = {
  done: { label: '已结束', tagClass: 'is-done', cardClass: 'tone-purple' },
  ongoing: { label: '进行中', tagClass: 'is-ongoing', cardClass: 'tone-blue' },
  upcoming: { label: '即将开始', tagClass: 'is-upcoming', cardClass: 'tone-mint' },
}

export function slotsForDay(
  catalog: ActivityCatalogItem[],
  dayKey: string,
): ActivityScheduleSlot[] {
  return catalog
    .map(toScheduleSlot)
    .filter((s): s is ActivityScheduleSlot => Boolean(s && dateKey(s.start) === dayKey))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function daysWithActivities(catalog: ActivityCatalogItem[]): Set<string> {
  const set = new Set<string>()
  catalog.forEach((a) => {
    const start = parseActivityTime(a.time)
    if (start) set.add(dateKey(start))
  })
  return set
}
