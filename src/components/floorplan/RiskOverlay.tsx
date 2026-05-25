import { motion, AnimatePresence } from 'framer-motion'
import type { RiskFinding } from '@/types'
import { toIso } from '@/utils/isometric'

const zoneColors: Record<string, string> = {
  high:   'rgba(239,68,68,0.28)',
  medium: 'rgba(249,115,22,0.22)',
  low:    'rgba(234,179,8,0.18)',
}
const borderColors: Record<string, string> = {
  high:   'rgba(239,68,68,0.7)',
  medium: 'rgba(249,115,22,0.6)',
  low:    'rgba(234,179,8,0.5)',
}

interface RiskOverlayProps {
  findings: RiskFinding[]
  originX: number
  originY: number
}

export default function RiskOverlay({ findings, originX, originY }: RiskOverlayProps) {
  const iso = (c: number, r: number) => toIso(c, r, originX, originY)

  const zones = findings.flatMap(f =>
    f.affectedZones.map((z, i) => ({ ...z, severity: f.severity, key: `${f.ruleId}-${i}` }))
  )

  return (
    <AnimatePresence>
      {zones.map(zone => {
        const [tx, ty] = iso(zone.x, zone.y)
        const [rx, ry] = iso(zone.x + zone.w, zone.y)
        const [bx, by] = iso(zone.x + zone.w, zone.y + zone.h)
        const [lx, ly] = iso(zone.x, zone.y + zone.h)
        const pts = `${tx},${ty} ${rx},${ry} ${bx},${by} ${lx},${ly}`

        return (
          <motion.polygon
            key={zone.key}
            points={pts}
            fill={zoneColors[zone.severity]}
            stroke={borderColors[zone.severity]}
            strokeWidth={2}
            pointerEvents="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )
      })}
    </AnimatePresence>
  )
}
