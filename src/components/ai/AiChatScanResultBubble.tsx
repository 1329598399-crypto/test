import { SCAN_MOCK_RESULTS } from '../../data/healthVitalsData'
import type { ChatMessage } from '../../store/useAppStore'

interface Props {
  message: ChatMessage
  onSave: (messageId: string) => void
}

export function AiChatScanResultBubble({ message, onSave }: Props) {
  if (message.kind !== 'scan-result' || !message.scanType || !message.id) return null

  const mock = SCAN_MOCK_RESULTS[message.scanType]
  const isDiet = message.scanType === 'diet'

  return (
    <div className="ai-chat-scan-result">
      <div className="ai-chat-scan-result-hero">
        <p className="ai-chat-scan-result-kicker">{isDiet ? '营养分析' : '药品识别'}</p>
        <h3 className="ai-chat-scan-result-name">{mock.name}</h3>
        {isDiet ? (
          <div className="ai-chat-scan-result-tags">
            <span>{SCAN_MOCK_RESULTS.diet.kcal} kcal</span>
            <span>蛋白 {SCAN_MOCK_RESULTS.diet.protein}</span>
            <span>碳水 {SCAN_MOCK_RESULTS.diet.carbs}</span>
            <span>脂肪 {SCAN_MOCK_RESULTS.diet.fat}</span>
          </div>
        ) : (
          <p className="ai-chat-scan-result-dose">{SCAN_MOCK_RESULTS.medication.dose}</p>
        )}
      </div>

      <div className="ai-chat-scan-result-note">
        <p className="ai-chat-scan-result-note-title">{isDiet ? 'Tips & Notes' : 'Caution'}</p>
        <p className="ai-chat-scan-result-note-body">
          {isDiet
            ? '以上为 AI 识别结果，请核对分量后保存。不构成医疗建议。'
            : SCAN_MOCK_RESULTS.medication.caution}
        </p>
      </div>

      <button
        type="button"
        className="ai-chat-scan-result-save"
        disabled={message.scanSaved}
        onClick={() => onSave(message.id!)}
      >
        {message.scanSaved ? '已保存到健康记录' : '保存到健康记录'}
      </button>
    </div>
  )
}
