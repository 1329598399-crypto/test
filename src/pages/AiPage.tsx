import { Camera, Keyboard, Mic, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiChatActionSheet } from '../components/ai/AiChatActionSheet'
import { AiChatScanOverlay } from '../components/ai/AiChatScanOverlay'
import type { AiScanType } from '../components/ai/AiChatScanOverlay'
import { AiChatScanResultBubble } from '../components/ai/AiChatScanResultBubble'
import { IpPartnerAvatar } from '../components/ai/IpPartnerAvatar'
import { MobileShell } from '../components/layout/MobileShell'
import {
  buildPartnerWelcome,
  hasCompletedAiPartner,
  loadAiPartner,
  type AiPartnerProfile,
} from '../data/aiPartner'
import type { ChatMessage } from '../store/useAppStore'
import { useAppStore, useRoleData } from '../store/useAppStore'

export function AiPage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  const data = useRoleData()
  const messages = useAppStore((s) => s.chatMessages)
  const sendChat = useAppStore((s) => s.sendChat)
  const sendChatScanResult = useAppStore((s) => s.sendChatScanResult)
  const saveChatScanResult = useAppStore((s) => s.saveChatScanResult)
  const [input, setInput] = useState('')
  const [keyboardMode, setKeyboardMode] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [activeScan, setActiveScan] = useState<AiScanType | null>(null)
  const [partner, setPartner] = useState<AiPartnerProfile>(() => loadAiPartner())
  const threadEndRef = useRef<HTMLDivElement>(null)

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

  const welcome = useMemo(() => buildPartnerWelcome(partner, role), [partner, role])

  const displayMessages: ChatMessage[] = useMemo(
    () =>
      messages.length === 0
        ? [{ id: 'welcome', role: 'assistant', text: welcome, kind: 'text' }]
        : messages,
    [messages, welcome],
  )

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages.length, activeScan])

  const send = () => {
    if (!input.trim()) return
    sendChat(input.trim())
    setInput('')
  }

  const handleScanPick = (type: AiScanType) => {
    setActionOpen(false)
    setActiveScan(type)
  }

  const handleScanFinished = useCallback(() => {
    if (!activeScan) return
    sendChatScanResult(activeScan)
    setActiveScan(null)
  }, [activeScan, sendChatScanResult])

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
          <button
            type="button"
            className="ai-chat-prompt-chip is-camera"
            onClick={() => setActionOpen(true)}
          >
            拍照识别食物
          </button>
        </div>

        <div className="ai-chat-thread">
          {displayMessages.map((m) => (
            <div key={m.id} className={`ai-chat-row ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
              {m.kind === 'scan-result' ? (
                <div className="ai-chat-assistant-stack">
                  <div className="ai-chat-bubble">{m.text}</div>
                  <AiChatScanResultBubble message={m} onSave={saveChatScanResult} />
                </div>
              ) : (
                <div className={`ai-chat-bubble ${m.text.startsWith('[拍照]') ? 'is-photo' : ''}`}>
                  {m.text.startsWith('[拍照]') ? (
                    <>
                      <span className="ai-chat-photo-tag">📷 图片</span>
                      {m.text.replace('[拍照] ', '')}
                    </>
                  ) : (
                    m.text
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        {keyboardMode ? (
          <div className="ai-chat-keyboard-bar">
            <button
              type="button"
              className="ai-chat-camera-inline"
              aria-label="拍照识别"
              onClick={() => setActionOpen(true)}
            >
              <Camera size={20} />
            </button>
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
              aria-label="拍照识别"
              onClick={() => setActionOpen(true)}
            >
              <Camera size={20} />
              <span>拍照</span>
            </button>
            <button
              type="button"
              className="ai-chat-mic-btn"
              aria-label="语音输入"
              onClick={() => sendChat('帮我记录今天血压 135/86')}
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

      <AiChatActionSheet
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        onPick={handleScanPick}
      />

      {activeScan ? (
        <AiChatScanOverlay
          scanType={activeScan}
          onClose={() => setActiveScan(null)}
          onFinished={handleScanFinished}
        />
      ) : null}
    </MobileShell>
  )
}
