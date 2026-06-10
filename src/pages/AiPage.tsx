import { Keyboard, Mic, MoreHorizontal, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IpPartnerAvatar } from '../components/ai/IpPartnerAvatar'
import { MobileShell } from '../components/layout/MobileShell'
import {
  buildPartnerWelcome,
  hasCompletedAiPartner,
  loadAiPartner,
  type AiPartnerProfile,
} from '../data/aiPartner'
import { useAppStore, useRoleData } from '../store/useAppStore'

export function AiPage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const data = useRoleData()
  const messages = useAppStore((s) => s.chatMessages)
  const sendChat = useAppStore((s) => s.sendChat)
  const [input, setInput] = useState('')
  const [keyboardMode, setKeyboardMode] = useState(false)
  const [partner, setPartner] = useState<AiPartnerProfile>(() => loadAiPartner())

  useEffect(() => {
    const sync = () => setPartner(loadAiPartner())
    window.addEventListener('fd-ai-partner-updated', sync)
    return () => window.removeEventListener('fd-ai-partner-updated', sync)
  }, [])

  useEffect(() => {
    if (!hasCompletedAiPartner()) {
      navigate('/ai/partner/intro', { replace: true })
    }
  }, [navigate])

  const welcome = useMemo(
    () => buildPartnerWelcome(partner, role),
    [partner, role],
  )

  const send = () => {
    if (!input.trim()) return
    sendChat(input.trim())
    setInput('')
  }

  const displayMessages =
    messages.length === 0
      ? [{ role: 'assistant' as const, text: welcome }]
      : messages

  return (
    <MobileShell showTab={false} immersive mainClassName="ai-chat-main">
      <div className="ai-chat-page">
        <header className="ai-chat-header safe-top">
          <button type="button" className="ai-chat-close" onClick={() => navigate(-1)} aria-label="关闭">
            <X size={20} />
          </button>
          <button
            type="button"
            className="ai-chat-customize"
            onClick={() => navigate('/ai/partner/customize')}
          >
            <Sparkles size={14} />
            定制
          </button>
        </header>

        <div className="ai-chat-hero">
          <div className="ai-chat-hero-glow" aria-hidden />
          <IpPartnerAvatar size="lg" variant={partner.avatarVariant} mood="greet" />
          <p className="ai-chat-partner-name">{partner.name}</p>
          <p className="ai-chat-partner-id">{partner.identity}</p>
        </div>

        <div className="ai-chat-prompts">
          {data.aiPrompts.map((p) => (
            <button key={p} type="button" className="ai-chat-prompt-chip" onClick={() => sendChat(p)}>
              {p}
            </button>
          ))}
        </div>

        <div className="ai-chat-thread">
          {displayMessages.map((m, i) => (
            <div key={i} className={`ai-chat-row ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
              <div className="ai-chat-bubble">{m.text}</div>
            </div>
          ))}
        </div>

        {keyboardMode ? (
          <div className="ai-chat-keyboard-bar">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="输入健康问题或记录数据…"
              className="ai-chat-input"
              autoFocus
            />
            <button type="button" className="ai-chat-send" onClick={send}>
              发送
            </button>
          </div>
        ) : (
          <div className="ai-chat-float-bar">
            <button
              type="button"
              className="ai-chat-float-btn"
              aria-label="更多"
              onClick={() => navigate('/ai/partner/customize')}
            >
              <MoreHorizontal size={20} />
              <span>更多</span>
            </button>
            <button
              type="button"
              className="ai-chat-mic-btn"
              aria-label="语音输入"
              onClick={() => {
                sendChat('帮我记录今天血压 135/86')
              }}
            >
              <Mic size={22} />
            </button>
            <button
              type="button"
              className="ai-chat-float-btn"
              aria-label="键盘"
              onClick={() => setKeyboardMode(true)}
            >
              <Keyboard size={20} />
              <span>键盘</span>
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
