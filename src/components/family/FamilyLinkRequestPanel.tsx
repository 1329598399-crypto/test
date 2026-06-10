import { clsx } from 'clsx'
import { ChevronRight, Link2, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { FamilyLinkRequest } from '../../data/familyLinkData'
import { useAppStore } from '../../store/useAppStore'

function sheetHost() {
  if (typeof document === 'undefined') return null
  return document.querySelector('.device-content') ?? document.body
}

function ConfirmSheet({
  request,
  open,
  onClose,
}: {
  request: FamilyLinkRequest
  open: boolean
  onClose: () => void
}) {
  const acceptFamilyLinkRequest = useAppStore((s) => s.acceptFamilyLinkRequest)
  const rejectFamilyLinkRequest = useAppStore((s) => s.rejectFamilyLinkRequest)
  const showToast = useAppStore((s) => s.showToast)

  if (!open) return null
  const host = sheetHost()
  if (!host) return null

  const handleAccept = () => {
    const err = acceptFamilyLinkRequest(request.id)
    if (err) showToast(err)
    onClose()
  }

  const handleReject = () => {
    const err = rejectFamilyLinkRequest(request.id)
    if (err) showToast(err)
    onClose()
  }

  return createPortal(
    <div className="family-link-sheet-root">
      <button type="button" className="family-link-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="family-link-sheet" role="dialog" aria-modal="true">
        <div className="family-link-sheet-handle" />
        <div className="family-link-sheet-head">
          <p className="family-link-sheet-title">确认家庭关联</p>
          <button type="button" className="family-link-sheet-close" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="family-link-sheet-body">
          <div className="family-link-sheet-avatar">{request.requesterName.charAt(0)}</div>
          <p className="family-link-sheet-name">{request.requesterName}</p>
          <p className="family-link-sheet-desc">
            申请将您添加为家庭成员，关系为
            <strong>「{request.relation}」</strong>
          </p>
          <p className="family-link-sheet-time">申请时间：{request.requestedAt}</p>
          <div className="family-link-sheet-notice">
            <ShieldCheck size={14} />
            <span>
              同意后将建立双向家庭关系；查看健康档案仍需对方另行授权，您可随时撤销。
            </span>
          </div>
        </div>
        <div className="family-link-sheet-foot">
          <button type="button" className="family-link-sheet-reject" onClick={handleReject}>
            拒绝
          </button>
          <button type="button" className="family-link-sheet-accept" onClick={handleAccept}>
            同意关联
          </button>
        </div>
      </div>
    </div>,
    host,
  )
}

export function usePendingLinkRequests() {
  const userId = useAppStore((s) => s.authUser?.userId)
  const familyLinkRequests = useAppStore((s) => s.familyLinkRequests)
  return familyLinkRequests.filter(
    (r) => r.targetUserId === userId && r.status === 'pending',
  )
}

/** 首页 / 家人页 — 待处理的关联申请 */
export function FamilyLinkRequestBanner({ className }: { className?: string }) {
  const pending = usePendingLinkRequests()
  const [active, setActive] = useState<FamilyLinkRequest | null>(null)

  if (pending.length === 0) return null

  return (
    <>
      <button
        type="button"
        className={clsx('family-link-banner', className)}
        onClick={() => setActive(pending[0])}
      >
        <span className="family-link-banner-icon">
          <Link2 size={18} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="family-link-banner-title">
            {pending.length === 1
              ? `${pending[0].requesterName} 申请关联家庭`
              : `${pending.length} 条家庭关联待确认`}
          </span>
          <span className="family-link-banner-sub">需您本人确认后方可建立关联</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-brand-500" />
      </button>
      {active && (
        <ConfirmSheet request={active} open onClose={() => setActive(null)} />
      )}
    </>
  )
}

/** 家人页 — 待确认申请列表 */
export function FamilyLinkRequestList() {
  const pending = usePendingLinkRequests()
  const [active, setActive] = useState<FamilyLinkRequest | null>(null)

  if (pending.length === 0) return null

  return (
    <>
      <div className="family-link-list">
        <p className="family-link-list-title">待您确认的关联</p>
        {pending.map((r) => (
          <button
            key={r.id}
            type="button"
            className="family-link-list-item"
            onClick={() => setActive(r)}
          >
            <span className="family-link-list-avatar">{r.requesterName.charAt(0)}</span>
            <span className="min-w-0 flex-1 text-left">
              <span className="family-link-list-name">{r.requesterName}</span>
              <span className="family-link-list-meta">
                关系：{r.relation} · {r.requestedAt}
              </span>
            </span>
            <span className="family-link-list-action">去确认</span>
          </button>
        ))}
      </div>
      {active && (
        <ConfirmSheet request={active} open onClose={() => setActive(null)} />
      )}
    </>
  )
}
