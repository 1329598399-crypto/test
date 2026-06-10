import { presetAccounts } from '../data/authMock'
import type { AuthUser } from '../data/authMock'
import type { AddFamilyMemberInput, FamilyMemberRecord } from '../data/familyMemberData'
import {
  inverseFamilyRelation,
  type FamilyLinkRequest,
} from '../data/familyLinkData'
import type { AuthorizedArchiveSnapshot } from '../data/authorizedArchiveSnapshots'
import { normalizePhone, isValidPhone } from './authService'
import { resolveAccount } from './authService'

export function lookupAccountByPhone(
  phoneRaw: string,
  registeredUsers: Record<string, AuthUser>,
): AuthUser | null {
  const phone = normalizePhone(phoneRaw)
  if (!isValidPhone(phone)) return null
  return resolveAccount(phone, registeredUsers)
}

export function calcAgeFromBirth(birth: string): number {
  const year = new Date(birth).getFullYear()
  if (Number.isNaN(year)) return 0
  return Math.max(1, new Date().getFullYear() - year)
}

export function validateAddFamilyMember(
  input: AddFamilyMemberInput,
  ownerUserId: string,
  ownerPhone: string | undefined,
  existing: FamilyMemberRecord[],
  registeredUsers: Record<string, AuthUser>,
): string | null {
  if (!input.name.trim()) return '请填写家庭成员姓名'
  if (!input.relation) return '请选择成员关系'
  if (!input.birth) return '请选择出生日期'
  if (!input.gender || input.gender === '未设置') return '请选择性别'

  const phone = input.phone ? normalizePhone(input.phone) : ''
  if (input.mode !== 'managed') {
    if (!phone) return '请输入对方手机号'
    if (!isValidPhone(phone)) return '请输入正确的 11 位手机号'
    if (ownerPhone && phone === normalizePhone(ownerPhone)) return '不能添加本人为家庭成员'
  }

  const linkedAccount = phone ? lookupAccountByPhone(phone, registeredUsers) : null
  if (linkedAccount?.userId === ownerUserId) return '不能添加本人为家庭成员'

  const dup = existing.find(
    (m) => m.phone && phone && normalizePhone(m.phone) === phone,
  )
  if (dup) {
    if (dup.accountStatus === 'link_pending') {
      return '已向该手机号发送关联申请，请等待对方确认'
    }
    return '该手机号已在家庭成员列表中'
  }

  if (input.mode === 'link' && !linkedAccount) {
    return '未找到该手机号对应的注册账号，可改用「发送账号邀请」'
  }

  if (input.mode === 'invite' && linkedAccount) {
    return `该手机号已注册为「${linkedAccount.displayName}」，请改用「关联已有账号」`
  }

  return null
}

export function buildFamilyMemberRecord(
  input: AddFamilyMemberInput,
  ownerUserId: string,
  registeredUsers: Record<string, AuthUser>,
  archiveSeq: number,
): FamilyMemberRecord {
  const phone = input.phone ? normalizePhone(input.phone) : undefined
  const linked = phone ? lookupAccountByPhone(phone, registeredUsers) : null
  const age = calcAgeFromBirth(input.birth)
  const id = `f-${Date.now()}`
  const archiveId = `F${ownerUserId.slice(-2)}${archiveSeq}`

  let accountStatus: FamilyMemberRecord['accountStatus'] = 'managed'
  let linkedUserId: string | undefined
  let invitedAt: string | undefined
  let tip = '档案已创建，可完善基础信息'
  let status = '新建'

  if (input.mode === 'link' && linked) {
    accountStatus = 'link_pending'
    linkedUserId = linked.userId
    tip = `已向 ${linked.displayName} 发送关联申请，待对方确认`
    status = '待确认'
  } else if (input.mode === 'invite' && phone) {
    accountStatus = linked ? 'pending' : 'invited'
    invitedAt = new Date().toLocaleString('zh-CN')
    tip = linked ? '对方注册后将自动完成关联' : '邀请短信已发送，待对方确认'
    status = '待确认'
  }

  return {
    id,
    name: input.name.trim(),
    relation: input.relation,
    gender: input.gender,
    age,
    birth: input.birth,
    phone,
    linkedUserId,
    archiveId,
    accountStatus,
    invitedAt,
    tip,
    status,
    avatar: input.name.trim().charAt(0),
  }
}

export function buildFamilyLinkRequest(
  member: FamilyMemberRecord,
  requester: AuthUser,
  target: AuthUser,
): FamilyLinkRequest {
  return {
    id: `flr-${Date.now()}`,
    memberId: member.id,
    requesterUserId: requester.userId,
    requesterName: requester.displayName,
    requesterPhone: requester.phone,
    targetUserId: target.userId,
    targetName: target.displayName,
    targetPhone: target.phone,
    relation: member.relation,
    inverseRelation: inverseFamilyRelation(member.relation),
    requestedAt: new Date().toLocaleString('zh-CN'),
    status: 'pending',
  }
}

export function buildReciprocalMember(request: FamilyLinkRequest): FamilyMemberRecord {
  return {
    id: `f-${Date.now()}-r`,
    name: request.requesterName,
    relation: request.inverseRelation,
    gender: '未设置',
    age: 0,
    phone: request.requesterPhone,
    linkedUserId: request.requesterUserId,
    archiveId: `R${request.targetUserId.slice(-2)}${Date.now().toString().slice(-3)}`,
    accountStatus: 'linked',
    tip: '已确认家庭关联，可发起档案授权',
    status: '已关联',
    avatar: request.requesterName.charAt(0),
  }
}

export function buildSnapshotFromMember(member: FamilyMemberRecord): AuthorizedArchiveSnapshot {
  return {
    archiveId: member.archiveId,
    name: member.name,
    gender: member.gender,
    age: member.age,
    relationship: member.relation,
    bloodType: '待完善',
    height: '—',
    weight: '—',
    syncAt: new Date().toLocaleString('zh-CN'),
    completeness: member.accountStatus === 'managed' ? 35 : 48,
    chips: [{ label: '新建家庭档案', tone: 'gray' }],
    allergies: [],
    recentRecords: [],
    exams: [],
    followups: [
      {
        date: new Date().toLocaleDateString('zh-CN'),
        title: '档案初始化',
        note:
          member.accountStatus === 'linked'
            ? '已关联平台账号，完善基础信息后可发起授权'
            : member.accountStatus === 'link_pending'
              ? '等待对方确认关联申请'
              : member.accountStatus === 'invited'
              ? '等待对方确认邀请后开启共享'
              : '由家庭成员代管，可逐步补充健康记录',
      },
    ],
    visitSummary: {
      focus: ['完善基础体征信息', '补充过敏史与既往史'],
      medications: [],
      recentExams: [],
    },
  }
}

const authFamilyAvatarTones = [
  'from-blue-500 to-indigo-500',
  'from-rose-400 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
]

/** 可发起档案授权的家庭成员状态 */
export function isFamilyMemberAuthable(member: FamilyMemberRecord): boolean {
  return member.accountStatus === 'linked' || member.accountStatus === 'managed'
}

export function toAuthFamilyCandidate(member: FamilyMemberRecord, index = 0) {
  return {
    id: member.id,
    name: member.name,
    relation: member.relation,
    avatar: member.avatar,
    tone: authFamilyAvatarTones[index % authFamilyAvatarTones.length],
    accountStatus: member.accountStatus,
  }
}

export function toArchivePersonPill(member: FamilyMemberRecord) {
  return {
    archiveId: member.archiveId,
    name: member.name,
    relationship: member.relation,
    avatar: member.avatar,
    gender: member.gender,
    age: member.age,
  }
}

export function maskPhoneShort(phone?: string) {
  if (!phone || phone.length < 11) return phone ?? ''
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

export function getPresetHintForPhone(phone: string): string | null {
  const preset = presetAccounts[normalizePhone(phone)]
  if (!preset) return null
  return `已识别演示账号：${preset.displayName}`
}
