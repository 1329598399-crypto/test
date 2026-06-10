import { ChevronRight, HeartPulse, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileShell } from '../components/layout/MobileShell'
import { authDemoHints } from '../data/authMock'
import { normalizePhone } from '../lib/authService'
import { useAppStore } from '../store/useAppStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAppStore((s) => s.login)
  const sendSmsCode = useAppStore((s) => s.sendSmsCode)
  const smsCooldownUntil = useAppStore((s) => s.smsCooldownUntil)
  const showToast = useAppStore((s) => s.showToast)

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
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

  const handleLogin = () => {
    setError('')
    setLoading(true)
    const err = login(phone, code)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    showToast('登录成功，欢迎回来')
    navigate(from, { replace: true })
  }

  const fillDemo = (demoPhone: string, demoCode: string) => {
    setPhone(demoPhone)
    setCode(demoCode)
    setError('')
  }

  return (
    <MobileShell showTab={false} immersive>
      <div className="auth-page">
        <div className="auth-hero immersive-inset-top">
          <div className="auth-hero-icon">
            <HeartPulse size={28} strokeWidth={2.2} />
          </div>
          <h1 className="auth-hero-title">家庭医生</h1>
          <p className="auth-hero-sub">登录后开启健康档案与专属服务</p>
        </div>

        <div className="auth-body">
          <div className="auth-card">
            <h2 className="auth-card-title">手机号登录</h2>
            <p className="auth-card-desc">未注册手机号验证后将自动创建账号</p>

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
                  placeholder="6 位验证码"
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

            {error && <p className="auth-error">{error}</p>}

            <button
              type="button"
              disabled={loading || phone.length < 11 || code.length < 6}
              onClick={handleLogin}
              className="auth-submit"
            >
              {loading ? '登录中…' : '登录'}
            </button>

            <p className="auth-switch">
              还没有账号？
              <Link to="/register" state={{ from }} className="auth-link">
                立即注册
              </Link>
            </p>
          </div>

          <div className="auth-demo">
            <p className="auth-demo-title">Demo 快捷登录</p>
            <p className="auth-demo-hint">验证码统一为 {authDemoHints[0].code}</p>
            <div className="auth-demo-list">
              {authDemoHints.map((item) => (
                <button
                  key={item.phone}
                  type="button"
                  onClick={() => fillDemo(item.phone, item.code)}
                  className="auth-demo-item"
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
          </div>

          <p className="auth-legal">
            <ShieldCheck size={14} className="inline text-brand-500" />{' '}
            登录即表示同意《用户服务协议》与《隐私政策》
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
