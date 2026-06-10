/** 健康指标趋势模拟数据（Demo） */

export interface VitalTrendPoint {
  date: string
  label: string
  value: number
  value2?: number
}

export interface VitalMetricSnapshot {
  type: string
  title: string
  value: string
  unit: string
  status: string
  statusTone: 'success' | 'warning' | 'primary' | 'info'
  lastTime: string
  ringPercent: number
  trend: VitalTrendPoint[]
  tip?: string
}

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const VITAL_SNAPSHOTS: Record<string, VitalMetricSnapshot> = {
  bp: {
    type: 'bp',
    title: '血压',
    value: '130/82',
    unit: 'mmHg',
    status: '略偏高',
    statusTone: 'warning',
    lastTime: '今天 08:20',
    ringPercent: 72,
    trend: weekLabels.map((label, i) => ({
      date: `06-${String(i + 3).padStart(2, '0')}`,
      label,
      value: 125 + i * 2,
      value2: 78 + (i % 3),
    })),
    tip: '建议保持规律测量，异常波动请咨询医生团队。',
  },
  glucose: {
    type: 'glucose',
    title: '血糖',
    value: '5.6',
    unit: 'mmol/L',
    status: '正常',
    statusTone: 'success',
    lastTime: '昨天 21:10',
    ringPercent: 85,
    trend: weekLabels.map((label, i) => ({
      date: `06-${String(i + 3).padStart(2, '0')}`,
      label,
      value: 5.2 + (i % 4) * 0.3,
    })),
    tip: '空腹与餐后血糖建议分开记录，便于医生查看趋势。',
  },
  hr: {
    type: 'hr',
    title: '心率',
    value: '72',
    unit: 'bpm',
    status: '正常',
    statusTone: 'success',
    lastTime: '今天 07:45',
    ringPercent: 68,
    trend: weekLabels.map((label, i) => ({
      date: `06-${String(i + 3).padStart(2, '0')}`,
      label,
      value: 68 + (i % 5) * 2,
    })),
    tip: '静息心率受睡眠与情绪影响，可配合心情日记一起查看。',
  },
  lipid: {
    type: 'lipid',
    title: '血脂 (LDL-C)',
    value: '3.8',
    unit: 'mmol/L',
    status: '来自体检',
    statusTone: 'info',
    lastTime: '体检报告 05-18',
    ringPercent: 58,
    trend: [
      { date: '2024-11', label: '11月', value: 4.2 },
      { date: '2025-02', label: '2月', value: 4.0 },
      { date: '2025-05', label: '5月', value: 3.8 },
    ],
    tip: '血脂数据来自体检/检验报告，不支持手动录入；新报告同步后自动更新。',
  },
}

export const MOOD_OPTIONS = [
  { id: 'very_sad', emoji: '😢', label: '有点难过' },
  { id: 'sad', emoji: '😔', label: '有点低落' },
  { id: 'neutral', emoji: '😐', label: '感觉平静' },
  { id: 'happy', emoji: '😊', label: '心情不错' },
  { id: 'great', emoji: '😄', label: '非常开心' },
]

export const SCAN_MOCK_RESULTS = {
  diet: {
    name: '燕麦鸡蛋早餐',
    kcal: 420,
    protein: '18g',
    carbs: '52g',
    fat: '12g',
    summary: '燕麦+水煮蛋+牛奶，约 420 kcal',
  },
  medication: {
    name: '氨氯地平片 5mg',
    dose: '每日 1 次 · 晨起',
    caution: '请按医生处方服用，勿自行调整剂量。',
    summary: '氨氯地平片 5mg，每日晨起 1 次',
  },
}
