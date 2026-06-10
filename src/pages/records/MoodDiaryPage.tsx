import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileShell } from '../../components/layout/MobileShell'
import { MOOD_OPTIONS } from '../../data/healthVitalsData'
import { useAppStore } from '../../store/useAppStore'

export function MoodDiaryPage() {
  const navigate = useNavigate()
  const addRecord = useAppStore((s) => s.addRecord)
  const completePathNode = useAppStore((s) => s.completePathNode)
  const showToast = useAppStore((s) => s.showToast)
  const [index, setIndex] = useState(2)

  const mood = MOOD_OPTIONS[index]

  const shift = (delta: number) => {
    setIndex((i) => Math.max(0, Math.min(MOOD_OPTIONS.length - 1, i + delta)))
  }

  const save = () => {
    addRecord('mood', `心情：${mood.label}`)
    completePathNode('node-start')
    completePathNode('node-1')
    showToast('心情已记录，+10 积分')
    navigate('/records', { replace: true })
  }

  return (
    <MobileShell title="心情日记" showTab={false} showBack mainClassName="hr-mood-main">
      <div className="hr-mood-page">
        <div className="hr-mood-progress">
          <div className="hr-mood-progress-fill" style={{ width: '50%' }} />
        </div>

        <h2 className="hr-mood-question">此刻你的心情如何？</h2>

        <div className="hr-mood-carousel">
          <button type="button" className="hr-mood-nav" onClick={() => shift(-1)} aria-label="上一个">
            <ChevronLeft size={20} />
          </button>
          <div className="hr-mood-stage">
            <div className="hr-mood-glow" aria-hidden />
            <div className="hr-mood-emojis">
              {MOOD_OPTIONS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className={`hr-mood-emoji ${i === index ? 'is-active' : ''} ${i === index - 1 ? 'is-left' : ''} ${i === index + 1 ? 'is-right' : ''}`}
                  onClick={() => setIndex(i)}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="hr-mood-nav" onClick={() => shift(1)} aria-label="下一个">
            <ChevronRight size={20} />
          </button>
        </div>

        <p className="hr-mood-label">我现在{mood.label}</p>

        <div className="hr-mood-footer">
          <button type="button" className="hr-mood-skip" onClick={() => navigate(-1)}>
            跳过
          </button>
          <button type="button" className="hr-mood-continue" onClick={save}>
            继续
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </MobileShell>
  )
}
