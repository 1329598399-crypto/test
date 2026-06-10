import { DEMO_SMS_CODE } from '../data/authMock'
import type { Role } from '../data/mockData'
import { useAppStore } from '../store/useAppStore'
import { isOpsPreviewMode } from './opsBridge'

const PREVIEW_PHONES: Record<Role, string> = {
  normal: '13800138001',
  member: '13800138002',
}

/** B 端 iframe 预览角色（与首页运营「普通/会员」切换对齐） */
export function getOpsPreviewRole(): Role {
  if (typeof window === 'undefined') return 'member'
  const raw = new URLSearchParams(window.location.search).get('previewRole')
  return raw === 'normal' ? 'normal' : 'member'
}

/** 运营预览 iframe 内自动登录对应 Demo 账号，避免落在登录页 */
export function bootstrapOpsPreviewSession(): boolean {
  if (!isOpsPreviewMode()) return false

  const role = getOpsPreviewRole()
  const phone = PREVIEW_PHONES[role]
  const state = useAppStore.getState()

  if (!state.isLoggedIn || state.role !== role) {
    state.login(phone, DEMO_SMS_CODE)
  }

  return true
}
