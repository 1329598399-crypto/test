/** 家庭成员与平台账号的关联状态 */
export type FamilyAccountStatus =
  | 'linked'
  | 'link_pending'
  | 'invited'
  | 'managed'
  | 'pending'

export type FamilyAddMode = 'link' | 'invite' | 'managed'

export interface FamilyMemberRecord {
  id: string
  name: string
  relation: string
  gender: string
  age: number
  birth?: string
  phone?: string
  linkedUserId?: string
  archiveId: string
  accountStatus: FamilyAccountStatus
  invitedAt?: string
  tip: string
  status: string
  avatar: string
}

export interface AddFamilyMemberInput {
  name: string
  relation: string
  gender: string
  birth: string
  phone?: string
  mode: FamilyAddMode
}

export const familyRelationOptions = [
  '配偶',
  '父亲',
  '母亲',
  '儿子',
  '女儿',
  '其他',
] as const

export const familyAddModeOptions: {
  id: FamilyAddMode
  title: string
  desc: string
  requiresPhone: boolean
}[] = [
  {
    id: 'link',
    title: '关联已有账号',
    desc: '对方已注册，提交后需对方在小程序内确认关联',
    requiresPhone: true,
  },
  {
    id: 'invite',
    title: '发送账号邀请',
    desc: '对方未注册时发送短信邀请，确认后关联',
    requiresPhone: true,
  },
  {
    id: 'managed',
    title: '代管档案（无账号）',
    desc: '适用于儿童、老人等无独立账号场景，由您代为管理',
    requiresPhone: false,
  },
]

export const familyAccountStatusLabel: Record<
  FamilyAccountStatus,
  { label: string; tone: 'green' | 'amber' | 'blue' | 'gray' }
> = {
  linked: { label: '已关联账号', tone: 'green' },
  link_pending: { label: '关联待确认', tone: 'amber' },
  invited: { label: '邀请待确认', tone: 'amber' },
  managed: { label: '代管档案', tone: 'blue' },
  pending: { label: '待注册关联', tone: 'gray' },
}

function member(
  partial: Omit<FamilyMemberRecord, 'avatar'> & { avatar?: string },
): FamilyMemberRecord {
  return {
    ...partial,
    avatar: partial.avatar ?? partial.name.charAt(0),
  }
}

/** 按账号主体（userId）隔离的家庭成员默认数据 */
export const defaultFamilyMembersByOwner: Record<string, FamilyMemberRecord[]> = {
  U1002: [
    member({
      id: 'f3',
      name: '李静',
      relation: '配偶',
      gender: '女',
      age: 36,
      birth: '1990-03-15',
      phone: '13800138001',
      linkedUserId: 'U1001',
      archiveId: 'B002',
      accountStatus: 'linked',
      tip: '睡眠记录已更新',
      status: '有动态',
    }),
    member({
      id: 'f2',
      name: '王小乐',
      relation: '儿子',
      gender: '男',
      age: 8,
      birth: '2018-05-20',
      archiveId: 'B003',
      accountStatus: 'managed',
      tip: '儿童生长档案由家长代管',
      status: '正常',
    }),
  ],
  U1001: [
    member({
      id: 'f1',
      name: '王建国',
      relation: '父亲',
      gender: '男',
      age: 62,
      birth: '1964-08-12',
      phone: '13800138002',
      linkedUserId: 'U1002',
      archiveId: 'A002',
      accountStatus: 'linked',
      tip: '昨晚有新血压记录',
      status: '有更新',
    }),
    member({
      id: 'f2',
      name: '王小乐',
      relation: '儿子',
      gender: '男',
      age: 8,
      birth: '2018-05-20',
      archiveId: 'A003',
      accountStatus: 'managed',
      tip: '开启授权后可查看生长曲线',
      status: '待授权',
    }),
  ],
}
