import { clsx } from 'clsx'
import { ChevronRight } from 'lucide-react'
import type { FamilyMemberRecord } from '../../data/familyMemberData'
import { familyAccountStatusLabel } from '../../data/familyMemberData'
import {
  formatGrantDesc,
  getActiveFamilyGrant,
  isFamilyMemberAuthorized,
  type ArchiveAuthGrant,
} from '../../data/archiveAuthData'
import { maskPhoneShort } from '../../lib/familyMemberService'

interface Props {
  member: FamilyMemberRecord
  grants: ArchiveAuthGrant[]
  onView: (id: string) => void
  onAuthorize: (id: string, name: string, relation: string) => void
  onResendInvite: (id: string) => void
  onRemindLink: (id: string) => void
  onCancelLink: (id: string) => void
}

export function FamilyMemberCard({
  member: m,
  grants,
  onView,
  onAuthorize,
  onResendInvite,
  onRemindLink,
  onCancelLink,
}: Props) {
  const grant = getActiveFamilyGrant(grants, m.id)
  const authorized = isFamilyMemberAuthorized(grants, m.id)
  const accountMeta = familyAccountStatusLabel[m.accountStatus]
  const canAuthorize =
    m.accountStatus === 'linked' || m.accountStatus === 'managed'

  const subtitle = authorized
    ? grant
      ? formatGrantDesc(grant)
      : m.tip
    : m.tip

  return (
    <article
      className={clsx('family-member-card', authorized && 'is-authorized')}
      onClick={authorized ? () => onView(m.id) : undefined}
      onKeyDown={
        authorized
          ? (e) => {
              if (e.key === 'Enter') onView(m.id)
            }
          : undefined
      }
      role={authorized ? 'button' : undefined}
      tabIndex={authorized ? 0 : undefined}
    >
      <div className="family-member-card-main">
        <div className="family-member-avatar">{m.avatar}</div>

        <div className="family-member-body">
          <div className="family-member-head">
            <p className="family-member-name">
              {m.name}
              <span className="family-member-relation">· {m.relation}</span>
            </p>
          </div>
          <p className="family-member-tip">{subtitle}</p>
          <div className="family-member-tags">
            <span className={clsx('family-account-badge', `is-${accountMeta.tone}`)}>
              {accountMeta.label}
            </span>
            {authorized && (
              <span className="family-auth-badge is-on">已授权</span>
            )}
            {m.phone && (
              <span className="family-member-phone">{maskPhoneShort(m.phone)}</span>
            )}
          </div>
        </div>

        <div className="family-member-actions" onClick={(e) => e.stopPropagation()}>
          {authorized ? (
            <button
              type="button"
              className="family-btn family-btn-primary"
              onClick={() => onView(m.id)}
            >
              查看档案
            </button>
          ) : m.accountStatus === 'link_pending' ? (
            <div className="family-btn-stack">
              <button
                type="button"
                className="family-btn family-btn-warn"
                onClick={() => onRemindLink(m.id)}
              >
                提醒
              </button>
              <button
                type="button"
                className="family-btn family-btn-muted"
                onClick={() => onCancelLink(m.id)}
              >
                撤回
              </button>
            </div>
          ) : m.accountStatus === 'invited' || m.accountStatus === 'pending' ? (
            <button
              type="button"
              className="family-btn family-btn-warn"
              onClick={() => onResendInvite(m.id)}
            >
              重发邀请
            </button>
          ) : canAuthorize ? (
            <button
              type="button"
              className="family-btn family-btn-outline"
              onClick={() => onAuthorize(m.id, m.name, m.relation)}
            >
              去授权
            </button>
          ) : null}
        </div>
      </div>

      {authorized && (
        <div className="family-member-foot">
          <span>点击查看 {m.name} 的授权档案</span>
          <ChevronRight size={14} />
        </div>
      )}
    </article>
  )
}
