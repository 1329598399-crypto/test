import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IpPartnerAvatar } from '../../components/ai/IpPartnerAvatar'
import { MobileShell } from '../../components/layout/MobileShell'
import { saveAiPartner, type AiPartnerProfile } from '../../data/aiPartner'

const STEPS = ['正在生成 AI 人格', '正在同步个性化设置', '正在和你建立连接']

export function AiPartnerGeneratingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const draft = (location.state as { draft?: AiPartnerProfile } | null)?.draft
  const [progress, setProgress] = useState(0)
  const savedRef = useRef(false)

  const activeStep = progress >= 68 ? 2 : progress >= 32 ? 1 : 0

  useEffect(() => {
    if (!draft) {
      navigate('/ai/partner/customize', { replace: true })
      return
    }

    const timer = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.floor(Math.random() * 8) + 4))
    }, 280)

    return () => window.clearInterval(timer)
  }, [draft, navigate])

  useEffect(() => {
    if (!draft || progress < 100 || savedRef.current) return
    savedRef.current = true
    const profile: AiPartnerProfile = {
      ...draft,
      callLabel:
        draft.callLabel ||
        (draft.callMode === 'owner' ? '主人' : draft.callMode === 'nickname' ? draft.name : '小懂'),
      completed: true,
      createdAt: new Date().toISOString(),
    }
    saveAiPartner(profile)
    const t = window.setTimeout(() => navigate('/ai', { replace: true }), 500)
    return () => window.clearTimeout(t)
  }, [draft, progress, navigate])

  if (!draft) return null

  return (
    <MobileShell showTab={false} immersive showBack={false} mainClassName="partner-flow-main">
    <div className="partner-flow-page partner-generating-page">
      <header className="partner-flow-header safe-top">
        <span className="w-9" />
        <h1>生成你的伙伴</h1>
        <span className="w-9" />
      </header>

      <div className="partner-generating-body">
        <ul className="partner-gen-steps">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={i < activeStep ? 'is-done' : i === activeStep ? 'is-active' : ''}
            >
              {step}
            </li>
          ))}
        </ul>

        <div className="partner-gen-ring-wrap">
          <div className="partner-gen-ring-outer" />
          <div className="partner-gen-ring-mid" />
          <svg className="partner-gen-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="partner-gen-ring-track" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="partner-gen-ring-progress"
              style={{
                strokeDasharray: 326.7,
                strokeDashoffset: 326.7 * (1 - progress / 100),
              }}
            />
          </svg>
          <div className="partner-gen-center">
            <IpPartnerAvatar size="md" variant={draft.avatarVariant} animate={false} />
            <span className="partner-gen-percent">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
    </MobileShell>
  )
}
