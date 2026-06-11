import {
  ChevronRight,
  Crown,
  FileText,
  Gift,
  LogOut,
  MessageCircle,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useNavigate } from 'react-router-dom'
import { maskPhone } from '../data/authMock'
import {
  getMemberCardSnapshot,
  getMembershipPlan,
  guestMembershipPitch,
} from '../data/membershipBenefits'
import { loadAiPartner } from '../data/aiPartner'
import { MobileShell } from '../components/layout/MobileShell'
import { BentoCard } from '../components/ui/BentoCard'
import { getArchivePct, getPoints, useAppStore, useRoleData } from '../store/useAppStore'

/** 我的页副标题：略压缩文案，便于单行展示 */
function formatMineServiceMeta(badge: string, serviceDay: number) {
  const tier = badge.replace(/^单人/, '')
  return `${tier} · 连续${serviceDay}天`
}

const memberServices = [
  { icon: MessageCircle, label: '专属顾问', desc: '线上咨询 8:00–21:00', path: '/advisor', memberOnly: true },
  { icon: Stethoscope, label: '随访报告', desc: '月度/季度健康总结', path: '/reports', memberOnly: true },
  { icon: Shield, label: '档案授权', desc: '家人与医生授权管理', path: '/profile/auth', memberOnly: true },
  { icon: Users, label: '家人动态', desc: '家庭关联与授权查看', path: '/family', memberOnly: false },
]

const accountItems = [
  { icon: Gift, label: '积分中心', path: '/points', color: 'from-violet-500 to-purple-600' },
  { icon: FileText, label: '健康档案', path: '/profile', color: 'from-blue-500 to-indigo-600' },
  { icon: Sparkles, label: '定制 AI 伙伴', path: '__ai_partner__', color: 'from-fuchsia-500 to-purple-600' },
]

export function MinePage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const authUser = useAppStore((s) => s.authUser)
  const selectedPlan = useAppStore((s) => s.selectedPlan)
  const data = useRoleData()
  const resetDemo = useAppStore((s) => s.resetDemo)
  const logout = useAppStore((s) => s.logout)
  const toggleRole = useAppStore((s) => s.toggleRole)
  const showToast = useAppStore((s) => s.showToast)
  const isMember = role === 'member'
  const pts = getPoints(role)
  const archivePct = getArchivePct(role)
  const memberCard = getMemberCardSnapshot(role, selectedPlan)
  const memberPlan = getMembershipPlan(selectedPlan)
  const examPct = memberCard
    ? Math.min(100, Math.round((memberCard.examQuotaUsed / memberCard.examQuotaTotal) * 100))
    : 0

  const handleLogout = () => {
    logout()
    showToast('已安全退出登录')
    navigate('/login', { replace: true })
  }

  const handleResetDemo = () => {
    resetDemo()
    showToast('演示数据已重置')
    navigate('/login', { replace: true })
  }

  const openMemberService = (path: string, memberOnly: boolean) => {
    if (memberOnly && !isMember) {
      showToast('该服务为会员专属，开通后可使用')
      navigate('/membership')
      return
    }
    navigate(path)
  }

  const demoNavRight =
    import.meta.env.DEV ? (
      <button
        type="button"
        className="mine-nav-demo"
        onClick={toggleRole}
        title="切换演示身份"
      >
        <RefreshCw size={12} />
      </button>
    ) : undefined

  return (
    <MobileShell nativeNav title="我的" showTab navRight={demoNavRight}>
      <div className="mine-page px-4 pb-5">
        {/* 会员：用户信息 + 电子卡一体；非会员：分开展示 */}
        {isMember && memberCard && memberPlan ? (
          <div className={clsx('mine-member-hub', `is-tier-${memberPlan.tierLevel}`)}>
            <div className="mine-member-hub-profile">
              <div className="mine-avatar">{data.userName.slice(0, 1)}</div>
              <div className="min-w-0 flex-1">
                <h2 className="mine-name">{data.userName}</h2>
                <p className="mine-meta">
                  {formatMineServiceMeta(data.badge, data.serviceDay)}
                </p>
                {authUser?.phone && (
                  <p className="mine-phone">{maskPhone(authUser.phone)}</p>
                )}
              </div>
              <button
                type="button"
                className="mine-points-pill"
                onClick={() => navigate('/points')}
              >
                <span className="mine-points-value">{pts.total}</span>
                <span className="mine-points-label">积分</span>
              </button>
            </div>
            <button
              type="button"
              className="mine-member-hub-card"
              onClick={() => navigate('/membership')}
            >
              <div className="mine-member-card-top">
                <div>
                  <p className="mine-member-card-tier">
                    <Crown size={14} />
                    {memberCard.tierName}
                  </p>
                  <p className="mine-member-card-no">{memberCard.cardNo}</p>
                </div>
                <span className="mine-member-card-badge">
                  有效至 {memberCard.validUntil}
                </span>
              </div>
              <p className="mine-member-card-team">{memberCard.teamLabel}</p>
              <div className="mine-exam-quota">
                <div className="mine-exam-quota-head">
                  <span>检查额度</span>
                  <span>
                    ¥{memberCard.examQuotaUsed.toLocaleString()} / ¥
                    {memberCard.examQuotaTotal.toLocaleString()}
                  </span>
                </div>
                <div className="mine-exam-quota-bar">
                  <span style={{ width: `${examPct}%` }} />
                </div>
                {memberPlan.discount && (
                  <p className="mine-exam-quota-hint">
                    超额部分享 {memberPlan.discount} 优惠
                  </p>
                )}
              </div>
              <div className="mine-usage-grid">
                {memberCard.usages.map((u) => (
                  <div key={u.id} className="mine-usage-item">
                    <p className="mine-usage-label">{u.label}</p>
                    <p className="mine-usage-value">
                      {u.total != null ? `${u.used}/${u.total}${u.unit ?? ''}` : '不限'}
                    </p>
                    {u.hint && <p className="mine-usage-hint">{u.hint}</p>}
                  </div>
                ))}
              </div>
              <span className="mine-member-card-link">
                查看全部权益
                <ChevronRight size={14} />
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="mine-profile">
              <div className="mine-avatar">{data.userName.slice(0, 1)}</div>
              <div className="min-w-0 flex-1">
                <h2 className="mine-name">{data.userName}</h2>
                <p className="mine-meta">
                  {formatMineServiceMeta(data.badge, data.serviceDay)}
                </p>
                {authUser?.phone && (
                  <p className="mine-phone">{maskPhone(authUser.phone)}</p>
                )}
              </div>
              <button
                type="button"
                className="mine-points-pill"
                onClick={() => navigate('/points')}
              >
                <span className="mine-points-value">{pts.total}</span>
                <span className="mine-points-label">积分</span>
              </button>
            </div>
            <button
              type="button"
              className="mine-upgrade-bar"
              onClick={() => navigate('/membership')}
            >
              <span className="mine-upgrade-bar-icon">
                <Crown size={16} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="mine-upgrade-bar-title">{guestMembershipPitch.title}</span>
                <span className="mine-upgrade-bar-sub">{guestMembershipPitch.tagline}</span>
              </span>
              <span className="mine-upgrade-bar-cta">
                ¥{guestMembershipPitch.fromPrice.toLocaleString()}起
                <ChevronRight size={14} />
              </span>
            </button>
          </>
        )}

        {/* 快捷数据 */}
        <div className="mine-stats">
          {[
            { label: '档案完善', value: `${archivePct}%`, path: '/profile' },
            { label: '今日积分', value: String(pts.today), path: '/points' },
            { label: '连续管理', value: `${data.serviceDay}天`, path: '/' },
          ].map((s) => (
            <button key={s.label} type="button" className="mine-stat" onClick={() => navigate(s.path)}>
              <span className="mine-stat-value">{s.value}</span>
              <span className="mine-stat-label">{s.label}</span>
            </button>
          ))}
        </div>

        {/* 服务入口 */}
        <section className="mine-section">
          <h3 className="mine-section-title">服务中心</h3>
          <div className="mine-service-list">
            {memberServices.map((item) => (
              <button
                key={item.label}
                type="button"
                className={clsx('mine-service-row', item.memberOnly && !isMember && 'is-locked')}
                onClick={() => openMemberService(item.path, item.memberOnly)}
              >
                <span className={clsx('mine-service-icon', item.memberOnly && 'is-member')}>
                  <item.icon size={18} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="mine-service-label">
                    {item.label}
                    {item.memberOnly && !isMember && (
                      <span className="mine-service-tag">会员</span>
                    )}
                  </span>
                  <span className="mine-service-desc">{item.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </section>

        {/* 账户 */}
        <section className="mine-section">
          <h3 className="mine-section-title">账户</h3>
          <div className="mine-account-grid">
            {accountItems.map((item) => (
              <BentoCard
                key={item.label}
                gradient={item.color}
                className="mine-account-card"
                onClick={() => {
                  if (item.path === '__ai_partner__') {
                    const partner = loadAiPartner()
                    navigate(partner.completed ? '/ai/partner/customize' : '/ai/partner/intro')
                    return
                  }
                  navigate(item.path)
                }}
              >
                <item.icon size={20} className="text-white" />
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-white/85">
                  {item.label === '积分中心' ? `${pts.total} 积分可用` : '基础档案人人可维护'}
                </p>
              </BentoCard>
            ))}
            {!isMember && (
              <BentoCard
                gradient="from-amber-400 to-orange-500"
                className="mine-account-card"
                onClick={() => navigate('/membership')}
              >
                <Crown size={20} className="text-white" />
                <p className="font-semibold text-white">开通会员</p>
                <p className="text-[11px] text-white/85">家庭医生专属服务</p>
              </BentoCard>
            )}
          </div>
        </section>

        <button type="button" className="mine-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          退出登录
        </button>
        <button type="button" className="mine-reset-btn" onClick={handleResetDemo}>
          <Settings size={16} />
          重置演示数据
        </button>
      </div>
    </MobileShell>
  )
}
