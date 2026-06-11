import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FamilyLinkRequestBanner } from '../components/family/FamilyLinkRequestPanel'
import { HomeActivityTeaser } from '../components/home/HomeActivityTeaser'
import { HomeAdvisorCard } from '../components/home/HomeAdvisorCard'
import { HomeIpMascot } from '../components/home/HomeIpMascot'
import { HomeRecordDual } from '../components/home/HomeRecordDual'
import { MobileShell } from '../components/layout/MobileShell'
import {
  formatHomeDate,
  getTimeGreeting,
} from '../data/homeFeedData'
import { getHomeFeed } from '../data/homeFeedLoader'
import { isOpsPreviewMode } from '../lib/opsBridge'
import { useAppStore, useRoleData } from '../store/useAppStore'

export function HomePage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const data = useRoleData()
  const [feedVersion, setFeedVersion] = useState(0)
  const isMember = role === 'member'
  const feed = useMemo(() => getHomeFeed(role), [role, feedVersion])

  useEffect(() => {
    const handler = () => setFeedVersion((v) => v + 1)
    window.addEventListener('fd-ops-home-feed-updated', handler)
    return () => window.removeEventListener('fd-ops-home-feed-updated', handler)
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

  return (
    <MobileShell immersive showTab>
      <div className="home-page home-page-bw pb-5">
        <HomeIpMascot
          message={ipMessage}
          userName={data.userName}
          dateLabel={formatHomeDate()}
          onTap={() => navigate('/ai')}
        />

        <div className="home-bw-body">
          <FamilyLinkRequestBanner className="home-bw-banner" />
          <HomeRecordDual />
          <HomeAdvisorCard advisor={feed.advisor} isMember={isMember} />
          <HomeActivityTeaser activities={data.activities} />
        </div>
      </div>
    </MobileShell>
  )
}
