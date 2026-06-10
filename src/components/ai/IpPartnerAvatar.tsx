import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  variant?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'greet' | 'remind' | 'celebrate' | 'think'
  animate?: boolean
  className?: string
}

const sizeMap = {
  sm: { wrap: 64, face: 44 },
  md: { wrap: 112, face: 72 },
  lg: { wrap: 140, face: 88 },
  xl: { wrap: 168, face: 104 },
}

export function IpPartnerAvatar({
  variant = 0,
  size = 'md',
  mood = 'greet',
  animate = true,
  className,
}: Props) {
  const dim = sizeMap[size]
  const variantClass = `ip-variant-${variant % 6}`
  const moodClass = mood === 'celebrate' ? 'is-mood-celebrate' : ''

  const body = (
    <div
      className={clsx('ip-partner-avatar', variantClass, moodClass, className)}
      style={{ width: dim.wrap, height: dim.wrap }}
      aria-hidden
    >
      <div className="ip-partner-glow" />
      <div className="ip-partner-body" style={{ width: dim.face, height: dim.face - 4 }}>
        <span className="ip-partner-face">
          <span className="ip-partner-eye ip-partner-eye-left" />
          <span className="ip-partner-eye ip-partner-eye-right" />
          <span className="ip-partner-blush ip-partner-blush-left" />
          <span className="ip-partner-blush ip-partner-blush-right" />
          <span className="ip-partner-mouth" />
          <span className="ip-partner-tongue" />
        </span>
        <span className="ip-partner-scarf" />
      </div>
      {(variant % 3 === 0 || mood === 'celebrate') && (
        <Sparkles size={size === 'xl' ? 16 : 12} className="ip-partner-sparkle" />
      )}
    </div>
  )

  if (!animate) return body

  return (
    <motion.div
      animate={
        mood === 'celebrate'
          ? { y: [0, -6, 0], scale: [1, 1.03, 1] }
          : { y: [0, -5, 0] }
      }
      transition={{
        duration: mood === 'celebrate' ? 1.2 : 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {body}
    </motion.div>
  )
}
