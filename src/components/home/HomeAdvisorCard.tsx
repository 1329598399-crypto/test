import { ChevronRight, MessageCircle, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HomeAdvisorProfile } from '../../data/homeFeedData'

interface Props {
  advisor: HomeAdvisorProfile
  isMember: boolean
}

export function HomeAdvisorCard({ advisor, isMember }: Props) {
  const navigate = useNavigate()

  const subtitle = isMember
    ? '添加企业微信，发起健康咨询'
    : advisor.upgradeHint ?? '添加企微了解顾问服务'

  return (
    <section className="home-advisor-section home-module home-module-advisor">
      <div className="home-module-head">
        <div className="home-module-head-left">
          <span className="home-module-icon is-advisor" aria-hidden>
            <Stethoscope size={16} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="home-module-title">专属顾问</h2>
            <p className="home-module-sub">企微一对一健康服务</p>
          </div>
        </div>
      </div>

      <button type="button" className="home-advisor-entry" onClick={() => navigate('/advisor')}>
        <span className="home-advisor-entry-icon" aria-hidden>
          <MessageCircle size={20} strokeWidth={2.2} />
        </span>
        <span className="home-advisor-entry-body">
          <span className="home-advisor-entry-name">{advisor.name}</span>
          <span className="home-advisor-entry-meta">
            {advisor.department}
            {advisor.title ? ` · ${advisor.title}` : ''}
          </span>
          <span className="home-advisor-entry-hint">{subtitle}</span>
        </span>
        <span className="home-advisor-entry-action">
          {isMember ? '添加企微' : '了解'}
          <ChevronRight size={16} />
        </span>
      </button>
    </section>
  )
}
