import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, ListChecks, X } from 'lucide-react'
import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { HomeTaskCard } from '../../data/homeFeedData'

interface Props {
  tasks: HomeTaskCard[]
}

const SWIPE_THRESHOLD = 36

function cardOffset(index: number, active: number, total: number): number {
  let offset = index - active
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total
  return offset
}

export function HomeTaskCarousel({ tasks }: Props) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const dragRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const suppressClickRef = useRef(false)

  const pending = tasks.filter((t) => !t.done).length
  const total = tasks.length
  const canSwipe = total > 1

  const goTo = useCallback(
    (index: number) => {
      if (total <= 0) return
      setActiveIndex(((index % total) + total) % total)
    },
    [total],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragRef.current || !canSwipe) return
      const dx = clientX - dragRef.current.x
      const dy = clientY - dragRef.current.y
      dragRef.current = null
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
      if (dx < 0) goNext()
      else goPrev()
    },
    [canSwipe, goNext, goPrev],
  )

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canSwipe || e.button > 0) return
    const target = e.target as HTMLElement
    if (target.closest('.home-task-stack-nav, .home-task-stack-action, .home-task-stack-dots')) return
    dragRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault()
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return
    finishDrag(e.clientX, e.clientY)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null
  }

  if (!total) return null

  const handleCardActivate = (index: number, nav: string) => {
    if (suppressClickRef.current) return
    if (index !== activeIndex) {
      setActiveIndex(index)
      return
    }
    navigate(nav)
  }

  return (
    <section className="home-task-carousel-section home-module home-module-tasks">
      <div className="home-module-head">
        <div className="home-module-head-left">
          <span className="home-module-icon is-tasks" aria-hidden>
            <ListChecks size={16} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="home-module-title">今日建议</h2>
            <p className="home-module-sub">{pending} 项待办 · 左右滑动切换</p>
          </div>
        </div>
      </div>

      <div
        className="home-task-stack-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        aria-roledescription="carousel"
        aria-label="今日建议卡片"
      >
        {canSwipe && (
          <>
            <button
              type="button"
              className="home-task-stack-nav is-prev"
              aria-label="上一条建议"
              onClick={goPrev}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="home-task-stack-nav is-next"
              aria-label="下一条建议"
              onClick={goNext}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div className="home-task-stack-perspective">
          {tasks.map((task, index) => {
            const offset = cardOffset(index, activeIndex, total)
            const isActive = offset === 0
            const position =
              offset === 0
                ? 'is-active'
                : offset === -1
                  ? 'is-prev'
                  : offset === 1
                    ? 'is-next'
                    : 'is-far'

            return (
              <article
                key={task.id}
                className={clsx(
                  'home-task-stack-card',
                  `is-accent-${task.accent}`,
                  task.done && 'is-done',
                  task.urgent && 'is-urgent',
                  position,
                )}
                aria-hidden={!isActive && Math.abs(offset) > 1}
                onClick={() => {
                  if (!isActive) handleCardActivate(index, task.nav)
                }}
              >
                <button
                  type="button"
                  className="home-task-stack-card-hit"
                  onClick={() => handleCardActivate(index, task.nav)}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${task.sourceLabel}：${task.title}`}
                  aria-hidden={!isActive}
                >
                  <span className="home-task-stack-accent-bar" aria-hidden />
                  <div className="home-task-stack-body">
                    <span className="home-task-stack-source">{task.sourceLabel}</span>
                    <p className="home-task-stack-title">{task.title}</p>
                  </div>

                  {isActive && (
                    <div className="home-task-stack-foot">
                      {task.points != null && task.points > 0 && !task.done ? (
                        <span className="home-task-stack-points">+{task.points}</span>
                      ) : (
                        <span className="home-task-stack-points is-empty" aria-hidden />
                      )}
                      <div className="home-task-stack-actions">
                        {canSwipe && (
                          <button
                            type="button"
                            className="home-task-stack-action is-skip"
                            aria-label="看下一条建议"
                            onClick={(e) => {
                              e.stopPropagation()
                              goNext()
                            }}
                          >
                            <X size={13} strokeWidth={2.2} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="home-task-stack-action is-go"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(task.nav)
                          }}
                        >
                          去处理
                          <ChevronRight size={13} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>
                  )}
                </button>
              </article>
            )
          })}
        </div>
      </div>

      {canSwipe && (
        <div className="home-task-stack-dots" role="tablist" aria-label="建议切换">
          {tasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`第 ${index + 1} 条：${task.sourceLabel}`}
              className={clsx(index === activeIndex && 'is-active')}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
