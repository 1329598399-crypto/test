import type { Role } from './mockData'
import {
  buildDefaultHomeFeed,
  type HomeFeedPayload,
} from './homeFeedData'

const STORAGE_KEY = 'fd_miniapp_home_feed_v1'

export type HomeFeedStore = Partial<Record<Role, HomeFeedPayload>>

let cache: HomeFeedStore | null = null

export function saveHomeFeedOverride(payload: HomeFeedStore | HomeFeedPayload, role?: Role) {
  if (typeof localStorage === 'undefined') return
  let store: HomeFeedStore
  if (role && payload && 'ipMessage' in payload) {
    const prev = readStore()
    store = { ...prev, [role]: payload as HomeFeedPayload }
  } else {
    store = payload as HomeFeedStore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  cache = store
}

function readStore(): HomeFeedStore {
  if (cache) return cache
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as HomeFeedStore | HomeFeedPayload
    if (parsed && 'ipMessage' in parsed) {
      return { member: parsed as HomeFeedPayload }
    }
    cache = parsed as HomeFeedStore
    return cache
  } catch {
    return {}
  }
}

export function invalidateHomeFeedCache() {
  cache = null
}

export function getHomeFeed(role: Role): HomeFeedPayload {
  const store = readStore()
  const hit = store[role]
  if (hit?.ipMessage && hit.taskCards?.length) return hit
  return buildDefaultHomeFeed(role)
}

export type { HomeFeedPayload }
