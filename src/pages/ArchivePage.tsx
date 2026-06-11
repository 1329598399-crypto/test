import {
  Check,
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Info,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
  Share2,
  Sparkles,
  Stethoscope,
  TestTube,
  UserRound,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArchiveAuthManagement } from '../components/archive/ArchiveAuthManagement'
import { ArchiveFamilyDynamics } from '../components/archive/ArchiveFamilyDynamics'
import { AddFamilyMemberFlow } from '../components/family/AddFamilyMemberFlow'
import {
  AnalysisSection,
  BasicSection,
  DocsSection,
  HistorySection,
  IndicatorsSection,
  LifeSection,
  MedicalSection,
  PlansSection,
  PortraitSection,
} from '../components/archive/ArchiveDetailSections'
import {
  formatGrantDesc,
  getGrantStatusLabel,
  isGrantActive,
} from '../data/archiveAuthData'
import { MobileShell } from '../components/layout/MobileShell'
import { BentoCard } from '../components/ui/BentoCard'
import {
  archiveHub,
  archiveModules,
  archivePersons,
  type ArchiveChipTone,
} from '../data/mockData'
import {
  getMergedArchiveProfile,
  previewHubItems,
  type DeptId,
  type ReportHistoryEntry,
} from '../lib/archiveHelpers'
import {
  archiveModuleHubSection,
  clearHubReturnState,
  persistHubReturnSection,
  persistHubScrollPosition,
  resolveHubReturnTarget,
  restoreHubView,
  type HubNavState,
  type HubReturnState,
  type HubScrollTarget,
} from '../lib/hubScroll'
import { useAppStore, useFamilyMembers, useRoleData } from '../store/useAppStore'
import { toArchivePersonPill } from '../lib/familyMemberService'

const chipToneClass: Record<ArchiveChipTone, string> = {
  red: 'archive-chip-red',
  amber: 'archive-chip-amber',
  blue: 'archive-chip-blue',
  green: 'archive-chip-green',
  gray: 'archive-chip-gray',
}

const personAvatarTones = [
  'from-brand-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
]

const visitDepartments: {
  id: DeptId
  name: string
  icon: string
  desc: string
  tone: string
  featured?: boolean
}[] = [
  {
    id: 'full',
    name: '综合摘要',
    icon: '📋',
    desc: '就诊前提供完整档案，适合首次外院就诊或资料较多场景',
    tone: 'from-indigo-500 to-blue-600',
    featured: true,
  },
  {
    id: 'cardiology',
    name: '心内科',
    icon: '❤️',
    desc: '血压、心率与心血管',
    tone: 'from-rose-400 to-red-500',
  },
  {
    id: 'endocrinology',
    name: '内分泌',
    icon: '🍬',
    desc: '血糖、血脂与代谢',
    tone: 'from-amber-400 to-orange-500',
  },
  {
    id: 'neurology',
    name: '神经内科',
    icon: '🧠',
    desc: '头晕、睡眠与神经',
    tone: 'from-violet-400 to-purple-500',
  },
  {
    id: 'orthopedics',
    name: '骨科',
    icon: '🦴',
    desc: '腰颈椎与关节',
    tone: 'from-slate-500 to-slate-700',
  },
  {
    id: 'gastroenterology',
    name: '消化内科',
    icon: '🫁',
    desc: '胃肠、肝胆与消化',
    tone: 'from-teal-400 to-cyan-600',
  },
]

const specialtyDepartments = visitDepartments.filter((d) => !d.featured)
const featuredDepartment = visitDepartments.find((d) => d.featured)

const deptTemplateChecklist: Record<DeptId, string[]> = {
  full: ['基础信息核验', '药物清单核对', '检查结果总览', '跨科协同提醒'],
  cardiology: ['血压记录（近2周）', '心率波动说明', '心血管用药依从性', '复查时间确认'],
  endocrinology: ['血糖/血脂报告', '饮食执行情况', '运动频次记录', '代谢随访计划'],
  neurology: ['睡眠日志', '头晕/头痛发生频次', '精神压力说明', '合并慢病信息'],
  orthopedics: ['疼痛部位与持续时长', '活动受限场景', '运动康复执行情况', '止痛药使用记录'],
  gastroenterology: ['饮食触发因素', '反酸/腹胀频次', '胃肠检查资料', '长期用药耐受情况'],
}

const visitReportData = {
  patient: {
    name: '王建国',
    gender: '男',
    age: 58,
    bloodType: 'B型',
    phone: '138****2865',
    bmi: '26.4',
    memberType: '标准会员',
    emergencyContact: '李静（配偶）',
  },
  allergies: [
    { name: '青霉素', severity: '严重', reaction: '皮疹、呼吸不适，已明确禁用' },
    { name: '虾蟹类', severity: '中度', reaction: '皮肤瘙痒，建议避免过量摄入' },
  ],
  pastHistory: [
    { dept: 'cardiology', condition: '高血压', detail: '病程 5 年，近半年持续监测。' },
    { dept: 'endocrinology', condition: '血脂管理', detail: '近两次体检提示 LDL 管理需求。' },
    { dept: 'neurology', condition: '睡眠障碍', detail: '偶发浅睡，已记录睡眠日志。' },
    { dept: 'orthopedics', condition: '腰椎劳损', detail: '久坐后腰酸，已开展拉伸训练。' },
    { dept: 'gastroenterology', condition: '慢性胃炎史', detail: '饮食不规律时偶有反酸。' },
  ],
  medications: [
    { drug: '缬沙坦片', dose: '80mg', freq: '每日1次', note: '早晨服用' },
    { drug: '阿托伐他汀', dose: '10mg', freq: '每日1次', note: '晚间服用' },
  ],
  exams: [
    { dept: 'cardiology', date: '2026-05-15', name: '血压', result: '130/82 mmHg', ref: '90-139/60-89', advice: '继续监测', flag: 'normal' },
    { dept: 'endocrinology', date: '2026-05-15', name: 'LDL-C', result: '3.8 mmol/L', ref: '<3.4', advice: '建议复查', flag: 'high' },
    { dept: 'endocrinology', date: '2026-06-01', name: '空腹血糖', result: '7.2 mmol/L', ref: '3.9-6.1', advice: '建议随访', flag: 'high' },
    { dept: 'neurology', date: '2026-05-30', name: '睡眠时长', result: '6.5 小时', ref: '7-8小时', advice: '调整作息', flag: 'attention' },
    { dept: 'gastroenterology', date: '2026-05-12', name: '肝功能 ALT', result: '42 U/L', ref: '9-50', advice: '定期监测', flag: 'normal' },
  ],
  familyHistory: [
    { dept: 'cardiology', relation: '父亲', condition: '高血压史' },
    { dept: 'neurology', relation: '母亲', condition: '脑血管病史' },
    { dept: 'endocrinology', relation: '兄长', condition: '糖代谢异常史' },
  ],
  followups: [
    { dept: 'cardiology', date: '2026-05-26', doctor: '张医生', note: '继续每日血压记录，复查前保持规律作息。' },
    { dept: 'endocrinology', date: '2026-05-26', doctor: '张医生', note: '建议 2 周内复查血脂四项并同步报告。' },
  ],
  focus: {
    cardiology: ['携带近 2 周血压记录', '说明目前用药依从性', '询问复查频率建议'],
    endocrinology: ['携带最近体检报告', '确认血脂/血糖复查时间', '询问饮食干预重点'],
    neurology: ['准备睡眠记录与头晕发生频次', '说明最近精神压力情况'],
    orthopedics: ['描述疼痛发生场景与时长', '说明活动受限程度'],
    gastroenterology: ['说明反酸与饮食关系', '携带近一次胃肠检查记录'],
  } as Record<Exclude<DeptId, 'full'>, string[]>,
  crossAlerts: {
    cardiology: ['存在代谢指标管理需求，就诊时建议同步血脂报告。'],
    endocrinology: ['合并高血压管理，建议同步携带近 2 周血压记录。'],
    neurology: ['睡眠波动可能与代谢和血压管理相关，建议联合评估。'],
    orthopedics: ['久坐及体重管理可能影响骨关节症状，建议同时说明生活方式。'],
    gastroenterology: ['饮食结构调整需结合血脂和代谢管理建议。'],
  } as Record<Exclude<DeptId, 'full'>, string[]>,
}

function isRelated(target: DeptId, dept: string) {
  return target === 'full' || target === dept
}

export function ArchivePage() {
  const { section } = useParams()
  if (section) return <ArchiveDetail section={section} />
  return <ArchiveHub />
}

function ArchiveHub() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useAppStore((s) => s.role)
  const selectedId = useAppStore((s) => s.selectedArchiveId)
  const setArchivePerson = useAppStore((s) => s.setArchivePerson)
  const privacy = useAppStore((s) => s.privacyProtected)
  const togglePrivacy = useAppStore((s) => s.togglePrivacy)
  const toggleRole = useAppStore((s) => s.toggleRole)
  const archiveSyncAt = useAppStore((s) => s.archiveSyncAt)
  const archiveBasics = useAppStore((s) => s.archiveBasics)
  const archiveExtraAllergies = useAppStore((s) => s.archiveExtraAllergies)
  const archiveExtraPastHistory = useAppStore((s) => s.archiveExtraPastHistory)
  const archiveExtraFamilyHistory = useAppStore((s) => s.archiveExtraFamilyHistory)
  const archiveAuthGrants = useAppStore((s) => s.archiveAuthGrants)
  const tempAuthSession = useAppStore((s) => s.tempAuthSession)
  const generateTempAuthSession = useAppStore((s) => s.generateTempAuthSession)
  const showToast = useAppStore((s) => s.showToast)
  const familyMembers = useFamilyMembers()
  const roleData = useRoleData()
  const [qrOpen, setQrOpen] = useState(false)
  const [addFamilyOpen, setAddFamilyOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    basic: true,
    allergy: true,
    past: true,
    family: true,
    exams: true,
    followup: true,
    auth: true,
  })

  const scrollTarget = (location.state as HubReturnState | null)?.scrollTarget

  const navigateFromHub = (path: string, hubSection: HubScrollTarget) => {
    persistHubScrollPosition()
    persistHubReturnSection(hubSection)
    navigate(path, { state: { hubSection } satisfies HubNavState })
  }

  useLayoutEffect(() => {
    if (!scrollTarget) return

    setExpanded((prev) => ({ ...prev, [scrollTarget]: true }))
  }, [scrollTarget])

  useEffect(() => {
    if (!scrollTarget) return

    const timers: number[] = []
    ;[0, 80, 200, 400].forEach((delay, index) => {
      timers.push(
        window.setTimeout(() => {
          restoreHubView(scrollTarget, index === 0 ? 'auto' : 'smooth')
        }, delay),
      )
    })

    timers.push(
      window.setTimeout(() => {
        clearHubReturnState()
        navigate(location.pathname, { replace: true, state: {} })
      }, 480),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [scrollTarget, location.pathname, navigate])

  const persons = useMemo(() => {
    const self = archivePersons[role][0]
    return [self, ...familyMembers.map(toArchivePersonPill)]
  }, [role, familyMembers])
  const person = persons.find((p) => p.archiveId === selectedId) ?? persons[0]
  const hub = archiveHub[role]
  const profile = getMergedArchiveProfile(role, {
    archiveSyncAt,
    archiveBasics,
    archiveExtraAllergies,
    archiveExtraPastHistory,
    archiveExtraFamilyHistory,
  })
  const pct = hub.completeness
  const isMember = role === 'member'
  const displayChips =
    profile.chips.length > 0 ? profile.chips : profile.guestChips

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const goAuthManagement = () => navigateFromHub('/profile/auth', 'auth')

  const scrollToAuth = () => {
    goAuthManagement()
  }

  const handleQuickGeneratePin = () => {
    const session = generateTempAuthSession(24)
    setQrOpen(true)
    showToast(`授权码 ${session.code} 已生成，24 小时内有效`)
  }

  const historyPath = (tab: string) => `/profile/history?tab=${tab}`

  const allergyPreview = previewHubItems(profile.allergies)
  const pastPreview = previewHubItems(profile.pastHistory)
  const familyPreview = previewHubItems(profile.familyHistory)
  const examsPreview = previewHubItems(profile.annualExams)
  const followupPreview = previewHubItems(profile.followups)
  const authPreview = useMemo(() => {
    const now = Date.now()
    const active = archiveAuthGrants.filter((g) => isGrantActive(g, now))
    return { visible: active.slice(0, 3), total: active.length, hasMore: active.length > 3 }
  }, [archiveAuthGrants])

  const renderViewAll = (
    total: number,
    hasMore: boolean,
    path: string,
    hubSection: HubScrollTarget,
    unit = '条',
  ) =>
    hasMore ? (
      <button
        type="button"
        className="archive-rec-view-all"
        onClick={() => navigateFromHub(path, hubSection)}
      >
        查看全部 {total} {unit} ›
      </button>
    ) : null

  const renderLockedOverlay = (label: string) => (
    <div className="archive-locked-overlay">
      <p className="text-xs text-muted">{label}</p>
      <button type="button" onClick={() => navigate('/membership')} className="archive-locked-btn">
        开通会员查看
      </button>
    </div>
  )

  return (
    <MobileShell title="健康档案" showTab immersive>
      <div className="archive-hub pb-5">
        <div className="archive-hero">
          <div className="archive-hero-inner immersive-inset-top">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-white">我的健康档案</h2>
                <p className="mt-0.5 text-xs text-white/85">
                  {privacy ? '***' : person.name} · {person.relationship}档案
                </p>
              </div>
              <div className="archive-hero-actions">
                <button
                  type="button"
                  onClick={toggleRole}
                  className="archive-hero-icon-btn"
                  title="切换演示身份"
                >
                  <RefreshCw size={12} />
                  {isMember ? '会员' : '普通'}
                </button>
                <button
                  type="button"
                  onClick={togglePrivacy}
                  className="archive-hero-icon-btn"
                  aria-label="隐私保护"
                >
                  {privacy ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="archive-person-scroll no-scrollbar">
              {persons.map((p, i) => (
                <button
                  key={p.archiveId}
                  type="button"
                  onClick={() => setArchivePerson(p.archiveId)}
                  className={clsx(
                    'archive-person-pill',
                    p.archiveId === person.archiveId && 'is-active',
                  )}
                >
                  <div
                    className={clsx(
                      'archive-person-avatar bg-gradient-to-br',
                      personAvatarTones[i % personAvatarTones.length],
                    )}
                  >
                    {p.avatar}
                  </div>
                  <span className="archive-person-name">{p.relationship}</span>
                </button>
              ))}
              <button
                type="button"
                className="archive-person-add"
                aria-label="添加家人"
                onClick={() => setAddFamilyOpen(true)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="archive-hub-body">
          {!isMember && (
            <div className="archive-guest-tip">
              <div className="flex gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="text-sm font-semibold text-ink">建立您的基础健康档案</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    过敏史、用药记录等基础档案人人可维护；开通会员可享家庭医生线上咨询、健康评估、检查计划与随访服务。
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/membership')} className="archive-guest-tip-btn">
                了解会员服务权益
              </button>
            </div>
          )}

          <div className="archive-med-id">
            <div className="archive-med-id-top">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] text-white/75">健康档案 · 就医身份证</p>
                  <p className="mt-1 text-xl font-bold">{privacy ? '***' : person.name}</p>
                </div>
                <span className="archive-med-id-badge">
                  {isMember ? '标准会员' : '基础用户'}
                </span>
              </div>
              <div className="archive-med-id-meta">
                <span>{person.gender}</span>
                <span>{privacy ? '**岁' : `${person.age}岁`}</span>
                <span>{privacy ? '**型' : profile.medId.bloodType}</span>
                <span>
                  {privacy ? '**/**' : `${profile.medId.height} / ${profile.medId.weight}`}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
                <span>档案号 {privacy ? '******' : person.archiveId}</span>
                <span>完善度 {privacy ? '**' : `${pct}%`} · 资料 {hub.folderTotal} 份</span>
              </div>
              <div className="archive-med-id-sync">
                <span className="archive-sync-dot" />
                本档案已同步 · {profile.syncAt}
              </div>
            </div>

            <div className="archive-med-id-chips">
              {displayChips.map((chip) => (
                <span key={chip.label} className={clsx('archive-chip', chipToneClass[chip.tone])}>
                  {chip.label}
                </span>
              ))}
            </div>

            <div className="archive-med-id-actions">
              {isMember ? (
                <>
                  <button type="button" onClick={() => setQrOpen((v) => !v)} className="archive-btn-primary">
                    📱 展示给医生
                  </button>
                  <button type="button" onClick={scrollToAuth} className="archive-btn-secondary">
                    🔐 管理授权
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigateFromHub('/profile/basic', 'basic')}
                    className="archive-btn-green"
                  >
                    📝 完善基础信息
                  </button>
                  <button type="button" onClick={() => navigate('/membership')} className="archive-btn-secondary">
                    解锁完整档案
                  </button>
                </>
              )}
            </div>

            {qrOpen && isMember && (
              <div className="archive-qr-area">
                <p className="archive-qr-title">扫描二维码查看完整档案（24h 有效）</p>
                <div className="archive-qr-box">📷</div>
                <p className="archive-qr-sub">
                  授权码：
                  {tempAuthSession && tempAuthSession.expiresAt > Date.now()
                    ? tempAuthSession.code
                    : profile.authCode}{' '}
                  · 24 小时后失效
                </p>
              </div>
            )}
          </div>

          <div id="archive-section-tools" className="mb-3 grid grid-cols-3 gap-2">
            {[
              { label: '健康记录', path: '/records', emoji: '📝', hubSection: null as HubScrollTarget | null },
              { label: '小懂代录', path: '/ai', emoji: '🤖', hubSection: null },
              { label: '健康画像', path: '/profile/portrait', emoji: '📊', hubSection: 'tools' as HubScrollTarget },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() =>
                  a.hubSection ? navigateFromHub(a.path, a.hubSection) : navigate(a.path)
                }
                className="archive-tool-btn"
              >
                <span className="text-lg">{a.emoji}</span>
                <span className="text-[10px] font-medium text-ink">{a.label}</span>
              </button>
            ))}
          </div>

          <ArchiveFamilyDynamics items={roleData.familyDynamics} />

          {isMember && (
            <button
              type="button"
              id="archive-section-visit"
              onClick={() => navigateFromHub('/profile/visit', 'visit')}
              className="archive-visit-entry mb-3 w-full"
            >
              <span className="text-2xl">📄</span>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-bold text-brand-700">外院就诊档案</p>
                <p className="text-[11px] text-muted">一键生成科室专属病历摘要</p>
              </div>
              <ChevronRight size={18} className="text-brand-400" />
            </button>
          )}

          <div id="archive-section-basic" className="archive-rec-sec">
            <button type="button" className="archive-rec-sec-h" onClick={() => toggleSection('basic')}>
              <h3>👤 基础信息</h3>
              <div className="archive-rec-sec-right">
                <span
                  className="archive-rec-add"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateFromHub('/profile/basic', 'basic')
                  }}
                >
                  编辑
                </span>
                <ChevronRight size={16} className={clsx('text-muted transition', expanded.basic && 'rotate-90')} />
              </div>
            </button>
            {expanded.basic && (
              <div className="archive-rec-body">
                <div className="archive-basic-grid">
                  {[
                    { label: '血型', value: profile.basic.bloodType },
                    { label: '民族', value: profile.basic.ethnicity },
                    { label: '紧急联系人', value: profile.basic.emergencyContact },
                    { label: '紧急联系电话', value: privacy ? '********' : profile.basic.emergencyPhone },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="archive-field-label">{item.label}</p>
                      <p className="archive-field-value">{privacy ? '***' : item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {[
            {
              key: 'allergy',
              title: '🚫 过敏史',
              count: `${profile.allergies.length}条`,
              add: '+ 添加',
              path: historyPath('allergy'),
              locked: false,
              content: (
                <>
                  {allergyPreview.visible.map((a) => (
                    <div key={a.name} className="archive-rec-item">
                      <span className={clsx('archive-rec-dot', a.severity === '严重' ? 'is-red' : 'is-amber')} />
                      <div className="min-w-0 flex-1">
                        <p className="archive-rec-item-title">{a.name}</p>
                        <p className="archive-rec-item-desc">{a.reaction}</p>
                        <span className={clsx('archive-rec-tag', a.severity === '严重' ? 'is-warn' : 'is-mid')}>
                          {a.severity}过敏
                        </span>
                      </div>
                    </div>
                  ))}
                  {renderViewAll(
                    allergyPreview.total,
                    allergyPreview.hasMore,
                    historyPath('allergy'),
                    'allergy',
                  )}
                </>
              ),
            },
            {
              key: 'past',
              title: '📖 既往史',
              count: `${profile.pastHistory.length}条`,
              add: '+ 添加',
              path: historyPath('past'),
              locked: false,
              content: (
                <>
                  {pastPreview.visible.map((p) => (
                    <div key={`${p.year}-${p.title}`} className="archive-rec-item">
                      <div className="archive-rec-date">
                        <p className="archive-rec-date-day">{p.year}</p>
                        <p>{p.month}</p>
                      </div>
                      <span className="archive-rec-dot is-blue" />
                      <div className="min-w-0 flex-1">
                        <p className="archive-rec-item-title">{p.title}</p>
                        <p className="archive-rec-item-desc">{p.detail}</p>
                        {p.tag && <span className="archive-rec-tag is-blue">{p.tag}</span>}
                      </div>
                    </div>
                  ))}
                  {renderViewAll(
                    pastPreview.total,
                    pastPreview.hasMore,
                    historyPath('past'),
                    'past',
                  )}
                </>
              ),
            },
            {
              key: 'family',
              title: '👨‍👩‍👦 家族史',
              count: `${profile.familyHistory.length}条`,
              add: '+ 添加',
              path: historyPath('family'),
              locked: false,
              content: (
                <>
                  {familyPreview.visible.map((f) => (
                    <div key={f.title} className="archive-rec-item">
                      <span className="archive-rec-dot is-amber" />
                      <div className="min-w-0 flex-1">
                        <p className="archive-rec-item-title">{f.title}</p>
                        <p className="archive-rec-item-desc">{f.detail}</p>
                      </div>
                    </div>
                  ))}
                  {renderViewAll(
                    familyPreview.total,
                    familyPreview.hasMore,
                    historyPath('family'),
                    'family',
                  )}
                </>
              ),
            },
            {
              key: 'exams',
              title: '🔬 检查记录',
              count: `${profile.annualExams.length}份`,
              add: '+ 上传',
              path: '/profile/docs',
              locked: !isMember,
              content: (
                <>
                  {examsPreview.visible.map((e) => (
                    <div key={`${e.year}-${e.title}`} className="archive-rec-item">
                      <div className="archive-rec-date">
                        <p className="archive-rec-date-day">{e.year}</p>
                        <p>{e.month}</p>
                      </div>
                      <span className="archive-rec-dot is-green" />
                      <div className="min-w-0 flex-1">
                        <p className="archive-rec-item-title">{e.title}</p>
                        <p className="archive-rec-item-desc">{e.detail}</p>
                        {e.tags && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.tags.map((tag) => (
                              <span key={tag} className="archive-rec-tag is-blue">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {renderViewAll(
                    examsPreview.total,
                    examsPreview.hasMore,
                    '/profile/docs',
                    'exams',
                    '份',
                  )}
                </>
              ),
            },
            {
              key: 'followup',
              title: '📅 随访记录',
              count: `${profile.followups.length}条`,
              add: '查看全部 ›',
              path: '/reports',
              locked: !isMember,
              content: (
                <>
                  {followupPreview.visible.map((f) => (
                    <div key={`${f.day}-${f.title}`} className="archive-rec-item">
                      <div className="archive-rec-date">
                        <p className="archive-rec-date-day">{f.day}</p>
                        <p>{f.month}</p>
                      </div>
                      <span className="archive-rec-dot is-blue" />
                      <div className="min-w-0 flex-1">
                        <p className="archive-rec-item-title">{f.title}</p>
                        <p className="archive-rec-item-desc">{f.detail}</p>
                        {f.tag && <span className="archive-rec-tag is-blue">{f.tag}</span>}
                      </div>
                    </div>
                  ))}
                  {renderViewAll(
                    followupPreview.total,
                    followupPreview.hasMore,
                    '/reports',
                    'followup',
                  )}
                </>
              ),
            },
          ].map((section) => (
            <div
              key={section.key}
              id={`archive-section-${section.key}`}
              className={clsx('archive-rec-sec', section.locked && 'is-locked')}
            >
              <button type="button" className="archive-rec-sec-h" onClick={() => toggleSection(section.key)}>
                <h3>{section.title}</h3>
                <div className="archive-rec-sec-right">
                  <span className="archive-rec-count">{section.count}</span>
                  {!section.locked && (
                    <span
                      className="archive-rec-add"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateFromHub(section.path, section.key as HubScrollTarget)
                      }}
                    >
                      {section.add}
                    </span>
                  )}
                  <ChevronRight
                    size={16}
                    className={clsx('text-muted transition', expanded[section.key] && 'rotate-90')}
                  />
                </div>
              </button>
              {expanded[section.key] && (
                <div className="archive-rec-body relative">
                  {section.content}
                  {section.locked &&
                    renderLockedOverlay(
                      section.key === 'exams'
                        ? '检查记录与报告管理为会员专属服务（含检查额度与解读）'
                        : '家庭医生随访记录为会员专属服务',
                    )}
                </div>
              )}
            </div>
          ))}

          {isMember && (
            <div id="archive-section-auth" className="archive-auth-panel">
              <div className="archive-auth-h">
                <h3>🔐 档案授权管理</h3>
                <button type="button" className="archive-auth-add" onClick={goAuthManagement}>
                  管理全部 ›
                </button>
              </div>
              {authPreview.visible.map((grant) => {
                const statusLabel = getGrantStatusLabel(grant)
                const active = isGrantActive(grant)
                return (
                  <button
                    key={grant.id}
                    type="button"
                    className="archive-auth-row"
                    onClick={goAuthManagement}
                  >
                    <div className={clsx('archive-auth-av bg-gradient-to-br', grant.tone)}>
                      {grant.avatar}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[13px] font-semibold text-ink">
                        {grant.name}
                        <span className="font-normal text-muted">（{grant.roleLabel}）</span>
                      </p>
                      <p className="text-[11px] text-muted">{formatGrantDesc(grant)}</p>
                    </div>
                    <span
                      className={clsx(
                        'archive-auth-badge',
                        active && grant.duration === 'temp' && 'is-temp',
                        active && grant.duration === 'long' && 'is-active',
                        !active && 'is-expire',
                      )}
                    >
                      {statusLabel}
                    </span>
                  </button>
                )
              })}
              {authPreview.hasMore && (
                <button type="button" className="archive-rec-view-all" onClick={goAuthManagement}>
                  查看全部 {authPreview.total} 项授权 ›
                </button>
              )}
              <div className="archive-auth-gen">
                <p className="mb-2 text-[13px] font-semibold text-ink">生成临时授权码</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      generateTempAuthSession(24)
                      setQrOpen(true)
                      showToast('二维码已生成，24 小时内有效')
                    }}
                    className="archive-auth-gen-card is-qr"
                  >
                    <span className="text-2xl">📱</span>
                    <p className="mt-1 text-xs font-semibold text-brand-700">生成二维码</p>
                    <p className="text-[10px] text-muted">医生扫码查看</p>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickGeneratePin}
                    className="archive-auth-gen-card is-pin"
                  >
                    <span className="text-2xl">🔢</span>
                    <p className="mt-1 text-xs font-semibold text-violet-700">生成授权码</p>
                    <p className="text-[10px] text-muted">
                      {tempAuthSession && tempAuthSession.expiresAt > Date.now()
                        ? tempAuthSession.code
                        : '6 位数字'}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="archive-section-modules" className="archive-more-modules">
            <p className="mb-2 text-xs font-semibold text-muted">更多档案模块</p>
            <div className="flex flex-wrap gap-2">
              {archiveModules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const hubSection = archiveModuleHubSection[m.id]
                    if (hubSection) navigateFromHub(m.path, hubSection)
                    else navigate(m.path)
                  }}
                  className="archive-module-chip"
                >
                  {m.icon} {m.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddFamilyMemberFlow open={addFamilyOpen} onClose={() => setAddFamilyOpen(false)} />
    </MobileShell>
  )
}

function ArchiveDetail({ section }: { section: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const hubSection = (location.state as HubNavState | null)?.hubSection
  const role = useAppStore((s) => s.role)
  const reportHistory = useAppStore((s) => s.reportHistory)
  const addReportHistory = useAppStore((s) => s.addReportHistory)
  const showToast = useAppStore((s) => s.showToast)
  const [selectedDept, setSelectedDept] = useState<DeptId | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportMeta, setReportMeta] = useState<{ code: string; generatedAt: string } | null>(null)
  const isMember = role === 'member'
  const deptMeta = visitDepartments.find((d) => d.id === selectedDept)

  const reportPayload = useMemo(() => {
    if (!selectedDept) return null
    const relatedPast = visitReportData.pastHistory.filter((x) => isRelated(selectedDept, x.dept))
    const relatedExams = visitReportData.exams.filter((x) => isRelated(selectedDept, x.dept))
    const relatedFamily = visitReportData.familyHistory.filter((x) => isRelated(selectedDept, x.dept))
    const relatedFollowups = visitReportData.followups.filter((x) => isRelated(selectedDept, x.dept))
    const focus = selectedDept === 'full' ? [] : visitReportData.focus[selectedDept] || []
    const crossAlerts = selectedDept === 'full' ? [] : visitReportData.crossAlerts[selectedDept] || []
    return {
      relatedPast,
      relatedExams,
      relatedFamily,
      relatedFollowups,
      focus,
      crossAlerts,
    }
  }, [selectedDept])

  const handleGenerateReport = () => {
    if (!selectedDept) return
    const code = `HX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${visitReportData.patient.name.charAt(0)}**`
    const generatedAt = new Date().toLocaleString('zh-CN')
    setReportMeta({ code, generatedAt })
    setReportOpen(true)
    addReportHistory({
      id: `${Date.now()}`,
      dept: selectedDept,
      deptName: visitDepartments.find((d) => d.id === selectedDept)?.name || '综合摘要',
      generatedAt,
      code,
    })
    showToast('就诊档案已生成，可打印或导出')
  }

  const buildReportHtml = () => {
    if (!selectedDept || !reportPayload) return ''
    const title = selectedDept === 'full' ? '综合就诊档案' : `${deptMeta?.name ?? ''}就诊档案`
    const checklist = deptTemplateChecklist[selectedDept]
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:Arial,"PingFang SC";margin:24px;color:#1f2937}h1{font-size:22px;margin:0 0 6px}h2{font-size:16px;margin:20px 0 8px;color:#1d4ed8}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}th{background:#f8fafc}ul{margin:8px 0 0 18px} .muted{color:#6b7280;font-size:12px}</style>
</head><body>
<h1>外院就诊档案</h1><div class="muted">${title} · 编号：${reportMeta?.code ?? '-'} · 生成时间：${reportMeta?.generatedAt ?? '-'}</div>
<h2>患者基本信息</h2>
<p>姓名：${visitReportData.patient.name} ｜ 性别：${visitReportData.patient.gender} ｜ 年龄：${visitReportData.patient.age}岁 ｜ 血型：${visitReportData.patient.bloodType}</p>
<p>BMI：${visitReportData.patient.bmi} ｜ 会员类型：${visitReportData.patient.memberType} ｜ 紧急联系人：${visitReportData.patient.emergencyContact}</p>
<h2>过敏史</h2><ul>${visitReportData.allergies.map((a)=>`<li>${a.name}（${a.severity}）：${a.reaction}</li>`).join('')}</ul>
<h2>专科就诊模板</h2><ul>${checklist.map((x)=>`<li>${x}</li>`).join('')}</ul>
<h2>相关既往史</h2><ul>${reportPayload.relatedPast.map((x)=>`<li>${x.condition}：${x.detail}</li>`).join('')}</ul>
<h2>当前用药</h2><ul>${visitReportData.medications.map((m)=>`<li>${m.drug} ${m.dose}，${m.freq}，${m.note}</li>`).join('')}</ul>
<h2>近期检查结果</h2>
<table><tr><th>日期</th><th>项目</th><th>结果</th><th>参考范围</th><th>评价</th></tr>
${reportPayload.relatedExams.map((e)=>`<tr><td>${e.date}</td><td>${e.name}</td><td>${e.result}</td><td>${e.ref}</td><td>${e.flag==='high'?'建议复查':e.flag==='normal'?'稳定':'持续观察'}</td></tr>`).join('')}
</table>
<h2>家族史与随访意见</h2>
<ul>${reportPayload.relatedFamily.map((f)=>`<li>${f.relation}：${f.condition}</li>`).join('')}</ul>
<ul>${reportPayload.relatedFollowups.map((f)=>`<li>${f.date} · ${f.doctor}：${f.note}</li>`).join('')}</ul>
${reportPayload.focus.length ? `<h2>本次就诊建议关注</h2><ul>${reportPayload.focus.map((f)=>`<li>${f}</li>`).join('')}</ul>` : ''}
${reportPayload.crossAlerts.length ? `<h2>跨科室就诊提醒</h2><ul>${reportPayload.crossAlerts.map((f)=>`<li>${f}</li>`).join('')}</ul>` : ''}
<p class="muted">说明：本档案仅供外院就诊时参考，不构成诊断或处方建议，请以接诊医生意见为准。</p>
</body></html>`
  }

  const handlePrintReport = () => {
    const html = buildReportHtml()
    if (!html) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  const handleExportReport = () => {
    const html = buildReportHtml()
    if (!html) return
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const a = document.createElement('a')
    const title = selectedDept === 'full' ? '综合就诊档案' : `${deptMeta?.name ?? '专科'}就诊档案`
    a.href = URL.createObjectURL(blob)
    a.download = `${title}-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleOpenHistory = (entry: ReportHistoryEntry) => {
    setSelectedDept(entry.dept)
    setReportMeta({ code: entry.code, generatedAt: entry.generatedAt })
    setReportOpen(true)
  }

  const examFlagLabel = (flag: string) => {
    if (flag === 'high') return '建议复查'
    if (flag === 'normal') return '稳定'
    return '持续观察'
  }

  const examFlagClass = (flag: string) => {
    if (flag === 'high') return 'is-attention'
    if (flag === 'normal') return 'is-stable'
    return 'is-watch'
  }

  const handleBack = () => {
    const target = resolveHubReturnTarget(hubSection, location.pathname, location.search)
    if (location.pathname.startsWith('/profile/')) {
      if (target) persistHubReturnSection(target)
      navigate('/profile', {
        state: target ? ({ scrollTarget: target } satisfies HubReturnState) : undefined,
      })
      return
    }
    navigate(-1)
  }

  const titles: Record<string, string> = {
    portrait: '健康画像',
    basic: '基本信息',
    docs: '健康资料',
    history: '健康史',
    indicators: '健康指标',
    plans: '健康计划',
    medical: '医疗信息',
    life: '生活信息',
    analysis: '动态分析',
    auth: '档案授权',
  }

  if (section === 'auth') {
    return (
      <MobileShell title="档案授权" showTab={false} showBack onBack={handleBack}>
        <ArchiveAuthManagement />
      </MobileShell>
    )
  }

  return (
    <MobileShell title={titles[section] ?? '档案详情'} showTab={false} showBack onBack={handleBack}>
      <div className="space-y-4 px-4 pb-6">
        {section === 'portrait' && <PortraitSection role={role} />}
        {section === 'basic' && <BasicSection role={role} />}
        {section === 'history' && <HistorySection role={role} />}
        {section === 'docs' && <DocsSection role={role} />}
        {section === 'indicators' && <IndicatorsSection role={role} />}
        {section === 'plans' && <PlansSection role={role} />}
        {section === 'analysis' && <AnalysisSection role={role} />}
        {section === 'medical' && <MedicalSection role={role} />}
        {section === 'life' && <LifeSection role={role} />}
        {section === 'visit' && (
          <div className="space-y-3">
            {!isMember && (
              <BentoCard className="p-4">
                <p className="text-sm font-semibold text-ink">外院就诊档案为会员专属能力</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  开通会员后可生成科室专属病历摘要，减少跨院重复沟通成本。
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/membership')}
                  className="mt-3 w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white"
                >
                  开通会员并使用
                </button>
              </BentoCard>
            )}

            {isMember && (
              <>
                <BentoCard className="visit-dept-panel overflow-hidden p-0">
                  <div className="visit-dept-header px-4 pb-3 pt-4">
                    <p className="text-[15px] font-bold text-ink">选择就诊科室</p>
                    <p className="mt-1 text-xs text-muted">先选科室，系统会按场景生成对应病历摘要</p>
                  </div>

                  {featuredDepartment && (
                    <button
                      type="button"
                      onClick={() => setSelectedDept(featuredDepartment.id)}
                      className={clsx(
                        'visit-dept-featured mx-4 mb-3 w-[calc(100%-2rem)] text-left',
                        selectedDept === featuredDepartment.id && 'is-selected',
                      )}
                    >
                      <div
                        className={clsx(
                          'visit-dept-featured-inner bg-gradient-to-r',
                          featuredDepartment.tone,
                        )}
                      >
                        <div className="visit-dept-icon-lg">{featuredDepartment.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-bold text-white">{featuredDepartment.name}</p>
                            <span className="visit-dept-badge">推荐</span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-white/88">
                            {featuredDepartment.desc}
                          </p>
                        </div>
                        {selectedDept === featuredDepartment.id ? (
                          <span className="visit-dept-check">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        ) : (
                          <ChevronRight size={18} className="text-white/70" />
                        )}
                      </div>
                    </button>
                  )}

                  <p className="visit-dept-section-label px-4">专科就诊</p>
                  <div className="visit-dept-grid px-4 pb-3">
                    {specialtyDepartments.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDept(d.id)}
                        className={clsx('visit-dept-card', selectedDept === d.id && 'is-selected')}
                      >
                        <div className={clsx('visit-dept-icon bg-gradient-to-br', d.tone)}>
                          {d.icon}
                        </div>
                        <p className="visit-dept-name">{d.name}</p>
                        <p className="visit-dept-desc">{d.desc}</p>
                        {selectedDept === d.id && (
                          <span className="visit-dept-check-sm">
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedDept && (
                    <div className="visit-dept-preview mx-4 mb-3">
                      <p className="visit-dept-preview-title">
                        已选 · {deptMeta?.name} · 将包含以下内容
                      </p>
                      <div className="visit-dept-preview-chips">
                        {deptTemplateChecklist[selectedDept].map((item) => (
                          <span key={item} className="visit-dept-chip">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="visit-dept-cta">
                    <button
                      type="button"
                      disabled={!selectedDept}
                      onClick={handleGenerateReport}
                      className="visit-dept-generate-btn"
                    >
                      {selectedDept === 'full'
                        ? '生成综合就诊档案'
                        : selectedDept
                          ? `生成${deptMeta?.name ?? ''}就诊档案`
                          : '请先选择就诊科室'}
                    </button>
                  </div>
                </BentoCard>

                <BentoCard className="visit-auth-panel overflow-hidden p-0">
                  <div className="visit-auth-header px-4 pb-3 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="visit-auth-icon">
                        <Share2 size={16} />
                      </span>
                      <p className="text-[15px] font-bold text-ink">授权与时效</p>
                    </div>
                    <p className="mt-1 text-xs text-muted">生成后建议 24 小时内使用，可随时撤销或重新生成</p>
                  </div>
                  <div className="visit-auth-tips mx-4 mb-3">
                    <div className="visit-auth-tip">
                      <Clock size={14} />
                      <span>有效期 24 小时</span>
                    </div>
                    <div className="visit-auth-tip">
                      <ShieldCheck size={14} />
                      <span>可随时撤销</span>
                    </div>
                  </div>
                  <div className="visit-auth-actions px-4 pb-4">
                    <button type="button" className="visit-auth-btn is-primary">
                      生成分享码
                    </button>
                    <button type="button" className="visit-auth-btn is-secondary">
                      临时授权码
                    </button>
                  </div>
                </BentoCard>

                <BentoCard className="visit-history-panel overflow-hidden p-0">
                  <div className="visit-history-header px-4 pb-2 pt-4">
                    <p className="text-[15px] font-bold text-ink">报告生成记录</p>
                    <p className="mt-0.5 text-xs text-muted">点击可再次查看已生成的档案</p>
                  </div>
                  {reportHistory.length === 0 ? (
                    <div className="visit-history-empty mx-4 mb-4">
                      <FileText size={28} className="text-slate-300" />
                      <p className="mt-2 text-xs text-muted">暂无记录，生成后可在这里查看历史版本</p>
                    </div>
                  ) : (
                    <div className="visit-history-list px-4 pb-4">
                      {reportHistory.map((h) => {
                        const dept = visitDepartments.find((d) => d.id === h.dept)
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => handleOpenHistory(h)}
                            className="visit-history-item"
                          >
                            <div className={clsx('visit-history-dept-icon bg-gradient-to-br', dept?.tone ?? 'from-slate-400 to-slate-500')}>
                              {dept?.icon ?? '📋'}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="text-[13px] font-bold text-ink">{h.deptName}</p>
                              <p className="mt-0.5 text-[11px] text-muted">{h.generatedAt}</p>
                              <p className="mt-0.5 truncate text-[11px] font-medium text-brand-600">{h.code}</p>
                            </div>
                            <ChevronRight size={16} className="shrink-0 text-slate-400" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </BentoCard>
              </>
            )}

            {reportOpen && reportPayload && selectedDept && (
              <div className="visit-report-overlay">
                <div className="visit-report-sheet">
                  <div className="visit-report-toolbar">
                    <button type="button" onClick={() => setReportOpen(false)} className="visit-report-close">
                      <X size={18} />
                    </button>
                    <p className="visit-report-toolbar-title">
                      {selectedDept === 'full' ? '综合就诊档案' : `${deptMeta?.name}就诊档案`}
                    </p>
                    <div className="w-9" />
                  </div>

                  <div className="visit-report-scroll">
                    <div className={clsx('visit-report-hero bg-gradient-to-br', deptMeta?.tone ?? 'from-brand-600 to-indigo-700')}>
                      <p className="visit-report-org">和谐医疗 · 家庭医生团队 编制</p>
                      <div className="visit-report-hero-main">
                        <span className="visit-report-hero-icon">{deptMeta?.icon ?? '📋'}</span>
                        <div>
                          <p className="visit-report-hero-title">外院就诊档案</p>
                          <p className="visit-report-hero-sub">
                            {selectedDept === 'full' ? '全部科室 · 病历摘要' : `${deptMeta?.name} · 病历摘要`}
                          </p>
                        </div>
                      </div>
                      <div className="visit-report-meta-row">
                        <span className="visit-report-meta-pill">{reportMeta?.code ?? '-'}</span>
                        <span className="visit-report-meta-pill">{reportMeta?.generatedAt ?? '-'}</span>
                      </div>
                    </div>

                    <div className="visit-report-body">
                      <section className="visit-report-section">
                        <div className="visit-report-section-head">
                          <UserRound size={15} />
                          <span>患者基本信息</span>
                        </div>
                        <div className="visit-report-patient-grid">
                          {[
                            { label: '姓名', value: visitReportData.patient.name },
                            { label: '性别', value: visitReportData.patient.gender },
                            { label: '年龄', value: `${visitReportData.patient.age}岁` },
                            { label: '血型', value: visitReportData.patient.bloodType },
                            { label: 'BMI', value: visitReportData.patient.bmi },
                            { label: '会员', value: visitReportData.patient.memberType },
                          ].map((item) => (
                            <div key={item.label} className="visit-report-stat">
                              <p className="visit-report-stat-label">{item.label}</p>
                              <p className="visit-report-stat-value">{item.value}</p>
                            </div>
                          ))}
                          <div className="visit-report-stat is-wide">
                            <p className="visit-report-stat-label">紧急联系人</p>
                            <p className="visit-report-stat-value">{visitReportData.patient.emergencyContact}</p>
                          </div>
                        </div>
                      </section>

                      <section className="visit-report-section">
                        <div className="visit-report-section-head">
                          <ShieldCheck size={15} />
                          <span>过敏史 · 就诊前请告知医生</span>
                        </div>
                        <div className="visit-report-stack">
                          {visitReportData.allergies.map((a) => (
                            <div key={a.name} className="visit-report-allergy">
                              <div className="visit-report-allergy-top">
                                <p className="visit-report-allergy-name">{a.name}</p>
                                <span className="visit-report-severity">{a.severity}过敏</span>
                              </div>
                              <p className="visit-report-allergy-desc">{a.reaction}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="visit-report-section">
                        <div className="visit-report-section-head">
                          <Stethoscope size={15} />
                          <span>相关既往史</span>
                        </div>
                        <div className="visit-report-stack">
                          {reportPayload.relatedPast.map((p) => (
                            <div key={p.condition} className="visit-report-info-card">
                              <p className="visit-report-info-title">{p.condition}</p>
                              <p className="visit-report-info-desc">{p.detail}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="visit-report-section">
                        <div className="visit-report-section-head">
                          <Pill size={15} />
                          <span>当前用药</span>
                        </div>
                        <div className="visit-report-med-list">
                          {visitReportData.medications.map((m) => (
                            <div key={m.drug} className="visit-report-med">
                              <div className="visit-report-med-icon">💊</div>
                              <div>
                                <p className="visit-report-med-name">{m.drug} · {m.dose}</p>
                                <p className="visit-report-med-desc">{m.freq} · {m.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="visit-report-section">
                        <div className="visit-report-section-head">
                          <TestTube size={15} />
                          <span>近期检查结果</span>
                        </div>
                        <div className="visit-report-exam-list">
                          {reportPayload.relatedExams.map((e) => (
                            <div key={`${e.date}-${e.name}`} className="visit-report-exam">
                              <div className="visit-report-exam-top">
                                <p className="visit-report-exam-name">{e.name}</p>
                                <span className={clsx('visit-report-exam-flag', examFlagClass(e.flag))}>
                                  {examFlagLabel(e.flag)}
                                </span>
                              </div>
                              <p className="visit-report-exam-result">{e.result}</p>
                              <p className="visit-report-exam-meta">{e.date} · 参考 {e.ref}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="visit-report-section">
                        <div className="visit-report-section-head">
                          <FileText size={15} />
                          <span>家族史与随访意见</span>
                        </div>
                        <div className="visit-report-stack">
                          {reportPayload.relatedFamily.map((f) => (
                            <div key={`${f.relation}-${f.condition}`} className="visit-report-info-card">
                              <p className="visit-report-info-title">{f.relation}</p>
                              <p className="visit-report-info-desc">{f.condition}</p>
                            </div>
                          ))}
                          {reportPayload.relatedFollowups.map((f) => (
                            <div key={`${f.date}-${f.dept}`} className="visit-report-followup">
                              <p className="visit-report-followup-title">{f.date} · {f.doctor} 随访</p>
                              <p className="visit-report-followup-desc">{f.note}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {reportPayload.focus.length > 0 && (
                        <section className="visit-report-section">
                          <div className="visit-report-section-head">
                            <Sparkles size={15} />
                            <span>本次就诊建议关注</span>
                          </div>
                          <div className="visit-report-focus-list">
                            {reportPayload.focus.map((f, i) => (
                              <div key={f} className="visit-report-focus-item">
                                <span className="visit-report-focus-num">{i + 1}</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {reportPayload.crossAlerts.length > 0 && (
                        <section className="visit-report-section">
                          <div className="visit-report-section-head">
                            <Info size={15} />
                            <span>跨科室就诊提醒</span>
                          </div>
                          <div className="visit-report-stack">
                            {reportPayload.crossAlerts.map((a) => (
                              <div key={a} className="visit-report-cross-alert">
                                {a}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <div className="visit-report-disclaimer">
                        <Info size={14} className="shrink-0 text-brand-500" />
                        <p>
                          本档案基于会员历史记录自动整理，仅供外院就诊时供主治医生参考，不构成诊断或处方建议，请以接诊医生意见为准。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="visit-report-footer">
                    <button type="button" onClick={handlePrintReport} className="visit-report-action is-secondary">
                      <Printer size={16} />
                      打印
                    </button>
                    <button type="button" onClick={handleExportReport} className="visit-report-action is-primary">
                      <Download size={16} />
                      导出档案
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {!['portrait', 'basic', 'history', 'docs', 'indicators', 'plans', 'analysis', 'visit'].includes(section) && (
          <BentoCard className="p-5 text-center">
            <p className="text-muted">「{titles[section]}」模块演示内容</p>
            <p className="mt-2 text-xs text-muted">完整表单与数据对接将在后续迭代</p>
          </BentoCard>
        )}
      </div>
    </MobileShell>
  )
}
