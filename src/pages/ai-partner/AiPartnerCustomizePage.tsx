import { ChevronLeft, ChevronRight, Dices, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IpPartnerAvatar } from '../../components/ai/IpPartnerAvatar'
import { MobileShell } from '../../components/layout/MobileShell'
import {
  DEFAULT_PARTNER,
  getPartnerGenderLabel,
  loadAiPartner,
  PARTNER_CALL_OPTIONS,
  PARTNER_GENDER_OPTIONS,
  randomPartnerDraft,
  type AiPartnerProfile,
  type PartnerGender,
} from '../../data/aiPartner'

export function AiPartnerCustomizePage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<AiPartnerProfile>(() => {
    const saved = loadAiPartner()
    return saved.completed ? saved : { ...DEFAULT_PARTNER, ...saved, name: saved.name || '小懂' }
  })
  const [callPickerOpen, setCallPickerOpen] = useState(false)
  const [genderPickerOpen, setGenderPickerOpen] = useState(false)

  const onRandom = () => {
    setDraft((prev) => randomPartnerDraft({ callMode: prev.callMode, callLabel: prev.callLabel }))
  }

  const onSubmit = () => {
    if (!draft.name.trim()) return
    const next: AiPartnerProfile = {
      ...draft,
      name: draft.name.trim(),
      callLabel:
        draft.callMode === 'owner'
          ? '主人'
          : draft.callMode === 'nickname'
            ? draft.name.trim()
            : '小懂',
    }
    navigate('/ai/partner/generating', { state: { draft: next } })
  }

  return (
    <MobileShell showTab={false} immersive showBack={false} mainClassName="partner-flow-main">
    <div className="partner-flow-page partner-customize-page">
      <header className="partner-flow-header safe-top">
        <button type="button" className="partner-flow-back" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={22} />
        </button>
        <h1>定制你的 AI 伙伴</h1>
        <span className="w-9" />
      </header>

      <div className="partner-customize-body">
        <div className="partner-avatar-stage">
          <IpPartnerAvatar size="lg" variant={draft.avatarVariant} mood="greet" />
          <button type="button" className="partner-dice-btn" onClick={onRandom} aria-label="随机形象">
            <Dices size={18} />
          </button>
        </div>

        <label className="partner-name-field">
          <Pencil size={16} className="text-slate-400" />
          <input
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            placeholder="给伙伴起个名字"
            maxLength={12}
          />
        </label>

        <div className="partner-settings-card">
          <button
            type="button"
            className="partner-setting-row"
            onClick={() => setCallPickerOpen((v) => !v)}
          >
            <span>称呼我为</span>
            <span className="partner-setting-value">
              {draft.callLabel}
              <ChevronRight size={16} />
            </span>
          </button>
          {callPickerOpen && (
            <div className="partner-picker-list">
              {PARTNER_CALL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={draft.callMode === o.value ? 'is-active' : ''}
                  onClick={() => {
                    setDraft((p) => ({ ...p, callMode: o.value, callLabel: o.label }))
                    setCallPickerOpen(false)
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="partner-setting-row"
            onClick={() => setGenderPickerOpen((v) => !v)}
          >
            <span>性别</span>
            <span className="partner-setting-value">
              {draft.genderLabel}
              <ChevronRight size={16} />
            </span>
          </button>
          {genderPickerOpen && (
            <div className="partner-picker-list">
              {PARTNER_GENDER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={draft.gender === o.value ? 'is-active' : ''}
                  onClick={() => {
                    setDraft((p) => ({
                      ...p,
                      gender: o.value as PartnerGender,
                      genderLabel: getPartnerGenderLabel(o.value),
                    }))
                    setGenderPickerOpen(false)
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          <div className="partner-pet-block">
            <div className="partner-pet-head">
              <span>伙伴设定</span>
              <button type="button" className="partner-random-link" onClick={onRandom}>
                <Dices size={14} />
                随机
              </button>
            </div>
            <label className="partner-field-label">身份</label>
            <input
              className="partner-text-input"
              value={draft.identity}
              onChange={(e) => setDraft((p) => ({ ...p, identity: e.target.value }))}
            />
            <label className="partner-field-label">描述</label>
            <textarea
              className="partner-textarea"
              value={draft.personality}
              onChange={(e) => setDraft((p) => ({ ...p, personality: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <p className="partner-footnote">* 别担心，后续你还可以在「我的」中继续修改这些配置</p>
      </div>

      <div className="partner-flow-footer safe-bottom">
        <button
          type="button"
          className="partner-primary-btn"
          disabled={!draft.name.trim()}
          onClick={onSubmit}
        >
          领取你的 AI 伙伴
        </button>
      </div>
    </div>
    </MobileShell>
  )
}
