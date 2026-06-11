import type { Role } from './mockData'
import { homeData, homePageExtras } from './mockData'

/** IP 形象情绪态 — 对应不同 CSS 动效 */
export type IpMood = 'greet' | 'remind' | 'celebrate' | 'think'

/** 首页任务卡片来源 */
export type HomeTaskSource = 'health_data' | 'doctor' | 'system' | 'points'

export interface HomeIpMessage {
  mood: IpMood
  /** 时段问候，如「中午好！」 */
  greeting: string
  /** 气泡主文案 */
  bubble: string
  /** 副文案 / 数据洞察 */
  subline?: string
  /** 点击气泡跳转路径 */
  nav?: string
  /** 完成任务可获积分（展示用） */
  pointsReward?: number
}

export interface HomeTaskCard {
  id: string
  title: string
  source: HomeTaskSource
  sourceLabel: string
  accent: 'blue' | 'green' | 'purple' | 'amber'
  nav: string
  done?: boolean
  points?: number
  priority: number
  /** 医生服务提醒（复查/用药等），在今日建议中高亮展示 */
  urgent?: boolean
}

export interface HomeServiceReminder {
  id: string
  type: string
  title: string
  desc: string
  urgent?: boolean
}

export interface HomeAdvisorTeamMember {
  name: string
  role: string
  initial: string
  online?: boolean
}

export interface HomeAdvisorProfile {
  id: string
  name: string
  title: string
  department: string
  hospital: string
  intro: string
  tags: string[]
  online: boolean
  nextAvailable?: string
  team: HomeAdvisorTeamMember[]
  /** 企微账号（会员展示） */
  wecomId?: string
  /** 联系电话（会员展示） */
  contactPhone?: string
  /** 普通用户看到的升级引导 */
  upgradeHint?: string
}

export interface HomeFeedPayload {
  version: number
  ipMessage: HomeIpMessage
  taskCards: HomeTaskCard[]
  advisor: HomeAdvisorProfile
}

const SOURCE_LABEL: Record<HomeTaskSource, string> = {
  health_data: '健康记录',
  doctor: '医生反馈',
  system: '系统提醒',
  points: '积分任务',
}

const ACCENT_CYCLE: HomeTaskCard['accent'][] = ['blue', 'green', 'purple', 'amber']

function taskFromLegacy(
  task: { id: string; title: string; desc: string; done: boolean; points: number; nav: string },
  source: HomeTaskSource,
  priority: number,
): HomeTaskCard {
  return {
    id: task.id,
    title: task.done ? task.title : `${task.title}${task.desc ? ` · ${task.desc}` : ''}`,
    source,
    sourceLabel: SOURCE_LABEL[source],
    accent: ACCENT_CYCLE[priority % ACCENT_CYCLE.length],
    nav: task.nav,
    done: task.done,
    points: task.points,
    priority,
  }
}

const defaultFeed: Record<Role, HomeFeedPayload> = {
  normal: {
    version: 1,
    ipMessage: {
      mood: 'greet',
      greeting: '您好',
      bubble: '有什么健康问题随时问我～',
      subline: '点气泡可继续对话',
      nav: '/ai',
    },
    taskCards: [
      {
        id: 'ht-health-bp',
        title: '提醒我测一次血压 💓',
        source: 'health_data',
        sourceLabel: SOURCE_LABEL.health_data,
        accent: 'blue',
        nav: '/records/form/bp',
        points: 12,
        priority: 1,
      },
      {
        id: 'ht-doctor-archive',
        title: '顾问建议：补充过敏史与家族史，便于首诊评估',
        source: 'doctor',
        sourceLabel: SOURCE_LABEL.doctor,
        accent: 'green',
        nav: '/profile/medical',
        points: 20,
        priority: 2,
      },
      {
        id: 'ht-system-ai',
        title: '帮我记录今天的饮食和运动 🥗',
        source: 'system',
        sourceLabel: SOURCE_LABEL.system,
        accent: 'purple',
        nav: '/ai',
        priority: 3,
      },
      {
        id: 'ht-system-archive',
        title: '完善档案后，我会根据您的记录推送更贴心的提醒',
        source: 'system',
        sourceLabel: SOURCE_LABEL.system,
        accent: 'amber',
        nav: '/profile',
        points: 10,
        priority: 4,
      },
    ],
    advisor: {
      id: 'adv-normal',
      name: '顾问助手 · 小康',
      title: '健康管理师',
      department: '客户服务中心',
      hospital: '家庭医生平台',
      intro: '提供基础健康咨询与开通引导，升级会员后可对接专属医生团队。',
      tags: ['基础咨询', '开通引导'],
      online: false,
      nextAvailable: '每天 8:00 – 21:00',
      team: [{ name: '小康', role: '顾问助理', initial: '康', online: true }],
      wecomId: 'health-advisor',
      contactPhone: '400-888-6688',
      upgradeHint: '开通会员后升级为专属家庭医生团队',
    },
  },
  member: {
    version: 1,
    ipMessage: {
      mood: 'remind',
      greeting: '建国您好',
      bubble: '不要忘记记录血压情况哦',
      subline: '点我继续对话',
      nav: '/records/form/bp',
      pointsReward: 10,
    },
    taskCards: [
      {
        id: 'ht-doc-report',
        title: '帮我上传近期体检报告，方便医生解读 📋',
        source: 'doctor',
        sourceLabel: SOURCE_LABEL.doctor,
        accent: 'amber',
        nav: '/profile/portrait',
        priority: 1,
      },
      {
        id: 'ht-health-glucose',
        title: '提醒我今晚餐后 2 小时测血糖 🩸',
        source: 'health_data',
        sourceLabel: SOURCE_LABEL.health_data,
        accent: 'blue',
        nav: '/records/form/glucose',
        points: 12,
        priority: 2,
      },
      {
        id: 'ht-doc-precheck',
        title: '看看复查前要注意什么 👀',
        source: 'doctor',
        sourceLabel: SOURCE_LABEL.doctor,
        accent: 'green',
        nav: '/reports',
        priority: 3,
      },
      {
        id: 'ht-doc-recheck',
        title: '6 月 10 日心内科复查，帮我确认时间 📅',
        source: 'doctor',
        sourceLabel: '复查',
        accent: 'amber',
        nav: '/reports',
        priority: 0,
        urgent: true,
      },
    ],
    advisor: {
      id: 'adv-member',
      name: '张雪娥',
      title: '主任医师',
      department: '心血管内科',
      hospital: '市第一人民医院',
      intro: '擅长高血压、冠心病与代谢综合征的长期管理，为您制定检查与随访计划。',
      tags: ['高血压管理', '报告解读', '复查提醒'],
      online: false,
      nextAvailable: '每天 8:00 – 21:00',
      team: homePageExtras.doctors.map((d) => ({
        name: d.name,
        role: d.role,
        initial: d.initial,
        online: d.online,
      })),
      wecomId: 'zhangxuee_fd',
      contactPhone: '138-0000-8802',
    },
  },
}

/** 将积分任务规则合并进 Feed（B 端未推送时的兜底） */
function normalizeReminderKey(text: string): string {
  return text.replace(/\s/g, '').toLowerCase()
}

function reminderOverlapsTask(reminder: HomeServiceReminder, task: HomeTaskCard): boolean {
  const rKey = normalizeReminderKey(reminder.title)
  const tKey = normalizeReminderKey(task.title)
  if (rKey.length >= 4 && (tKey.includes(rKey.slice(0, 8)) || rKey.includes(tKey.slice(0, 8)))) {
    return true
  }
  if (reminder.type === '复查' && (task.nav === '/reports' || task.title.includes('复查'))) {
    return true
  }
  if (reminder.type === '用药' && task.title.includes('药')) {
    return true
  }
  return false
}

function reminderNav(type: string): string {
  if (type === '复查') return '/reports'
  if (type === '用药') return '/profile/medical'
  return '/reports'
}

/** 将医生服务提醒并入今日建议，避免首页重复展示提醒条 */
export function mergeServiceRemindersIntoTasks(
  tasks: HomeTaskCard[],
  reminders: HomeServiceReminder[],
): HomeTaskCard[] {
  if (!reminders.length) return tasks

  const boosted = tasks.map((task) => {
    const match = reminders.find((r) => reminderOverlapsTask(r, task))
    if (!match) return task
    return {
      ...task,
      sourceLabel: match.type,
      accent: match.urgent ? ('amber' as const) : task.accent,
      priority: match.urgent ? Math.min(task.priority, -1) : task.priority,
      urgent: match.urgent ?? task.urgent,
    }
  })

  const extra = reminders
    .filter((r) => !boosted.some((t) => reminderOverlapsTask(r, t)))
    .map((r, i) => ({
      id: `sr-${r.id}`,
      title: r.desc ? `${r.title} · ${r.desc}` : r.title,
      source: 'doctor' as HomeTaskSource,
      sourceLabel: r.type,
      accent: (r.urgent ? 'amber' : 'green') as HomeTaskCard['accent'],
      nav: reminderNav(r.type),
      priority: r.urgent ? -10 - i : 5 + i,
      urgent: r.urgent,
    }))

  return [...extra, ...boosted].sort((a, b) => a.priority - b.priority)
}

export function buildDefaultHomeFeed(role: Role): HomeFeedPayload {
  const base = defaultFeed[role]
  const legacyTasks = homeData[role].tasks
    .filter((t) => !t.done)
    .map((t, i) => taskFromLegacy(t, 'points', 10 + i))

  const merged = [...base.taskCards]
  for (const lt of legacyTasks) {
    if (!merged.some((m) => m.id === lt.id)) merged.push(lt)
  }
  merged.sort((a, b) => a.priority - b.priority)

  return { ...base, taskCards: merged.slice(0, 6) }
}

export function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export function formatHomeDate(date = new Date()): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}
