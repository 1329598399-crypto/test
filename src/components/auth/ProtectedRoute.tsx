import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { OpsPreviewShell } from '../ops/OpsPreviewShell'
import { isOpsPreviewMode } from '../../lib/opsBridge'
import { useAppStore } from '../../store/useAppStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)
  const location = useLocation()

  if (isOpsPreviewMode()) {
    return <OpsPreviewShell>{children}</OpsPreviewShell>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return children
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}
