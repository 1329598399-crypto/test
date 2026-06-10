import {
  buildDefaultHealthRecordsConfig,
  type HealthRecordsConfig,
} from './healthRecordsConfig'

const STORAGE_KEY = 'fd_miniapp_health_records_config_v1'

let cache: HealthRecordsConfig | null = null

export function invalidateHealthRecordsCache() {
  cache = null
}

function readRaw(): HealthRecordsConfig | null {
  if (cache) return cache
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    cache = JSON.parse(raw) as HealthRecordsConfig
    return cache
  } catch {
    return null
  }
}

export function saveHealthRecordsOverride(config: HealthRecordsConfig) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  cache = config
}

export function getHealthRecordsConfig(): HealthRecordsConfig {
  const hit = readRaw()
  if (hit?.pathNodes?.length) return { ...buildDefaultHealthRecordsConfig(), ...hit }
  return buildDefaultHealthRecordsConfig()
}

export type { HealthRecordsConfig }
