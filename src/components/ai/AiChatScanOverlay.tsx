import { Camera, Settings, SlidersHorizontal, X } from 'lucide-react'
import { getHealthRecordsConfig } from '../../data/healthRecordsLoader'
import { usePhotoScan } from '../../hooks/usePhotoScan'

export type AiScanType = 'diet' | 'medication'

interface Props {
  scanType: AiScanType
  onClose: () => void
  onFinished: () => void
}

export function AiChatScanOverlay({ scanType, onClose, onFinished }: Props) {
  const config = getHealthRecordsConfig()
  const { phase, progress, startScan } = usePhotoScan(onFinished)

  const title = scanType === 'diet' ? '食物营养识别' : '药品识别'
  const hint = scanType === 'diet' ? config.scanDietHint : config.scanMedHint
  const statLeft = scanType === 'diet' ? '识别热量' : '识别药品'
  const statRight = scanType === 'diet' ? '16 gram' : 'AI 辅助'

  return (
    <div className="ai-chat-scan-overlay">
      <header className="ai-chat-scan-top safe-top">
        <button type="button" className="ai-chat-scan-close" onClick={onClose} aria-label="关闭">
          <X size={20} />
        </button>
        <p className="ai-chat-scan-title">{title}</p>
        <span className="ai-chat-scan-top-spacer" />
      </header>

      <div className="ai-chat-scan-body">
        <div className="hr-scan-stats ai-chat-scan-stats">
          <div className="hr-scan-stat hr-scan-stat-green">
            <span>{scanType === 'diet' ? '🥗' : '💊'}</span>
            <span>{statLeft}</span>
          </div>
          <div className="hr-scan-stat hr-scan-stat-purple">
            <span>{scanType === 'diet' ? '⚖️' : '🤖'}</span>
            <span>{statRight}</span>
          </div>
        </div>

        <div className="hr-scan-viewfinder">
          <div className="hr-scan-frame ai-chat-scan-frame">
            <div className={`hr-scan-subject hr-scan-subject-${scanType}`} />
            {phase === 'scanning' && (
              <div className="hr-scan-line" style={{ top: `${Math.min(progress, 92)}%` }} />
            )}
            {phase === 'scanning' && (
              <span className="hr-scan-badge">Scanning… {progress}%</span>
            )}
          </div>
          <p className="hr-scan-hint">{hint}</p>
        </div>

        <div className="hr-scan-controls">
          <button type="button" className="hr-scan-side" aria-label="设置">
            <Settings size={22} />
          </button>
          <button
            type="button"
            className="hr-scan-shutter"
            onClick={startScan}
            disabled={phase === 'scanning'}
          >
            <Camera size={28} />
          </button>
          <button type="button" className="hr-scan-side" aria-label="调节">
            <SlidersHorizontal size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}
