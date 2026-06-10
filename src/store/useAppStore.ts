import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import {
  STORAGE_KEY,
  activityCatalog,
  homeData,
  pointsHistory,
  type Role,
} from '../data/mockData'
import type { PastHistoryItem } from '../data/pastHistoryOptions'
import type { FamilyHistoryItem } from '../data/familyHistoryOptions'
import type { MedicalDocItem, MedDocMoveMember } from '../data/medicalDocsData'
import { defaultMedDocMoveMembers } from '../data/medicalDocsData'
import type { ArchiveAuthGrant, TempAuthSession } from '../data/archiveAuthData'
import { defaultArchiveAuthGrants } from '../data/archiveAuthData'
import type { AddFamilyMemberInput, FamilyMemberRecord } from '../data/familyMemberData'
import { defaultFamilyMembersByOwner } from '../data/familyMemberData'
import type { AuthorizedArchiveSnapshot } from '../data/authorizedArchiveSnapshots'
import type {
  ArchiveBasicOverride,
  ArchiveDocItem,
  ReportHistoryEntry,
} from '../lib/archiveHelpers'
import { formatSyncNow } from '../lib/archiveHelpers'
import type { AuthUser } from '../data/authMock'
import { SMS_COOLDOWN_SEC, maskPhone } from '../data/authMock'
import type { FamilyLinkRequest } from '../data/familyLinkData'
import {
  buildFamilyLinkRequest,
  buildFamilyMemberRecord,
  buildReciprocalMember,
  buildSnapshotFromMember,
  isFamilyMemberAuthable,
  lookupAccountByPhone,
  toAuthFamilyCandidate,
  validateAddFamilyMember,
} from '../lib/familyMemberService'
import {
  buildRegisteredUser,
  isValidPhone,
  makeToken,
  normalizePhone,
  resolveAccount,
  validateLoginInput,
  validateRegisterInput,
  type RegisterInput,
} from '../lib/authService'

export interface RecordLog {
  id: string
  type: string
  summary: string
  time: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

interface AppState {
  role: Role
  selectedArchiveId: string | null
  privacyProtected: boolean
  signedMembership: boolean
  selectedPlan: string
  recordLogs: RecordLog[]
  pathCompletedNodeIds: string[]
  chatMessages: ChatMessage[]
  activityJoined: Record<string, boolean>
  reportHistory: ReportHistoryEntry[]
  archiveSyncAt: Partial<Record<Role, string>>
  archiveBasics: Partial<Record<Role, ArchiveBasicOverride>>
  archiveDocs: ArchiveDocItem[]
  archiveExtraAllergies: Partial<
    Record<Role, { name: string; severity: string; reaction: string }[]>
  >
  archiveExtraPastHistory: Partial<Record<Role, PastHistoryItem[]>>
  archiveExtraFamilyHistory: Partial<Record<Role, FamilyHistoryItem[]>>
  medicalDocExtras: MedicalDocItem[]
  medicalDocOverrides: Record<string, MedicalDocItem>
  deletedMedicalDocIds: string[]
  medDocMoveMembers: MedDocMoveMember[]
  planDone: Record<string, boolean>
  sharePinCode: string | null
  archiveAuthGrants: ArchiveAuthGrant[]
  tempAuthSession: TempAuthSession | null
  toastMessage: string | null
  familyAuth: Record<string, boolean>
  familyMembersByOwner: Record<string, FamilyMemberRecord[]>
  familyMemberSnapshots: Record<string, AuthorizedArchiveSnapshot>
  familyLinkRequests: FamilyLinkRequest[]
  isLoggedIn: boolean
  accessToken: string | null
  authUser: AuthUser | null
  registeredUsers: Record<string, AuthUser>
  smsCooldownUntil: number
  toggleRole: () => void
  setArchivePerson: (id: string) => void
  togglePrivacy: () => void
  signMembership: (planId: string) => void
  toggleTask: (taskId: string) => void
  addRecord: (type: string, summary: string) => void
  completePathNode: (nodeId: string) => void
  sendChat: (text: string) => string
  joinActivity: (id: string) => void
  showToast: (msg: string) => void
  clearToast: () => void
  addReportHistory: (entry: ReportHistoryEntry) => void
  updateArchiveBasic: (role: Role, partial: ArchiveBasicOverride) => void
  touchArchiveSync: (role: Role) => void
  addArchiveDoc: (folder: string, name: string) => void
  addArchiveAllergy: (
    role: Role,
    allergy: { name: string; severity: string; reaction: string },
  ) => void
  addArchivePastHistory: (role: Role, item: PastHistoryItem) => void
  addArchiveFamilyHistory: (role: Role, item: FamilyHistoryItem) => void
  addMedicalDoc: (doc: MedicalDocItem) => void
  updateMedicalDoc: (doc: MedicalDocItem) => void
  deleteMedicalDoc: (id: string) => void
  addMedDocMoveMember: (member: MedDocMoveMember) => void
  setPlanDone: (id: string, done: boolean) => void
  setSharePinCode: (code: string | null) => void
  addArchiveAuthGrant: (grant: Omit<ArchiveAuthGrant, 'id' | 'status' | 'createdAt'>) => void
  revokeArchiveAuthGrant: (id: string) => void
  extendArchiveAuthGrant: (id: string, hours: number) => void
  generateTempAuthSession: (hours?: number) => TempAuthSession
  verifyTempAuthCode: (code: string) => { ok: true } | { ok: false; error: string }
  clearTempAuthSession: () => void
  toggleFamilyAuth: (id: string) => void
  addFamilyMember: (input: AddFamilyMemberInput) => string | null
  resendFamilyInvite: (memberId: string) => string | null
  resendFamilyLinkRequest: (memberId: string) => string | null
  cancelFamilyLinkRequest: (memberId: string) => string | null
  acceptFamilyLinkRequest: (requestId: string) => string | null
  rejectFamilyLinkRequest: (requestId: string) => string | null
  getFamilyMembers: () => FamilyMemberRecord[]
  getPendingLinkRequestsForMe: () => FamilyLinkRequest[]
  sendSmsCode: (phone: string) => string | null
  login: (phone: string, code: string) => string | null
  register: (input: RegisterInput) => string | null
  logout: () => void
  resetDemo: () => void
  getRoleData: () => (typeof homeData)[Role]
}

const defaultLogs: RecordLog[] = [
  { id: 'r1', type: 'bp', summary: '135/86 mmHg', time: '今天 08:20' },
  { id: 'r2', type: 'diet', summary: '早餐燕麦+鸡蛋，约 420 kcal', time: '昨天 09:10' },
]

const defaultFamilyAuth: Record<string, boolean> = {
  f1: true,
  f2: true,
  f3: true,
}

const archiveDefaults = {
  reportHistory: [] as ReportHistoryEntry[],
  archiveSyncAt: {} as Partial<Record<Role, string>>,
  archiveBasics: {} as Partial<Record<Role, ArchiveBasicOverride>>,
  archiveDocs: [] as ArchiveDocItem[],
  archiveExtraAllergies: {} as Partial<
    Record<Role, { name: string; severity: string; reaction: string }[]>
  >,
  archiveExtraPastHistory: {} as Partial<Record<Role, PastHistoryItem[]>>,
  archiveExtraFamilyHistory: {} as Partial<Record<Role, FamilyHistoryItem[]>>,
  medicalDocExtras: [] as MedicalDocItem[],
  medicalDocOverrides: {} as Record<string, MedicalDocItem>,
  deletedMedicalDocIds: [] as string[],
  medDocMoveMembers: [...defaultMedDocMoveMembers],
  planDone: {} as Record<string, boolean>,
  sharePinCode: null as string | null,
  archiveAuthGrants: [...defaultArchiveAuthGrants],
  tempAuthSession: null as TempAuthSession | null,
  toastMessage: null as string | null,
  familyAuth: defaultFamilyAuth,
  familyMembersByOwner: { ...defaultFamilyMembersByOwner },
  familyMemberSnapshots: {} as Record<string, AuthorizedArchiveSnapshot>,
  familyLinkRequests: [] as FamilyLinkRequest[],
}

const authDefaults = {
  isLoggedIn: false,
  accessToken: null as string | null,
  authUser: null as AuthUser | null,
  registeredUsers: {} as Record<string, AuthUser>,
  smsCooldownUntil: 0,
}

function sessionFromUser(user: AuthUser) {
  return {
    isLoggedIn: true as const,
    authUser: user,
    accessToken: makeToken(user.userId),
    role: user.accountType,
    signedMembership: user.accountType === 'member',
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      role: 'normal',
      selectedArchiveId: null,
      privacyProtected: false,
      signedMembership: false,
      selectedPlan: 'standard',
      recordLogs: defaultLogs,
      pathCompletedNodeIds: [],
      chatMessages: [],
      activityJoined: { a3: true },
      ...archiveDefaults,
      ...authDefaults,

      toggleRole: () =>
        set((s) => {
          if (!s.isLoggedIn) return {}
          const nextRole = s.role === 'member' ? 'normal' : 'member'
          return {
            role: nextRole,
            authUser: s.authUser
              ? { ...s.authUser, accountType: nextRole }
              : null,
            signedMembership: nextRole === 'member',
          }
        }),

      setArchivePerson: (id) => set({ selectedArchiveId: id }),

      togglePrivacy: () =>
        set((s) => ({ privacyProtected: !s.privacyProtected })),

      signMembership: (planId) =>
        set((s) => {
          const phone = s.authUser?.phone
          const nextUser = s.authUser
            ? { ...s.authUser, accountType: 'member' as Role }
            : null
          const registeredUsers = phone && s.registeredUsers[phone]
            ? {
                ...s.registeredUsers,
                [phone]: { ...s.registeredUsers[phone], accountType: 'member' as Role },
              }
            : s.registeredUsers
          return {
            signedMembership: true,
            selectedPlan: planId,
            role: 'member',
            authUser: nextUser,
            registeredUsers,
          }
        }),

      toggleTask: (taskId) => {
        const role = get().role
        const tasks = homeData[role].tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t,
        )
        homeData[role].tasks = tasks
        set({})
      },

      addRecord: (type, summary) =>
        set((s) => ({
          recordLogs: [
            { id: `r${Date.now()}`, type, summary, time: '刚刚' },
            ...s.recordLogs,
          ],
        })),

      completePathNode: (nodeId) =>
        set((s) => {
          if (s.pathCompletedNodeIds.includes(nodeId)) return s
          return { pathCompletedNodeIds: [...s.pathCompletedNodeIds, nodeId] }
        }),

      sendChat: (text) => {
        const role = get().role
        let reply = '我已收到你的问题，会提供科普解释；涉及用药和诊断请由医生确认。'
        if (/血压|血糖|mmHg|mmol/.test(text)) {
          reply = '已识别为健康记录草稿，请确认后保存到档案。此为健康参考，不构成诊断。'
        } else if (/睡|失眠/.test(text)) {
          reply = '睡眠不足可能与压力、作息有关，可先记录近 7 天睡眠感受。'
        } else if (/会员|权益/.test(text)) {
          reply =
            role === 'member'
              ? '您当前为标准会员，可在「我的」查看权益与电子会员卡。'
              : '开通会员后可获得专属医生、复查提醒和月度报告。'
        }
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { role: 'user', text },
            { role: 'assistant', text: reply },
          ],
        }))
        return reply
      },

      joinActivity: (id) =>
        set((s) => ({
          activityJoined: { ...s.activityJoined, [id]: true },
        })),

      showToast: (msg) => set({ toastMessage: msg }),
      clearToast: () => set({ toastMessage: null }),

      addReportHistory: (entry) =>
        set((s) => ({
          reportHistory: [entry, ...s.reportHistory].slice(0, 8),
        })),

      updateArchiveBasic: (role, partial) =>
        set((s) => ({
          archiveBasics: {
            ...s.archiveBasics,
            [role]: { ...s.archiveBasics[role], ...partial },
          },
        })),

      touchArchiveSync: (role) =>
        set((s) => ({
          archiveSyncAt: { ...s.archiveSyncAt, [role]: formatSyncNow() },
        })),

      addArchiveDoc: (folder, name) => {
        const date = new Date().toLocaleDateString('zh-CN')
        set((s) => ({
          archiveDocs: [
            { id: `doc-${Date.now()}`, folder, name, date },
            ...s.archiveDocs,
          ],
        }))
      },

      addArchiveAllergy: (role, allergy) =>
        set((s) => ({
          archiveExtraAllergies: {
            ...s.archiveExtraAllergies,
            [role]: [...(s.archiveExtraAllergies[role] ?? []), allergy],
          },
        })),

      addArchivePastHistory: (role, item) =>
        set((s) => ({
          archiveExtraPastHistory: {
            ...s.archiveExtraPastHistory,
            [role]: [...(s.archiveExtraPastHistory[role] ?? []), item],
          },
        })),

      addArchiveFamilyHistory: (role, item) =>
        set((s) => ({
          archiveExtraFamilyHistory: {
            ...s.archiveExtraFamilyHistory,
            [role]: [...(s.archiveExtraFamilyHistory[role] ?? []), item],
          },
        })),

      addMedicalDoc: (doc) =>
        set((s) => ({
          medicalDocExtras: [doc, ...s.medicalDocExtras.filter((d) => d.id !== doc.id)],
        })),

      updateMedicalDoc: (doc) =>
        set((s) => {
          const isExtra = s.medicalDocExtras.some((d) => d.id === doc.id)
          if (isExtra) {
            return {
              medicalDocExtras: s.medicalDocExtras.map((d) => (d.id === doc.id ? doc : d)),
            }
          }
          return {
            medicalDocOverrides: { ...s.medicalDocOverrides, [doc.id]: doc },
          }
        }),

      deleteMedicalDoc: (id) =>
        set((s) => ({
          deletedMedicalDocIds: s.deletedMedicalDocIds.includes(id)
            ? s.deletedMedicalDocIds
            : [...s.deletedMedicalDocIds, id],
          medicalDocExtras: s.medicalDocExtras.filter((d) => d.id !== id),
        })),

      addMedDocMoveMember: (member) =>
        set((s) => ({
          medDocMoveMembers: [...s.medDocMoveMembers.filter((m) => m.id !== member.id), member],
        })),

      setPlanDone: (id, done) =>
        set((s) => ({
          planDone: { ...s.planDone, [id]: done },
        })),

      setSharePinCode: (code) => set({ sharePinCode: code }),

      addArchiveAuthGrant: (input) => {
        const grant: ArchiveAuthGrant = {
          ...input,
          id: `ag-${Date.now()}`,
          status: 'active',
          createdAt: new Date().toLocaleDateString('zh-CN'),
        }
        set((s) => ({
          archiveAuthGrants: [grant, ...s.archiveAuthGrants],
        }))
        if (input.familyMemberId) {
          set((s) => ({
            familyAuth: { ...s.familyAuth, [input.familyMemberId!]: true },
          }))
        }
      },

      revokeArchiveAuthGrant: (id) =>
        set((s) => {
          const target = s.archiveAuthGrants.find((g) => g.id === id)
          const next = s.archiveAuthGrants.map((g) =>
            g.id === id ? { ...g, status: 'revoked' as const } : g,
          )
          const familyAuth = target?.familyMemberId
            ? { ...s.familyAuth, [target.familyMemberId]: false }
            : s.familyAuth
          return { archiveAuthGrants: next, familyAuth }
        }),

      extendArchiveAuthGrant: (id, hours) =>
        set((s) => ({
          archiveAuthGrants: s.archiveAuthGrants.map((g) => {
            if (g.id !== id) return g
            const base = Math.max(Date.now(), g.expiresAt ? new Date(g.expiresAt).getTime() : Date.now())
            return {
              ...g,
              status: 'active' as const,
              duration: 'temp' as const,
              expiresAt: new Date(base + hours * 60 * 60 * 1000).toISOString(),
            }
          }),
        })),

      generateTempAuthSession: (hours = 24) => {
        const now = Date.now()
        const session: TempAuthSession = {
          code: `${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: now,
          expiresAt: now + hours * 60 * 60 * 1000,
        }
        set({ tempAuthSession: session, sharePinCode: session.code })
        return session
      },

      verifyTempAuthCode: (code) => {
        const session = get().tempAuthSession
        if (!session) {
          return { ok: false, error: '暂无有效授权码，请让患者先生成' }
        }
        if (session.expiresAt <= Date.now()) {
          return { ok: false, error: '授权码已过期，请重新生成' }
        }
        if (session.code !== code) {
          return { ok: false, error: '授权码不正确' }
        }
        return { ok: true }
      },

      clearTempAuthSession: () => set({ tempAuthSession: null, sharePinCode: null }),

      toggleFamilyAuth: (id) =>
        set((s) => ({
          familyAuth: { ...s.familyAuth, [id]: !s.familyAuth[id] },
        })),

      getFamilyMembers: () => {
        const userId = get().authUser?.userId ?? 'U1002'
        return get().familyMembersByOwner[userId] ?? defaultFamilyMembersByOwner[userId] ?? []
      },

      addFamilyMember: (input) => {
        const authUser = get().authUser
        if (!authUser) return '请先登录'
        const ownerId = authUser.userId
        const existing = get().familyMembersByOwner[ownerId] ?? []
        const err = validateAddFamilyMember(
          input,
          ownerId,
          authUser.phone,
          existing,
          get().registeredUsers,
        )
        if (err) return err

        const member = buildFamilyMemberRecord(
          input,
          ownerId,
          get().registeredUsers,
          existing.length + 1,
        )
        const snapshot = buildSnapshotFromMember(member)

        let linkRequest: FamilyLinkRequest | null = null
        if (input.mode === 'link' && member.linkedUserId && input.phone) {
          const target = lookupAccountByPhone(input.phone, get().registeredUsers)
          if (target) {
            linkRequest = buildFamilyLinkRequest(member, authUser, target)
          }
        }

        set((s) => ({
          familyMembersByOwner: {
            ...s.familyMembersByOwner,
            [ownerId]: [member, ...existing],
          },
          familyMemberSnapshots: {
            ...s.familyMemberSnapshots,
            [member.id]: snapshot,
          },
          familyLinkRequests: linkRequest
            ? [...s.familyLinkRequests, linkRequest]
            : s.familyLinkRequests,
          medDocMoveMembers: [
            ...s.medDocMoveMembers.filter((m) => m.id !== member.id),
            { id: member.id, name: member.name, relation: member.relation, age: member.age },
          ],
        }))
        return null
      },

      resendFamilyInvite: (memberId) => {
        const authUser = get().authUser
        if (!authUser) return '请先登录'
        const ownerId = authUser.userId
        const list = get().familyMembersByOwner[ownerId] ?? []
        const target = list.find((m) => m.id === memberId)
        if (!target) return '未找到该家庭成员'
        if (
          target.accountStatus !== 'invited' &&
          target.accountStatus !== 'pending' &&
          target.accountStatus !== 'link_pending'
        ) {
          return '该成员无需重新邀请'
        }
        if (target.accountStatus === 'link_pending') {
          return get().resendFamilyLinkRequest(memberId)
        }
        set((s) => ({
          familyMembersByOwner: {
            ...s.familyMembersByOwner,
            [ownerId]: list.map((m) =>
              m.id === memberId
                ? {
                    ...m,
                    invitedAt: new Date().toLocaleString('zh-CN'),
                    tip: '邀请已重新发送，待对方确认',
                  }
                : m,
            ),
          },
        }))
        get().showToast(`已向 ${target.name} 重发邀请`)
        return null
      },

      resendFamilyLinkRequest: (memberId) => {
        const authUser = get().authUser
        if (!authUser) return '请先登录'
        const ownerId = authUser.userId
        const list = get().familyMembersByOwner[ownerId] ?? []
        const target = list.find((m) => m.id === memberId)
        if (!target || target.accountStatus !== 'link_pending') {
          return '该成员无需重新发送关联申请'
        }
        set((s) => ({
          familyLinkRequests: s.familyLinkRequests.map((r) =>
            r.memberId === memberId && r.status === 'pending'
              ? { ...r, requestedAt: new Date().toLocaleString('zh-CN') }
              : r,
          ),
          familyMembersByOwner: {
            ...s.familyMembersByOwner,
            [ownerId]: list.map((m) =>
              m.id === memberId
                ? { ...m, tip: '关联申请已重新发送，待对方确认' }
                : m,
            ),
          },
        }))
        get().showToast(`已提醒 ${target.name} 确认关联`)
        return null
      },

      cancelFamilyLinkRequest: (memberId) => {
        const authUser = get().authUser
        if (!authUser) return '请先登录'
        const ownerId = authUser.userId
        const list = get().familyMembersByOwner[ownerId] ?? []
        const target = list.find((m) => m.id === memberId)
        if (!target || target.accountStatus !== 'link_pending') {
          return '无法撤回该申请'
        }
        set((s) => ({
          familyLinkRequests: s.familyLinkRequests.filter(
            (r) => !(r.memberId === memberId && r.status === 'pending'),
          ),
          familyMembersByOwner: {
            ...s.familyMembersByOwner,
            [ownerId]: list.filter((m) => m.id !== memberId),
          },
          familyMemberSnapshots: Object.fromEntries(
            Object.entries(s.familyMemberSnapshots).filter(([id]) => id !== memberId),
          ),
        }))
        get().showToast('已撤回关联申请')
        return null
      },

      acceptFamilyLinkRequest: (requestId) => {
        const authUser = get().authUser
        if (!authUser) return '请先登录'
        const request = get().familyLinkRequests.find(
          (r) => r.id === requestId && r.status === 'pending',
        )
        if (!request) return '未找到该关联申请'
        if (request.targetUserId !== authUser.userId) {
          return '无权处理该申请'
        }

        const ownerId = request.requesterUserId
        const ownerList = get().familyMembersByOwner[ownerId] ?? []
        const requesterMember = ownerList.find((m) => m.id === request.memberId)
        if (!requesterMember) return '关联申请已失效'

        const reciprocal = buildReciprocalMember(request)
        const reciprocalSnapshot = buildSnapshotFromMember(reciprocal)
        const targetId = authUser.userId
        const targetList = get().familyMembersByOwner[targetId] ?? []
        const alreadyLinked = targetList.some(
          (m) => m.linkedUserId === ownerId && m.accountStatus === 'linked',
        )

        set((s) => ({
          familyLinkRequests: s.familyLinkRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'accepted' as const } : r,
          ),
          familyMembersByOwner: {
            ...s.familyMembersByOwner,
            [ownerId]: ownerList.map((m) =>
              m.id === request.memberId
                ? {
                    ...m,
                    accountStatus: 'linked' as const,
                    tip: `已与 ${authUser.displayName} 确认关联，可发起档案授权`,
                    status: '已关联',
                  }
                : m,
            ),
            [targetId]: alreadyLinked
              ? targetList
              : [reciprocal, ...targetList],
          },
          familyMemberSnapshots: {
            ...s.familyMemberSnapshots,
            [reciprocal.id]: reciprocalSnapshot,
          },
          medDocMoveMembers: [
            ...s.medDocMoveMembers.filter((m) => m.id !== reciprocal.id),
            {
              id: reciprocal.id,
              name: reciprocal.name,
              relation: reciprocal.relation,
              age: reciprocal.age,
            },
          ],
        }))
        get().showToast(`已与 ${request.requesterName} 建立家庭关联`)
        return null
      },

      rejectFamilyLinkRequest: (requestId) => {
        const authUser = get().authUser
        if (!authUser) return '请先登录'
        const request = get().familyLinkRequests.find(
          (r) => r.id === requestId && r.status === 'pending',
        )
        if (!request) return '未找到该关联申请'
        if (request.targetUserId !== authUser.userId) {
          return '无权处理该申请'
        }

        const ownerId = request.requesterUserId
        const ownerList = get().familyMembersByOwner[ownerId] ?? []

        set((s) => ({
          familyLinkRequests: s.familyLinkRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'rejected' as const } : r,
          ),
          familyMembersByOwner: {
            ...s.familyMembersByOwner,
            [ownerId]: ownerList.filter((m) => m.id !== request.memberId),
          },
          familyMemberSnapshots: Object.fromEntries(
            Object.entries(s.familyMemberSnapshots).filter(
              ([id]) => id !== request.memberId,
            ),
          ),
        }))
        get().showToast('已拒绝关联申请')
        return null
      },

      getPendingLinkRequestsForMe: () => {
        const userId = get().authUser?.userId
        if (!userId) return []
        return get().familyLinkRequests.filter(
          (r) => r.targetUserId === userId && r.status === 'pending',
        )
      },

      sendSmsCode: (phoneRaw) => {
        const phone = normalizePhone(phoneRaw)
        if (!isValidPhone(phone)) return '请输入正确的 11 位手机号'
        const now = Math.floor(Date.now() / 1000)
        if (get().smsCooldownUntil > now) return null
        set({ smsCooldownUntil: now + SMS_COOLDOWN_SEC })
        get().showToast(`验证码已发送至 ${maskPhone(phone)}`)
        return null
      },

      login: (phoneRaw, code) => {
        const result = validateLoginInput(phoneRaw, code)
        if (!result.ok) return result.error

        let user = resolveAccount(result.phone, get().registeredUsers)
        let registeredUsers = get().registeredUsers

        if (!user) {
          user = buildRegisteredUser(result.phone, `用户${result.phone.slice(-4)}`)
          registeredUsers = { ...registeredUsers, [result.phone]: user }
        }

        set({ ...sessionFromUser(user), registeredUsers })
        return null
      },

      register: (input) => {
        const result = validateRegisterInput(input, get().registeredUsers)
        if (!result.ok) return result.error

        const user = buildRegisteredUser(result.phone, input.displayName)
        const registeredUsers = {
          ...get().registeredUsers,
          [result.phone]: user,
        }

        set({ ...sessionFromUser(user), registeredUsers })
        return null
      },

      logout: () => {
        set({
          isLoggedIn: false,
          accessToken: null,
          authUser: null,
          role: 'normal',
          signedMembership: false,
          selectedArchiveId: null,
          chatMessages: [],
        })
      },

      resetDemo: () => {
        localStorage.removeItem(STORAGE_KEY)
        set({
          role: 'normal',
          selectedArchiveId: null,
          privacyProtected: false,
          signedMembership: false,
          selectedPlan: 'standard',
          recordLogs: defaultLogs,
          pathCompletedNodeIds: [],
          chatMessages: [],
          activityJoined: { a3: true },
          ...archiveDefaults,
          ...authDefaults,
          familyAuth: { ...defaultFamilyAuth },
          familyMembersByOwner: { ...defaultFamilyMembersByOwner },
          familyMemberSnapshots: {},
          familyLinkRequests: [],
        })
      },

      getRoleData: () => {
        const { role, authUser } = get()
        const base = homeData[role]
        if (!authUser?.displayName) return base
        return { ...base, userName: authUser.displayName }
      },
    }),
    {
      name: STORAGE_KEY,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AppState>
        const authUser = saved.authUser ?? null
        return {
          ...current,
          ...saved,
          isLoggedIn: Boolean(saved.isLoggedIn && authUser),
          authUser,
          accessToken: saved.accessToken ?? null,
          registeredUsers: saved.registeredUsers ?? {},
          smsCooldownUntil: saved.smsCooldownUntil ?? 0,
        }
      },
    },
  ),
)

/** 稳定引用，避免 useAppStore(s => s.getRoleData()) 导致无限重渲染 */
export function useRoleData() {
  const role = useAppStore((s) => s.role)
  const displayName = useAppStore((s) => s.authUser?.displayName)
  return useMemo(() => {
    const base = homeData[role]
    if (!displayName) return base
    return { ...base, userName: displayName }
  }, [role, displayName])
}

/** 当前登录账号的家庭成员列表 */
export function useFamilyMembers() {
  const userId = useAppStore((s) => s.authUser?.userId)
  const familyMembersByOwner = useAppStore((s) => s.familyMembersByOwner)
  return useMemo(() => {
    const id = userId ?? 'U1002'
    return familyMembersByOwner[id] ?? defaultFamilyMembersByOwner[id] ?? []
  }, [userId, familyMembersByOwner])
}

/** 已关联/代管、可发起档案授权的家人（与档案授权页共用） */
export function useAuthableFamilyMembers() {
  const members = useFamilyMembers()
  return useMemo(
    () =>
      members
        .filter(isFamilyMemberAuthable)
        .map((m, i) => toAuthFamilyCandidate(m, i)),
    [members],
  )
}

export function getArchivePct(role: Role) {
  return parseInt(homeData[role].archiveRate, 10) || 0
}

export function getPoints(role: Role) {
  const d = homeData[role]
  return { today: d.todayPoints, total: d.totalPoints }
}

export { activityCatalog, pointsHistory }
