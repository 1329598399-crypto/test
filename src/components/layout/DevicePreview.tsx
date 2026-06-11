import type { ReactNode } from 'react'

export function DevicePreview({ children }: { children: ReactNode }) {
  return (
    <div className="device-preview">
      <div className="device-screen">
        <div className="device-content">{children}</div>
      </div>
    </div>
  )
}
