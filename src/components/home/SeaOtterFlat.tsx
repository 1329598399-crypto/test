import { motion, useReducedMotion } from 'framer-motion'

const SEA_OTTER_SRC = '/ip/sea-otter-mascot.png'

interface Props {
  className?: string
}

/** 参考图风格：紫色光晕圆底 + 平面海獭 + 轻柔浮动 */
export function SeaOtterFlat({ className }: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={className ?? 'home-ip-otter-flat'}>
      <span className="home-ip-otter-flat-ring" aria-hidden />
      <span className="home-ip-otter-flat-shadow" aria-hidden />
      <motion.img
        src={SEA_OTTER_SRC}
        alt=""
        className="home-ip-otter-flat-img"
        draggable={false}
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
        }
      />
    </div>
  )
}
