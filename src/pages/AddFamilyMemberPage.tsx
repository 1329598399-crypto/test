import { useNavigate } from 'react-router-dom'
import { AddFamilyMemberFlow } from '../components/family/AddFamilyMemberFlow'
import { MobileShell } from '../components/layout/MobileShell'

/** 保留路由入口，实际使用紧凑两步流（非长页滚动） */
export function AddFamilyMemberPage() {
  const navigate = useNavigate()

  return (
    <MobileShell title="添加家庭成员" showTab={false} showBack mainClassName="flex flex-col">
      <div className="flex min-h-[calc(100dvh-120px)] flex-1 flex-col">
        <AddFamilyMemberFlow
          open
          variant="inline"
          onClose={() => navigate(-1)}
          onSuccess={() => navigate('/family', { replace: true })}
        />
      </div>
    </MobileShell>
  )
}
