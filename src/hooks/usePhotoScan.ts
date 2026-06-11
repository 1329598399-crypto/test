import { useEffect, useRef, useState } from 'react'

export type PhotoScanPhase = 'idle' | 'scanning' | 'result'

export function usePhotoScan(onComplete?: () => void) {
  const [phase, setPhase] = useState<PhotoScanPhase>('idle')
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (phase !== 'scanning') return
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(timer)
          setPhase('result')
          onCompleteRef.current?.()
          return 100
        }
        return p + 8
      })
    }, 120)
    return () => window.clearInterval(timer)
  }, [phase])

  const startScan = () => {
    setProgress(0)
    setPhase('scanning')
  }

  const resetScan = () => {
    setProgress(0)
    setPhase('idle')
  }

  return { phase, progress, startScan, resetScan, setPhase }
}
