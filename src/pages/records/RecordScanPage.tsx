import { Camera, Settings, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MobileShell } from '../../components/layout/MobileShell'
import { getHealthRecordsConfig } from '../../data/healthRecordsLoader'
import { SCAN_MOCK_RESULTS } from '../../data/healthVitalsData'
import { useAppStore } from '../../store/useAppStore'

type ScanType = 'diet' | 'medication'

export function RecordScanPage() {
  const { scanType } = useParams<{ scanType: string }>()
  const type = (scanType === 'medication' ? 'medication' : 'diet') as ScanType
  const navigate = useNavigate()
  const addRecord = useAppStore((s) => s.addRecord)
  const completePathNode = useAppStore((s) => s.completePathNode)
  const showToast = useAppStore((s) => s.showToast)
  const config = getHealthRecordsConfig()

  const [phase, setPhase] = useState<'idle' | 'scanning' | 'result'>('idle')
  const [progress, setProgress] = useState(0)

  const title = type === 'diet' ? '饮食识别' : '用药识别'
  const hint = type === 'diet' ? config.scanDietHint : config.scanMedHint
  const mock = SCAN_MOCK_RESULTS[type]

  useEffect(() => {
    if (phase !== 'scanning') return
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setPhase('result')
          return 100
        }
        return p + 8
      })
    }, 120)
    return () => clearInterval(t)
  }, [phase])

  const startScan = () => {
    setProgress(0)
    setPhase('scanning')
  }

  const save = () => {
    addRecord(type, mock.summary)
    if (type === 'diet') completePathNode('node-2')
    showToast(type === 'diet' ? '饮食记录已保存' : '用药记录已保存')
    navigate('/records', { replace: true })
  }

  return (
    <MobileShell title={title} showTab={false} showBack mainClassName="hr-scan-main">
      <div className="hr-scan-page">
        {phase !== 'result' && (
          <>
            <div className="hr-scan-stats">
              <div className="hr-scan-stat hr-scan-stat-green">
                <span>🥗</span>
                <span>{type === 'diet' ? '识别热量' : '识别药品'}</span>
              </div>
              <div className="hr-scan-stat hr-scan-stat-purple">
                <span>⚖️</span>
                <span>AI 辅助</span>
              </div>
            </div>

            <div className="hr-scan-viewfinder">
              <div className="hr-scan-frame">
                <div className={`hr-scan-subject hr-scan-subject-${type}`} />
                {phase === 'scanning' && (
                  <div className="hr-scan-line" style={{ top: `${Math.min(progress, 92)}%` }} />
                )}
                {phase === 'scanning' && (
                  <span className="hr-scan-badge">识别中… {progress}%</span>
                )}
              </div>
              <p className="hr-scan-hint">{hint}</p>
            </div>

            <div className="hr-scan-controls">
              <button type="button" className="hr-scan-side" aria-label="设置">
                <Settings size={22} />
              </button>
              <button type="button" className="hr-scan-shutter" onClick={startScan} disabled={phase === 'scanning'}>
                <Camera size={28} />
              </button>
              <button type="button" className="hr-scan-side" aria-label="调节">
                <SlidersHorizontal size={22} />
              </button>
            </div>
          </>
        )}

        {phase === 'result' && (
          <div className="hr-scan-result">
            <div className="hr-scan-result-hero">
              <h2>{mock.name}</h2>
              {type === 'diet' ? (
                <div className="hr-scan-result-tags">
                  <span>{SCAN_MOCK_RESULTS.diet.kcal} kcal</span>
                  <span>蛋白 {SCAN_MOCK_RESULTS.diet.protein}</span>
                  <span>碳水 {SCAN_MOCK_RESULTS.diet.carbs}</span>
                </div>
              ) : (
                <p className="hr-scan-result-dose">{SCAN_MOCK_RESULTS.medication.dose}</p>
              )}
            </div>
            <div className="hr-scan-result-card">
              <h3>识别说明</h3>
              <p>{type === 'diet' ? '以上为 AI 识别结果，请核对后保存。' : SCAN_MOCK_RESULTS.medication.caution}</p>
            </div>
            <button type="button" className="hr-scan-save" onClick={save}>
              保存到健康记录
            </button>
            <button type="button" className="hr-scan-retry" onClick={() => setPhase('idle')}>
              重新拍摄
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
