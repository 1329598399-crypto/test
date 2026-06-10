import { CalendarDays, Check, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AllergyCompactList, AllergyPickerSheet } from './AllergyPickerPanel'
import { PastHistoryCompactList, PastHistoryPickerSheet } from './PastHistoryPickerPanel'
import { FamilyHistoryCompactList, FamilyHistoryPickerSheet } from './FamilyHistoryPickerPanel'
import { DocsSection } from './MedicalDocsSection'
import { pastHistoryKey, type PastHistoryItem } from '../../data/pastHistoryOptions'
import { familyHistoryKey, parseFamilyTitle, type FamilyHistoryItem } from '../../data/familyHistoryOptions'
import { BentoCard } from '../ui/BentoCard'
import {
  portraitData,
  type Role,
} from '../../data/mockData'
import {
  getMergedArchiveProfile,
  type ArchiveBasicOverride,
} from '../../lib/archiveHelpers'
import { useAppStore } from '../../store/useAppStore'

const recordTypeLabel: Record<string, string> = {
  bp: '血压',
  glucose: '血糖',
  diet: '饮食',
  sport: '运动',
  mood: '心情',
  weight: '体重',
  waist: '腰围',
  hr: '心率',
}

function useArchiveProfile(role: Role) {
  const archiveSyncAt = useAppStore((s) => s.archiveSyncAt)
  const archiveBasics = useAppStore((s) => s.archiveBasics)
  const archiveExtraAllergies = useAppStore((s) => s.archiveExtraAllergies)
  const archiveExtraPastHistory = useAppStore((s) => s.archiveExtraPastHistory)
  const archiveExtraFamilyHistory = useAppStore((s) => s.archiveExtraFamilyHistory)
  return useMemo(
    () =>
      getMergedArchiveProfile(role, {
        archiveSyncAt,
        archiveBasics,
        archiveExtraAllergies,
        archiveExtraPastHistory,
        archiveExtraFamilyHistory,
      }),
    [role, archiveSyncAt, archiveBasics, archiveExtraAllergies, archiveExtraPastHistory, archiveExtraFamilyHistory],
  )
}

export function PortraitSection({ role }: { role: Role }) {
  const portrait = portraitData[role]
  const profile = useArchiveProfile(role)

  return (
    <>
      <BentoCard className="p-5">
        <p className="text-xs text-muted">六维健康概况 · 辅助判断，不可替代医生诊断</p>
        <div className="mt-4 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-muted">
            {['基础信息', '生活健康', '健康史', '就医资料', '健康计划', '医疗健康'].map((l) => (
              <span key={l} className="rounded-lg bg-white/80 px-2 py-1">
                {l}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted">
          档案同步：{profile.syncAt} · 过敏史 {profile.allergies.length} 条 · 随访{' '}
          {profile.followups.length} 条
        </p>
      </BentoCard>
      <BentoCard className="p-4">
        <p className="font-semibold text-ink">医生关注事项</p>
        <p className="mt-2 text-sm text-muted">{portrait.focus}</p>
      </BentoCard>
      <div className="flex flex-wrap gap-2">
        {portrait.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
          >
            {t}
          </span>
        ))}
      </div>
    </>
  )
}

export function BasicSection({ role }: { role: Role }) {
  const profile = useArchiveProfile(role)
  const updateArchiveBasic = useAppStore((s) => s.updateArchiveBasic)
  const touchArchiveSync = useAppStore((s) => s.touchArchiveSync)
  const showToast = useAppStore((s) => s.showToast)
  const [form, setForm] = useState<ArchiveBasicOverride>({
    ethnicity: profile.basic.ethnicity,
    emergencyContact: profile.basic.emergencyContact,
    emergencyPhone: profile.basic.emergencyPhone,
    height: profile.medId.height,
    weight: profile.medId.weight,
  })

  const handleSave = () => {
    updateArchiveBasic(role, form)
    touchArchiveSync(role)
    showToast('基础信息已保存并同步')
  }

  const fields: { key: keyof ArchiveBasicOverride; label: string; placeholder: string }[] = [
    { key: 'ethnicity', label: '民族', placeholder: '如：汉族' },
    { key: 'emergencyContact', label: '紧急联系人', placeholder: '姓名与关系' },
    { key: 'emergencyPhone', label: '紧急联系电话', placeholder: '手机号码' },
    { key: 'height', label: '身高', placeholder: '如：165cm' },
    { key: 'weight', label: '体重', placeholder: '如：58kg' },
  ]

  return (
    <BentoCard className="space-y-4 p-4">
      <p className="text-sm text-muted">编辑基础体征与紧急联系人，保存后同步至就医身份证。</p>
      <div className="space-y-3">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs font-medium text-muted">{f.label}</span>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400"
              value={form[f.key] ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </label>
        ))}
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted">
          血型 {profile.basic.bloodType} · 出生 {profile.medId.birth}（来自建档信息，如需修改请联系顾问）
        </div>
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white"
      >
        保存并同步
      </button>
    </BentoCard>
  )
}

const historyTabs = [
  { id: 'allergy', label: '过敏史' },
  { id: 'past', label: '既往史' },
  { id: 'family', label: '家族史' },
] as const

export function HistorySection({ role }: { role: Role }) {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const tab = (params.get('tab') as (typeof historyTabs)[number]['id']) || 'allergy'
  const profile = useArchiveProfile(role)
  const addArchiveAllergy = useAppStore((s) => s.addArchiveAllergy)
  const addArchivePastHistory = useAppStore((s) => s.addArchivePastHistory)
  const addArchiveFamilyHistory = useAppStore((s) => s.addArchiveFamilyHistory)
  const touchArchiveSync = useAppStore((s) => s.touchArchiveSync)
  const showToast = useAppStore((s) => s.showToast)
  const [showAdd, setShowAdd] = useState(false)
  const [showPastAdd, setShowPastAdd] = useState(false)
  const [showFamilyAdd, setShowFamilyAdd] = useState(false)

  const handleAddAllergy = (item: {
    name: string
    severity: string
    reaction: string
  }) => {
    if (profile.allergies.some((a) => a.name === item.name)) {
      showToast('该过敏原已在档案中')
      return
    }
    addArchiveAllergy(role, item)
    touchArchiveSync(role)
    showToast('过敏史已添加')
  }

  const handleAddPastHistory = (item: PastHistoryItem) => {
    if (profile.pastHistory.some((p) => pastHistoryKey(p) === pastHistoryKey(item))) {
      showToast('该既往史记录已存在')
      return
    }
    addArchivePastHistory(role, item)
    touchArchiveSync(role)
    showToast('既往史已添加')
    setShowPastAdd(false)
  }

  const handleAddFamilyHistory = (item: FamilyHistoryItem) => {
    const key = familyHistoryKey(item)
    const exists = profile.familyHistory.some((f) => {
      if (f.title === item.title) return true
      const parsed = parseFamilyTitle(f.title)
      return familyHistoryKey(parsed) === key
    })
    if (exists) {
      showToast('该家族史记录已存在')
      return
    }
    addArchiveFamilyHistory(role, item)
    touchArchiveSync(role)
    showToast('家族史已添加')
    setShowFamilyAdd(false)
  }

  const addActions: Record<
    (typeof historyTabs)[number]['id'],
    { label: string; open: () => void }
  > = {
    allergy: { label: '添加过敏史', open: () => setShowAdd(true) },
    past: { label: '添加既往史', open: () => setShowPastAdd(true) },
    family: { label: '添加家族史', open: () => setShowFamilyAdd(true) },
  }
  const currentAdd = addActions[tab]

  return (
    <div className={clsx('history-section', currentAdd && 'has-sticky-add')}>
      <div className="history-section-body space-y-3">
        <div className="history-tab-bar">
          {historyTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setParams({ tab: t.id }, { replace: true, state: location.state })}
              className={clsx('history-tab-btn', tab === t.id && 'is-active')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'allergy' && (
          <>
            {profile.allergies.length === 0 ? (
              <BentoCard className="p-4 text-center">
                <p className="history-empty-text">暂未记录过敏史</p>
              </BentoCard>
            ) : (
              <BentoCard className="overflow-hidden p-0">
                <AllergyCompactList items={profile.allergies} />
              </BentoCard>
            )}
          </>
        )}

        {tab === 'past' && (
          <>
            {profile.pastHistory.length === 0 ? (
              <BentoCard className="p-4 text-center">
                <p className="history-empty-text">暂未记录既往史</p>
              </BentoCard>
            ) : (
              <BentoCard className="overflow-hidden p-0">
                <PastHistoryCompactList items={profile.pastHistory} />
              </BentoCard>
            )}
          </>
        )}

        {tab === 'family' && (
          <>
            {profile.familyHistory.length === 0 ? (
              <BentoCard className="p-4 text-center">
                <p className="history-empty-text">暂未记录家族史</p>
              </BentoCard>
            ) : (
              <BentoCard className="overflow-hidden p-0">
                <FamilyHistoryCompactList items={profile.familyHistory} />
              </BentoCard>
            )}
          </>
        )}

      </div>

      {currentAdd && (
        <div className="history-sticky-add">
          <button type="button" onClick={currentAdd.open} className="history-add-btn is-sticky">
            {currentAdd.label}
          </button>
        </div>
      )}

      <AllergyPickerSheet
        open={showAdd}
        existing={profile.allergies}
        onSave={handleAddAllergy}
        onClose={() => setShowAdd(false)}
      />
      <PastHistoryPickerSheet
        open={showPastAdd}
        existing={profile.pastHistory}
        onSave={handleAddPastHistory}
        onClose={() => setShowPastAdd(false)}
      />
      <FamilyHistoryPickerSheet
        open={showFamilyAdd}
        existing={profile.familyHistory}
        onSave={handleAddFamilyHistory}
        onClose={() => setShowFamilyAdd(false)}
      />
    </div>
  )
}

export { DocsSection }

export function IndicatorsSection({ role }: { role: Role }) {
  const navigate = useNavigate()
  const recordLogs = useAppStore((s) => s.recordLogs)
  const defaults =
    role === 'member'
      ? [
          { label: '血压', value: '130/82 mmHg', time: '今天' },
          { label: '血糖', value: '7.2 mmol/L', time: '3天前' },
        ]
      : [
          { label: '血压', value: '135/86 mmHg', time: '今天' },
          { label: '血糖', value: '5.4 mmol/L', time: '3天前' },
        ]

  const fromLogs = recordLogs.slice(0, 4).map((r) => ({
    label: recordTypeLabel[r.type] ?? r.type,
    value: r.summary,
    time: r.time,
  }))

  const items = fromLogs.length ? fromLogs : defaults

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <BentoCard key={`${item.label}-${item.time}`} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink">{item.label}</p>
              <p className="text-xs text-muted">{item.time}</p>
            </div>
            <span className="text-sm font-semibold text-brand-700">{item.value}</span>
          </div>
        </BentoCard>
      ))}
      <button
        type="button"
        onClick={() => navigate('/records')}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white"
      >
        去记录数据
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

const planItems = {
  normal: [
    { id: 'p1', title: '检查计划', desc: '6月15日 血脂复查' },
    { id: 'p2', title: '饮食计划', desc: '低盐饮食，每日饮水 1.5L' },
    { id: 'p3', title: '运动计划', desc: '每周快走 3 次，每次 30 分钟' },
  ],
  member: [
    { id: 'p1', title: '检查计划', desc: '血脂 + 心电图复查（6月10日）' },
    { id: 'p2', title: '饮食计划', desc: '低盐低脂方案，按周执行' },
    { id: 'p3', title: '运动计划', desc: '每周快走 4 次，配合拉伸' },
  ],
}

export function PlansSection({ role }: { role: Role }) {
  const planDone = useAppStore((s) => s.planDone)
  const setPlanDone = useAppStore((s) => s.setPlanDone)
  const showToast = useAppStore((s) => s.showToast)
  const items = planItems[role]

  const toggle = (id: string) => {
    const next = !planDone[id]
    setPlanDone(id, next)
    showToast(next ? '已标记完成' : '已取消完成')
  }

  return (
    <div className="space-y-3">
      {items.map((plan) => {
        const done = !!planDone[plan.id]
        return (
          <BentoCard key={plan.id} className="p-4">
            <button
              type="button"
              onClick={() => toggle(plan.id)}
              className="flex w-full items-start gap-3 text-left"
            >
              <span
                className={clsx(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2',
                  done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300',
                )}
              >
                {done && <Check size={12} strokeWidth={3} />}
              </span>
              <div>
                <p className={clsx('font-semibold', done ? 'text-muted line-through' : 'text-ink')}>
                  {plan.title}
                </p>
                <p className="mt-1 text-sm text-muted">{plan.desc}</p>
              </div>
            </button>
          </BentoCard>
        )
      })}
      {role === 'normal' && (
        <p className="text-center text-xs text-muted">开通会员后可获得医生定制的干预计划</p>
      )}
    </div>
  )
}

export function MedicalSection({ role }: { role: Role }) {
  const navigate = useNavigate()
  const profile = useArchiveProfile(role)

  return (
    <div className="space-y-3">
      <BentoCard className="p-4">
        <p className="font-semibold text-ink">过敏史</p>
        <div className="mt-2 space-y-2">
          {profile.allergies.length === 0 ? (
            <p className="text-sm text-muted">暂未记录，建议补充以便就诊时告知医生</p>
          ) : (
            profile.allergies.map((a) => (
              <p key={a.name} className="text-sm text-muted">
                · {a.name}（{a.severity}）— {a.reaction}
              </p>
            ))
          )}
        </div>
      </BentoCard>
      <BentoCard className="p-4">
        <p className="font-semibold text-ink">用药记录</p>
        <div className="mt-2 space-y-2">
          {profile.chips
            .filter((c) => c.label.includes('用药') || c.label.includes('药'))
            .filter((c) => !c.label.includes('过敏'))
            .map((c) => (
              <p key={c.label} className="text-sm text-muted">
                · {c.label.replace(/^💊\s*/, '')}
              </p>
            ))}
          {profile.pastHistory
            .filter((p) => p.tag === '长期用药')
            .map((p) => (
              <p key={`${p.year}-${p.title}`} className="text-sm text-muted">
                · {p.title}：{p.detail}
              </p>
            ))}
          {profile.chips.every((c) => !c.label.includes('用药') && !c.label.includes('药')) &&
            profile.pastHistory.every((p) => p.tag !== '长期用药') && (
              <p className="text-sm text-muted">暂无长期用药记录</p>
            )}
        </div>
      </BentoCard>
      <BentoCard className="p-4">
        <p className="font-semibold text-ink">既往病史</p>
        <div className="mt-2 space-y-2">
          {profile.pastHistory.map((p) => (
            <p key={`${p.year}-${p.title}`} className="text-sm text-muted">
              · {p.title}：{p.detail}
            </p>
          ))}
        </div>
      </BentoCard>
      <button
        type="button"
        onClick={() => navigate('/profile/history?tab=past')}
        className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white"
      >
        编辑健康史
      </button>
    </div>
  )
}

export function LifeSection({ role: _role }: { role: Role }) {
  const navigate = useNavigate()
  const recordLogs = useAppStore((s) => s.recordLogs)
  const lifeLogs = recordLogs.filter((r) =>
    ['diet', 'mood', 'sport', 'weight', 'waist'].includes(r.type),
  )

  return (
    <div className="space-y-3">
      <BentoCard className="p-4">
        <p className="font-semibold text-ink">生活健康记录</p>
        <p className="mt-1 text-sm text-muted">
          饮食、运动、心情等日常记录归在生活健康模块，与医生端随访联动。
        </p>
      </BentoCard>
      {(lifeLogs.length ? lifeLogs : recordLogs).slice(0, 4).map((r) => (
        <BentoCard key={r.id} className="p-4">
          <p className="text-xs text-muted">{r.time}</p>
          <p className="mt-1 text-sm font-medium text-ink">
            {recordTypeLabel[r.type] ?? r.type}
          </p>
          <p className="text-sm text-muted">{r.summary}</p>
        </BentoCard>
      ))}
      <button
        type="button"
        onClick={() => navigate('/records')}
        className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white"
      >
        去记录生活数据
      </button>
    </div>
  )
}

export function AnalysisSection({ role }: { role: Role }) {
  const profile = useArchiveProfile(role)
  const recordLogs = useAppStore((s) => s.recordLogs)

  const timeline = [
    ...profile.followups.slice(0, 2).map((f) => ({
      title: f.title,
      desc: f.detail,
      time: `${f.month}${f.day}日`,
    })),
    ...recordLogs.slice(0, 2).map((r) => ({
      title: `新增${recordTypeLabel[r.type] ?? r.type}记录`,
      desc: r.summary,
      time: r.time,
    })),
  ]

  return (
    <div className="space-y-3">
      <BentoCard className="p-4">
        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <CalendarDays size={18} />
        </div>
        <p className="font-semibold text-ink">近 7 天档案变化</p>
        <p className="mt-1 text-sm text-muted">
          饮食、睡眠、血压记录持续更新，医生端可查看趋势。最近同步 {profile.syncAt}。
        </p>
      </BentoCard>

      <BentoCard className="p-4">
        <p className="mb-3 font-semibold text-ink">动态时间线</p>
        <div className="space-y-3">
          {timeline.map((item, i) => (
            <div key={`${item.title}-${i}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                {i < timeline.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
              </div>
              <div className="pb-3">
                <p className="text-xs text-muted">{item.time}</p>
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      <BentoCard className="p-4">
        <p className="font-semibold text-ink">建议动作</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          <li>· 本周补齐 2 次血压记录</li>
          <li>· 复查前上传体检报告</li>
          <li>· 与医生确认后续计划</li>
        </ul>
      </BentoCard>
    </div>
  )
}
