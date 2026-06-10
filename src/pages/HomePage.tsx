import { useEffect, useMemo, useState } from 'react'

import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Heart,
  Play,
  Sparkles,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { FamilyLinkRequestBanner } from '../components/family/FamilyLinkRequestPanel'

import { HomeAdvisorCard } from '../components/home/HomeAdvisorCard'

import { HomeIpMascot } from '../components/home/HomeIpMascot'

import { HomeTaskCarousel } from '../components/home/HomeTaskCarousel'

import { MobileShell } from '../components/layout/MobileShell'

import { loadActivityCatalog } from '../data/activitiesCatalog'

import {
  formatHomeDate,
  getTimeGreeting,
  mergeServiceRemindersIntoTasks,
} from '../data/homeFeedData'

import { getHomeFeed } from '../data/homeFeedLoader'
import { isOpsPreviewMode } from '../lib/opsBridge'

import { homePageExtras, recordTypes } from '../data/mockData'

import { isFamilyMemberAuthorized } from '../data/archiveAuthData'

import { useAppStore, useRoleData } from '../store/useAppStore'



const recordIconMap = Object.fromEntries(recordTypes.map((r) => [r.name, r.icon]))

const recordToneMap: Record<string, string> = {
  血压: 'blue',
  血糖: 'green',
  心率: 'rose',
  饮食: 'amber',
  运动: 'teal',
  体重: 'violet',
  心情: 'pink',
  腰围: 'indigo',
}

function familyInitial(name: string) {
  const m = name.match(/[\u4e00-\u9fa5]/)
  return m?.[0] ?? name.slice(0, 1)
}



export function HomePage() {

  const navigate = useNavigate()

  const role = useAppStore((s) => s.role)

  const archiveAuthGrants = useAppStore((s) => s.archiveAuthGrants)

  const data = useRoleData()

  const [feedVersion, setFeedVersion] = useState(0)

  const isMember = role === 'member'

  const feed = useMemo(() => getHomeFeed(role), [role, feedVersion])



  useEffect(() => {

    const handler = () => setFeedVersion((v) => v + 1)

    window.addEventListener('fd-ops-home-feed-updated', handler)

    return () => window.removeEventListener('fd-ops-home-feed-updated', handler)

  }, [])



  const activityCovers = useMemo(() => {

    const map = Object.fromEntries(loadActivityCatalog().map((a) => [a.id, a.cover]))

    return map

  }, [])



  const ipMessage = useMemo(
    () => ({
      ...feed.ipMessage,
      greeting:
        isOpsPreviewMode() || feed.ipMessage.greeting.includes('好')
          ? feed.ipMessage.greeting
          : `${getTimeGreeting()}，${data.userName}`,
    }),
    [feed.ipMessage, data.userName],
  )

  const todayTasks = useMemo(
    () => mergeServiceRemindersIntoTasks(feed.taskCards, data.serviceReminders),
    [feed.taskCards, data.serviceReminders],
  )



  return (

    <MobileShell immersive showTab>

      <div className="home-page home-page-v2 pb-5">

        <header className="home-top-bar immersive-inset-top">

          <div className="home-top-greet">

            <p className="home-top-hello">您好，{data.userName}</p>

            <p className="home-top-date">{formatHomeDate()}</p>

          </div>

        </header>



        <HomeIpMascot message={ipMessage} onTap={() => navigate('/ai')} />



        <div className="home-sheet-v2 px-4">

          <FamilyLinkRequestBanner className="mb-3" />



          <HomeTaskCarousel tasks={todayTasks} />



          <HomeAdvisorCard advisor={feed.advisor} isMember={isMember} />



          <section className="home-module home-zone-records">

            <div className="home-module-head">

              <div className="home-module-head-left">

                <span className="home-module-icon is-records" aria-hidden>

                  <ClipboardList size={16} strokeWidth={2.2} />

                </span>

                <div>

                  <h2 className="home-module-title">健康记录</h2>

                  <p className="home-module-sub">打卡闯关 · 拍照识别</p>

                </div>

              </div>

              <button type="button" onClick={() => navigate('/records')} className="home-zone-link is-accent">

                全部

              </button>

            </div>

            <div className="home-record-grid">

              {data.records.slice(0, 5).map((name) => (

                <button

                  key={name}

                  type="button"

                  onClick={() => navigate('/records')}

                  className={`home-record-item is-tone-${recordToneMap[name] ?? 'blue'}`}

                >

                  <span className="home-record-icon">{recordIconMap[name] ?? '📝'}</span>

                  <span className="home-record-label">{name}</span>

                </button>

              ))}

            </div>

          </section>



          <section className="home-module home-zone-family">

            <div className="home-module-head">

              <div className="home-module-head-left">

                <span className="home-module-icon is-family" aria-hidden>

                  <Heart size={16} strokeWidth={2.2} />

                </span>

                <div>

                  <h2 className="home-module-title">家人动态</h2>

                  <p className="home-module-sub">授权后可查看家人档案</p>

                </div>

              </div>

              <button type="button" onClick={() => navigate('/family')} className="home-zone-link is-accent">

                查看

              </button>

            </div>

            <div className="home-feed home-feed-family">

              {data.familyDynamics.map((f, index) => {

                const authorized = f.id

                  ? isFamilyMemberAuthorized(archiveAuthGrants, f.id)

                  : false

                return (

                  <button

                    key={f.name}

                    type="button"

                    onClick={() =>

                      authorized && f.id

                        ? navigate(`/family/view/${f.id}`)

                        : navigate('/family')

                    }

                    className="home-feed-row"

                  >

                    <span className={`home-family-avatar is-tone-${index % 3}`}>

                      {familyInitial(f.name)}

                    </span>

                    <span className="min-w-0 flex-1 text-left">

                      <span className="flex items-center gap-2">

                        <span className="text-[13px] font-semibold text-ink">{f.name}</span>

                        <span className="home-feed-tag">{f.status}</span>

                      </span>

                      <span className="mt-0.5 block truncate text-[11px] text-muted">{f.info}</span>

                    </span>

                    <ChevronRight size={16} className="shrink-0 text-slate-300" />

                  </button>

                )

              })}

            </div>

          </section>



          <section className="home-module home-zone-activities">

            <div className="home-module-head">

              <div className="home-module-head-left">

                <span className="home-module-icon is-activities" aria-hidden>

                  <Sparkles size={16} strokeWidth={2.2} />

                </span>

                <div>

                  <h2 className="home-module-title">活动专区</h2>

                  <p className="home-module-sub">健康讲座 · 线下沙龙</p>

                </div>

              </div>

              <button

                type="button"

                onClick={() => navigate('/activities')}

                className="home-zone-link is-accent"

              >

                全部

              </button>

            </div>

            <div className="home-activity-scroll">

              {data.activities.map((a) => {

                const cover = activityCovers[a.id]

                const coverUrl =

                  cover?.type === 'video' ? cover.posterUrl || '' : cover?.url || ''

                return (

                  <button

                    key={a.id}

                    type="button"

                    onClick={() => navigate(`/activities/${a.id}`)}

                    className="home-activity-chip text-left"

                  >

                    {coverUrl ? (

                      <div className="home-activity-cover relative mb-2 overflow-hidden rounded-lg">

                        <img src={coverUrl} alt="" className="h-16 w-full object-cover" />

                        {cover?.type === 'video' ? (

                          <span className="absolute inset-0 flex items-center justify-center bg-black/20">

                            <Play size={16} className="text-white" fill="white" />

                          </span>

                        ) : null}

                      </div>

                    ) : (

                      <Calendar size={14} className="text-brand-500" />

                    )}

                    <p

                      className={`line-clamp-2 text-[12px] font-medium leading-snug text-ink ${coverUrl ? 'mt-0' : 'mt-1.5'}`}

                    >

                      {a.name}

                    </p>

                    <p className="mt-1 text-[10px] text-muted">{a.time}</p>

                    {a.joined && <span className="home-activity-joined">已报名</span>}

                  </button>

                )

              })}

            </div>

          </section>



          <button

            type="button"

            onClick={() => navigate('/membership')}

            className={`home-membership-bar mb-4 w-full text-left ${isMember ? 'is-member' : 'is-guest'}`}

          >

            <span className="home-membership-badge">{isMember ? '会员' : '开通'}</span>

            <p className="home-membership-title">{data.advisorName}</p>

            <p className="home-membership-desc">{data.membershipHint}</p>

            <span className="home-membership-cta">

              {data.membershipAction}

              <ChevronRight size={14} />

            </span>

          </button>



          {isMember && (

            <p className="pb-2 text-center text-[10px] text-muted/60">

              专属团队：{homePageExtras.doctors.map((d) => d.name).join(' · ')}

            </p>

          )}

        </div>

      </div>

    </MobileShell>

  )

}

