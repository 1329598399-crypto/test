import { clsx } from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  buildFamilyTitle,
  FAMILY_HISTORY_OTHER,
  familyHistoryCategories,
  familyHistoryDefaults,
  familyHistoryKey,
  familyRelationOptions,
  parseFamilyTitle,
  type FamilyHistoryItem,
} from '../../data/familyHistoryOptions'

export function FamilyHistoryCompactList({ items }: { items: { title: string; detail: string }[] }) {
  if (items.length === 0) return null

  return (
    <div className="family-history-list">
      {items.map((f) => (
        <div key={f.title} className="family-history-row">
          <p className="family-history-title">{f.title}</p>
          <p className="family-history-desc">{f.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function FamilyHistoryPickerSheet({
  open,
  existing,
  onSave,
  onClose,
}: {
  open: boolean
  existing: { title: string; detail: string }[]
  onSave: (item: FamilyHistoryItem) => void
  onClose: () => void
}) {
  const recorded = useMemo(() => {
    const keys = new Set<string>()
    for (const item of existing) {
      const parsed = parseFamilyTitle(item.title)
      keys.add(familyHistoryKey(parsed))
      keys.add(item.title)
    }
    return keys
  }, [existing])

  const [relation, setRelation] = useState<string | null>(null)
  const [category, setCategory] = useState<(typeof familyHistoryCategories)[number]['id']>('chronic')
  const [selected, setSelected] = useState<string | null>(null)
  const [customRelation, setCustomRelation] = useState('')
  const [customCondition, setCustomCondition] = useState('')
  const [detail, setDetail] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  const cat = familyHistoryCategories.find((c) => c.id === category)!
  const isOtherRelation = relation === FAMILY_HISTORY_OTHER
  const isOtherCondition = selected === FAMILY_HISTORY_OTHER
  const resolvedRelation = isOtherRelation ? customRelation.trim() : relation
  const resolvedCondition = isOtherCondition ? customCondition.trim() : selected
  const resolvedTitle =
    resolvedRelation && resolvedCondition
      ? buildFamilyTitle(resolvedRelation, resolvedCondition)
      : ''
  const canConfirm =
    Boolean(resolvedRelation) &&
    Boolean(resolvedCondition) &&
    Boolean(detail.trim()) &&
    !recorded.has(familyHistoryKey({ relation: resolvedRelation as string, condition: resolvedCondition as string })) &&
    !recorded.has(resolvedTitle)

  useEffect(() => {
    if (!open) {
      setRelation(null)
      setCategory('chronic')
      setSelected(null)
      setCustomRelation('')
      setCustomCondition('')
      setDetail('')
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

  const handleSelectRelation = (name: string) => {
    setRelation(name)
    setSelected(null)
    setShowDetail(false)
    if (name === FAMILY_HISTORY_OTHER) {
      setCustomRelation('')
    }
  }

  const handleSelectCondition = (name: string) => {
    if (!resolvedRelation && !relation) return
    const rel = isOtherRelation ? customRelation.trim() : relation
    if (!rel) return
    if (
      name !== FAMILY_HISTORY_OTHER &&
      recorded.has(familyHistoryKey({ relation: rel, condition: name }))
    ) {
      return
    }
    setSelected(name)
    setShowDetail(true)
    if (name === FAMILY_HISTORY_OTHER) {
      setCustomCondition('')
      setDetail('')
      return
    }
    setDetail(familyHistoryDefaults[name] ?? '')
  }

  const handleConfirm = () => {
    if (!canConfirm || !resolvedRelation || !resolvedCondition) return
    onSave({
      id: `family-${Date.now()}`,
      relation: resolvedRelation,
      condition: resolvedCondition,
      title: buildFamilyTitle(resolvedRelation, resolvedCondition),
      detail: detail.trim(),
    })
    setRelation(null)
    setSelected(null)
    setCustomRelation('')
    setCustomCondition('')
    setDetail('')
    setShowDetail(false)
  }

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet" role="dialog" aria-modal="true" aria-labelledby="family-sheet-title">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p id="family-sheet-title" className="allergy-sheet-title">
              添加家族史
            </p>
            <p className="allergy-sheet-subtitle">选择亲属与疾病类型，或选「其他」手动填写</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="allergy-sheet-body">
          <div className="allergy-sheet-scroll">
            <p className="family-sheet-label">亲属关系</p>
            <div className="allergy-tag-grid mb-3">
              {familyRelationOptions.map((name) => {
                const isSelected = relation === name
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelectRelation(name)}
                    className={clsx('allergy-tag', isSelected && 'is-selected')}
                  >
                    {name}
                  </button>
                )
              })}
            </div>

            {isOtherRelation && (
              <input
                className="allergy-sheet-input mb-3"
                placeholder="填写亲属关系，如：叔父"
                value={customRelation}
                onChange={(e) => {
                  setCustomRelation(e.target.value)
                  setSelected(null)
                  setShowDetail(false)
                }}
              />
            )}

            {relation && (relation !== FAMILY_HISTORY_OTHER || customRelation.trim()) && (
              <>
                <div className="allergy-sheet-segment family-sheet-segment">
                  {familyHistoryCategories.map((tab) => (
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

                <p className="family-sheet-label">疾病/健康状况</p>
                <div className="allergy-tag-grid">
                  {cat.options.map((name) => {
                    const rel = isOtherRelation ? customRelation.trim() : relation!
                    const isRecorded =
                      name !== FAMILY_HISTORY_OTHER &&
                      recorded.has(familyHistoryKey({ relation: rel, condition: name }))
                    const isSelected = selected === name
                    return (
                      <button
                        key={name}
                        type="button"
                        disabled={isRecorded}
                        onClick={() => handleSelectCondition(name)}
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
              </>
            )}
          </div>

          {showDetail && selected && (
            <div className="allergy-sheet-footer">
              {isOtherCondition && (
                <input
                  className="allergy-sheet-input mb-2"
                  placeholder="填写疾病或健康状况"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                />
              )}
              <textarea
                className="allergy-sheet-input past-history-textarea mb-3"
                placeholder="补充说明（必填）"
                rows={2}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
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
