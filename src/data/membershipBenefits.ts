import type { Role } from './mockData'

/** 2026 家庭医生会员权益 — 各卡级均含的核心服务（打勾项） */
export const membershipCoreBenefits = [
  { id: 'consult', icon: '💬', title: '线上咨询', desc: '每天 8:00–21:00 企微/电话值班' },
  { id: 'assess', icon: '📋', title: '健康评估', desc: '回顾病史、家族史、门诊记录及检查结果' },
  { id: 'exam_plan', icon: '🔬', title: '检查计划', desc: '必查/复查/补充区分，形成检查清单' },
  { id: 'recheck', icon: '🔔', title: '复查提醒', desc: '异常项列出并主动提醒跟进' },
  { id: 'outpatient', icon: '🏥', title: '普通门诊', desc: '全年不限次' },
  { id: 'green', icon: '⚡', title: '绿色通道', desc: '检查与就诊优先安排' },
  { id: 'annual', icon: '📊', title: '年度总评', desc: '回顾全年健康并给出下一年重点建议' },
] as const

/** 正式权益表 · 各服务项目说明（B 端配置 / 对比表用） */
export const membershipServiceItems = [
  { id: 'consult', category: '基础服务', title: '线上咨询', desc: '每天 8:00–21:00 企微/电话值班' },
  { id: 'assess', category: '基础服务', title: '健康评估', desc: '回顾病史、家族史、门诊记录及检查结果' },
  { id: 'exam_plan', category: '基础服务', title: '检查计划', desc: '必查/复查/补充区分，形成检查清单' },
  { id: 'recheck', category: '基础服务', title: '复查提醒', desc: '异常项列出并主动提醒跟进' },
  { id: 'outpatient', category: '基础服务', title: '普通门诊', desc: '全年不限次' },
  { id: 'specialist', category: '专家服务', title: '专家门诊', desc: '省级专家门诊服务' },
  { id: 'multi', category: '专家服务', title: '多学科专家门诊', desc: '多位省级专家联合门诊' },
  { id: 'green', category: '就医便利', title: '绿色通道', desc: '检查与就诊优先安排' },
  { id: 'annual', category: '健康管理', title: '年度总评', desc: '回顾全年健康并给出下一年重点建议' },
  { id: 'exam_quota', category: '检查权益', title: '检查额度', desc: '家庭医生指导下的检查费用额度' },
  { id: 'discount', category: '检查权益', title: '超额优惠', desc: '超出检查额度后的费用折扣' },
  { id: 'gift', category: '增值权益', title: '健康礼包', desc: '¥800 代金券（常规体检、胃镜、挂号等）' },
] as const

/** 家庭会员增购规则（正式表补充说明） */
export const membershipFamilyRules = {
  includedSlots: 2,
  maxMembers: 6,
  addOnPrice: { basic: 2199, silver: 3299, gold: 5399 },
  validityNote: '家庭会员自开卡日起有效期 1 年；增购成员与主卡同时到期',
  sharedBenefitsNote: '核心权益（门诊次数、检查额度等）家庭成员共享',
} as const

/** 随卡级变化的权益（Demo 展示用） */
export const membershipTierBenefits = [
  { id: 'specialist', label: '专家门诊', tiers: '2–12 次/年' },
  { id: 'multi', label: '多学科专家门诊', tiers: '银卡及以上' },
  { id: 'exam_quota', label: '检查额度', tiers: '¥3,000–¥14,000' },
  { id: 'discount', label: '超额优惠', tiers: '9折–8折' },
  { id: 'annual', label: '年度总评', tiers: '全年健康复盘' },
  { id: 'gift', label: '健康礼包', tiers: '金卡专属 ¥800' },
] as const

export type MembershipTierLevel = 'basic' | 'silver' | 'gold'

/** 卡级视觉主题 — 参考美团/淘宝会员中心分级皮肤 */
export const membershipTierThemes: Record<
  MembershipTierLevel,
  {
    label: string
    shortLabel: string
    tagline: string
    exclusiveTitle: string
    perks: string[]
    ctaText: string
  }
> = {
  basic: {
    label: '基础会员',
    shortLabel: '基础',
    tagline: '轻松入门，专属团队开启连续健康管理',
    exclusiveTitle: '基础会员专享',
    perks: ['家庭医生团队对接', '检查额度直抵体检', '专家门诊 2 次起'],
    ctaText: '开通基础会员',
  },
  silver: {
    label: '银卡会员',
    shortLabel: '银卡',
    tagline: '多学科协作 · 更高检查额度 · 年度健康总评',
    exclusiveTitle: '银卡尊享权益',
    perks: ['多学科专家门诊 2 次/年', '超额检查 85 折', '检查额度 ¥5,000 起'],
    ctaText: '升级银卡会员',
  },
  gold: {
    label: '金卡会员',
    shortLabel: '金卡',
    tagline: '更高门诊次数 · 健康礼包 · 绿色通道优先',
    exclusiveTitle: '金卡至尊权益',
    perks: ['检查额度最高 ¥14,000（家庭）', '专家门诊最高 12 次/年', '健康礼包 ¥800'],
    ctaText: '开通金卡会员',
  },
}

export interface MembershipPlanDetail {
  id: string
  tierLevel: MembershipTierLevel
  name: string
  price: number
  family: boolean
  hot?: boolean
  badge?: string
  examQuota: number
  specialistVisits: number
  multiDisciplinary: number | null
  discount: string | null
  familySlots: number | null
  annualReview: boolean
  giftPack: number | null
  highlights: string[]
  /** 各权益项展示值（B 端自定义配置） */
  benefitValues?: Record<string, string>
}

export const membershipPlansDetail: MembershipPlanDetail[] = [
  {
    id: 'basic',
    tierLevel: 'basic',
    name: '单人基础会员',
    price: 2399,
    family: false,
    examQuota: 3000,
    specialistVisits: 2,
    multiDisciplinary: null,
    discount: '9折',
    familySlots: null,
    annualReview: true,
    giftPack: null,
    highlights: ['含 6 项基础服务 + 年度总评', '检查额度 ¥3,000', '专家门诊 2 次/年', '超额检查 9 折'],
  },
  {
    id: 'standard',
    tierLevel: 'silver',
    name: '单人银卡会员',
    price: 3599,
    family: false,
    hot: true,
    badge: '推荐',
    examQuota: 5000,
    specialistVisits: 4,
    multiDisciplinary: 2,
    discount: '85折',
    familySlots: null,
    annualReview: true,
    giftPack: null,
    highlights: ['多学科专家门诊 2 次/年', '检查额度 ¥5,000', '超额检查 85 折'],
  },
  {
    id: 'gold',
    tierLevel: 'gold',
    name: '单人金卡会员',
    price: 5899,
    family: false,
    badge: '尊享',
    examQuota: 7000,
    specialistVisits: 6,
    multiDisciplinary: 4,
    discount: '8折',
    familySlots: null,
    annualReview: true,
    giftPack: 800,
    highlights: ['检查额度 ¥7,000', '专家门诊 6 次/年', '健康礼包 ¥800'],
  },
  {
    id: 'family_basic',
    tierLevel: 'basic',
    name: '家庭基础会员',
    price: 4399,
    family: true,
    examQuota: 6000,
    specialistVisits: 4,
    multiDisciplinary: null,
    discount: '9折',
    familySlots: 2,
    annualReview: true,
    giftPack: null,
    highlights: ['含 2 位家庭成员，可增购', '共享检查额度 ¥6,000', '专家门诊 4 次/年'],
  },
  {
    id: 'family',
    tierLevel: 'silver',
    name: '家庭银卡会员',
    price: 6699,
    family: true,
    hot: true,
    badge: '推荐',
    examQuota: 10000,
    specialistVisits: 8,
    multiDisciplinary: 4,
    discount: '85折',
    familySlots: 2,
    annualReview: true,
    giftPack: null,
    highlights: ['含 2 位家庭成员，可增购', '检查额度 ¥10,000', '多学科门诊 4 次/年'],
  },
  {
    id: 'family_gold',
    tierLevel: 'gold',
    name: '家庭金卡会员',
    price: 9899,
    family: true,
    badge: '尊享',
    examQuota: 14000,
    specialistVisits: 12,
    multiDisciplinary: 8,
    discount: '8折',
    familySlots: 2,
    annualReview: true,
    giftPack: 800,
    highlights: ['含 2 位家庭成员，可增购', '检查额度 ¥14,000', '健康礼包 ¥800'],
  },
]

export function getMembershipPlan(planId: string): MembershipPlanDetail | undefined {
  return membershipPlansDetail.find((p) => p.id === planId)
}

export function getPlansByScope(family: boolean): MembershipPlanDetail[] {
  return membershipPlansDetail.filter((p) => p.family === family)
}

export const membershipServiceFlow = [
  { step: 1, title: '选择套餐', desc: '按个人或家庭需求选卡级' },
  { step: 2, title: '线上签约', desc: '确认服务协议与权益说明' },
  { step: 3, title: '完成支付', desc: '开通电子会员卡' },
  { step: 4, title: '权益生效', desc: '专属团队对接，预约首诊' },
] as const

export const membershipFaqs = [
  {
    q: '普通用户和会员有什么区别？',
    a: '普通用户可维护基础健康档案与日常记录；会员在此基础上获得家庭医生团队服务，包括线上咨询、健康评估、检查计划、复查提醒、专家门诊与检查额度等。',
  },
  {
    q: '检查额度如何使用？',
    a: '额度用于家庭医生指导下的检查项目，就诊时出示电子会员卡即可识别。超额部分按卡级享受 9 折、85 折或 8 折优惠，消费记录同步至「我的」。',
  },
  {
    q: '家庭会员如何添加家人？',
    a: '家庭套餐默认含 2 位家庭成员，核心权益共享。可在「健康档案 → 家庭档案」关联家人；增购成员：基础 ¥2,199/人、银卡 ¥3,299/人、金卡 ¥5,399/人，最多 6 人，与主卡同时到期。',
  },
  {
    q: '开通后多久可以联系医生？',
    a: '支付成功后权益即时生效，专属顾问将在 1 个工作日内主动联系，协助完善档案并预约首诊建档。',
  },
] as const

export type BenefitCompareValue = boolean | string

export const benefitCompareRows: {
  id: string
  label: string
  getValue: (plan: MembershipPlanDetail) => BenefitCompareValue
}[] = [
  { id: 'consult', label: '线上咨询', getValue: () => true },
  { id: 'assess', label: '健康评估', getValue: () => true },
  { id: 'exam_plan', label: '检查计划', getValue: () => true },
  { id: 'recheck', label: '复查提醒', getValue: () => true },
  { id: 'outpatient', label: '普通门诊', getValue: () => '不限次' },
  { id: 'green', label: '绿色通道', getValue: () => true },
  {
    id: 'specialist',
    label: '专家门诊',
    getValue: (p) => `${p.specialistVisits} 次/年`,
  },
  {
    id: 'multi',
    label: '多学科门诊',
    getValue: (p) => (p.multiDisciplinary ? `${p.multiDisciplinary} 次/年` : '—'),
  },
  {
    id: 'exam_quota',
    label: '检查额度',
    getValue: (p) => `¥${p.examQuota.toLocaleString()}`,
  },
  {
    id: 'discount',
    label: '超额优惠',
    getValue: (p) => p.discount ?? '—',
  },
  {
    id: 'annual',
    label: '年度总评',
    getValue: (p) => p.annualReview,
  },
  {
    id: 'gift',
    label: '健康礼包',
    getValue: (p) => (p.giftPack ? `¥${p.giftPack}` : '—'),
  },
  {
    id: 'family_slots',
    label: '家庭成员',
    getValue: (p) =>
      p.familySlots ? `含 ${p.familySlots} 人${p.family ? '，可增购' : ''}` : '—',
  },
]

export interface MemberBenefitUsage {
  id: string
  label: string
  used: number
  total: number | null
  unit?: string
  hint?: string
}

export interface MemberCardSnapshot {
  tierId: string
  tierName: string
  cardNo: string
  validUntil: string
  examQuotaTotal: number
  examQuotaUsed: number
  usages: MemberBenefitUsage[]
  teamLabel: string
}

const memberCards: Record<string, MemberCardSnapshot> = {
  basic: {
    tierId: 'single_basic',
    tierName: '单人基础会员',
    cardNo: 'FD2026 0088 1101',
    validUntil: '2027-06-09',
    examQuotaTotal: 3000,
    examQuotaUsed: 0,
    teamLabel: '家庭医生 · 张医生团队',
    usages: [
      { id: 'specialist', label: '专家门诊', used: 0, total: 2, unit: '次' },
      { id: 'recheck', label: '复查协助', used: 0, total: 2, unit: '次' },
    ],
  },
  standard: {
    tierId: 'single_silver',
    tierName: '单人银卡会员',
    cardNo: 'FD2026 0088 2103',
    validUntil: '2027-06-09',
    examQuotaTotal: 5000,
    examQuotaUsed: 2850,
    teamLabel: '家庭医生 · 张医生团队',
    usages: [
      { id: 'specialist', label: '专家门诊', used: 1, total: 4, unit: '次' },
      { id: 'multi', label: '多学科门诊', used: 0, total: 2, unit: '次' },
      { id: 'recheck', label: '复查协助', used: 1, total: 3, unit: '次', hint: '6月10日心内科' },
    ],
  },
  gold: {
    tierId: 'single_gold',
    tierName: '单人金卡会员',
    cardNo: 'FD2026 0088 3105',
    validUntil: '2027-06-09',
    examQuotaTotal: 7000,
    examQuotaUsed: 3200,
    teamLabel: '家庭医生 · 张医生团队',
    usages: [
      { id: 'specialist', label: '专家门诊', used: 2, total: 6, unit: '次' },
      { id: 'multi', label: '多学科门诊', used: 1, total: 4, unit: '次' },
      { id: 'recheck', label: '复查协助', used: 2, total: 4, unit: '次' },
    ],
  },
  family_basic: {
    tierId: 'family_basic',
    tierName: '家庭基础会员',
    cardNo: 'FD2026 1188 1102',
    validUntil: '2027-06-09',
    examQuotaTotal: 6000,
    examQuotaUsed: 1200,
    teamLabel: '家庭医生 · 张医生团队',
    usages: [
      { id: 'specialist', label: '专家门诊', used: 1, total: 4, unit: '次' },
      { id: 'recheck', label: '复查协助', used: 0, total: 2, unit: '次' },
    ],
  },
  family: {
    tierId: 'family_silver',
    tierName: '家庭银卡会员',
    cardNo: 'FD2026 1188 5601',
    validUntil: '2027-06-09',
    examQuotaTotal: 10000,
    examQuotaUsed: 4200,
    teamLabel: '家庭医生 · 张医生团队',
    usages: [
      { id: 'specialist', label: '专家门诊', used: 2, total: 8, unit: '次' },
      { id: 'multi', label: '多学科门诊', used: 1, total: 4, unit: '次' },
      { id: 'recheck', label: '复查协助', used: 2, total: 4, unit: '次' },
    ],
  },
  family_gold: {
    tierId: 'family_gold',
    tierName: '家庭金卡会员',
    cardNo: 'FD2026 1188 9901',
    validUntil: '2027-06-09',
    examQuotaTotal: 14000,
    examQuotaUsed: 6800,
    teamLabel: '家庭医生 · 张医生团队',
    usages: [
      { id: 'specialist', label: '专家门诊', used: 3, total: 12, unit: '次' },
      { id: 'multi', label: '多学科门诊', used: 2, total: 8, unit: '次' },
      { id: 'recheck', label: '复查协助', used: 2, total: 5, unit: '次' },
    ],
  },
}

export function getMemberCardSnapshot(
  role: Role,
  selectedPlan: string,
): MemberCardSnapshot | null {
  if (role !== 'member') return null
  return memberCards[selectedPlan] ?? memberCards.standard
}

/** 普通用户开通引导 — 强调服务权益，非档案上锁 */
export const guestMembershipPitch = {
  title: '开通家庭医生会员',
  tagline: '专属团队 · 检查额度 · 复查提醒',
  fromPrice: 2399,
}

/** @deprecated 使用 membershipPlansDetail */
export const membershipTiers = membershipPlansDetail.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  family: p.family,
  hot: p.hot,
}))
