import { ChevronRight, ListChecks } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HomeTaskCard } from '../../data/homeFeedData'

interface Props {
  tasks: HomeTaskCard[]
}

/** 今日建议 — 紧凑摘要条（主引导在 IP 区） */
export function HomeTaskCarousel({ tasks }: Props) {
  const navigate = useNavigate()
  const pending = tasks.filter((t) => !t.done)
  const total = tasks.length

  if (!total) return null

  return (
    <section className="home-task-compact home-module home-module-tasks" aria-label="今日建议">
      <div className="home-task-compact-head">
        <div className="home-module-head-left">
          <span className="home-module-icon is-tasks" aria-hidden>
            <ListChecks size={15} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="home-module-title home-task-compact-title">今日建议</h2>
            <p className="home-module-sub">{pending.length} 项待办</p>
          </div>
        </div>
      </div>

      <div className="home-task-compact-scroll">
        {pending.map((task) => (
          <button
            key={task.id}
            type="button"
            className={`home-task-compact-chip is-accent-${task.accent}${task.urgent ? ' is-urgent' : ''}`}
            onClick={() => navigate(task.nav)}
          >
            <span className="home-task-compact-chip-label">{task.sourceLabel}</span>
            <span className="home-task-compact-chip-text">{task.title}</span>
            <ChevronRight size={12} className="home-task-compact-chip-arrow" aria-hidden />
          </button>
        ))}
      </div>
    </section>
  )
}
