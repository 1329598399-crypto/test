/**
 * C 端会员配置（由 B 端运营「发布到小程序」同步，或使用内置默认）
 */
import {
  membershipCoreBenefits as defaultCoreBenefits,
  membershipFamilyRules as defaultFamilyRules,
  membershipFaqs as defaultFaqs,
  membershipPlansDetail as defaultPlans,
  membershipServiceItems as defaultServiceItems,
  type MembershipPlanDetail,
} from './membershipBenefits'

export const MEMBERSHIP_CONFIG_STORAGE_KEY = 'fd_miniapp_membership_config_v1'

export type BenefitValueType = 'universal' | 'count' | 'money' | 'text' | 'boolean'

export interface MembershipServiceItemConfig {
  id: string
  category: string
  title: string
  desc: string
  valueType: BenefitValueType
  unit?: string
  sortCode?: number
  status?: string
  icon?: string
}

export interface MembershipPlanConfig extends MembershipPlanDetail {
  benefitValues?: Record<string, string>
}

export interface MembershipConfigPayload {
  serviceItems: MembershipServiceItemConfig[]
  plans: MembershipPlanConfig[]
  familyRules: typeof defaultFamilyRules
  faqs: { q: string; a: string }[]
  coreBenefits: { id: string; icon: string; title: string; desc: string }[]
}

function inferValueType(id: string): BenefitValueType {
  if (['consult', 'assess', 'exam_plan', 'recheck', 'green', 'annual'].includes(id)) return 'universal'
  if (id === 'specialist' || id === 'multi') return 'count'
  if (id === 'exam_quota' || id === 'gift') return 'money'
  return 'text'
}

function buildLegacyBenefitValues(plan: MembershipPlanDetail): Record<string, string> {
  return {
    consult: '√',
    assess: '√',
    exam_plan: '√',
    recheck: '√',
    outpatient: '不限次',
    green: '√',
    annual: '√',
    specialist: `${plan.specialistVisits} 次`,
    multi: plan.multiDisciplinary ? `${plan.multiDisciplinary} 次` : '—',
    exam_quota: `¥${plan.examQuota.toLocaleString()}`,
    discount: plan.discount ?? '—',
    gift: plan.giftPack ? `¥${plan.giftPack.toLocaleString()}` : '—',
    ...(plan.familySlots ? { family_slots: `含 ${plan.familySlots} 人，可增购` } : {}),
  }
}

const defaultPayload = (): MembershipConfigPayload => ({
  serviceItems: defaultServiceItems.map((i, idx) => ({
    id: i.id,
    category: i.category,
    title: i.title,
    desc: i.desc,
    valueType: inferValueType(i.id),
    unit: i.id === 'specialist' || i.id === 'multi' ? '次' : i.id === 'exam_quota' || i.id === 'gift' ? '元' : '',
    sortCode: idx + 1,
    status: 'ON',
  })),
  plans: defaultPlans.map((p) => ({
    ...p,
    benefitValues: buildLegacyBenefitValues(p),
  })),
  familyRules: defaultFamilyRules,
  faqs: [...defaultFaqs],
  coreBenefits: [...defaultCoreBenefits],
})

let cached: MembershipConfigPayload | null = null

export function loadMembershipConfig(): MembershipConfigPayload {
  if (cached) return cached
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(MEMBERSHIP_CONFIG_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as MembershipConfigPayload
        if (parsed?.plans?.length && parsed?.serviceItems?.length) {
          cached = parsed
          return parsed
        }
      }
    } catch {
      /* fallback */
    }
  }
  cached = defaultPayload()
  return cached
}

export function saveMembershipConfigOverride(payload: MembershipConfigPayload) {
  cached = payload
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEMBERSHIP_CONFIG_STORAGE_KEY, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent('fd-ops-membership-updated'))
  }
}

export function invalidateMembershipConfigCache() {
  cached = null
}

export function getMembershipPlansFromConfig(): MembershipPlanConfig[] {
  return loadMembershipConfig().plans
}

export function getMembershipPlanFromConfig(planId: string): MembershipPlanConfig | undefined {
  return getMembershipPlansFromConfig().find((p) => p.id === planId)
}

export function getCompareRowsFromConfig() {
  const cfg = loadMembershipConfig()
  const items = cfg.serviceItems.filter((i) => i.status !== 'OFF')
  return items.map((item) => ({
    id: item.id,
    label: item.title,
    getValue: (plan: MembershipPlanConfig) => {
      const raw = plan.benefitValues?.[item.id]
      if (raw === '√') return true
      if (raw === '—' || raw == null) return '—'
      return raw
    },
  }))
}

export function getCoreBenefitsFromConfig() {
  return loadMembershipConfig().coreBenefits
}

export function getMembershipFaqsFromConfig() {
  return loadMembershipConfig().faqs
}
