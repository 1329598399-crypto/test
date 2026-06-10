export type AuthGrantType = 'family' | 'doctor' | 'temp_doctor'
export type AuthScope = 'view_all' | 'view_add' | 'visit_readonly'
export type AuthGrantStatus = 'active' | 'expired' | 'revoked'
export type AuthFilterTab = 'all' | 'family' | 'doctor' | 'temp'

export interface ArchiveAuthGrant {
  id: string
  name: string
  roleLabel: string
  avatar: string
  tone: string
  type: AuthGrantType
  scope: AuthScope
  duration: 'long' | 'temp'
  status: AuthGrantStatus
  createdAt: string
  expiresAt: string | null
  familyMemberId?: string
}

export interface TempAuthSession {
  code: string
  createdAt: number
  expiresAt: number
}

export const authScopeOptions: { id: AuthScope; label: string; desc: string }[] = [
  { id: 'view_all', label: '查看全部档案', desc: '含健康史、检查报告与就医资料' },
  { id: 'view_add', label: '查看并补充', desc: '可查看档案并补充记录，适合家庭医生' },
  { id: 'visit_readonly', label: '就诊只读摘要', desc: '仅外院就诊时查看摘要，不含完整档案' },
]

export const authDurationOptions: { id: 'long' | 'temp'; hours: number | null; label: string }[] = [
  { id: 'long', hours: null, label: '长期授权' },
  { id: 'temp', hours: 24, label: '24 小时' },
  { id: 'temp', hours: 168, label: '7 天' },
]

export const authTypeOptions: {
  id: AuthGrantType
  label: string
  desc: string
  defaultScope: AuthScope
}[] = [
  { id: 'family', label: '家人', desc: '配偶、父母、子女等家庭成员', defaultScope: 'view_all' },
  { id: 'doctor', label: '医生团队', desc: '家庭医生、健康管理师', defaultScope: 'view_add' },
  { id: 'temp_doctor', label: '外院医生', desc: '就诊时临时授权，到期自动失效', defaultScope: 'visit_readonly' },
]

/** @deprecated 家人候选请使用 useAuthableFamilyMembers() 从 store 动态读取 */
export const authAddFamilyCandidates = [
  { id: 'f2', name: '王小乐', relation: '儿子', avatar: '乐', tone: 'from-blue-500 to-indigo-500' },
  { id: 'f-add', name: '李静', relation: '配偶', avatar: '静', tone: 'from-rose-400 to-pink-500' },
]

export const authAddDoctorCandidates = [
  { id: 'd1', name: '张医生', roleLabel: '家庭医生', avatar: '张', tone: 'from-emerald-500 to-teal-500' },
  { id: 'd2', name: '刘健康管理师', roleLabel: '健康管理师', avatar: '刘', tone: 'from-violet-500 to-purple-500' },
]

const now = Date.now()
const hours18 = now + 18 * 60 * 60 * 1000

export const defaultArchiveAuthGrants: ArchiveAuthGrant[] = [
  {
    id: 'ag1',
    name: '王小乐',
    roleLabel: '儿子',
    avatar: '乐',
    tone: 'from-blue-500 to-indigo-500',
    type: 'family',
    scope: 'view_all',
    duration: 'long',
    status: 'active',
    createdAt: '2026-03-12',
    expiresAt: null,
    familyMemberId: 'f2',
  },
  {
    id: 'ag2',
    name: '张医生',
    roleLabel: '家庭医生',
    avatar: '张',
    tone: 'from-emerald-500 to-teal-500',
    type: 'doctor',
    scope: 'view_add',
    duration: 'long',
    status: 'active',
    createdAt: '2026-01-08',
    expiresAt: null,
  },
  {
    id: 'ag3',
    name: '李大夫',
    roleLabel: '骨科 · 外院',
    avatar: '李',
    tone: 'from-slate-500 to-slate-600',
    type: 'temp_doctor',
    scope: 'visit_readonly',
    duration: 'temp',
    status: 'active',
    createdAt: '2026-06-08',
    expiresAt: new Date(hours18).toISOString(),
  },
]

export function scopeLabel(scope: AuthScope): string {
  return authScopeOptions.find((o) => o.id === scope)?.label ?? scope
}

export function formatGrantDesc(grant: ArchiveAuthGrant): string {
  const scope = scopeLabel(grant.scope)
  if (grant.duration === 'long') return `${scope} · 长期授权`
  return `${scope} · 临时授权`
}

export function getGrantStatusLabel(grant: ArchiveAuthGrant, nowMs = Date.now()): string {
  if (grant.status === 'revoked') return '已撤销'
  if (grant.status === 'expired') return '已过期'
  if (grant.duration === 'long' || !grant.expiresAt) return '已授权'
  const left = new Date(grant.expiresAt).getTime() - nowMs
  if (left <= 0) return '已过期'
  const hours = Math.ceil(left / (60 * 60 * 1000))
  if (hours >= 24) return `剩余${Math.ceil(hours / 24)}天`
  return `剩余${hours}h`
}

export function getActiveFamilyGrant(
  grants: ArchiveAuthGrant[],
  familyMemberId: string,
  nowMs = Date.now(),
): ArchiveAuthGrant | undefined {
  return grants.find(
    (g) => g.familyMemberId === familyMemberId && isGrantActive(g, nowMs),
  )
}

export function isFamilyMemberAuthorized(
  grants: ArchiveAuthGrant[],
  familyMemberId: string,
  nowMs = Date.now(),
): boolean {
  return Boolean(getActiveFamilyGrant(grants, familyMemberId, nowMs))
}

export function isGrantActive(grant: ArchiveAuthGrant, nowMs = Date.now()): boolean {
  if (grant.status === 'revoked' || grant.status === 'expired') return false
  if (grant.duration === 'long' || !grant.expiresAt) return true
  return new Date(grant.expiresAt).getTime() > nowMs
}

export function isGrantExpiringSoon(grant: ArchiveAuthGrant, nowMs = Date.now()): boolean {
  if (!isGrantActive(grant, nowMs) || !grant.expiresAt) return false
  const left = new Date(grant.expiresAt).getTime() - nowMs
  return left > 0 && left <= 24 * 60 * 60 * 1000
}

export function filterAuthGrants(
  grants: ArchiveAuthGrant[],
  tab: AuthFilterTab,
  nowMs = Date.now(),
): ArchiveAuthGrant[] {
  const activeFirst = [...grants].sort((a, b) => {
    const aActive = isGrantActive(a, nowMs) ? 0 : 1
    const bActive = isGrantActive(b, nowMs) ? 0 : 1
    return aActive - bActive
  })
  if (tab === 'all') return activeFirst
  if (tab === 'family') return activeFirst.filter((g) => g.type === 'family')
  if (tab === 'doctor') return activeFirst.filter((g) => g.type === 'doctor')
  return activeFirst.filter((g) => g.type === 'temp_doctor' || g.duration === 'temp')
}

export function formatTempAuthCountdown(expiresAt: number, nowMs = Date.now()): string {
  const left = expiresAt - nowMs
  if (left <= 0) return '已失效'
  const h = Math.floor(left / (60 * 60 * 1000))
  const m = Math.floor((left % (60 * 60 * 1000)) / (60 * 1000))
  if (h > 0) return `${h}小时${m}分`
  return `${m}分钟`
}
