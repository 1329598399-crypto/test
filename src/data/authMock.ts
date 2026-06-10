import type { Role } from './mockData'

export const DEMO_SMS_CODE = '123456'
export const SMS_COOLDOWN_SEC = 60

export interface AuthUser {
  userId: string
  phone: string
  displayName: string
  accountType: Role
  registeredAt: string
}

/** 预置演示账号（登录即进入对应身份） */
export const presetAccounts: Record<
  string,
  { displayName: string; accountType: Role; userId: string }
> = {
  '13800138001': { displayName: '李静', accountType: 'normal', userId: 'U1001' },
  '13800138002': { displayName: '王建国', accountType: 'member', userId: 'U1002' },
  '13800138003': { displayName: '张阿姨', accountType: 'normal', userId: 'U1003' },
}

export const authDemoHints = [
  { phone: '13800138001', label: '普通用户 · 李静', code: DEMO_SMS_CODE },
  { phone: '13800138002', label: '标准会员 · 王建国', code: DEMO_SMS_CODE },
  { phone: '13800138003', label: '普通用户 · 张阿姨', code: DEMO_SMS_CODE },
]

export function normalizePhone(input: string) {
  return input.replace(/\D/g, '').slice(0, 11)
}

export function isValidPhone(phone: string) {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function maskPhone(phone: string) {
  if (phone.length < 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

export function makeToken(userId: string) {
  return `fd_demo_${userId}_${Date.now()}`
}
