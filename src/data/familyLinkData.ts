/** 关联账号申请 — 待目标用户确认 */
export interface FamilyLinkRequest {
  id: string
  /** 发起方家庭成员记录 id */
  memberId: string
  requesterUserId: string
  requesterName: string
  requesterPhone?: string
  targetUserId: string
  targetName: string
  targetPhone: string
  /** 发起方填写的与对方关系 */
  relation: string
  /** 对方视角的关系标签 */
  inverseRelation: string
  requestedAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

export function inverseFamilyRelation(relation: string): string {
  const map: Record<string, string> = {
    配偶: '配偶',
    父亲: '子女',
    母亲: '子女',
    儿子: '父母',
    女儿: '父母',
    其他: '家人',
  }
  return map[relation] ?? '家人'
}
