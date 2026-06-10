import type { CSSProperties } from 'react'
import { Lock, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { RecordPathNode } from '../../data/healthRecordsConfig'
import { IpPartnerAvatar } from '../ai/IpPartnerAvatar'
import { loadAiPartner } from '../../data/aiPartner'

export type PathNodeView = RecordPathNode & {
  status: 'locked' | 'active' | 'done'
}

export function RecordPathGame({
  nodes,
  title,
  subtitle,
  mascotHint,
  onNodeTap,
}: {
  nodes: PathNodeView[]
  title: string
  subtitle: string
  mascotHint: string
  onNodeTap: (node: PathNodeView) => void
}) {
  const navigate = useNavigate()
  const partner = loadAiPartner()

  return (
    <div className="hr-path-page">
      <div className="hr-path-topbar">
        <button type="button" className="hr-path-pill" onClick={() => navigate('/records')}>
          📅 记录
        </button>
        <button type="button" className="hr-path-pill" onClick={() => navigate('/points')}>
          🎁 奖励
        </button>
      </div>

      <header className="hr-path-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      <div className="hr-path-scene">
        <svg className="hr-path-svg" viewBox="0 0 320 520" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <path
            className="hr-path-line"
            d="M 160 480 Q 80 420 120 360 Q 200 300 100 240 Q 40 180 160 120 Q 260 60 160 40"
            fill="none"
          />
        </svg>

        {nodes.map((node, i) => {
          const positions = [
            { bottom: '8%', left: '50%' },
            { bottom: '28%', left: '22%' },
            { bottom: '46%', left: '68%' },
            { bottom: '64%', left: '18%' },
            { top: '6%', left: '50%' },
          ]
          const pos = positions[i] ?? positions[0]
          const isStart = node.order === 0
          const isReview = node.id.includes('review')

          return (
            <button
              key={node.id}
              type="button"
              className={`hr-path-node hr-path-node-${node.status} ${isStart ? 'is-start' : ''} ${isReview ? 'is-review' : ''}`}
              style={pos as CSSProperties}
              disabled={node.status === 'locked'}
              onClick={() => onNodeTap(node)}
            >
              {node.status === 'locked' ? (
                <Lock size={isStart ? 20 : 16} />
              ) : node.status === 'done' ? (
                <span>{node.icon}</span>
              ) : isStart ? (
                <>
                  <Star size={18} fill="currentColor" />
                  <span className="hr-path-node-label">{node.title}</span>
                </>
              ) : (
                <>
                  <span className="hr-path-node-emoji">{node.icon}</span>
                  <span className="hr-path-node-label">{node.title}</span>
                </>
              )}
            </button>
          )
        })}

        <div className="hr-path-mascot" aria-hidden>
          <IpPartnerAvatar size="sm" variant={partner.avatarVariant} mood="celebrate" />
        </div>
      </div>

      <p className="hr-path-hint">{mascotHint}</p>
    </div>
  )
}
