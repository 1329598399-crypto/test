import {
  DEMO_SMS_CODE,
  isValidPhone,
  makeToken,
  normalizePhone,
  presetAccounts,
  type AuthUser,
} from '../data/authMock'

export type RegisterInput = {
  phone: string
  code: string
  displayName: string
  agreed: boolean
}

export function validateSmsCode(code: string) {
  return code.trim() === DEMO_SMS_CODE
}

export function resolveAccount(
  phone: string,
  registeredUsers: Record<string, AuthUser>,
): AuthUser | null {
  const preset = presetAccounts[phone]
  if (preset) {
    return {
      userId: preset.userId,
      phone,
      displayName: preset.displayName,
      accountType: preset.accountType,
      registeredAt: '2026-01-15',
    }
  }
  return registeredUsers[phone] ?? null
}

export function buildRegisteredUser(phone: string, displayName: string): AuthUser {
  return {
    userId: `U${Date.now()}`,
    phone,
    displayName: displayName.trim(),
    accountType: 'normal',
    registeredAt: new Date().toISOString().slice(0, 10),
  }
}

export function validateLoginInput(phoneRaw: string, code: string) {
  const phone = normalizePhone(phoneRaw)
  if (!isValidPhone(phone)) return { ok: false as const, error: '请输入正确的 11 位手机号' }
  if (!validateSmsCode(code)) return { ok: false as const, error: '验证码错误，Demo 请使用 123456' }
  return { ok: true as const, phone }
}

export function validateRegisterInput(
  input: RegisterInput,
  registeredUsers: Record<string, AuthUser>,
) {
  const phone = normalizePhone(input.phone)
  if (!isValidPhone(phone)) return { ok: false as const, error: '请输入正确的 11 位手机号' }
  if (!validateSmsCode(input.code)) return { ok: false as const, error: '验证码错误，Demo 请使用 123456' }
  if (!input.displayName.trim()) return { ok: false as const, error: '请填写您的姓名' }
  if (!input.agreed) return { ok: false as const, error: '请先阅读并同意用户协议与隐私政策' }
  if (presetAccounts[phone] || registeredUsers[phone]) {
    return { ok: false as const, error: '该手机号已注册，请直接登录' }
  }
  return { ok: true as const, phone }
}

export { makeToken, normalizePhone, isValidPhone }
