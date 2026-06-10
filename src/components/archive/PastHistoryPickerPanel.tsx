import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  buildPastYearOptions,
  PAST_HISTORY_OTHER,
  pastHistoryCategories,
  pastHistoryDefaults,
  pastHistoryMonths,
  pastHistoryTagOptions,
  type PastHistoryItem,
  pastHistoryKey,
} from '../../data/pastHistoryOptions'

export function PastHistoryCompactList({ items }: { items: PastHistoryItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="past-history-list">
      {items.map((p) => (
        <div key={p.id ?? pastHistoryKey(p)} className="past-history-row">
          <div className="past-history-date">
            <p className="past-history-year">{p.year}</p>
            <p className="past-history-month">{p.month}</p>
          </div>
          <span className="past-history-line" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="past-history-title">{p.title}</p>
            <p className="past-history-desc">{p.detail}</p>
            {p.tag && <span className="past-history-tag">{p.tag}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function PastHistoryPickerSheet({
  open,
  existing,
  onSave,
  onClose,
}: {
  open: boolean
  existing: PastHistoryItem[]
  onSave: (item: PastHistoryItem) => void
  onClose: () => void
}) {
  const recorded = new Set(existing.map((p) => pastHistoryKey(p)))
  const years = buildPastYearOptions()
  const now = new Date()

  const [category, setCategory] = useState<(typeof pastHistoryCategories)[number]['id']>('chronic')
  const [selected, setSelected] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState<string>(pastHistoryMonths[now.getMonth()])
  const [detail, setDetail] = useState('')
  const [tag, setTag] = useState<string>(pastHistoryTagOptions[0])
  const [showDetail, setShowDetail] = useState(false)

  const cat = pastHistoryCategories.find((c) => c.id === category)!
  const isOther = selected === PAST_HISTORY_OTHER
  const resolvedTitle = isOther ? customTitle.trim() : selected
  const canConfirm =
    Boolean(resolvedTitle) &&
    Boolean(detail.trim()) &&
    !recorded.has(pastHistoryKey({ year, month, title: resolvedTitle as string }))

  useEffect(() => {
    if (!open) {
      setCategory('chronic')
      setSelected(null)
      setCustomTitle('')
      setYear(String(now.getFullYear()))
      setMonth(pastHistoryMonths[now.getMonth()])
      setDetail('')
      setTag(pastHistoryTagOptions[0])
      setShowDetail(false)
    }
  }, [open, now])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sheetHost =
    typeof document !== 'undefined'
      ? document.querySelector('.device-content') ?? document.body
      : null

  if (!sheetHost) return null

  const handleSelect = (name: string) => {
    if (name !== PAST_HISTORY_OTHER && recorded.has(pastHistoryKey({ year, month, title: name }))) return
    setSelected(name)
    setShowDetail(true)
    if (name === PAST_HISTORY_OTHER) {
      setCustomTitle('')
      setDetail('')
      setTag(pastHistoryTagOptions[0])
      return
    }
    const defaults = pastHistoryDefaults[name]
    setDetail(defaults?.detail ?? '')
    setTag(defaults?.tag ?? pastHistoryTagOptions[0])
  }

  const handleConfirm = () => {
    if (!canConfirm || !resolvedTitle) return
    onSave({
      id: `past-${Date.now()}`,
      year,
      month,
      title: resolvedTitle,
      detail: detail.trim(),
      tag,
    })
    setSelected(null)
    setCustomTitle('')
    setDetail('')
    setTag(pastHistoryTagOptions[0])
    setShowDetail(false)
  }

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet" role="dialog" aria-modal="true" aria-labelledby="past-sheet-title">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p id="past-sheet-title" className="allergy-sheet-title">
              添加既往史
            </p>
            <p className="allergy-sheet-subtitle">选择常见疾病/手术，或选「其他」手动填写</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="allergy-sheet-segment">
          {pastHistoryCategories.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCategory(tab.id)
                setSelected(null)
                setShowDetail(false)
              }}
              className={clsx('allergy-sheet-segment-btn', category === tab.id && 'is-active')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="allergy-sheet-body">
          <div className="allergy-sheet-scroll">
            <div className="allergy-tag-grid">
              {cat.options.map((name) => {
              const isRecorded =
                name !== PAST_HISTORY_OTHER &&
                recorded.has(pastHistoryKey({ year, month, title: name }))
              const isSelected = selected === name
              return (
                <button
                  key={name}
                  type="button"
                  disabled={isRecorded}
                  onClick={() => handleSelect(name)}
                  className={clsx(
                    'allergy-tag',
                    isSelected && 'is-selected',
                    isRecorded && 'is-recorded',
                  )}
                >
                  {name}
                  {isRecorded && <span className="allergy-tag-check">✓</span>}
                </button>
              )
            })}
            </div>
          </div>

          {showDetail && selected && (
            <div className="allergy-sheet-footer">
            {isOther && (
              <input
                className="allergy-sheet-input mb-2"
                placeholder="填写疾病或手术名称"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            )}
            <div className="past-history-form-row mb-2">
              <select
                className="allergy-sheet-input past-history-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
              <select
                className="allergy-sheet-input past-history-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {pastHistoryMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="allergy-sheet-input past-history-textarea mb-2"
              placeholder="补充说明（必填）"
              rows={2}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
            <div className="mb-3 flex flex-wrap gap-1.5">
              {pastHistoryTagOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={clsx('past-history-tag-pill', tag === t && 'is-active')}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="allergy-sheet-submit"
            >
              确认添加{resolvedTitle ? ` · ${resolvedTitle}` : ''}
            </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    sheetHost,
  )
}
