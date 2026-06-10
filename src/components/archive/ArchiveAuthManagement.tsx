import { clsx } from 'clsx'
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  Plus,
  QrCode,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  authAddDoctorCandidates,
  authDurationOptions,
  authScopeOptions,
  authTypeOptions,
  filterAuthGrants,
  formatGrantDesc,
  formatTempAuthCountdown,
  getGrantStatusLabel,
  isGrantActive,
  isGrantExpiringSoon,
  scopeLabel,
  type ArchiveAuthGrant,
  type AuthFilterTab,
  type AuthGrantType,
  type AuthScope,
} from '../../data/archiveAuthData'
import { familyAccountStatusLabel } from '../../data/familyMemberData'
import { useAppStore, useAuthableFamilyMembers, useFamilyMembers } from '../../store/useAppStore'

function useSheetHost() {
  if (typeof document === 'undefined') return null
  return document.querySelector('.device-content') ?? document.body
}

function useEscape(onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

const filterTabs: { id: AuthFilterTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'family', label: '家人' },
  { id: 'doctor', label: '医生' },
  { id: 'temp', label: '临时' },
]

export function ArchiveAuthManagement() {
  const navigate = useNavigate()
  const familyMembers = useFamilyMembers()
  const authableFamily = useAuthableFamilyMembers()
  const grants = useAppStore((s) => s.archiveAuthGrants)
  const tempAuthSession = useAppStore((s) => s.tempAuthSession)
  const generateTempAuthSession = useAppStore((s) => s.generateTempAuthSession)
  const revokeArchiveAuthGrant = useAppStore((s) => s.revokeArchiveAuthGrant)
  const extendArchiveAuthGrant = useAppStore((s) => s.extendArchiveAuthGrant)
  const addArchiveAuthGrant = useAppStore((s) => s.addArchiveAuthGrant)
  const showToast = useAppStore((s) => s.showToast)

  const [tab, setTab] = useState<AuthFilterTab>('all')
  const [now, setNow] = useState(Date.now())
  const [addOpen, setAddOpen] = useState(false)
  const [detailGrant, setDetailGrant] = useState<ArchiveAuthGrant | null>(null)
  const [revokeGrant, setRevokeGrant] = useState<ArchiveAuthGrant | null>(null)
  const [qrOpen, setQrOpen] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const filtered = useMemo(() => filterAuthGrants(grants, tab, now), [grants, tab, now])
  const activeCount = useMemo(
    () => grants.filter((g) => isGrantActive(g, now)).length,
    [grants, now],
  )
  const expiringCount = useMemo(
    () => grants.filter((g) => isGrantExpiringSoon(g, now)).length,
    [grants, now],
  )

  const handleGenerateQr = () => {
    if (!tempAuthSession || tempAuthSession.expiresAt <= now) {
      generateTempAuthSession(24)
    }
    setQrOpen(true)
    showToast('二维码已生成，24 小时内有效')
  }

  const handleGeneratePin = () => {
    const session = generateTempAuthSession(24)
    showToast(`授权码 ${session.code} 已生成，24 小时内有效`)
  }

  const tempCountdown =
    tempAuthSession && tempAuthSession.expiresAt > now
      ? formatTempAuthCountdown(tempAuthSession.expiresAt, now)
      : null

  return (
    <div className="auth-mgmt-page pb-24">
      <div className="auth-mgmt-summary">
        <div className="auth-mgmt-summary-icon">
          <ShieldCheck size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="auth-mgmt-summary-title">档案授权管理</p>
          <p className="auth-mgmt-summary-sub">
            共 {activeCount} 项有效授权
            {expiringCount > 0 ? ` · ${expiringCount} 项即将到期` : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="auth-mgmt-family-hub"
        onClick={() => navigate('/family')}
      >
        <div className="auth-mgmt-family-hub-main">
          <p className="auth-mgmt-family-hub-title">家庭成员管理</p>
          <p className="auth-mgmt-family-hub-sub">
            共 {familyMembers.length} 人 · 可授权 {authableFamily.length} 人
            {familyMembers.some((m) => m.accountStatus === 'link_pending')
              ? ' · 有关联待确认'
              : ''}
          </p>
        </div>
        <span className="auth-mgmt-family-hub-link">统一管理 ›</span>
      </button>

      <div className="auth-mgmt-tip">
        <AlertTriangle size={14} className="shrink-0 text-amber-600" />
        <p>先添加并确认家庭成员，再在此授权；授权可随时撤销，不构成诊断依据。</p>
      </div>

      <div className="auth-mgmt-tabs">
        {filterTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={clsx('auth-mgmt-tab', tab === t.id && 'is-active')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="auth-mgmt-list">
        {filtered.length === 0 ? (
          <div className="auth-mgmt-empty">
            <UserRound size={28} className="text-muted" />
            <p>暂无{filterTabs.find((t) => t.id === tab)?.label}授权记录</p>
          </div>
        ) : (
          filtered.map((grant) => {
            const active = isGrantActive(grant, now)
            const statusLabel = getGrantStatusLabel(grant, now)
            return (
              <button
                key={grant.id}
                type="button"
                className={clsx('auth-mgmt-row', !active && 'is-inactive')}
                onClick={() => setDetailGrant(grant)}
              >
                <div className={clsx('auth-mgmt-av bg-gradient-to-br', grant.tone)}>
                  {grant.avatar}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="auth-mgmt-name">
                    {grant.name}
                    <span className="auth-mgmt-role">（{grant.roleLabel}）</span>
                  </p>
                  <p className="auth-mgmt-desc">{formatGrantDesc(grant)}</p>
                  <p className="auth-mgmt-meta">授权于 {grant.createdAt}</p>
                </div>
                <span
                  className={clsx(
                    'auth-mgmt-badge',
                    active && grant.duration === 'temp' && 'is-temp',
                    active && grant.duration === 'long' && 'is-active',
                    !active && 'is-expire',
                  )}
                >
                  {statusLabel}
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </button>
            )
          })
        )}
      </div>

      <div className="auth-mgmt-temp">
        <p className="auth-mgmt-temp-title">临时授权 · 就诊场景</p>
        <p className="auth-mgmt-temp-sub">生成二维码或 6 位授权码，供医生扫码查看档案摘要</p>
        <div className="auth-mgmt-temp-grid">
          <button type="button" className="auth-mgmt-temp-card is-qr" onClick={handleGenerateQr}>
            <QrCode size={22} />
            <span>生成二维码</span>
            {tempCountdown && <em>{tempCountdown}后失效</em>}
          </button>
          <button type="button" className="auth-mgmt-temp-card is-pin" onClick={handleGeneratePin}>
            <span className="text-lg font-bold tracking-widest">
              {tempAuthSession && tempAuthSession.expiresAt > now
                ? tempAuthSession.code
                : '······'}
            </span>
            <span>生成授权码</span>
            {tempCountdown && <em>{tempCountdown}后失效</em>}
          </button>
        </div>
        <button
          type="button"
          className="auth-mgmt-doctor-demo"
          onClick={() => navigate('/auth/enter')}
        >
          模拟医生验证授权码并查看 ›
        </button>
      </div>

      <div className="auth-mgmt-sticky-add">
        <button type="button" className="auth-mgmt-add-btn" onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          新增授权
        </button>
      </div>

      <AddAuthSheet
        open={addOpen}
        existing={grants}
        onClose={() => setAddOpen(false)}
        onConfirm={(grant) => {
          addArchiveAuthGrant(grant)
          showToast(`已为 ${grant.name} 创建授权`)
          setAddOpen(false)
        }}
      />

      <GrantDetailSheet
        grant={detailGrant}
        now={now}
        onClose={() => setDetailGrant(null)}
        onRevoke={() => {
          if (detailGrant) setRevokeGrant(detailGrant)
          setDetailGrant(null)
        }}
        onExtend={(hours) => {
          if (!detailGrant) return
          extendArchiveAuthGrant(detailGrant.id, hours)
          showToast(`已延长 ${detailGrant.name} 的授权 ${hours} 小时`)
          setDetailGrant(null)
        }}
      />

      <RevokeConfirmSheet
        grant={revokeGrant}
        onClose={() => setRevokeGrant(null)}
        onConfirm={() => {
          if (!revokeGrant) return
          revokeArchiveAuthGrant(revokeGrant.id)
          showToast(`已撤销 ${revokeGrant.name} 的档案授权`)
          setRevokeGrant(null)
        }}
      />

      <QrDisplaySheet
        open={qrOpen}
        code={tempAuthSession?.code}
        expiresAt={tempAuthSession?.expiresAt}
        now={now}
        onClose={() => setQrOpen(false)}
        onDemoView={() => {
          setQrOpen(false)
          navigate('/auth/enter')
        }}
      />
    </div>
  )
}

function AddAuthSheet({
  open,
  existing,
  onClose,
  onConfirm,
}: {
  open: boolean
  existing: ArchiveAuthGrant[]
  onClose: () => void
  onConfirm: (grant: Omit<ArchiveAuthGrant, 'id' | 'status' | 'createdAt'>) => void
}) {
  const navigate = useNavigate()
  const authableFamily = useAuthableFamilyMembers()
  const pendingFamily = useFamilyMembers().filter(
    (m) =>
      m.accountStatus === 'link_pending' ||
      m.accountStatus === 'invited' ||
      m.accountStatus === 'pending',
  )

  useEscape(onClose, open)
  const [type, setType] = useState<AuthGrantType>('family')
  const [scope, setScope] = useState<AuthScope>('view_all')
  const [durationHours, setDurationHours] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!open) return
    setType('family')
    setScope('view_all')
    setDurationHours(null)
    setSelectedId(null)
    setAgreed(false)
  }, [open])

  useEffect(() => {
    const opt = authTypeOptions.find((t) => t.id === type)
    if (opt) setScope(opt.defaultScope)
    if (type === 'temp_doctor') setDurationHours(24)
    else setDurationHours(null)
    setSelectedId(null)
  }, [type])

  if (!open) return null
  const host = useSheetHost()
  if (!host) return null

  const familyCandidates = authableFamily.filter(
    (c) => !existing.some((g) => g.familyMemberId === c.id && isGrantActive(g)),
  )
  const doctorCandidates = authAddDoctorCandidates.filter(
    (c) => !existing.some((g) => g.name === c.name && g.status === 'active'),
  )
  const candidates =
    type === 'family' ? familyCandidates : type === 'doctor' ? doctorCandidates : []
  const selectedFamily = familyCandidates.find((c) => c.id === selectedId)
  const selectedDoctor = doctorCandidates.find((c) => c.id === selectedId)
  const canSubmit =
    agreed &&
    (type === 'temp_doctor' ||
      (type === 'family' && selectedFamily) ||
      (type === 'doctor' && selectedDoctor))

  const handleSubmit = () => {
    if (!canSubmit) return
    const expiresAt =
      durationHours != null
        ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
        : null

    if (type === 'family' && selectedFamily) {
      onConfirm({
        name: selectedFamily.name,
        roleLabel: selectedFamily.relation,
        avatar: selectedFamily.avatar,
        tone: selectedFamily.tone,
        type,
        scope,
        duration: durationHours ? 'temp' : 'long',
        expiresAt,
        familyMemberId: selectedFamily.id,
      })
      return
    }

    if (type === 'doctor' && selectedDoctor) {
      onConfirm({
        name: selectedDoctor.name,
        roleLabel: selectedDoctor.roleLabel,
        avatar: selectedDoctor.avatar,
        tone: selectedDoctor.tone,
        type,
        scope,
        duration: durationHours ? 'temp' : 'long',
        expiresAt,
      })
      return
    }

    if (type === 'temp_doctor') {
      onConfirm({
        name: '外院接诊医生',
        roleLabel: '临时 · 就诊只读',
        avatar: '医',
        tone: 'from-slate-500 to-slate-600',
        type,
        scope: 'visit_readonly',
        duration: 'temp',
        expiresAt,
      })
    }
  }

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet auth-add-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p className="allergy-sheet-title">新增档案授权</p>
            <p className="allergy-sheet-sub">选择对象、范围与有效期，授权可随时撤销</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body auth-add-body">
          <section>
            <p className="auth-add-label">授权对象类型</p>
            <div className="auth-add-type-grid">
              {authTypeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={clsx('auth-add-type-card', type === opt.id && 'is-active')}
                  onClick={() => setType(opt.id)}
                >
                  <p className="font-semibold">{opt.label}</p>
                  <p>{opt.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {type === 'family' && familyCandidates.length === 0 && (
            <section className="auth-add-family-empty">
              <p className="auth-add-family-empty-title">暂无可授权的家人</p>
              <p className="auth-add-family-empty-desc">
                {pendingFamily.length > 0
                  ? `有 ${pendingFamily.length} 位成员待确认关联或邀请，确认后才可授权档案。`
                  : '请先在家庭档案中添加成员，并完成账号关联或代管建档。'}
              </p>
              {pendingFamily.length > 0 && (
                <ul className="auth-add-family-pending">
                  {pendingFamily.map((m) => (
                    <li key={m.id}>
                      {m.name} · {familyAccountStatusLabel[m.accountStatus].label}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="auth-add-family-empty-btn"
                onClick={() => {
                  onClose()
                  navigate('/family')
                }}
              >
                去管理家庭成员
              </button>
            </section>
          )}

          {type !== 'temp_doctor' && candidates.length > 0 && (
            <section>
              <p className="auth-add-label">选择{ type === 'family' ? '家人' : '医生' }</p>
              <div className="auth-add-people">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={clsx('auth-add-person', selectedId === c.id && 'is-active')}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className={clsx('auth-add-person-av bg-gradient-to-br', c.tone)}>
                      {c.avatar}
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block font-semibold">{c.name}</span>
                      <span className="text-xs text-muted">
                        {'relation' in c ? c.relation : c.roleLabel}
                      </span>
                    </span>
                    {selectedId === c.id && <Check size={16} className="text-brand-600" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {type === 'temp_doctor' && (
            <div className="auth-add-note">
              将生成 24 小时有效的临时授权，外院医生仅可查看就诊摘要，不含完整档案与诊断结论。
            </div>
          )}

          <section>
            <p className="auth-add-label">授权范围</p>
            <div className="auth-add-scope-list">
              {authScopeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={clsx('auth-add-scope', scope === opt.id && 'is-active')}
                  onClick={() => setScope(opt.id)}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs text-muted">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {type !== 'temp_doctor' && (
            <section>
              <p className="auth-add-label">有效期</p>
              <div className="auth-add-duration-row">
                {authDurationOptions.map((opt, i) => {
                  const hours = opt.hours
                  const active = durationHours === hours
                  return (
                    <button
                      key={`${opt.label}-${i}`}
                      type="button"
                      className={clsx('auth-add-duration', active && 'is-active')}
                      onClick={() => setDurationHours(hours)}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          <label className="auth-add-agree">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>我已阅读并同意授权条款，知晓可随时撤销授权</span>
          </label>
        </div>
        <div className="auth-add-footer">
          <button type="button" className="auth-add-submit" disabled={!canSubmit} onClick={handleSubmit}>
            确认授权
          </button>
        </div>
      </div>
    </div>,
    host,
  )
}

function GrantDetailSheet({
  grant,
  now,
  onClose,
  onRevoke,
  onExtend,
}: {
  grant: ArchiveAuthGrant | null
  now: number
  onClose: () => void
  onRevoke: () => void
  onExtend: (hours: number) => void
}) {
  useEscape(onClose, !!grant)
  if (!grant) return null
  const host = useSheetHost()
  if (!host) return null

  const active = isGrantActive(grant, now)
  const statusLabel = getGrantStatusLabel(grant, now)

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet auth-detail-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div className="flex items-center gap-3">
            <div className={clsx('auth-mgmt-av bg-gradient-to-br', grant.tone)}>{grant.avatar}</div>
            <div>
              <p className="allergy-sheet-title">{grant.name}</p>
              <p className="allergy-sheet-sub">{grant.roleLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body auth-detail-body">
          <div className="auth-detail-status">
            <span className={clsx('auth-mgmt-badge', active ? 'is-active' : 'is-expire')}>
              {statusLabel}
            </span>
          </div>
          <dl className="auth-detail-dl">
            <div>
              <dt>授权范围</dt>
              <dd>{scopeLabel(grant.scope)}</dd>
            </div>
            <div>
              <dt>授权类型</dt>
              <dd>{grant.duration === 'long' ? '长期授权' : '临时授权'}</dd>
            </div>
            <div>
              <dt>授权时间</dt>
              <dd>{grant.createdAt}</dd>
            </div>
            {grant.expiresAt && (
              <div>
                <dt>到期时间</dt>
                <dd>{new Date(grant.expiresAt).toLocaleString('zh-CN')}</dd>
              </div>
            )}
          </dl>
          <p className="auth-detail-note">
            撤销后对方将无法继续查看您的档案。涉及就医决策请以接诊医生意见为准。
          </p>
        </div>
        {active && (
          <div className="auth-detail-actions">
            {grant.duration === 'temp' && (
              <button type="button" className="auth-detail-extend" onClick={() => onExtend(24)}>
                <Clock size={16} />
                延长 24 小时
              </button>
            )}
            <button type="button" className="auth-detail-revoke" onClick={onRevoke}>
              撤销授权
            </button>
          </div>
        )}
      </div>
    </div>,
    host,
  )
}

function RevokeConfirmSheet({
  grant,
  onClose,
  onConfirm,
}: {
  grant: ArchiveAuthGrant | null
  onClose: () => void
  onConfirm: () => void
}) {
  useEscape(onClose, !!grant)
  if (!grant) return null
  const host = useSheetHost()
  if (!host) return null

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet auth-revoke-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-body auth-revoke-body">
          <div className="auth-revoke-icon">
            <AlertTriangle size={24} />
          </div>
          <p className="auth-revoke-title">确认撤销授权？</p>
          <p className="auth-revoke-sub">
            撤销后，{grant.name}（{grant.roleLabel}）将无法继续查看您的健康档案。
          </p>
          <div className="auth-revoke-actions">
            <button type="button" className="auth-revoke-cancel" onClick={onClose}>
              取消
            </button>
            <button type="button" className="auth-revoke-confirm" onClick={onConfirm}>
              确认撤销
            </button>
          </div>
        </div>
      </div>
    </div>,
    host,
  )
}

function QrDisplaySheet({
  open,
  code,
  expiresAt,
  now,
  onClose,
  onDemoView,
}: {
  open: boolean
  code?: string
  expiresAt?: number
  now: number
  onClose: () => void
  onDemoView?: () => void
}) {
  useEscape(onClose, open)
  if (!open || !code || !expiresAt) return null
  const host = useSheetHost()
  if (!host) return null

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet auth-qr-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <p className="allergy-sheet-title">扫码查看档案</p>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body auth-qr-body">
          <div className="auth-qr-box">
            <QrCode size={120} strokeWidth={1.2} className="text-brand-600" />
          </div>
          <p className="auth-qr-code">授权码：{code}</p>
          <p className="auth-qr-expire">
            {formatTempAuthCountdown(expiresAt, now)}后失效 · 仅用于就诊参考
          </p>
          {onDemoView && (
            <button type="button" className="auth-qr-demo-btn" onClick={onDemoView}>
              模拟医生扫码查看
            </button>
          )}
        </div>
      </div>
    </div>,
    host,
  )
}
