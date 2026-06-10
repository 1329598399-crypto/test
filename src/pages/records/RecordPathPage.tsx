import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecordPathGame, type PathNodeView } from '../../components/records/RecordPathGame'
import { MobileShell } from '../../components/layout/MobileShell'
import { getHealthRecordsConfig } from '../../data/healthRecordsLoader'
import { useAppStore } from '../../store/useAppStore'

function resolveNodeStatus(
  node: { id: string; order: number },
  completed: string[],
  nodes: { id: string; order: number }[],
): PathNodeView['status'] {
  if (completed.includes(node.id)) return 'done'
  const sorted = [...nodes].sort((a, b) => a.order - b.order)
  const firstIncomplete = sorted.find((n) => !completed.includes(n.id))
  if (!firstIncomplete) return 'done'
  if (firstIncomplete.id === node.id) return 'active'
  return 'locked'
}

export function RecordPathPage() {
  const navigate = useNavigate()
  const completed = useAppStore((s) => s.pathCompletedNodeIds)
  const showToast = useAppStore((s) => s.showToast)
  const [config, setConfig] = useState(() => getHealthRecordsConfig())

  useEffect(() => {
    const sync = () => setConfig(getHealthRecordsConfig())
    window.addEventListener('fd-ops-health-records-updated', sync)
    return () => window.removeEventListener('fd-ops-health-records-updated', sync)
  }, [])

  const nodes: PathNodeView[] = useMemo(() => {
    const sorted = [...config.pathNodes].sort((a, b) => a.order - b.order)
    return sorted.map((n) => ({
      ...n,
      status: resolveNodeStatus(n, completed, sorted),
    }))
  }, [config.pathNodes, completed])

  const onNodeTap = (node: PathNodeView) => {
    if (node.status === 'locked') {
      showToast('请先完成上一关卡')
      return
    }
    if (node.status === 'done') {
      navigate(node.nav)
      return
    }
    navigate(node.nav)
  }

  return (
    <MobileShell title="健康闯关" showTab={false} showBack mainClassName="hr-path-main">
      <RecordPathGame
        nodes={nodes}
        title={config.pathTitle}
        subtitle={config.pathSubtitle}
        mascotHint={config.mascotHint}
        onNodeTap={onNodeTap}
      />
    </MobileShell>
  )
}
