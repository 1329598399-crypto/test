import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'

export function ArchiveToast() {
  const message = useAppStore((s) => s.toastMessage)
  const clearToast = useAppStore((s) => s.clearToast)

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => clearToast(), 2200)
    return () => window.clearTimeout(t)
  }, [message, clearToast])

  if (!message) return null

  return (
    <div className="archive-toast" role="status">
      {message}
    </div>
  )
}
