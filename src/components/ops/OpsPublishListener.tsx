import { useEffect } from 'react'
import { initOpsPublishBridge } from '../../lib/opsBridge'

/** 接收 B 端「发布到小程序」推送，业务人员无需在 C 端手动操作 */
export function OpsPublishListener() {
  useEffect(() => initOpsPublishBridge(), [])
  return null
}
