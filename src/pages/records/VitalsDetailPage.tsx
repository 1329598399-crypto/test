import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MobileShell } from '../../components/layout/MobileShell'
import { VITAL_SNAPSHOTS } from '../../data/healthVitalsData'
import { useAppStore } from '../../store/useAppStore'

const INPUT_TYPES = new Set(['bp', 'glucose', 'hr'])

export function VitalsDetailPage() {
  const { vitalType } = useParams<{ vitalType: string }>()
  const type = vitalType ?? 'bp'
  const snap = VITAL_SNAPSHOTS[type] ?? VITAL_SNAPSHOTS.bp
  const navigate = useNavigate()
  const addRecord = useAppStore((s) => s.addRecord)
  const completePathNode = useAppStore((s) => s.completePathNode)
  const showToast = useAppStore((s) => s.showToast)
  const logs = useAppStore((s) => s.recordLogs)

  const latestLog = logs.find((l) => l.type === type)
  const [input, setInput] = useState(
    type === 'bp' ? '130/82' : type === 'glucose' ? '5.6' : type === 'hr' ? '72' : '',
  )

  const readOnly = type === 'lipid' || !INPUT_TYPES.has(type)

  const chartPoints = useMemo(() => {
    const max = Math.max(...snap.trend.map((p) => p.value))
    return snap.trend.map((p) => ({
      ...p,
      heightPct: Math.round((p.value / max) * 100),
    }))
  }, [snap.trend])

  const save = () => {
    if (readOnly) return
    const unit = snap.unit
    addRecord(type, `${input} ${unit}`)
    if (type === 'bp') completePathNode('node-3')
    showToast(`${snap.title}已保存`)
    navigate('/records', { replace: true })
  }

  const displayValue = latestLog?.summary.split(' ')[0] ?? snap.value

  return (
    <MobileShell title={snap.title} showTab={false} showBack mainClassName="hr-vital-main">
      <div className="hr-vital-page">
        <div className="hr-vital-gauge-wrap">
          <div className="hr-vital-gauge-outer">
            <svg className="hr-vital-ring" viewBox="0 0 120 120">
              <circle className="hr-vital-ring-track" cx="60" cy="60" r="52" />
              <circle
                className="hr-vital-ring-progress"
                cx="60"
                cy="60"
                r="52"
                style={{
                  strokeDasharray: 327,
                  strokeDashoffset: 327 - (327 * snap.ringPercent) / 100,
                }}
              />
            </svg>
            <div className="hr-vital-gauge-center">
              <span className={`hr-vital-status hr-vital-status-${snap.statusTone}`}>{snap.status}</span>
              <strong className="hr-vital-value">{displayValue}</strong>
              <span className="hr-vital-unit">{snap.unit}</span>
            </div>
          </div>
          <p className="hr-vital-time">最近：{latestLog?.time ?? snap.lastTime}</p>
        </div>

        <div className="hr-vital-chart-card">
          <div className="hr-vital-chart-head">
            <span>趋势</span>
            <span className="hr-vital-chart-filter">近 7 天</span>
          </div>
          <div className="hr-vital-bars">
            {chartPoints.map((p) => (
              <div key={p.date} className="hr-vital-bar-col">
                <div className="hr-vital-bar-fill" style={{ height: `${p.heightPct}%` }} />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {readOnly ? (
          <div className="hr-vital-readonly">
            <p>{snap.tip}</p>
            <button type="button" className="hr-vital-link" onClick={() => navigate('/profile/portrait')}>
              查看体检报告
            </button>
          </div>
        ) : (
          <div className="hr-vital-form">
            <label>
              <span>录入{snap.title}</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={type === 'bp' ? '130/82' : '请输入'}
              />
            </label>
            <p className="hr-vital-tip">{snap.tip}</p>
            <button type="button" className="hr-vital-save" onClick={save}>
              保存记录
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
