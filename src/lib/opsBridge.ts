/**
 * 接收 B 端运营配置发布（iframe 预览 / postMessage）
 * 业务人员无需在 C 端手动导入 JSON
 */
import { saveActivityCatalogOverride, type ActivityCatalogItem } from '../data/activitiesCatalog'
import {
  saveMembershipConfigOverride,
  invalidateMembershipConfigCache,
  type MembershipConfigPayload,
} from '../data/membershipConfigLoader'
import {
  invalidateHomeFeedCache,
  saveHomeFeedOverride,
  type HomeFeedStore,
} from '../data/homeFeedLoader'
import {
  invalidateHealthRecordsCache,
  saveHealthRecordsOverride,
  type HealthRecordsConfig,
} from '../data/healthRecordsLoader'

export const OPS_PUBLISH_MESSAGE = {
  ACTIVITY_CATALOG: 'FD_OPS_ACTIVITY_CATALOG',
  ACTIVITY_CATALOG_ACK: 'FD_OPS_ACTIVITY_CATALOG_ACK',
  MEMBERSHIP_CONFIG: 'FD_OPS_MEMBERSHIP_CONFIG',
  MEMBERSHIP_CONFIG_ACK: 'FD_OPS_MEMBERSHIP_CONFIG_ACK',
  HOME_FEED: 'FD_OPS_HOME_FEED',
  HOME_FEED_ACK: 'FD_OPS_HOME_FEED_ACK',
  HEALTH_RECORDS: 'FD_OPS_HEALTH_RECORDS',
  HEALTH_RECORDS_ACK: 'FD_OPS_HEALTH_RECORDS_ACK',
  PREVIEW_READY: 'FD_OPS_PREVIEW_READY',
} as const

export function isOpsPreviewMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('opsPreview') === '1'
}

export function notifyOpsPreviewReady() {
  if (!isOpsPreviewMode() || window.parent === window) return
  window.parent.postMessage({ type: OPS_PUBLISH_MESSAGE.PREVIEW_READY }, '*')
}

export function initOpsPublishBridge(onCatalogUpdated?: () => void) {
  if (typeof window === 'undefined') return () => {}

  const handler = (ev: MessageEvent) => {
    const data = ev.data
    if (!data || typeof data !== 'object') return

    if (data.type === OPS_PUBLISH_MESSAGE.ACTIVITY_CATALOG) {
      const payload = data.payload as ActivityCatalogItem[]
      if (!Array.isArray(payload) || !payload.length) return
      saveActivityCatalogOverride(payload)
      onCatalogUpdated?.()
      window.dispatchEvent(new CustomEvent('fd-ops-catalog-updated'))
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: OPS_PUBLISH_MESSAGE.ACTIVITY_CATALOG_ACK, count: payload.length },
          '*',
        )
      }
      return
    }

    if (data.type === OPS_PUBLISH_MESSAGE.MEMBERSHIP_CONFIG) {
      const payload = data.payload as MembershipConfigPayload
      if (!payload?.plans?.length) return
      invalidateMembershipConfigCache()
      saveMembershipConfigOverride(payload)
      onCatalogUpdated?.()
      window.dispatchEvent(new CustomEvent('fd-ops-membership-updated'))
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: OPS_PUBLISH_MESSAGE.MEMBERSHIP_CONFIG_ACK, count: payload.plans.length },
          '*',
        )
      }
      return
    }

    if (data.type === OPS_PUBLISH_MESSAGE.HOME_FEED) {
      const payload = data.payload as HomeFeedStore
      if (!payload || typeof payload !== 'object') return
      invalidateHomeFeedCache()
      saveHomeFeedOverride(payload)
      onCatalogUpdated?.()
      window.dispatchEvent(new CustomEvent('fd-ops-home-feed-updated'))
      if (window.parent !== window) {
        const count = Object.keys(payload).length
        window.parent.postMessage(
          { type: OPS_PUBLISH_MESSAGE.HOME_FEED_ACK, count },
          '*',
        )
      }
      return
    }

    if (data.type === OPS_PUBLISH_MESSAGE.HEALTH_RECORDS) {
      const payload = data.payload as HealthRecordsConfig
      if (!payload?.pathNodes?.length) return
      invalidateHealthRecordsCache()
      saveHealthRecordsOverride(payload)
      onCatalogUpdated?.()
      window.dispatchEvent(new CustomEvent('fd-ops-health-records-updated'))
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: OPS_PUBLISH_MESSAGE.HEALTH_RECORDS_ACK, count: payload.pathNodes.length },
          '*',
        )
      }
    }
  }

  window.addEventListener('message', handler)
  // 非 iframe 内无需通知；iframe 内在 OpsPreviewShell 登录完成后再 notify
  if (!isOpsPreviewMode() || window.parent === window) {
    notifyOpsPreviewReady()
  }

  return () => window.removeEventListener('message', handler)
}
