/**
 * C 端活动目录（与 B 端 familyDoctorOpsMock 活动 a1–a4 对齐）
 * 支持封面图/视频、详情页展示与报名
 */
export type ActivityMediaType = 'image' | 'video'

export interface ActivityMedia {
  type: ActivityMediaType
  url: string
  posterUrl?: string
  name?: string
}

export type ActivityPublishStatus = 'UPCOMING' | 'ONGOING' | 'ENDED'

export interface ActivityCatalogItem {
  id: string
  name: string
  time: string
  location: string
  seats: string
  points: number
  desc: string
  type: string
  status: ActivityPublishStatus
  organizer?: string
  cover?: ActivityMedia | null
  gallery?: ActivityMedia[]
  /** 已结束线上活动的回放视频 */
  replay?: ActivityMedia | null
}

const CATALOG_STORAGE_KEY = 'fd_miniapp_activity_catalog_v1'

/** 默认活动（含封面媒体，与 B 端运营配置一致） */
export const defaultActivityCatalog: ActivityCatalogItem[] = [
  {
    id: 'a1',
    name: '慢病管理营（线上）',
    time: '06/08 19:30',
    location: '线上直播',
    seats: '回放可观看',
    points: 15,
    desc: '高血压、糖尿病日常管理技巧。医生团队讲解居家监测与用药提醒要点。',
    type: '线上直播',
    status: 'ENDED',
    organizer: '健康管理师团队',
    cover: {
      type: 'video',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      posterUrl: 'https://picsum.photos/seed/chronic-care/800/450',
      name: '慢病管理营预告',
    },
    replay: {
      type: 'video',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      posterUrl: 'https://picsum.photos/seed/chronic-care/800/450',
      name: '活动回放',
    },
  },
  {
    id: 'a2',
    name: '女性健康沙龙（线下）',
    time: '06/12 14:00',
    location: '朝阳健康中心',
    seats: '剩余 12 席',
    points: 20,
    desc: '甲状腺、乳腺健康科普。现场答疑与免费筛查体验。',
    type: '线下活动',
    status: 'UPCOMING',
    organizer: '运营中心',
    cover: {
      type: 'image',
      url: 'https://picsum.photos/seed/women-health/800/450',
      name: '沙龙现场',
    },
    gallery: [
      { type: 'image', url: 'https://picsum.photos/seed/women-health-2/800/450', name: '往期回顾' },
    ],
  },
  {
    id: 'a3',
    name: '会员茶话会（线下）',
    time: '06/09 10:00',
    location: '海淀服务中心',
    seats: '已报名',
    points: 25,
    desc: '会员专属交流，家庭医生团队现场答疑。',
    type: '线下活动',
    status: 'ONGOING',
    organizer: '家庭医生一组',
    cover: {
      type: 'image',
      url: 'https://picsum.photos/seed/tea-party/800/450',
      name: '茶话会',
    },
  },
  {
    id: 'a4',
    name: '心血管健康讲座（线上）',
    time: '06/13 19:00',
    location: '线上直播',
    seats: '剩余 8 席',
    points: 15,
    desc: '心脑血管健康管理，适合银卡及以上会员。',
    type: '线上直播',
    status: 'UPCOMING',
    organizer: '健康管理师团队',
    cover: {
      type: 'video',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      posterUrl: 'https://picsum.photos/seed/heart-health/800/450',
      name: '讲座预告',
    },
  },
]

export function loadActivityCatalog(): ActivityCatalogItem[] {
  if (typeof window === 'undefined') return defaultActivityCatalog
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ActivityCatalogItem[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* use default */
  }
  return defaultActivityCatalog
}

/** B 端「同步 C 端」或运营导入时写入（Demo） */
export function saveActivityCatalogOverride(items: ActivityCatalogItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(items))
}

/** B 端「同步至 C 端」导出 JSON 后，在 C 端活动专区粘贴导入 */
export function importActivityCatalogFromJson(raw: string): { ok: boolean; count?: number; error?: string } {
  try {
    const parsed = JSON.parse(raw) as ActivityCatalogItem[]
    if (!Array.isArray(parsed)) return { ok: false, error: '格式错误：需为 JSON 数组' }
    if (!parsed.length) return { ok: false, error: '活动列表为空' }
    saveActivityCatalogOverride(parsed)
    return { ok: true, count: parsed.length }
  } catch {
    return { ok: false, error: 'JSON 解析失败，请检查复制是否完整' }
  }
}

export function getActivityById(id: string): ActivityCatalogItem | undefined {
  return loadActivityCatalog().find((a) => a.id === id)
}

export function toLegacyCatalogItem(item: ActivityCatalogItem) {
  return {
    id: item.id,
    name: item.name,
    time: item.time,
    location: item.location,
    joined: false,
    seats: item.seats,
    points: item.points,
    desc: item.desc,
  }
}
