import { ChevronRight, UserPlus } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileShell } from '../components/layout/MobileShell'
import { DEMO_SMS_CODE, SMS_COOLDOWN_SEC } from '../data/authMock'
import { normalizePhone } from '../lib/authService'
import { useAppStore } from '../store/useAppStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const register = useAppStore((s) => s.register)
  const sendSmsCode = useAppStore((s) => s.sendSmsCode)
  const smsCooldownUntil = useAppStore((s) => s.smsCooldownUntil)
  const showToast = useAppStore((s) => s.showToast)

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    if (smsCooldownUntil <= Math.floor(Date.now() / 1000)) return
    const t = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(t)
  }, [smsCooldownUntil, tick])

  const cooldownLeft = Math.max(0, smsCooldownUntil - Math.floor(Date.now() / 1000))

  const handleSendCode = () => {
    setError('')
    const err = sendSmsCode(phone)
    if (err) setError(err)
  }

  const handleRegister = () => {
    setError('')
    setLoading(true)
    const err = register({ phone, code, displayName, agreed })
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    showToast(`欢迎加入，${displayName.trim()}！`)
    navigate(from, { replace: true })
  }

  return (
    <MobileShell title="注册账号" showTab={false} showBack>
      <div className="auth-page auth-page-register px-4 pb-8">
        <div className="auth-register-head">
          <div className="auth-register-icon">
            <UserPlus size={22} />
          </div>
          <h2 className="text-lg font-bold text-ink">创建您的健康账号</h2>
          <p className="mt-1 text-sm text-muted">注册后可完善档案、记录健康数据并参与积分活动</p>
        </div>

        <div className="auth-card mt-4">
          <label className="auth-field">
            <span className="auth-label">手机号</span>
            <input
              className="auth-input"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">验证码</span>
            <div className="auth-code-row">
              <input
                className="auth-input flex-1"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Demo 验证码 123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button
                type="button"
                disabled={cooldownLeft > 0 || phone.length < 11}
                onClick={handleSendCode}
                className={clsx('auth-code-btn', cooldownLeft > 0 && 'is-disabled')}
              >
                {cooldownLeft > 0 ? `${cooldownLeft}s` : '获取验证码'}
              </button>
            </div>
          </label>

          <label className="auth-field">
            <span className="auth-label">姓名</span>
            <input
              className="auth-input"
              type="text"
              maxLength={20}
              placeholder="请输入真实姓名，便于建档"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label className="auth-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="auth-checkbox"
            />
            <span>
              我已阅读并同意
              <button type="button" className="auth-link-inline">
                《用户服务协议》
              </button>
              与
              <button type="button" className="auth-link-inline">
                《隐私政策》
              </button>
            </span>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="button"
            disabled={loading || phone.length < 11 || code.length < 6 || !displayName.trim()}
            onClick={handleRegister}
            className="auth-submit"
          >
            {loading ? '注册中…' : '注册并登录'}
          </button>

          <p className="auth-switch">
            已有账号？
            <Link to="/login" state={{ from }} className="auth-link">
              去登录
              <ChevronRight size={14} className="inline" />
            </Link>
          </p>
        </div>

        <p className="auth-demo-hint mt-4 text-center text-xs text-muted">
          Demo 环境验证码固定为 {DEMO_SMS_CODE}，{SMS_COOLDOWN_SEC} 秒内不可重复发送
        </p>
      </div>
    </MobileShell>
  )
}
