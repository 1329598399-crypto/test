import { clsx } from 'clsx'
import { QrCode, Search } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthorizedArchiveView } from '../components/archive/AuthorizedArchiveView'
import { MobileShell } from '../components/layout/MobileShell'
import {
  formatTempAuthCountdown,
  getGrantStatusLabel,
  getActiveFamilyGrant,
  isFamilyMemberAuthorized,
  type AuthScope,
} from '../data/archiveAuthData'
import {
  familyArchiveSnapshots,
  getOwnerVisitSnapshot,
  type AuthorizedArchiveSnapshot,
} from '../data/authorizedArchiveSnapshots'
import { useFamilyMembers, useAppStore } from '../store/useAppStore'

/** 家人授权后查看档案 */
export function FamilyAuthorizedViewPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const archiveAuthGrants = useAppStore((s) => s.archiveAuthGrants)
  const familyMemberSnapshots = useAppStore((s) => s.familyMemberSnapshots)
  const familyMembers = useFamilyMembers()

  const member = familyMembers.find((m) => m.id === memberId)
  const snapshot: AuthorizedArchiveSnapshot | null = memberId
    ? familyArchiveSnapshots[memberId] ?? familyMemberSnapshots[memberId] ?? null
    : null
  const grant = memberId ? getActiveFamilyGrant(archiveAuthGrants, memberId) : undefined
  const authorized = memberId
    ? isFamilyMemberAuthorized(archiveAuthGrants, memberId)
    : false
  const scope = grant?.scope ?? 'view_all'

  if (!member || !snapshot) {
    return (
      <MobileShell title="查看档案" showTab={false} showBack>
        <div className="px-4 py-12 text-center text-sm text-muted">未找到家人档案</div>
      </MobileShell>
    )
  }

  if (!authorized) {
    return (
      <MobileShell title="查看档案" showTab={false} showBack>
        <div className="auth-view-blocked px-4 py-10">
          <p className="text-base font-semibold text-ink">暂无查看权限</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            查看 {member.name} 的档案需先获得本人授权，授权后可随时撤销。
          </p>
          <button
            type="button"
            onClick={() => navigate('/family')}
            className="auth-view-blocked-btn"
          >
            返回家人动态
          </button>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title={`${member.name}的档案`} showTab={false} showBack>
      <AuthorizedArchiveView
        snapshot={snapshot}
        scope={scope}
        viewerLabel={`家人授权查看 · ${member.relation}`}
        expiresLabel={grant?.expiresAt ? getGrantStatusLabel(grant) : null}
        footerNote="您正在以家人身份查看授权范围内的健康信息。"
      />
    </MobileShell>
  )
}

/** 医生/外院通过授权码查看 */
export function AuthEnterPage() {
  const navigate = useNavigate()
  const tempAuthSession = useAppStore((s) => s.tempAuthSession)
  const verifyTempAuthCode = useAppStore((s) => s.verifyTempAuthCode)
  const showToast = useAppStore((s) => s.showToast)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleVerify = (inputCode?: string) => {
    const trimmed = (inputCode ?? code).trim()
    if (trimmed.length !== 6) {
      setError('请输入 6 位授权码')
      return
    }
    const result = verifyTempAuthCode(trimmed)
    if (!result.ok) {
      setError(result.error ?? '授权码无效或已过期')
      return
    }
    setError('')
    showToast('授权验证成功，正在打开档案摘要')
    navigate('/auth/view', {
      state: { scope: 'visit_readonly' as AuthScope },
    })
  }

  const handleDemoScan = () => {
    if (!tempAuthSession || tempAuthSession.expiresAt <= Date.now()) {
      showToast('请先在档案授权管理中生成临时授权码')
      navigate('/profile/auth')
      return
    }
    handleVerify(tempAuthSession.code)
  }

  return (
    <MobileShell title="授权码查看" showTab={false} showBack>
      <div className="auth-enter-page px-4 pb-8">
        <div className="auth-enter-hero">
          <div className="auth-enter-hero-icon">
            <QrCode size={28} />
          </div>
          <h2 className="text-lg font-bold text-ink">验证授权后查看</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            患者展示二维码或告知 6 位授权码后，可查看授权范围内的档案摘要（只读）。
          </p>
        </div>

        <div className="auth-enter-card">
          <label className="auth-enter-label">输入 6 位授权码</label>
          <input
            className={clsx('auth-enter-input', error && 'is-error')}
            inputMode="numeric"
            maxLength={6}
            placeholder="请输入授权码"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              setError('')
            }}
          />
          {error && <p className="auth-enter-error">{error}</p>}
          <button type="button" className="auth-enter-submit" onClick={() => handleVerify()}>
            <Search size={16} />
            验证并查看
          </button>
        </div>

        <button type="button" className="auth-enter-scan" onClick={handleDemoScan}>
          <QrCode size={18} />
          模拟扫码验证（Demo）
        </button>

        <p className="auth-enter-legal">
          仅供就诊参考，不构成诊断或处方建议。授权到期后自动失效，患者可随时撤销。
        </p>
      </div>
    </MobileShell>
  )
}

/** 验证通过后的医生只读查看页 */
export function DoctorSharedViewPage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const tempAuthSession = useAppStore((s) => s.tempAuthSession)
  const location = useLocation()
  const scope = (location.state as { scope?: AuthScope } | null)?.scope ?? 'visit_readonly'

  const snapshot = getOwnerVisitSnapshot(role)
  const expiresLabel =
    tempAuthSession && tempAuthSession.expiresAt > Date.now()
      ? `${formatTempAuthCountdown(tempAuthSession.expiresAt)}后失效`
      : null

  if (!tempAuthSession || tempAuthSession.expiresAt <= Date.now()) {
    return (
      <MobileShell title="档案摘要" showTab={false} showBack>
        <div className="auth-view-blocked px-4 py-10">
          <p className="text-base font-semibold text-ink">授权已失效</p>
          <p className="mt-2 text-sm text-muted">请让患者重新生成临时授权码或二维码。</p>
          <button type="button" onClick={() => navigate('/auth/enter')} className="auth-view-blocked-btn">
            重新验证
          </button>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="授权档案摘要" showTab={false} showBack>
      <AuthorizedArchiveView
        snapshot={snapshot}
        scope={scope}
        viewerLabel={`临时授权查看 · ${snapshot.name}`}
        expiresLabel={expiresLabel}
        footerNote="您正在以接诊医生身份查看患者授权的就诊摘要。"
      />
    </MobileShell>
  )
}
