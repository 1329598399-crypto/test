import { clsx } from 'clsx'
import { Check, ChevronLeft, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  familyAddModeOptions,
  familyRelationOptions,
  type FamilyAddMode,
} from '../../data/familyMemberData'
import {
  getPresetHintForPhone,
  lookupAccountByPhone,
  maskPhoneShort,
} from '../../lib/familyMemberService'
import { MobileDatePickerField } from '../common/MobileDatePickerField'
import { useAppStore } from '../../store/useAppStore'

const modeShortLabel: Record<FamilyAddMode, string> = {
  link: '关联账号',
  invite: '发送邀请',
  managed: '代管档案',
}

function useSheetHost() {
  if (typeof document === 'undefined') return null
  return document.querySelector('.device-content') ?? document.body
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  /** sheet=底部弹层；inline=嵌入页面 */
  variant?: 'sheet' | 'inline'
}

export function AddFamilyMemberFlow({
  open,
  onClose,
  onSuccess,
  variant = 'sheet',
}: Props) {
  const registeredUsers = useAppStore((s) => s.registeredUsers)
  const addFamilyMember = useAppStore((s) => s.addFamilyMember)
  const showToast = useAppStore((s) => s.showToast)

  const host = useSheetHost()

  const [step, setStep] = useState<1 | 2>(1)
  const [mode, setMode] = useState<FamilyAddMode>('managed')
  const [relation, setRelation] = useState('配偶')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'男' | '女' | ''>('')
  const [birth, setBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setStep(1)
      setMode('managed')
      setRelation('配偶')
      setName('')
      setGender('')
      setBirth('')
      setPhone('')
      setError('')
    }
  }, [open])

  const modeMeta = familyAddModeOptions.find((m) => m.id === mode)!
  const lookup = useMemo(() => {
    if (!phone || phone.length < 11) return null
    return lookupAccountByPhone(phone, registeredUsers)
  }, [phone, registeredUsers])
  const presetHint = phone.length >= 11 ? getPresetHintForPhone(phone) : null

  const canNext =
    step === 1 && Boolean(relation) && Boolean(mode)

  const canSubmit =
    step === 2 &&
    name.trim().length > 0 &&
    gender !== '' &&
    birth.length > 0 &&
    (!modeMeta.requiresPhone || phone.length === 11)

  const handleSubmit = () => {
    const err = addFamilyMember({
      name,
      relation,
      gender,
      birth,
      phone: modeMeta.requiresPhone ? phone : undefined,
      mode,
    })
    if (err) {
      setError(err)
      return
    }
    showToast(
      mode === 'link'
        ? `已向 ${name} 发送关联申请，待对方确认`
        : mode === 'invite'
          ? `已向 ${maskPhoneShort(phone)} 发送邀请`
          : `已为 ${name} 创建代管档案`,
    )
    onSuccess?.()
    onClose()
  }

  if (!open && variant === 'sheet') return null

  const showHead = variant === 'sheet'

  const body = (
    <div
      className={clsx('family-add-flow', variant === 'sheet' && 'is-sheet')}
      role="dialog"
      aria-modal={variant === 'sheet'}
    >
      {variant === 'sheet' && <div className="family-add-flow-handle" />}

      {showHead && (
        <div className="family-add-flow-head">
          {step === 2 ? (
            <button type="button" className="family-add-flow-back" onClick={() => { setStep(1); setError('') }}>
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="w-8" />
          )}
          <div className="min-w-0 flex-1 text-center">
            <p className="family-add-flow-title">添加家庭成员</p>
            <p className="family-add-flow-sub">步骤 {step}/2</p>
          </div>
          <button type="button" className="family-add-flow-close" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>
      )}

      {!showHead && step === 2 && (
        <div className="family-add-flow-inline-back px-4 pt-2">
          <button type="button" className="family-add-flow-back" onClick={() => { setStep(1); setError('') }}>
            <ChevronLeft size={16} />
            <span>上一步</span>
          </button>
        </div>
      )}

      <div className={clsx('family-add-flow-steps', !showHead && 'px-4 pt-2')}>
        <span className={clsx('family-add-flow-dot', step >= 1 && 'is-on')} />
        <span className={clsx('family-add-flow-line', step >= 2 && 'is-on')} />
        <span className={clsx('family-add-flow-dot', step >= 2 && 'is-on')} />
      </div>

      {step === 1 && (
        <div className="family-add-flow-body">
          <p className="family-add-flow-label">添加方式</p>
          <div className="family-add-segment">
            {familyAddModeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={clsx('family-add-segment-btn', mode === opt.id && 'is-active')}
                onClick={() => { setMode(opt.id); setError('') }}
              >
                {modeShortLabel[opt.id]}
              </button>
            ))}
          </div>
          <p className="family-add-flow-hint">{modeMeta.desc}</p>

          <p className="family-add-flow-label mt-3">成员关系</p>
          <div className="family-add-relation-scroll no-scrollbar">
            {familyRelationOptions.map((rel) => (
              <button
                key={rel}
                type="button"
                className={clsx('family-add-relation-chip', relation === rel && 'is-active')}
                onClick={() => setRelation(rel)}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="family-add-flow-body">
          <div className="family-add-summary">
            <span>{modeShortLabel[mode]}</span>
            <span>·</span>
            <span>{relation}</span>
          </div>

          <label className="family-add-field">
            <span>姓名</span>
            <input
              placeholder="家庭成员姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="family-add-row">
            <div className="family-add-field flex-1">
              <span>性别</span>
              <div className="family-add-gender-row">
                {(['男', '女'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={clsx('family-add-gender-btn', gender === g && 'is-active')}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="family-add-field flex-1">
              <span>出生日期</span>
              <MobileDatePickerField
                value={birth}
                onChange={setBirth}
                placeholder="请选择"
              />
            </div>
          </div>

          {modeMeta.requiresPhone && (
            <label className="family-add-field">
              <span>手机号</span>
              <input
                inputMode="numeric"
                placeholder="11 位手机号"
                maxLength={11}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                  setError('')
                }}
              />
            </label>
          )}

          {modeMeta.requiresPhone && lookup && mode === 'link' && (
            <p className="family-add-inline-tip is-ok">
              <Check size={12} />
              将向 {lookup.displayName} 发送关联申请
            </p>
          )}
          {presetHint && !lookup && mode === 'invite' && (
            <p className="family-add-inline-tip is-warn">{presetHint}</p>
          )}
          {mode === 'managed' && (
            <p className="family-add-inline-tip">无账号成员由您代管档案，无需填写手机号</p>
          )}
          {mode === 'link' && (
            <p className="family-add-inline-tip">演示可关联：13800138003（张阿姨）</p>
          )}
          {mode === 'invite' && (
            <p className="family-add-inline-tip">演示可邀请未注册号：13800138888</p>
          )}
        </div>
      )}

      {error && <p className="family-add-flow-error">{error}</p>}

      <div className="family-add-flow-foot">
        {step === 1 ? (
          <button
            type="button"
            className="family-add-flow-primary"
            disabled={!canNext}
            onClick={() => { setStep(2); setError('') }}
          >
            下一步
          </button>
        ) : (
          <button
            type="button"
            className="family-add-flow-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {mode === 'link' ? '发送关联申请' : mode === 'invite' ? '发送邀请' : '创建档案'}
          </button>
        )}
        <p className="family-add-flow-legal">添加需对方知情同意，授权可随时撤销</p>
      </div>
    </div>
  )

  if (variant === 'inline') {
    return open ? body : null
  }

  if (!host) return null

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      {body}
    </div>,
    host,
  )
}
