import type { ActivityCatalogItem, ActivityMedia } from './activitiesCatalog'

/** 活动封面（本地静态资源，离线/内网可访问） */
export const activityCoverPaths = {
  chronicCare: '/activities/a1-cover.svg',
  womenHealth: '/activities/a2-cover.svg',
  womenHealthGallery: '/activities/a2-gallery.svg',
  teaParty: '/activities/a3-cover.svg',
  heartHealth: '/activities/a4-cover.svg',
} as const

const LEGACY_PICSUM_URLS: Record<string, string> = {
  'https://picsum.photos/seed/chronic-care/800/450': activityCoverPaths.chronicCare,
  'https://picsum.photos/seed/women-health/800/450': activityCoverPaths.womenHealth,
  'https://picsum.photos/seed/women-health-2/800/450': activityCoverPaths.womenHealthGallery,
  'https://picsum.photos/seed/tea-party/800/450': activityCoverPaths.teaParty,
  'https://picsum.photos/seed/heart-health/800/450': activityCoverPaths.heartHealth,
}

export function resolveActivityMediaUrl(url?: string): string | undefined {
  if (!url) return url
  const mapped = LEGACY_PICSUM_URLS[url]
  if (mapped) return mapped
  if (/picsum\.photos/i.test(url)) return activityCoverPaths.chronicCare
  return url
}

export function normalizeActivityMedia(media?: ActivityMedia | null): ActivityMedia | null | undefined {
  if (!media) return media
  return {
    ...media,
    url: resolveActivityMediaUrl(media.url) ?? media.url,
    posterUrl: media.posterUrl ? resolveActivityMediaUrl(media.posterUrl) : media.posterUrl,
  }
}

export function normalizeActivityCatalogItem(item: ActivityCatalogItem): ActivityCatalogItem {
  return {
    ...item,
    cover: item.cover ? (normalizeActivityMedia(item.cover) ?? undefined) : item.cover,
    gallery: item.gallery
      ?.map((g) => normalizeActivityMedia(g))
      .filter((g): g is ActivityMedia => !!g),
    replay: item.replay ? (normalizeActivityMedia(item.replay) ?? undefined) : item.replay,
  }
}

export function normalizeActivityCatalog(items: ActivityCatalogItem[]): ActivityCatalogItem[] {
  return items.map(normalizeActivityCatalogItem)
}
