import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MobileShell } from '../components/layout/MobileShell'
import { BentoCard } from '../components/ui/BentoCard'
import { recordTypes } from '../data/mockData'
import { useAppStore } from '../store/useAppStore'
import { RecordDashboard } from './records/RecordDashboard'

export function RecordsPage() {
  const { form } = useParams()
  if (form) return <RecordForm typeId={form} />
  return <RecordDashboard />
}

function RecordForm({ typeId }: { typeId: string }) {
  const navigate = useNavigate()
  const addRecord = useAppStore((s) => s.addRecord)
  const type = recordTypes.find((t) => t.id === typeId)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (typeId === 'mood') navigate('/records/mood', { replace: true })
    else if (typeId === 'diet' || typeId === 'medication') navigate(`/records/scan/${typeId}`, { replace: true })
    else if (['bp', 'glucose', 'hr', 'lipid'].includes(typeId)) navigate(`/records/vitals/${typeId}`, { replace: true })
  }, [typeId, navigate])

  if (['mood', 'diet', 'medication', 'bp', 'glucose', 'hr', 'lipid'].includes(typeId)) return null

  const save = () => {
    addRecord(typeId, value || '已记录')
    navigate('/records')
  }

  return (
    <MobileShell title={`记录${type?.name ?? ''}`} showTab={false} showBack>
      <div className="px-4 pb-6">
        <BentoCard className="p-4">
          <p className="text-xs text-muted">保存后同步至健康档案，医生团队可查看</p>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-ink">数值 / 描述</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-ink outline-none focus:border-brand-400"
              placeholder="请输入"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="mt-4 w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white"
          >
            保存记录
          </button>
        </BentoCard>
      </div>
    </MobileShell>
  )
}
