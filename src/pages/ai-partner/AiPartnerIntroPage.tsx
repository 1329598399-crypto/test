import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { IpPartnerAvatar } from '../../components/ai/IpPartnerAvatar'
import { MobileShell } from '../../components/layout/MobileShell'

export function AiPartnerIntroPage() {
  const navigate = useNavigate()

  return (
    <MobileShell showTab={false} immersive showBack={false} mainClassName="partner-flow-main">
    <div className="partner-flow-page partner-intro-page">
      <header className="partner-flow-header safe-top">
        <button type="button" className="partner-flow-back" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={22} />
        </button>
        <h1>定制你的 AI 伙伴</h1>
        <span className="w-9" />
      </header>

      <div className="partner-intro-body">
        <h2 className="partner-intro-title">遇见你的健康小伙伴</h2>
        <p className="partner-intro-desc">
          在家医平台里，可爱的小懂会成为你的健康伙伴。陪你记录血压血糖、提醒复查随访，用温暖的方式帮你养成健康习惯。
        </p>

        <div className="partner-intro-visual">
          <div className="partner-intro-deco partner-intro-deco-a" />
          <div className="partner-intro-deco partner-intro-deco-b" />
          <IpPartnerAvatar size="xl" variant={2} mood="greet" />
          <div className="partner-intro-speech">从今天开始，你可以问我任何健康相关的问题！</div>
        </div>
      </div>

      <div className="partner-flow-footer safe-bottom">
        <button
          type="button"
          className="partner-primary-btn"
          onClick={() => navigate('/ai/partner/customize')}
        >
          继续
        </button>
      </div>
    </div>
    </MobileShell>
  )
}
