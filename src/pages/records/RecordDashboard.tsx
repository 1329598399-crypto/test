import { ChevronRight, Gamepad2, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DailyGoalsClover } from '../../components/records/DailyGoalsClover'
import { WeekCalendar } from '../../components/records/WeekCalendar'
import { MobileShell } from '../../components/layout/MobileShell'
import { getHealthRecordsConfig } from '../../data/healthRecordsLoader'
import { VITAL_SNAPSHOTS } from '../../data/healthVitalsData'
import { recordTypes } from '../../data/mockData'
import { useAppStore } from '../../store/useAppStore'

const METRIC_NAV: Record<string, string> = {
  bp: '/records/vitals/bp',
  glucose: '/records/vitals/glucose',
  hr: '/records/vitals/hr',
  lipid: '/records/vitals/lipid',
  diet: '/records/scan/diet',
  mood: '/records/mood',
  medication: '/records/scan/medication',
}

export function RecordDashboard() {
  const navigate = useNavigate()
  const logs = useAppStore((s) => s.recordLogs)
  const [config, setConfig] = useState(() => getHealthRecordsConfig())
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const sync = () => setConfig(getHealthRecordsConfig())
    window.addEventListener('fd-ops-health-records-updated', sync)
    return () => window.removeEventListener('fd-ops-health-records-updated', sync)
  }, [])

  const stepPct = Math.min(100, Math.round((config.stepCount / config.stepTarget) * 100))

  const metricCards = useMemo(() => {
    const types = ['hr', 'bp', 'glucose', 'lipid'] as const
    return types.map((t) => {
      const snap = VITAL_SNAPSHOTS[t]
      const log = logs.find((l) => l.type === t)
      return {
        id: t,
        icon: recordTypes.find((r) => r.id === t)?.icon ?? '📊',
        title: snap.title,
        time: log?.time ?? snap.lastTime,
        value: log?.summary.split(' ')[0] ?? snap.value,
        unit: snap.unit,
        nav: METRIC_NAV[t],
      }
    })
  }, [logs])

  const quickTypes = recordTypes.filter((t) => t.id !== 'lipid')

  return (
    <MobileShell title="健康记录" showTab={false} showBack mainClassName="hr-dashboard-main">
      <div className="hr-dashboard">
        {config.gameModeEnabled && (
          <button type="button" className="hr-game-banner" onClick={() => navigate('/records/path')}>
            <div className="hr-game-banner-left">
              <Gamepad2 size={22} />
              <div>
                <p className="hr-game-banner-title">{config.pathTitle}</p>
                <p className="hr-game-banner-sub">{config.pathSubtitle}</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </button>
        )}

        <div className="hr-summary-card">
          <div className="hr-summary-head">
            <span className="hr-summary-date">{selectedDay.replace(/-/g, '.')}</span>
            <button type="button" className="hr-summary-ai" onClick={() => navigate('/ai')}>
              <Sparkles size={14} />
              小懂代录
            </button>
          </div>
          <DailyGoalsClover goals={config.dailyGoals} />
          <div className="hr-step-bar">
            <span className="hr-step-icon">👟</span>
            <div className="hr-step-track">
              <div className="hr-step-fill" style={{ width: `${stepPct}%` }} />
            </div>
            <span className="hr-step-text">
              {config.stepCount}/{config.stepTarget}
            </span>
          </div>
        </div>

        <WeekCalendar selected={selectedDay} onSelect={setSelectedDay} />

        <section className="hr-metric-section">
          <h3 className="hr-section-title">健康指标</h3>
          <div className="hr-metric-list">
            {metricCards.map((m) => (
              <button key={m.id} type="button" className="hr-metric-card" onClick={() => navigate(m.nav)}>
                <span className="hr-metric-icon">{m.icon}</span>
                <div className="hr-metric-body">
                  <p className="hr-metric-title">{m.title}</p>
                  <p className="hr-metric-time">{m.time}</p>
                </div>
                <div className="hr-metric-value">
                  <strong>{m.value}</strong>
                  <span>{m.unit}</span>
                </div>
                <ChevronRight size={16} className="hr-metric-chevron" />
              </button>
            ))}
          </div>
        </section>

        <section className="hr-quick-section">
          <h3 className="hr-section-title">快捷录入</h3>
          <div className="hr-quick-grid">
            {quickTypes.map((t) => {
              const nav =
                METRIC_NAV[t.id] ??
                (t.id === 'diet' || t.id === 'medication'
                  ? `/records/scan/${t.id}`
                  : t.id === 'mood'
                    ? '/records/mood'
                    : `/records/form/${t.id}`)
              return (
                <button key={t.id} type="button" className="hr-quick-item" onClick={() => navigate(nav)}>
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="hr-recent-section">
          <h3 className="hr-section-title">最近记录</h3>
          <div className="hr-recent-list">
            {logs.slice(0, 5).map((log) => {
              const type = recordTypes.find((t) => t.id === log.type)
              return (
                <div key={log.id} className="hr-recent-item">
                  <span>{type?.icon ?? '📝'}</span>
                  <div>
                    <p className="hr-recent-title">{type?.name ?? log.type}</p>
                    <p className="hr-recent-meta">
                      {log.summary} · {log.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </MobileShell>
  )
}
