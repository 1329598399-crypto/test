import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  ALLERGY_OTHER,
  allergenDefaultReactions,
  drugAllergenOptions,
  guessSeverity,
  nonDrugAllergenOptions,
} from '../../data/allergyOptions'

type AllergyItem = { name: string; severity: string; reaction: string }

const severityOptions = ['轻度', '中度', '严重'] as const

export function AllergyCompactList({ items }: { items: AllergyItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="allergy-compact-list">
      {items.map((a) => (
        <div key={a.name} className="allergy-compact-row">
          <span
            className={clsx(
              'allergy-compact-dot',
              (a.severity === '严重' || a.severity === '过敏') && 'is-warn',
              a.severity === '中度' && 'is-mid',
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="allergy-compact-name">{a.name}</p>
            <p className="allergy-compact-desc">{a.reaction}</p>
          </div>
          <span className="allergy-compact-badge">{a.severity}</span>
        </div>
      ))}
    </div>
  )
}

export function AllergyPickerSheet({
  open,
  existing,
  onSave,
  onClose,
}: {
  open: boolean
  existing: AllergyItem[]
  onSave: (item: AllergyItem) => void
  onClose: () => void
}) {
  const recorded = new Set(existing.map((a) => a.name))
  const [category, setCategory] = useState<'drug' | 'nonDrug'>('drug')
  const [selected, setSelected] = useState<string | null>(null)
  const [customName, setCustomName] = useState('')
  const [severity, setSeverity] = useState<string>('中度')
  const [reaction, setReaction] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  const options = category === 'drug' ? drugAllergenOptions : nonDrugAllergenOptions
  const isOther = selected === ALLERGY_OTHER
  const resolvedName = isOther ? customName.trim() : selected
  const canConfirm =
    Boolean(resolvedName) && !recorded.has(resolvedName as string)

  useEffect(() => {
    if (!open) {
      setCategory('drug')
      setSelected(null)
      setCustomName('')
      setSeverity('中度')
      setReaction('')
      setShowDetail(false)
    }
  }, [open])

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
    if (recorded.has(name)) return
    setSelected(name)
    setShowDetail(true)
    if (name === ALLERGY_OTHER) {
      setCustomName('')
      setReaction('')
      setSeverity('中度')
      return
    }
    setSeverity(guessSeverity(name))
    setReaction(allergenDefaultReactions[name] ?? '')
  }

  const handleConfirm = () => {
    if (!canConfirm) return
    onSave({
      name: resolvedName as string,
      severity,
      reaction: reaction.trim() || '待补充具体反应',
    })
    setSelected(null)
    setCustomName('')
    setSeverity('中度')
    setReaction('')
    setShowDetail(false)
  }

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet" role="dialog" aria-modal="true" aria-labelledby="allergy-sheet-title">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p id="allergy-sheet-title" className="allergy-sheet-title">
              添加过敏史
            </p>
            <p className="allergy-sheet-subtitle">选择常见项，或选「其他」手动填写</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="allergy-sheet-segment">
          {(
            [
              { id: 'drug' as const, label: '药物过敏原' },
              { id: 'nonDrug' as const, label: '非药物过敏原' },
            ] as const
          ).map((tab) => (
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
              {options.map((name) => {
              const isRecorded = recorded.has(name)
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
                placeholder="填写过敏原名称"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            )}
            <div className="mb-2 flex items-center gap-2">
              <span className="allergy-sheet-label">程度</span>
              <div className="flex flex-1 gap-1.5">
                {severityOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={clsx('allergy-severity-pill', severity === s && 'is-active')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <input
              className="allergy-sheet-input mb-3"
              placeholder="反应描述（选填）"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
            />
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="allergy-sheet-submit"
            >
              确认添加{resolvedName ? ` · ${resolvedName}` : ''}
            </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    sheetHost,
  )
}
