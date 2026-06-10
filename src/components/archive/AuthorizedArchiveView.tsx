import { clsx } from 'clsx'
import { AlertTriangle, Clock, Eye, ShieldCheck } from 'lucide-react'
import type { AuthScope } from '../../data/archiveAuthData'
import { scopeLabel } from '../../data/archiveAuthData'
import {
  scopeAllowsSection,
  type AuthorizedArchiveSnapshot,
} from '../../data/authorizedArchiveSnapshots'

const chipToneClass = {
  blue: 'archive-chip-blue',
  green: 'archive-chip-green',
  amber: 'archive-chip-amber',
  gray: 'archive-chip-gray',
}

interface Props {
  snapshot: AuthorizedArchiveSnapshot
  scope: AuthScope
  viewerLabel: string
  expiresLabel?: string | null
  footerNote?: string
}

export function AuthorizedArchiveView({
  snapshot,
  scope,
  viewerLabel,
  expiresLabel,
  footerNote,
}: Props) {
  const isVisitOnly = scope === 'visit_readonly'

  return (
    <div className="auth-view-page pb-8">
      <div className="auth-view-banner">
        <div className="auth-view-banner-icon">
          <ShieldCheck size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="auth-view-banner-title">{viewerLabel}</p>
          <p className="auth-view-banner-sub">
            {scopeLabel(scope)}
            {expiresLabel ? ` · ${expiresLabel}` : ''}
          </p>
        </div>
        <span className="auth-view-readonly">
          <Eye size={12} />
          只读
        </span>
      </div>

      <div className="auth-view-tip">
        <AlertTriangle size={13} className="shrink-0" />
        <p>
          本页为授权查看内容，仅供健康管理参考，不构成诊断或治疗建议。{footerNote ?? ''}
        </p>
      </div>

      <div className="auth-view-hero">
        <p className="auth-view-hero-label">授权查看档案</p>
        <p className="auth-view-hero-name">{snapshot.name}</p>
        <p className="auth-view-hero-meta">
          {snapshot.gender} · {snapshot.age}岁 · {snapshot.bloodType}
          {snapshot.relationship ? ` · ${snapshot.relationship}` : ''}
        </p>
        <div className="auth-view-hero-stats">
          <span>档案号 {snapshot.archiveId}</span>
          <span>完善度 {snapshot.completeness}%</span>
          <span>同步 {snapshot.syncAt}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {snapshot.chips.map((chip) => (
            <span key={chip.label} className={clsx('archive-chip text-[10px]', chipToneClass[chip.tone])}>
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {isVisitOnly && snapshot.visitSummary && (
        <section className="auth-view-section">
          <h3 className="auth-view-section-title">📄 就诊摘要（授权范围）</h3>
          <div className="auth-view-card">
            <p className="mb-2 text-xs font-semibold text-ink">建议就诊时关注</p>
            <ul className="auth-view-list">
              {snapshot.visitSummary.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {snapshot.visitSummary.medications.length > 0 && (
              <>
                <p className="mb-2 mt-3 text-xs font-semibold text-ink">当前用药</p>
                <ul className="auth-view-list">
                  {snapshot.visitSummary.medications.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="mb-2 mt-3 text-xs font-semibold text-ink">近期关键指标</p>
            <div className="auth-view-metrics">
              {snapshot.visitSummary.recentExams.map((exam) => (
                <div key={exam.name} className="auth-view-metric">
                  <span>{exam.name}</span>
                  <span className={clsx(exam.flag === 'attention' && 'text-amber-600')}>
                    {exam.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {scopeAllowsSection(scope, 'allergy') && snapshot.allergies.length > 0 && (
        <section className="auth-view-section">
          <h3 className="auth-view-section-title">🚫 过敏史</h3>
          <div className="auth-view-card space-y-2">
            {snapshot.allergies.map((a) => (
              <div key={a.name} className="auth-view-row">
                <div>
                  <p className="font-semibold text-ink">{a.name}</p>
                  <p className="text-xs text-muted">{a.reaction}</p>
                </div>
                <span className="auth-view-tag is-warn">{a.severity}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {scopeAllowsSection(scope, 'records') && snapshot.recentRecords.length > 0 && (
        <section className="auth-view-section">
          <h3 className="auth-view-section-title">📝 近期健康记录</h3>
          <div className="auth-view-card space-y-2">
            {snapshot.recentRecords.map((r) => (
              <div key={`${r.label}-${r.time}`} className="auth-view-row">
                <div>
                  <p className="font-semibold text-ink">{r.label}</p>
                  <p className="text-xs text-muted">{r.time}</p>
                </div>
                <span className="text-sm font-medium text-brand-700">{r.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {scopeAllowsSection(scope, 'exams') && snapshot.exams.length > 0 && (
        <section className="auth-view-section">
          <h3 className="auth-view-section-title">🔬 检查记录</h3>
          <div className="auth-view-card space-y-3">
            {snapshot.exams.map((e) => (
              <div key={`${e.date}-${e.title}`}>
                <p className="text-[11px] text-muted">{e.date}</p>
                <p className="font-semibold text-ink">{e.title}</p>
                <p className="text-xs text-muted">{e.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {scopeAllowsSection(scope, 'followup') && snapshot.followups.length > 0 && (
        <section className="auth-view-section">
          <h3 className="auth-view-section-title">📅 随访与服务记录</h3>
          <div className="auth-view-card space-y-3">
            {snapshot.followups.map((f) => (
              <div key={`${f.date}-${f.title}`}>
                <p className="text-[11px] text-muted">{f.date}</p>
                <p className="font-semibold text-ink">{f.title}</p>
                <p className="text-xs text-muted">{f.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {expiresLabel && (
        <div className="auth-view-expire">
          <Clock size={14} />
          <span>{expiresLabel}后授权将自动失效</span>
        </div>
      )}
    </div>
  )
}
