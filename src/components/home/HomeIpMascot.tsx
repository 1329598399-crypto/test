import { Pencil, Zap } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadAiPartner } from '../../data/aiPartner'
import type { HomeIpMessage } from '../../data/homeFeedData'
import { SeaOtterFlat } from './SeaOtterFlat'

interface Props {
  message: HomeIpMessage
  userName: string
  dateLabel: string
  onTap?: () => void
}

function getSpeechText(message: HomeIpMessage): string {
  const bubble = message.bubble.trim()
  const greeting = message.greeting.trim()
  if (!greeting) return bubble
  if (bubble.startsWith(greeting) || bubble.includes(greeting.slice(0, 2))) return bubble
  return `${greeting}，${bubble}`
}

export function HomeIpMascot({ message, userName, dateLabel, onTap }: Props) {
  const navigate = useNavigate()
  const [partner, setPartner] = useState(() => loadAiPartner())

  useEffect(() => {
    const sync = () => setPartner(loadAiPartner())
    window.addEventListener('fd-ai-partner-updated', sync)
    return () => window.removeEventListener('fd-ai-partner-updated', sync)
  }, [])

  const openCustomize = (e: MouseEvent) => {
    e.stopPropagation()
    navigate(partner.completed ? '/ai/partner/customize' : '/ai/partner/intro')
  }

  const speech = getSpeechText(message)
  const bubbleNav = message.nav ?? '/ai'

  const openBubble = () => navigate(bubbleNav)
  const openMascot = () => (onTap ? onTap() : navigate('/ai'))

  return (
    <section className="home-ip-hero immersive-inset-top">
      <div className="home-ip-hero-toolbar">
        <div className="home-ip-hero-meta">
          <p className="home-ip-hero-greet">您好，{userName}</p>
          <p className="home-ip-hero-date">{dateLabel}</p>
        </div>
        <button
          type="button"
          className="home-ip-hero-customize"
          onClick={openCustomize}
          aria-label={partner.completed ? `定制 ${partner.name}` : '定制 AI 伙伴'}
        >
          <Pencil size={12} />
          {partner.completed ? partner.name : '定制 IP'}
        </button>
      </div>

      <div className="home-ip-scene">
        <div className="home-ip-scene-inner">
          <button
            type="button"
            className="home-ip-speech-bubble"
            onClick={openBubble}
            aria-label={`${speech}，前往相关功能`}
          >
            <p className="home-ip-speech-text">{speech}</p>
          </button>

          <button type="button" className="home-ip-otter-btn" onClick={openMascot} aria-label="打开小懂 AI">
            <SeaOtterFlat />
          </button>

          {message.pointsReward ? (
            <span className="home-ip-points-chip">
              <Zap size={12} fill="currentColor" />
              +{message.pointsReward}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  )
}
