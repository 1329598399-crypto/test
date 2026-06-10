export const PAST_HISTORY_OTHER = '其他'

export type PastHistoryItem = {
  id?: string
  year: string
  month: string
  title: string
  detail: string
  tag?: string
}

export const pastHistoryCategories = [
  {
    id: 'chronic',
    label: '慢性疾病',
    options: [
      '高血压',
      '糖尿病',
      '高血脂',
      '甲状腺疾病',
      '慢性胃炎',
      '慢阻肺',
      '其他',
    ],
  },
  {
    id: 'surgery',
    label: '手术外伤',
    options: ['骨折', '阑尾切除术', '剖宫产', '关节置换', '肿瘤手术史', '其他'],
  },
  {
    id: 'common',
    label: '其他常见',
    options: ['哮喘', '痛风', '乙肝携带', '抑郁/焦虑', '睡眠障碍', '其他'],
  },
] as const

export const pastHistoryTagOptions = [
  '长期用药',
  '饮食控制',
  '已缓解',
  '已治愈',
  '观察中',
  '无长期用药',
] as const

export const pastHistoryDefaults: Record<string, { detail: string; tag?: string }> = {
  高血压: { detail: '确诊后需规律监测血压，遵医嘱管理。', tag: '长期用药' },
  糖尿病: { detail: '需关注血糖变化，配合饮食与运动管理。', tag: '饮食控制' },
  高血脂: { detail: '建议定期复查血脂，必要时药物干预。', tag: '观察中' },
  甲状腺疾病: { detail: '按医嘱复查甲状腺功能，关注结节变化。', tag: '观察中' },
  慢性胃炎: { detail: '注意饮食规律，避免刺激性食物。', tag: '观察中' },
  慢阻肺: { detail: '避免烟雾刺激，按医嘱使用吸入药物。', tag: '长期用药' },
  骨折: { detail: '已处理并完成康复，注意避免二次损伤。', tag: '已缓解' },
  阑尾切除术: { detail: '术后恢复良好，无特殊不适。', tag: '已治愈' },
  剖宫产: { detail: '术后恢复良好，无并发症。', tag: '已治愈' },
  关节置换: { detail: '术后定期复查，进行康复训练。', tag: '观察中' },
  肿瘤手术史: { detail: '术后按医嘱复查，关注恢复情况。', tag: '观察中' },
  哮喘: { detail: '避免过敏原，常备缓解药物。', tag: '长期用药' },
  痛风: { detail: '低嘌呤饮食，监测尿酸水平。', tag: '饮食控制' },
  乙肝携带: { detail: '定期复查肝功能和病毒载量。', tag: '观察中' },
  '抑郁/焦虑': { detail: '如有情绪困扰建议心理咨询或专科随访。', tag: '观察中' },
  睡眠障碍: { detail: '记录睡眠情况，必要时专科评估。', tag: '观察中' },
}

export const pastHistoryMonths = [
  '01月',
  '02月',
  '03月',
  '04月',
  '05月',
  '06月',
  '07月',
  '08月',
  '09月',
  '10月',
  '11月',
  '12月',
] as const

export function buildPastYearOptions() {
  const current = new Date().getFullYear()
  return Array.from({ length: 40 }, (_, i) => String(current - i))
}

export function sortPastHistory(items: PastHistoryItem[]) {
  return [...items].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year)
    if (yearDiff !== 0) return yearDiff
    return pastHistoryMonths.indexOf(b.month as (typeof pastHistoryMonths)[number]) -
      pastHistoryMonths.indexOf(a.month as (typeof pastHistoryMonths)[number])
  })
}

export function pastHistoryKey(item: Pick<PastHistoryItem, 'year' | 'month' | 'title'>) {
  return `${item.year}-${item.month}-${item.title}`
}
