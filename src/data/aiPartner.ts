export type PartnerGender = 'secret' | 'female' | 'male'

export type PartnerCallMode = 'owner' | 'nickname' | 'xiaodong'

export interface AiPartnerProfile {
  name: string
  callMode: PartnerCallMode
  callLabel: string
  gender: PartnerGender
  genderLabel: string
  identity: string
  personality: string
  avatarVariant: number
  completed: boolean
  createdAt?: string
}

const STORAGE_KEY = 'fd_ai_partner_v1'

export const PARTNER_CALL_OPTIONS: { value: PartnerCallMode; label: string }[] = [
  { value: 'owner', label: '主人' },
  { value: 'nickname', label: '昵称' },
  { value: 'xiaodong', label: '小懂' },
]

export const PARTNER_GENDER_OPTIONS: { value: PartnerGender; label: string }[] = [
  { value: 'secret', label: '保密' },
  { value: 'female', label: '女孩' },
  { value: 'male', label: '男孩' },
]

export const PERSONALITY_PRESETS = [
  '萌系撒娇、爱黏人，对你充满依赖，好奇心强，情绪真挚外露。',
  '温柔体贴，擅长健康提醒与记录代录，说话简洁清晰。',
  '活泼开朗，喜欢用轻松语气鼓励你完成每日健康任务。',
  '沉稳可靠，侧重科普解释与就医提醒，不替代医生诊断。',
]

export const IDENTITY_PRESETS = [
  '你的健康小助手',
  '你的电子宠物',
  '你的家庭医生伙伴',
]

export const DEFAULT_PARTNER: AiPartnerProfile = {
  name: '小懂',
  callMode: 'xiaodong',
  callLabel: '小懂',
  gender: 'secret',
  genderLabel: '保密',
  identity: '你的健康小助手',
  personality: PERSONALITY_PRESETS[0],
  avatarVariant: 0,
  completed: false,
}

export function getPartnerCallLabel(mode: PartnerCallMode): string {
  return PARTNER_CALL_OPTIONS.find((o) => o.value === mode)?.label ?? '小懂'
}

export function getPartnerGenderLabel(gender: PartnerGender): string {
  return PARTNER_GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? '保密'
}

export function loadAiPartner(): AiPartnerProfile {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_PARTNER }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PARTNER }
    return { ...DEFAULT_PARTNER, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PARTNER }
  }
}

export function saveAiPartner(profile: AiPartnerProfile) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent('fd-ai-partner-updated'))
}

export function hasCompletedAiPartner(): boolean {
  return loadAiPartner().completed
}

export function randomPartnerDraft(base?: Partial<AiPartnerProfile>): AiPartnerProfile {
  const names = ['小懂', 'TATA', '暖暖', '安安', '团子']
  const variant = Math.floor(Math.random() * 6)
  return {
    ...DEFAULT_PARTNER,
    ...base,
    name: names[Math.floor(Math.random() * names.length)],
    personality: PERSONALITY_PRESETS[Math.floor(Math.random() * PERSONALITY_PRESETS.length)],
    identity: IDENTITY_PRESETS[Math.floor(Math.random() * IDENTITY_PRESETS.length)],
    avatarVariant: variant,
    gender: PARTNER_GENDER_OPTIONS[Math.floor(Math.random() * PARTNER_GENDER_OPTIONS.length)].value,
    genderLabel: getPartnerGenderLabel(
      PARTNER_GENDER_OPTIONS[Math.floor(Math.random() * PARTNER_GENDER_OPTIONS.length)].value,
    ),
  }
}

export function partnerDisplayGreeting(partner: AiPartnerProfile): string {
  if (partner.callMode === 'owner') return '主人'
  if (partner.callMode === 'nickname') return partner.name
  return partner.name || '小懂'
}

export function buildPartnerWelcome(partner: AiPartnerProfile, role: 'normal' | 'member'): string {
  const who = partnerDisplayGreeting(partner)
  const tone = partner.personality.slice(0, 18)
  if (role === 'member') {
    return `Hi，${who}。我是${partner.name}，${partner.identity}。已同步您的会员服务，${tone}… 有什么健康相关问题都可以问我。`
  }
  return `Hi，${who}。我是${partner.name}，${partner.identity}。${tone}… 从今天起，您可以问我健康科普、记录代录与功能引导。`
}
