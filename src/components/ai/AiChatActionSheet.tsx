import { Camera, Pill, UtensilsCrossed, X } from 'lucide-react'

export type AiScanPick = 'diet' | 'medication'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (type: AiScanPick) => void
}

export function AiChatActionSheet({ open, onClose, onPick }: Props) {
  if (!open) return null

  return (
    <div className="ai-chat-sheet-root">
      <button type="button" className="ai-chat-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="ai-chat-sheet" role="dialog" aria-modal="true">
        <div className="ai-chat-sheet-handle" />
        <div className="ai-chat-sheet-head">
          <p className="ai-chat-sheet-title">拍照识别</p>
          <button type="button" className="ai-chat-sheet-close" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="ai-chat-sheet-body">
          <button
            type="button"
            className="ai-chat-sheet-option"
            onClick={() => onPick('diet')}
          >
            <span className="ai-chat-sheet-option-icon is-diet">
              <UtensilsCrossed size={20} />
            </span>
            <span className="ai-chat-sheet-option-text">
              <span className="ai-chat-sheet-option-title">食物营养识别</span>
              <span className="ai-chat-sheet-option-desc">拍照分析热量、蛋白质与碳水</span>
            </span>
            <Camera size={18} className="ai-chat-sheet-option-cam" />
          </button>
          <button
            type="button"
            className="ai-chat-sheet-option"
            onClick={() => onPick('medication')}
          >
            <span className="ai-chat-sheet-option-icon is-med">
              <Pill size={20} />
            </span>
            <span className="ai-chat-sheet-option-text">
              <span className="ai-chat-sheet-option-title">药品识别</span>
              <span className="ai-chat-sheet-option-desc">识别药名、用法与注意事项</span>
            </span>
            <Camera size={18} className="ai-chat-sheet-option-cam" />
          </button>
        </div>
      </div>
    </div>
  )
}
