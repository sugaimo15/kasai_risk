import { motion, AnimatePresence } from 'framer-motion'
import type { RiskFinding } from '@/types'

const zoneColors: Record<string, string> = {
  high: 'rgba(239,68,68,0.25)',
  medium: 'rgba(249,115,22,0.2)',
  low: 'rgba(234,179,8,0.15)',
}

const borderColors: Record<string, string> = {
  high: 'rgba(239,68,68,0.6)',
  medium: 'rgba(249,115,22,0.5)',
  low: 'rgba(234,179,8,0.4)',
}

interface RiskOverlayProps {
  findings: RiskFinding[]
  cellSize: number
}

export default function RiskOverlay({ findings, cellSize: C }: RiskOverlayProps) {
  const zones = findings.flatMap(f =>
    f.affectedZones.map((z, i) => ({ ...z, severity: f.severity, key: `${f.ruleId}-${i}` }))
  )

  return (
    <AnimatePresence>
      {zones.map(zone => (
        <motion.rect
          key={zone.key}
          x={zone.x * C}
          y={zone.y * C}
          width={zone.w * C}
          height={zone.h * C}
          fill={zoneColors[zone.severity]}
          stroke={borderColors[zone.severity]}
          strokeWidth={2}
          rx={4}
          pointerEvents="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </AnimatePresence>
  )
}
