/** 健康记录运营配置（与 B 端对齐） */

export type PathNodeStatus = 'locked' | 'active' | 'done'

export interface RecordPathNode {
  id: string
  title: string
  subtitle: string
  recordType: string
  nav: string
  points: number
  icon: string
  order: number
}

export interface DailyGoalMetric {
  id: string
  label: string
  current: number
  target: number
  unit: string
  color: string
}

export interface HealthRecordsConfig {
  version: number
  gameModeEnabled: boolean
  pathTitle: string
  pathSubtitle: string
  mascotHint: string
  pathNodes: RecordPathNode[]
  dailyGoals: DailyGoalMetric[]
  stepCount: number
  stepTarget: number
  scanDietHint: string
  scanMedHint: string
}

export const RECORD_PATH_NAV_OPTIONS = [
  { value: '/records/mood', label: '心情日记' },
  { value: '/records/scan/diet', label: '饮食拍照' },
  { value: '/records/scan/medication', label: '用药拍照' },
  { value: '/records/vitals/bp', label: '血压记录' },
  { value: '/records/vitals/glucose', label: '血糖记录' },
  { value: '/records/vitals/hr', label: '心率记录' },
  { value: '/records/form/sport', label: '运动记录' },
  { value: '/records/form/weight', label: '体重记录' },
]

export function buildDefaultHealthRecordsConfig(): HealthRecordsConfig {
  return {
    version: 1,
    gameModeEnabled: true,
    pathTitle: '今日健康闯关',
    pathSubtitle: '完成打卡解锁下一关，连续记录更有积分奖励',
    mascotHint: '小懂陪你一起养成记录习惯～',
    pathNodes: [
      {
        id: 'node-start',
        title: '开始',
        subtitle: '今日首打卡',
        recordType: 'mood',
        nav: '/records/mood',
        points: 8,
        icon: '🌟',
        order: 0,
      },
      {
        id: 'node-1',
        title: '关卡 1',
        subtitle: '记录心情',
        recordType: 'mood',
        nav: '/records/mood',
        points: 10,
        icon: '😊',
        order: 1,
      },
      {
        id: 'node-2',
        title: '关卡 2',
        subtitle: '饮食拍照',
        recordType: 'diet',
        nav: '/records/scan/diet',
        points: 12,
        icon: '🍽',
        order: 2,
      },
      {
        id: 'node-3',
        title: '关卡 3',
        subtitle: '血压记录',
        recordType: 'bp',
        nav: '/records/vitals/bp',
        points: 12,
        icon: '💓',
        order: 3,
      },
      {
        id: 'node-review',
        title: '复习',
        subtitle: '回顾本周记录',
        recordType: 'review',
        nav: '/records',
        points: 5,
        icon: '📋',
        order: 4,
      },
    ],
    dailyGoals: [
      { id: 'stand', label: '站立', current: 2, target: 8, unit: '次', color: '#fb923c' },
      { id: 'kcal', label: '消耗', current: 300, target: 500, unit: 'kcal', color: '#f87171' },
      { id: 'exercise', label: '运动', current: 18, target: 30, unit: '分钟', color: '#60a5fa' },
      { id: 'steps', label: '步数', current: 2364, target: 10000, unit: '步', color: '#4ade80' },
    ],
    stepCount: 2364,
    stepTarget: 10000,
    scanDietHint: '将食物置于取景框内，小懂将识别热量与营养',
    scanMedHint: '对准药盒或药片，识别药品名称与用法提醒',
  }
}
