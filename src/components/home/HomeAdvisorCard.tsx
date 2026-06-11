import { ChevronRight, QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HomeAdvisorProfile } from '../../data/homeFeedData'

interface Props {
  advisor: HomeAdvisorProfile
  isMember: boolean
}

export function HomeAdvisorCard({ advisor, isMember }: Props) {
  const navigate = useNavigate()

  if (isMember) {
    return (
      <section className="home-bw-block home-advisor-contact">
        <div className="home-bw-block-head">
          <h2 className="home-bw-block-title">专属顾问</h2>
          <p className="home-bw-block-sub">会员一对一健康服务</p>
        </div>
        <button
          type="button"
          className="home-advisor-contact-card home-advisor-contact-compact"
          onClick={() => navigate('/advisor')}
        >
          <span className="home-advisor-contact-avatar">{advisor.name.slice(0, 1)}</span>
          <span className="home-advisor-contact-body">
            <span className="home-advisor-contact-name">{advisor.name}</span>
            <span className="home-advisor-contact-action">添加企业微信</span>
          </span>
          <ChevronRight size={18} className="home-advisor-contact-chevron" />
        </button>
      </section>
    )
  }

  return (
    <section className="home-bw-block home-advisor-contact">
      <div className="home-bw-block-head">
        <h2 className="home-bw-block-title">专属顾问</h2>
        <p className="home-bw-block-sub">{advisor.upgradeHint ?? '添加企微了解顾问服务'}</p>
      </div>
      <button type="button" className="home-advisor-qr-card" onClick={() => navigate('/advisor')}>
        <div className="home-advisor-qr-preview" aria-hidden>
          <QrCode size={72} strokeWidth={1.2} />
        </div>
        <div className="home-advisor-qr-text">
          <p className="home-advisor-qr-title">扫码添加企业微信</p>
          <p className="home-advisor-qr-desc">了解顾问服务 · 健康咨询与开通引导</p>
          <span className="home-advisor-qr-link">
            查看二维码
            <ChevronRight size={14} />
          </span>
        </div>
      </button>
    </section>
  )
}
