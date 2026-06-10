import { ChevronRight, Image as ImageIcon, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddFamilyMemberFlow } from '../components/family/AddFamilyMemberFlow'
import { FamilyMemberCard } from '../components/family/FamilyMemberCard'
import { FamilyLinkRequestList } from '../components/family/FamilyLinkRequestPanel'
import { MobileShell } from '../components/layout/MobileShell'
import { BentoCard, SectionTitle } from '../components/ui/BentoCard'
import {
  type ActivityCatalogItem,
  type ActivityMedia,
  getActivityById,
} from '../data/activitiesCatalog'
import { getHomeFeed } from '../data/homeFeedLoader'
import {
  healthReports,
  mallItems,
  pointsHistory,
} from '../data/mockData'
import { getActiveFamilyGrant } from '../data/archiveAuthData'
import { type HubNavState, type HubReturnState, persistHubReturnSection, persistHubScrollPosition, readHubReturnSection } from '../lib/hubScroll'
import { getPoints, useAppStore, useFamilyMembers } from '../store/useAppStore'

export function PointsPage() {
  const role = useAppStore((s) => s.role)
  const pts = getPoints(role)

  return (
    <MobileShell title="积分中心" showTab={false} showBack>
      <div className="px-4 pb-6">
        <BentoCard gradient="from-amber-400 to-orange-500" className="mb-5 p-5 text-white">
          <p className="text-sm opacity-90">我的积分</p>
          <p className="mt-1 text-4xl font-bold">{pts.total}</p>
          <p className="mt-2 text-sm opacity-85">今日 +{pts.today}</p>
        </BentoCard>
        <SectionTitle title="积分明细" />
        <div className="mb-5 space-y-2">
          {pointsHistory.map((h) => (
            <BentoCard key={h.id} className="flex justify-between p-4">
              <div>
                <p className="font-medium">{h.title}</p>
                <p className="text-xs text-muted">{h.time}</p>
              </div>
              <span className={h.delta > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                {h.delta > 0 ? '+' : ''}
                {h.delta}
              </span>
            </BentoCard>
          ))}
        </div>
        <SectionTitle title="积分商城" />
        <div className="grid grid-cols-2 gap-3">
          {mallItems.map((m) => (
            <BentoCard key={m.id} className="p-4">
              <p className="font-semibold">{m.name}</p>
              <p className="mt-2 text-sm text-amber-600">{m.points} 积分</p>
            </BentoCard>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}

export function ActivityCover({ media, className = '' }: { media?: ActivityMedia | null; className?: string }) {
  if (!media) {
    return (
      <div className={`flex aspect-[16/9] items-center justify-center rounded-2xl bg-slate-100 ${className}`}>
        <ImageIcon size={28} className="text-slate-300" />
      </div>
    )
  }
  if (media.type === 'video') {
    return (
      <div className={`relative aspect-[16/9] overflow-hidden rounded-2xl bg-black ${className}`}>
        <video
          src={media.url}
          poster={media.posterUrl}
          controls
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
  return (
    <img
      src={media.url}
      alt={media.name || '活动封面'}
      className={`aspect-[16/9] w-full rounded-2xl object-cover ${className}`}
    />
  )
}

function ActivityStatusBadge({ status }: { status: ActivityCatalogItem['status'] }) {
  const map = {
    UPCOMING: { label: '未开始', cls: 'bg-blue-50 text-blue-700' },
    ONGOING: { label: '进行中', cls: 'bg-emerald-50 text-emerald-700' },
    ENDED: { label: '已结束', cls: 'bg-slate-100 text-slate-600' },
  } as const
  const meta = map[status]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}>{meta.label}</span>
}

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const joined = useAppStore((s) => s.activityJoined)
  const joinActivity = useAppStore((s) => s.joinActivity)
  const showToast = useAppStore((s) => s.showToast)
  const [activity, setActivity] = useState<ActivityCatalogItem | undefined>(() =>
    id ? getActivityById(id) : undefined,
  )

  useEffect(() => {
    setActivity(id ? getActivityById(id) : undefined)
  }, [id])

  if (!activity) {
    return (
      <MobileShell title="活动详情" showTab={false} showBack>
        <div className="px-4 py-8 text-center text-sm text-muted">活动不存在或已下架</div>
      </MobileShell>
    )
  }

  const handleJoin = () => {
    if (activity.status === 'ENDED') {
      showToast('请观看下方活动回放')
      return
    }
    joinActivity(activity.id)
    showToast('报名成功，请准时参加')
  }

  return (
    <MobileShell title="活动详情" showTab={false} showBack>
      <div className="px-4 pb-8">
        <ActivityCover media={activity.cover} className="mb-4" />
        <div className="mb-3 flex items-center gap-2">
          <ActivityStatusBadge status={activity.status} />
          <span className="text-xs text-muted">{activity.type}</span>
          {activity.organizer ? (
            <span className="text-xs text-muted">· {activity.organizer}</span>
          ) : null}
        </div>
        <h1 className="text-xl font-bold text-ink">{activity.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {activity.time} · {activity.location}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink/85">{activity.desc}</p>
        <p className="mt-3 text-sm text-amber-600">签到可获 +{activity.points} 积分</p>

        {activity.gallery && activity.gallery.length > 0 ? (
          <div className="mt-6">
            <SectionTitle title="活动图集" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {activity.gallery.map((g, i) => (
                <ActivityCover key={`${g.url}-${i}`} media={g} />
              ))}
            </div>
          </div>
        ) : null}

        {activity.replay ? (
          <div className="mt-6">
            <SectionTitle title="活动回放" />
            <div className="mt-2">
              <ActivityCover media={activity.replay} />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleJoin}
          disabled={joined[activity.id] && activity.status !== 'ENDED'}
          className="mt-6 w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white disabled:bg-emerald-100 disabled:text-emerald-700"
        >
          {activity.status === 'ENDED'
            ? '活动已结束'
            : joined[activity.id]
              ? '已报名'
              : `立即报名 · ${activity.seats}`}
        </button>
        <button
          type="button"
          onClick={() => navigate('/activities')}
          className="mt-3 w-full rounded-2xl border border-slate-200 py-3 text-sm text-muted"
        >
          返回活动列表
        </button>
      </div>
    </MobileShell>
  )
}

export function FamilyPage() {
  const navigate = useNavigate()
  const familyMembers = useFamilyMembers()
  const archiveAuthGrants = useAppStore((s) => s.archiveAuthGrants)
  const addArchiveAuthGrant = useAppStore((s) => s.addArchiveAuthGrant)
  const revokeArchiveAuthGrant = useAppStore((s) => s.revokeArchiveAuthGrant)
  const resendFamilyInvite = useAppStore((s) => s.resendFamilyInvite)
  const cancelFamilyLinkRequest = useAppStore((s) => s.cancelFamilyLinkRequest)
  const showToast = useAppStore((s) => s.showToast)

  const [addFamilyOpen, setAddFamilyOpen] = useState(false)

  const handleAuth = (id: string, name: string, relation: string) => {
    const existing = getActiveFamilyGrant(archiveAuthGrants, id)
    if (existing) {
      revokeArchiveAuthGrant(existing.id)
      showToast(`已撤销 ${name} 的档案授权`)
      return
    }
    addArchiveAuthGrant({
      name,
      roleLabel: relation,
      avatar: name.charAt(0),
      tone: 'from-blue-500 to-indigo-500',
      type: 'family',
      scope: 'view_all',
      duration: 'long',
      expiresAt: null,
      familyMemberId: id,
    })
    showToast(`已授权 ${name} 查看档案`)
  }

  const goAuthManagement = () => {
    persistHubScrollPosition()
    persistHubReturnSection('auth')
    navigate('/profile/auth', { state: { hubSection: 'auth' } satisfies HubNavState })
  }

  const viewFamilyArchive = (id: string) => {
    navigate(`/family/view/${id}`)
  }

  return (
    <MobileShell title="家人动态" showTab={false} showBack>
      <div className="family-page px-4 pb-24">
        <FamilyLinkRequestList />

        <div className="family-page-banner">
          <p>关联需对方确认 · 查看档案需单独授权</p>
          <button type="button" onClick={goAuthManagement}>
            授权管理
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="family-member-list">
          {familyMembers.map((m) => (
            <FamilyMemberCard
              key={m.id}
              member={m}
              grants={archiveAuthGrants}
              onView={viewFamilyArchive}
              onAuthorize={handleAuth}
              onResendInvite={resendFamilyInvite}
              onRemindLink={resendFamilyInvite}
              onCancelLink={cancelFamilyLinkRequest}
            />
          ))}
        </div>

        <div className="family-sticky-add">
          <button type="button" className="family-sticky-add-btn" onClick={() => setAddFamilyOpen(true)}>
            + 添加家庭成员
          </button>
        </div>
      </div>
      <AddFamilyMemberFlow open={addFamilyOpen} onClose={() => setAddFamilyOpen(false)} />
    </MobileShell>
  )
}

export function AdvisorPage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const isMember = role === 'member'
  const feed = getHomeFeed(role)
  const advisor = feed.advisor
  const serviceHours = advisor.nextAvailable ?? '每天 8:00 – 21:00'

  return (
    <MobileShell title="专属顾问" showTab={false} showBack>
      <div className="advisor-page px-4 pb-6">
        <div className="advisor-profile-brief">
          <div className="advisor-profile-avatar">{advisor.name.slice(0, 1)}</div>
          <div>
            <p className="advisor-profile-name">{advisor.name}</p>
            <p className="advisor-profile-meta">
              {advisor.department} · {advisor.title}
            </p>
            <p className="advisor-profile-hospital">{advisor.hospital}</p>
          </div>
        </div>

        <section className="advisor-wecom-card">
          <p className="advisor-wecom-title">添加企业微信 · 发起咨询</p>
          <p className="advisor-wecom-desc">长按识别下方二维码，添加专属顾问企业微信进行沟通</p>
          <div className="advisor-wecom-qr" aria-label="专属顾问企业微信二维码">
            <QrCode size={148} strokeWidth={1.1} className="text-brand-600" />
          </div>
          <p className="advisor-wecom-foot">咨询时段：{serviceHours}</p>
        </section>

        <ul className="advisor-wecom-tips">
          <li>健康咨询、报告解读、复查提醒等服务均通过企业微信交付</li>
          <li>添加后请备注您的注册手机号，便于顾问核对档案</li>
        </ul>

        {!isMember && advisor.upgradeHint && (
          <BentoCard className="mt-4 p-4" onClick={() => navigate('/membership')}>
            <p className="text-sm font-semibold text-ink">升级会员</p>
            <p className="mt-1 text-xs text-muted">{advisor.upgradeHint}</p>
          </BentoCard>
        )}
      </div>
    </MobileShell>
  )
}

export function ReportsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const hubSection = (location.state as HubNavState | null)?.hubSection

  const handleBack = () => {
    const target = hubSection ?? readHubReturnSection()
    if (target) {
      persistHubReturnSection(target)
      navigate('/profile', { state: { scrollTarget: target } satisfies HubReturnState })
      return
    }
    navigate(-1)
  }

  return (
    <MobileShell title="健康报告" showTab={false} showBack onBack={handleBack}>
      <div className="space-y-3 px-4 pb-6">
        {healthReports.map((r) => (
          <BentoCard key={r.id} className="p-4">
            <p className="font-semibold">{r.title}</p>
            <p className="mt-1 text-xs text-muted">
              {r.date} · {r.doctor}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{r.summary}</p>
            <span className="mt-3 inline-block rounded-full bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">
              已发布
            </span>
          </BentoCard>
        ))}
      </div>
    </MobileShell>
  )
}
