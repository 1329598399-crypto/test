import { Pencil } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IpPartnerAvatar } from '../ai/IpPartnerAvatar'
import { loadAiPartner } from '../../data/aiPartner'
import type { HomeIpMessage } from '../../data/homeFeedData'

interface Props {
  message: HomeIpMessage
  onTap?: () => void
}

const moodClass: Record<HomeIpMessage['mood'], string> = {
  greet: 'is-mood-greet',
  remind: 'is-mood-remind',
  celebrate: 'is-mood-celebrate',
  think: 'is-mood-think',
}

function highlightBubbleText(text: string) {
  const parts = text.split(/(\d+)/)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    /^\d+$/.test(part) ? (
      <strong key={i} className="home-ip-highlight-num">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

/** 首页气泡仅展示一句短文案，详情由「今日建议」承载 */
function getSpeechText(message: HomeIpMessage): string {
  const bubble = message.bubble.trim()
  const greeting = message.greeting.trim()
  if (!greeting) return bubble
  if (bubble.startsWith(greeting) || bubble.includes(greeting.slice(0, 2))) return bubble
  return `${greeting}，${bubble}`
}

export function HomeIpMascot({ message, onTap }: Props) {
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

  return (
    <section className={`home-ip-section home-ip-bubble-row ${moodClass[message.mood]}`}>
      <button
        type="button"
        className="home-ip-customize-fab"
        onClick={openCustomize}
        aria-label={partner.completed ? `定制 ${partner.name}` : '定制 AI 伙伴'}
      >
        <Pencil size={11} />
        {partner.completed ? partner.name : '定制'}
      </button>

      <div className="home-ip-bubble-layout home-ip-bubble-layout-centered">
        <button
          type="button"
          className="home-ip-bubble-avatar-hit"
          onClick={onTap}
          aria-label="打开小懂 AI"
        >
          <div className="home-ip-bubble-avatar-glow" aria-hidden />
          <IpPartnerAvatar size="lg" variant={partner.avatarVariant} mood={message.mood} />
          {partner.completed && <span className="home-ip-avatar-name">{partner.name}</span>}
        </button>

        <button type="button" className="home-ip-speech-hit" onClick={onTap}>
          <div className="home-ip-speech home-ip-speech-centered">
            <span className="home-ip-speech-tail" aria-hidden />
            <p className="home-ip-speech-text">{highlightBubbleText(speech)}</p>
          </div>
        </button>
      </div>
    </section>
  )
}
