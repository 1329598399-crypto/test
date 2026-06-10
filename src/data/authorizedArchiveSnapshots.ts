import type { AuthScope } from './archiveAuthData'

export interface AuthorizedArchiveSnapshot {
  archiveId: string
  name: string
  gender: string
  age: number
  relationship?: string
  bloodType: string
  height: string
  weight: string
  syncAt: string
  completeness: number
  chips: { label: string; tone: 'blue' | 'green' | 'amber' | 'gray' }[]
  allergies: { name: string; severity: string; reaction: string }[]
  recentRecords: { label: string; value: string; time: string }[]
  exams: { date: string; title: string; detail: string }[]
  followups: { date: string; title: string; note: string }[]
  visitSummary?: {
    focus: string[]
    medications: string[]
    recentExams: { name: string; result: string; flag?: string }[]
  }
}

/** 家人档案快照（被授权查看） */
export const familyArchiveSnapshots: Record<string, AuthorizedArchiveSnapshot> = {
  f1: {
    archiveId: 'B001',
    name: '王建国',
    gender: '男',
    age: 62,
    relationship: '父亲',
    bloodType: 'B型',
    height: '172cm',
    weight: '74kg',
    syncAt: '2026-06-08 09:12',
    completeness: 88,
    chips: [
      { label: '高血压管理', tone: 'blue' },
      { label: '规律测压', tone: 'green' },
    ],
    allergies: [{ name: '磺胺类', severity: '中度', reaction: '皮疹' }],
    recentRecords: [
      { label: '血压', value: '138/84 mmHg', time: '昨晚 21:30' },
      { label: '心率', value: '68 bpm', time: '昨晚 21:30' },
    ],
    exams: [
      { date: '2026-05-20', title: '年度体检报告', detail: '血压偏高，建议继续监测' },
      { date: '2026-04-02', title: '心电图', detail: '窦性心律，未见明显异常' },
    ],
    followups: [
      { date: '2026-05-26', title: '家庭医生随访', note: '继续每日血压记录，保持低盐饮食' },
    ],
    visitSummary: {
      focus: ['携带近 2 周血压记录', '说明目前用药依从性'],
      medications: ['缬沙坦片 80mg 每日1次'],
      recentExams: [
        { name: '血压', result: '138/84 mmHg' },
        { name: 'LDL-C', result: '3.6 mmol/L', flag: 'attention' },
      ],
    },
  },
  f2: {
    archiveId: 'B003',
    name: '王小乐',
    gender: '男',
    age: 8,
    relationship: '儿子',
    bloodType: 'O型',
    height: '128cm',
    weight: '26kg',
    syncAt: '2026-06-07 18:40',
    completeness: 72,
    chips: [
      { label: '儿童生长', tone: 'green' },
      { label: '视力筛查待办', tone: 'amber' },
    ],
    allergies: [],
    recentRecords: [
      { label: '身高', value: '128 cm', time: '06/01' },
      { label: '体重', value: '26 kg', time: '06/01' },
    ],
    exams: [
      { date: '2026-03-15', title: '儿童保健手册', detail: '生长发育正常，建议注意用眼卫生' },
    ],
    followups: [
      { date: '2026-06-15', title: '视力筛查提醒', note: '本周六社区儿童视力筛查活动' },
    ],
  },
  f3: {
    archiveId: 'B002',
    name: '李静',
    gender: '女',
    age: 36,
    relationship: '配偶',
    bloodType: 'A型',
    height: '165cm',
    weight: '58kg',
    syncAt: '2026-06-08 07:55',
    completeness: 85,
    chips: [
      { label: '睡眠管理', tone: 'blue' },
      { label: '体重稳定', tone: 'green' },
    ],
    allergies: [{ name: '花粉', severity: '轻度', reaction: '打喷嚏、流涕' }],
    recentRecords: [
      { label: '睡眠', value: '7.2 小时', time: '今天 07:10' },
      { label: '心情', value: '良好', time: '昨天 22:00' },
      { label: '体重', value: '58.0 kg', time: '06/06' },
    ],
    exams: [
      { date: '2026-04-18', title: '甲状腺超声', detail: '右叶小结节，建议年度复查' },
      { date: '2026-02-10', title: '妇科检查', detail: '未见明显异常' },
    ],
    followups: [
      { date: '2026-05-30', title: '睡眠日志跟进', note: '近一周睡眠时长有所改善，建议保持规律作息' },
    ],
    visitSummary: {
      focus: ['说明近期睡眠变化', '携带甲状腺超声报告'],
      medications: [],
      recentExams: [{ name: '睡眠时长', result: '7.2 小时/晚' }],
    },
  },
}

/** 档案主人（临时授权给医生查看的摘要） */
export function getOwnerVisitSnapshot(role: 'normal' | 'member'): AuthorizedArchiveSnapshot {
  if (role === 'member') {
    return {
      archiveId: 'B001',
      name: '王建国',
      gender: '男',
      age: 58,
      relationship: '本人',
      bloodType: 'B型',
      height: '175cm',
      weight: '78kg',
      syncAt: '2026-06-08 10:20',
      completeness: 91,
      chips: [
        { label: '高血压管理', tone: 'blue' },
        { label: '血脂关注', tone: 'amber' },
      ],
      allergies: [
        { name: '青霉素', severity: '严重', reaction: '皮疹、呼吸不适' },
        { name: '虾蟹类', severity: '中度', reaction: '皮肤瘙痒' },
      ],
      recentRecords: [
        { label: '血压', value: '130/82 mmHg', time: '今天 08:20' },
        { label: '空腹血糖', value: '7.2 mmol/L', time: '06/01' },
      ],
      exams: [
        { date: '2026-05-15', title: '年度体检报告', detail: '血压、血脂需持续管理' },
        { date: '2026-05-15', title: '血脂四项', detail: 'LDL-C 偏高，建议复查' },
      ],
      followups: [
        { date: '2026-05-26', title: '家庭医生随访', note: '继续监测血压，2 周内复查血脂' },
      ],
      visitSummary: {
        focus: ['携带近 2 周血压记录', '说明降压药服用时间', '询问复查频率建议'],
        medications: ['缬沙坦片 80mg 每日1次', '阿托伐他汀 10mg 每日1次'],
        recentExams: [
          { name: '血压', result: '130/82 mmHg' },
          { name: 'LDL-C', result: '3.8 mmol/L', flag: 'attention' },
          { name: '空腹血糖', result: '7.2 mmol/L', flag: 'attention' },
        ],
      },
    }
  }
  return {
    archiveId: 'A001',
    name: '李静',
    gender: '女',
    age: 36,
    relationship: '本人',
    bloodType: 'A型',
    height: '165cm',
    weight: '58kg',
    syncAt: '2026-06-08 08:00',
    completeness: 62,
    chips: [{ label: '基础档案完善中', tone: 'gray' }],
    allergies: [{ name: '花粉', severity: '轻度', reaction: '打喷嚏' }],
    recentRecords: [{ label: '血压', value: '118/76 mmHg', time: '昨天' }],
    exams: [{ date: '2025-11-20', title: '基础体检', detail: '整体指标平稳' }],
    followups: [],
    visitSummary: {
      focus: ['补充过敏史与家族史', '说明近期睡眠情况'],
      medications: [],
      recentExams: [{ name: '血压', result: '118/76 mmHg' }],
    },
  }
}

export function scopeAllowsSection(
  scope: AuthScope,
  section: 'basic' | 'allergy' | 'records' | 'exams' | 'followup' | 'visit',
): boolean {
  if (scope === 'visit_readonly') {
    return section === 'basic' || section === 'visit' || section === 'allergy'
  }
  if (scope === 'view_add') return section !== 'followup'
  return true
}
