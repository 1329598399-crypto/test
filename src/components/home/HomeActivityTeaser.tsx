import { Play } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { activityCoverPaths } from '../../data/activityCoverAssets'
import { loadActivityCatalog, type ActivityCatalogItem } from '../../data/activitiesCatalog'

interface ActivityRow {
  id: string
  name: string
  time: string
}

interface Props {
  activities: ActivityRow[]
}

const STATUS_RANK: Record<ActivityCatalogItem['status'], number> = {
  ONGOING: 0,
  UPCOMING: 1,
  ENDED: 2,
}

function pickFeaturedActivity(
  activities: ActivityRow[],
  catalog: ActivityCatalogItem[],
): { activity: ActivityRow; coverUrl: string; isVideo: boolean } | null {
  if (!activities.length) return null
  const catalogMap = Object.fromEntries(catalog.map((c) => [c.id, c]))
  const sorted = [...activities].sort((a, b) => {
    const ca = catalogMap[a.id]
    const cb = catalogMap[b.id]
    const ra = ca ? STATUS_RANK[ca.status] : 1
    const rb = cb ? STATUS_RANK[cb.status] : 1
    return ra - rb
  })
  const activity = sorted[0]
  const cover = catalogMap[activity.id]?.cover
  const coverUrl =
    cover?.type === 'video' ? cover.posterUrl || activityCoverPaths.chronicCare : cover?.url || ''
  return { activity, coverUrl, isVideo: cover?.type === 'video' }
}

export function HomeActivityTeaser({ activities }: Props) {
  const navigate = useNavigate()
  const featured = useMemo(
    () => pickFeaturedActivity(activities, loadActivityCatalog()),
    [activities],
  )

  if (!featured) return null

  const { activity, coverUrl, isVideo } = featured

  return (
    <button
      type="button"
      className="home-activity-teaser"
      onClick={() => navigate(`/activities/${activity.id}`)}
    >
      {coverUrl ? (
        <div className="home-activity-teaser-cover">
          <img
            src={coverUrl}
            alt=""
            className="home-activity-teaser-img"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = activityCoverPaths.chronicCare
            }}
          />
          {isVideo ? (
            <span className="home-activity-teaser-play">
              <Play size={18} fill="currentColor" />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="home-activity-teaser-body">
        <p className="home-activity-teaser-kicker">近期活动</p>
        <p className="home-activity-teaser-title">{activity.name}</p>
        <p className="home-activity-teaser-time">{activity.time}</p>
      </div>
    </button>
  )
}
