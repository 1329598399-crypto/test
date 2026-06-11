import { ChevronRight, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { isFamilyMemberAuthorized } from '../../data/archiveAuthData'
import { useAppStore } from '../../store/useAppStore'

interface FamilyDynamic {
  id?: string
  name: string
  info: string
  status: string
}

function familyInitial(name: string) {
  const m = name.match(/[\u4e00-\u9fa5]/)
  return m?.[0] ?? name.slice(0, 1)
}

interface Props {
  items: FamilyDynamic[]
}

export function ArchiveFamilyDynamics({ items }: Props) {
  const navigate = useNavigate()
  const archiveAuthGrants = useAppStore((s) => s.archiveAuthGrants)

  if (!items.length) return null

  return (
    <section id="archive-section-family" className="archive-family-dynamics archive-rec-sec mb-3">
      <div className="archive-family-head">
        <div className="archive-family-head-left">
          <span className="archive-family-dynamics-icon" aria-hidden>
            <Heart size={16} strokeWidth={2.2} />
          </span>
          <div>
            <h3 className="archive-family-head-title">家人动态</h3>
            <p className="archive-family-head-sub">授权后可查看家人档案</p>
          </div>
        </div>
        <button type="button" className="archive-family-head-link" onClick={() => navigate('/family')}>
          查看
        </button>
      </div>
      <div className="archive-family-feed">
        {items.map((f, index) => {
          const authorized = f.id ? isFamilyMemberAuthorized(archiveAuthGrants, f.id) : false
          return (
            <button
              key={f.name}
              type="button"
              onClick={() =>
                authorized && f.id ? navigate(`/family/view/${f.id}`) : navigate('/family')
              }
              className="archive-family-row"
            >
              <span className={`archive-family-avatar is-tone-${index % 3}`}>
                {familyInitial(f.name)}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">{f.name}</span>
                  <span className="archive-family-tag">{f.status}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">{f.info}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-slate-300" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
