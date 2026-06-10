import type { DailyGoalMetric } from '../../data/healthRecordsConfig'

export function DailyGoalsClover({ goals }: { goals: DailyGoalMetric[] }) {
  const leaves = goals.slice(0, 4)
  const leafColors = ['#fb923c', '#f87171', '#60a5fa', '#4ade80']

  return (
    <div className="hr-clover-card">
      <div className="hr-clover-visual">
        <div className="hr-clover-icon" aria-hidden>
          {leaves.map((g, i) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100))
            const angle = i * 90
            return (
              <span
                key={g.id}
                className="hr-clover-leaf"
                style={{
                  ['--leaf-color' as string]: leafColors[i] ?? g.color,
                  ['--leaf-fill' as string]: `${pct}%`,
                  transform: `rotate(${angle}deg)`,
                }}
              />
            )
          })}
          <span className="hr-clover-core">今日</span>
        </div>
        <div className="hr-clover-metrics">
          {leaves.slice(0, 2).map((g) => (
            <div key={g.id} className="hr-clover-metric">
              <span className="hr-clover-metric-bar" style={{ background: g.color }} />
              <div>
                <p className="hr-clover-metric-label">{g.label}</p>
                <p className="hr-clover-metric-val">
                  {g.current} / {g.target} {g.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="hr-clover-metrics hr-clover-metrics-right">
          {leaves.slice(2, 4).map((g) => (
            <div key={g.id} className="hr-clover-metric">
              <span className="hr-clover-metric-bar" style={{ background: g.color }} />
              <div>
                <p className="hr-clover-metric-label">{g.label}</p>
                <p className="hr-clover-metric-val">
                  {g.current} / {g.target} {g.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
