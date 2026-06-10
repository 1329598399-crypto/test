import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gem,
  Shield,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileShell } from '../components/layout/MobileShell'
import {
  getCompareRowsFromConfig,
  getCoreBenefitsFromConfig,
  getMembershipFaqsFromConfig,
  getMembershipPlanFromConfig,
  getMembershipPlansFromConfig,
} from '../data/membershipConfigLoader'
import {
  membershipServiceFlow,
  membershipTierThemes,
  type MembershipPlanDetail,
  type MembershipTierLevel,
} from '../data/membershipBenefits'
import { useAppStore } from '../store/useAppStore'
import { isOpsPreviewMode } from '../lib/opsBridge'

const tierLabels: Record<MembershipTierLevel, string> = {
  basic: '基础',
  silver: '银卡',
  gold: '金卡',
}

const tierIcons: Record<MembershipTierLevel, typeof Star> = {
  basic: Star,
  silver: Sparkles,
  gold: Gem,
}

function formatPrice(n: number) {
  return `¥${n.toLocaleString()}`
}

function CompareCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
  }
  if (value === false) {
    return <span className="text-muted">—</span>
  }
  if (value === '—') {
    return <span className="text-muted">—</span>
  }
  return <span className="text-[11px] font-medium leading-tight text-ink">{value}</span>
}

function SignSheet({
  plan,
  tierLevel,
  onClose,
  onConfirm,
}: {
  plan: MembershipPlanDetail
  tierLevel: MembershipTierLevel
  onClose: () => void
  onConfirm: () => void
}) {
  const [agreed, setAgreed] = useState(false)
  const [paying, setPaying] = useState(false)
  const theme = membershipTierThemes[tierLevel]

  const handlePay = () => {
    if (!agreed) return
    setPaying(true)
    window.setTimeout(() => {
      onConfirm()
      setPaying(false)
    }, 800)
  }

  return (
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div
        className={clsx('allergy-sheet membership-sign-sheet', `is-tier-${tierLevel}`)}
        role="dialog"
        aria-modal="true"
      >
        <div className="allergy-sheet-handle" />
        <div className="membership-sign-hero">
          <p className="membership-sign-hero-tier">{plan.name}</p>
          <p className="membership-sign-hero-price">
            {formatPrice(plan.price)}
            <span>/年</span>
          </p>
        </div>
        <div className="allergy-sheet-header">
          <div>
            <p className="allergy-sheet-title">确认{theme.ctaText.replace('开通', '').replace('升级', '')}</p>
            <p className="allergy-sheet-sub">有效期 1 年 · 权益即时生效</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body membership-sign-body">
          <div className="membership-sign-summary">
            <div className="membership-sign-row">
              <span>检查额度</span>
              <strong>¥{plan.examQuota.toLocaleString()}</strong>
            </div>
            <div className="membership-sign-row">
              <span>专家门诊</span>
              <strong>{plan.specialistVisits} 次/年</strong>
            </div>
            {plan.multiDisciplinary && (
              <div className="membership-sign-row">
                <span>多学科门诊</span>
                <strong>{plan.multiDisciplinary} 次/年</strong>
              </div>
            )}
            {plan.familySlots && (
              <div className="membership-sign-row">
                <span>家庭成员</span>
                <strong>含 {plan.familySlots} 人</strong>
              </div>
            )}
            {plan.giftPack && (
              <div className="membership-sign-row">
                <span>健康礼包</span>
                <strong>¥{plan.giftPack}</strong>
              </div>
            )}
          </div>
          <label className="membership-sign-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              我已阅读并同意
              <button type="button" className="membership-sign-link">
                《家庭医生会员服务协议》
              </button>
              及
              <button type="button" className="membership-sign-link">
                《健康数据授权说明》
              </button>
            </span>
          </label>
          <p className="membership-sign-note">
            <Shield size={12} />
            支付成功后将生成电子会员卡，体检中心可识别会员身份。
          </p>
          <button
            type="button"
            className="membership-sign-pay"
            disabled={!agreed || paying}
            onClick={handlePay}
          >
            {paying ? '支付处理中…' : `${theme.ctaText} ${formatPrice(plan.price)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MembershipPage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const selectedPlanId = useAppStore((s) => s.selectedPlan)
  const signMembership = useAppStore((s) => s.signMembership)
  const showToast = useAppStore((s) => s.showToast)

  const [configTick, setConfigTick] = useState(0)

  useEffect(() => {
    const bump = () => {
      setConfigTick((n) => n + 1)
      if (isOpsPreviewMode()) setShowCompare(true)
    }
    window.addEventListener('fd-ops-membership-updated', bump)
    return () => window.removeEventListener('fd-ops-membership-updated', bump)
  }, [])

  const membershipPlans = useMemo(() => {
    void configTick
    return getMembershipPlansFromConfig()
  }, [configTick])

  const benefitCompareRows = useMemo(() => {
    void configTick
    return getCompareRowsFromConfig()
  }, [configTick])

  const membershipCoreBenefits = useMemo(() => {
    void configTick
    return getCoreBenefitsFromConfig()
  }, [configTick])

  const membershipFaqs = useMemo(() => {
    void configTick
    return getMembershipFaqsFromConfig()
  }, [configTick])

  const getMembershipPlan = (planId: string) => getMembershipPlanFromConfig(planId)
  const getPlansByScope = (family: boolean) => membershipPlans.filter((p) => p.family === family)

  const currentPlan = role === 'member' ? getMembershipPlan(selectedPlanId) : null

  const [familyMode, setFamilyMode] = useState(currentPlan?.family ?? false)
  const [tierLevel, setTierLevel] = useState<MembershipTierLevel>(
    currentPlan?.tierLevel ?? 'silver',
  )
  const [activePlanId, setActivePlanId] = useState(currentPlan?.id ?? '')
  const [showCompare, setShowCompare] = useState(() => isOpsPreviewMode())
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [signPlan, setSignPlan] = useState<MembershipPlanDetail | null>(null)
  const cardStageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const scopePlans = useMemo(() => getPlansByScope(familyMode), [familyMode])
  const selectedPlan = useMemo(() => {
    if (!scopePlans.length) return undefined
    return (
      scopePlans.find((p) => p.id === activePlanId) ??
      scopePlans.find((p) => p.tierLevel === tierLevel) ??
      scopePlans[0]
    )
  }, [scopePlans, activePlanId, tierLevel])
  const activeTierLevel = selectedPlan?.tierLevel ?? tierLevel
  const theme = membershipTierThemes[activeTierLevel]
  const TierIcon = tierIcons[activeTierLevel]

  useEffect(() => {
    if (!scopePlans.length) return
    if (!selectedPlan) {
      setActivePlanId(scopePlans[0].id)
      return
    }
    if (selectedPlan.id !== activePlanId) setActivePlanId(selectedPlan.id)
    if (selectedPlan.tierLevel !== tierLevel) setTierLevel(selectedPlan.tierLevel)
  }, [scopePlans, selectedPlan, activePlanId, tierLevel])

  useEffect(() => {
    const stage = cardStageRef.current
    const card = cardRefs.current[activePlanId]
    if (!stage || !card) return
    const targetLeft = card.offsetLeft - (stage.clientWidth - card.clientWidth) / 2
    stage.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' })
  }, [activePlanId, scopePlans])

  const handleSign = (plan: MembershipPlanDetail) => {
    if (role === 'member' && plan.id === selectedPlanId) {
      showToast('您当前已是该套餐')
      return
    }
    setSignPlan(plan)
  }

  const handleConfirmSign = () => {
    if (!signPlan) return
    signMembership(signPlan.id)
    setSignPlan(null)
    showToast('会员开通成功，专属服务已生效')
    navigate('/mine')
  }

  return (
    <MobileShell showTab={false} immersive mainClassName="membership-main">
      <div
        className={clsx(
          'membership-page',
          `is-tier-${activeTierLevel}`,
          familyMode && 'is-family',
        )}
      >
        <div className="membership-hero">
          {/* 沉浸式顶栏 */}
          <header className="membership-immersive-header safe-top">
            <button
              type="button"
              className="membership-immersive-back"
              aria-label="返回"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={22} />
            </button>
            <span className="membership-immersive-title">会员中心</span>
            <span className="membership-immersive-tier">
              <TierIcon size={12} />
              {theme.shortLabel}
            </span>
          </header>

          <div className="membership-backdrop" aria-hidden />

          <div className="membership-stage">
          {/* 单人 / 家庭 */}
          <div className="membership-scope-pill">
            <button
              type="button"
              className={clsx(!familyMode && 'is-active')}
              onClick={() => {
                setFamilyMode(false)
              }}
            >
              单人会员
            </button>
            <button
              type="button"
              className={clsx(familyMode && 'is-active')}
              onClick={() => {
                setFamilyMode(true)
              }}
            >
              家庭会员
            </button>
          </div>

          <div className="membership-card-hero">
            {currentPlan && role === 'member' ? (
              <>
                <p className="membership-card-hero-eyebrow">当前已开通</p>
                <h2 className="membership-card-hero-title">{currentPlan.name}</h2>
              </>
            ) : (
              <>
                <p className="membership-card-hero-eyebrow">家庭医生 · 年度会员</p>
                <h2 className="membership-card-hero-title">选择您的专属方案</h2>
              </>
            )}
            <p className="membership-tier-tagline">{theme.tagline}</p>
          </div>

          <div className="membership-card-carousel">
            <div className="membership-card-stage" ref={cardStageRef}>
              {scopePlans.map((plan) => {
                const active = selectedPlan?.id === plan.id
                const PlanIcon = tierIcons[plan.tierLevel]
                return (
                  <button
                    key={plan.id}
                    ref={(node) => {
                      cardRefs.current[plan.id] = node
                    }}
                    type="button"
                    className={clsx(
                      'membership-vip-card',
                      `tier-${plan.tierLevel}`,
                      active && 'is-active',
                    )}
                    aria-pressed={active}
                    onClick={() => setActivePlanId(plan.id)}
                  >
                    <div className="membership-vip-card-glare" aria-hidden />
                    <div className="membership-vip-card-shine" aria-hidden />
                    <div className="membership-vip-card-stripe" aria-hidden />
                    <span className="membership-vip-card-chip">
                      <Shield size={10} strokeWidth={2.5} />
                      VIP
                    </span>
                    {plan.badge && active && (
                      <span className="membership-vip-card-ribbon">{plan.badge}</span>
                    )}
                    <div className="membership-vip-card-body">
                      <div className="membership-vip-card-top">
                        <PlanIcon size={active ? 20 : 14} strokeWidth={2.2} />
                        {active && (
                          <span className="membership-vip-card-scope">
                            {familyMode ? '家庭版' : '个人版'}
                          </span>
                        )}
                      </div>
                      <p className="membership-vip-card-tier">{tierLabels[plan.tierLevel]}</p>
                      {active && (
                        <p className="membership-vip-card-name">{plan.name}</p>
                      )}
                      {active ? (
                        <>
                          <div className="membership-vip-card-price">
                            <span className="membership-vip-card-price-currency">¥</span>
                            <span className="membership-vip-card-price-num">
                              {plan.price.toLocaleString()}
                            </span>
                            <span className="membership-vip-card-price-unit">/年</span>
                          </div>
                          <div className="membership-vip-card-metrics">
                            <span>额度 ¥{(plan.examQuota / 1000).toFixed(0)}k</span>
                            <span>专家 {plan.specialistVisits}次</span>
                          </div>
                          {plan.highlights[0] && (
                            <p className="membership-vip-card-teaser">{plan.highlights[0]}</p>
                          )}
                        </>
                      ) : (
                        <p className="membership-vip-card-compact-price">
                          {formatPrice(plan.price)}
                          <span>/年</span>
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            {scopePlans.length > 1 && (
              <div className="membership-card-dots" role="tablist" aria-label="会员方案">
                {scopePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    role="tab"
                    aria-selected={plan.id === activePlanId}
                    className={clsx(plan.id === activePlanId && 'is-active')}
                    onClick={() => setActivePlanId(plan.id)}
                  />
                ))}
              </div>
            )}
            {scopePlans.length > 1 && (
              <p className="membership-card-swipe-hint">左右滑动 · 切换卡级方案</p>
            )}
          </div>
          </div>
        </div>

        {/* 下方内容区 — 白底保证可读 */}
        <div className="membership-content">
          {selectedPlan && (
            <section className={clsx('membership-exclusive-panel', `is-tier-${activeTierLevel}`)}>
              <div className="membership-exclusive-head">
                <h3>{theme.exclusiveTitle}</h3>
                <span>{selectedPlan.name}</span>
              </div>
              <div className="membership-exclusive-metrics">
                <div>
                  <strong>¥{selectedPlan.examQuota.toLocaleString()}</strong>
                  <span>检查额度</span>
                </div>
                <div>
                  <strong>{selectedPlan.specialistVisits}</strong>
                  <span>专家门诊/年</span>
                </div>
                <div>
                  <strong>{selectedPlan.multiDisciplinary ?? '—'}</strong>
                  <span>多学科/年</span>
                </div>
                {selectedPlan.discount ? (
                  <div>
                    <strong>{selectedPlan.discount}</strong>
                    <span>超额优惠</span>
                  </div>
                ) : (
                  <div>
                    <strong>{selectedPlan.annualReview ? '含' : '—'}</strong>
                    <span>年度总评</span>
                  </div>
                )}
              </div>
              <ul className="membership-exclusive-list">
                {theme.perks.map((p) => (
                  <li key={p}>
                    <Check size={14} strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
                {selectedPlan.highlights.slice(0, 2).map((h) => (
                  <li key={h}>
                    <Check size={14} strokeWidth={2.5} />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="membership-section px-4">
            <h3 className="membership-section-title">各卡级均含基础服务</h3>
            <div className="membership-core-grid">
              {membershipCoreBenefits.map((b) => (
                <div key={b.id} className="membership-core-item">
                  <span className="membership-core-icon">{b.icon}</span>
                  <p className="membership-core-title">{b.title}</p>
                  <p className="membership-core-desc">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="membership-section px-4">
            <button
              type="button"
              className="membership-compare-toggle"
              onClick={() => setShowCompare((v) => !v)}
            >
              <span>完整权益对比</span>
              <ChevronDown
                size={18}
                className={clsx('transition-transform', showCompare && 'rotate-180')}
              />
            </button>
            {showCompare && (
              <div className="membership-compare-table-wrap">
                <table className="membership-compare-table">
                  <thead>
                    <tr>
                      <th>权益项</th>
                      {scopePlans.map((p) => (
                        <th
                          key={p.id}
                          className={clsx(
                            `col-tier-${p.tierLevel}`,
                            p.id === selectedPlan?.id && 'is-col-active',
                          )}
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {benefitCompareRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.label}</td>
                        {scopePlans.map((p) => (
                          <td
                            key={p.id}
                            className={clsx(
                              `col-tier-${p.tierLevel}`,
                              p.id === selectedPlan?.id && 'is-col-active',
                            )}
                          >
                            <CompareCell value={row.getValue(p)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="membership-section px-4">
            <h3 className="membership-section-title">开通后服务流程</h3>
            <div className="membership-flow">
              {membershipServiceFlow.map((item, i) => (
                <div key={item.step} className="membership-flow-item">
                  <div className="membership-flow-dot">{item.step}</div>
                  {i < membershipServiceFlow.length - 1 && (
                    <div className="membership-flow-line" />
                  )}
                  <div className="membership-flow-text">
                    <p className="membership-flow-title">{item.title}</p>
                    <p className="membership-flow-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="membership-section px-4">
            <h3 className="membership-section-title">常见问题</h3>
            <div className="membership-faq-list">
              {membershipFaqs.map((faq, i) => (
                <div key={faq.q} className="membership-faq-item">
                  <button
                    type="button"
                    className="membership-faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <ChevronRight
                      size={16}
                      className={clsx(
                        'shrink-0 transition-transform',
                        openFaq === i && 'rotate-90',
                      )}
                    />
                  </button>
                  {openFaq === i && <p className="membership-faq-a">{faq.a}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {selectedPlan && (
        <div className={clsx('membership-bottom-bar', `is-tier-${activeTierLevel}`)}>
          <div className="membership-bottom-info">
            <p className="membership-bottom-name">{selectedPlan.name}</p>
            <p className="membership-bottom-price">
              {formatPrice(selectedPlan.price)}
              <span>/年</span>
            </p>
          </div>
          <button
            type="button"
            className="membership-bottom-cta"
            onClick={() => handleSign(selectedPlan)}
          >
            {role === 'member' && selectedPlan.id === selectedPlanId
              ? '当前套餐'
              : theme.ctaText}
          </button>
        </div>
      )}

      {signPlan && (
        <SignSheet
          plan={signPlan}
          tierLevel={signPlan.tierLevel}
          onClose={() => setSignPlan(null)}
          onConfirm={handleConfirmSign}
        />
      )}
    </MobileShell>
  )
}
