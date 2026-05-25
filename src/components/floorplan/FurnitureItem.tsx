import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlacedFurniture, FurnitureDefinition, GridRect } from '@/types'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { toIso, hexDarken, hexLighten } from '@/utils/isometric'

interface FurnitureItemProps {
  pf: PlacedFurniture
  def: FurnitureDefinition
  box: GridRect
  originX: number
  originY: number
  isAffected: boolean
  isDragging: boolean
  disableInteraction?: boolean
  onDragStart: () => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: (clientX: number, clientY: number) => void
}

export default function FurnitureItem({
  pf, def, box, originX, originY, isAffected, isDragging, disableInteraction,
  onDragStart, onDragMove, onDragEnd,
}: FurnitureItemProps) {
  const { t } = useTranslation()
  const removeFurniture = useFloorPlanStore(s => s.removeFurniture)
  const toggleAnchor = useFloorPlanStore(s => s.toggleAnchor)
  const rotateFurniture = useFloorPlanStore(s => s.rotateFurniture)
  const selectedInstanceId = useFloorPlanStore(s => s.selectedInstanceId)
  const selectFurniture = useFloorPlanStore(s => s.selectFurniture)

  const isSelected = selectedInstanceId === pf.instanceId
  const dragRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })

  const { x: col, y: row, w, h } = box
  const H = isDragging ? def.boxH * 0.5 : def.boxH

  const [tx, ty] = toIso(col, row, originX, originY)
  const [rx, ry] = toIso(col + w, row, originX, originY)
  const [bx, by] = toIso(col + w, row + h, originX, originY)
  const [lx, ly] = toIso(col, row + h, originX, originY)

  const topColor   = hexLighten(def.color, 0.25)
  const leftColor  = hexDarken(def.color, 0.75)
  const rightColor = hexDarken(def.color, 0.58)

  const strokeColor = isSelected ? '#6366f1' : isAffected ? '#ef4444' : 'rgba(0,0,0,0.25)'
  const strokeW = isSelected || isAffected ? 2.5 : 1.5

  const cx = (tx + rx + bx + lx) / 4
  const cy = (ty + ry + by + ly) / 4 - H
  const emojiSize = Math.min(w, h) * 14 + 6

  function pts(...coords: [number, number][]) {
    return coords.map(([x, y]) => `${x},${y}`).join(' ')
  }

  function onPointerDown(e: React.PointerEvent<SVGGElement>) {
    if (disableInteraction) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = false
    startRef.current = { x: e.clientX, y: e.clientY }
    onDragStart()
  }

  function onPointerMove(e: React.PointerEvent<SVGGElement>) {
    const dx = Math.abs(e.clientX - startRef.current.x)
    const dy = Math.abs(e.clientY - startRef.current.y)
    if (dx > 4 || dy > 4) {
      dragRef.current = true
      onDragMove(e.clientX, e.clientY)
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGGElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (dragRef.current) {
      onDragEnd(e.clientX, e.clientY)
    } else {
      selectFurniture(isSelected ? null : pf.instanceId)
    }
    dragRef.current = false
  }

  return (
    <g
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={e => e.preventDefault()}
      style={{ cursor: isDragging ? 'grabbing' : disableInteraction ? 'default' : 'grab', userSelect: 'none' }}
      opacity={isDragging ? 0.6 : 1}
      aria-label={t(def.labelKey)}
      role="button"
    >
      {/* Drop shadow */}
      <polygon
        points={pts([tx, ty + 3], [rx, ry + 3], [bx, by + 3], [lx, ly + 3])}
        fill="rgba(0,0,0,0.18)"
        transform="translate(3,4)"
        pointerEvents="none"
      />

      {/* Left face (SW, screen-left, darkest) */}
      <polygon
        points={pts([lx, ly - H], [bx, by - H], [bx, by], [lx, ly])}
        fill={leftColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />

      {/* Right face (SE, screen-right, medium) */}
      <polygon
        points={pts([bx, by - H], [rx, ry - H], [rx, ry], [bx, by])}
        fill={rightColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />

      {/* Top face (lightest) */}
      <polygon
        points={pts([tx, ty - H], [rx, ry - H], [bx, by - H], [lx, ly - H])}
        fill={topColor}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />

      {/* Anchor indicator */}
      {pf.isAnchored && (
        <text x={lx + 4} y={ly - H - 2} fontSize={10} fill="#2563eb" pointerEvents="none">⚓</text>
      )}

      {/* Risk warning badge */}
      {isAffected && !isDragging && (
        <g pointerEvents="none">
          <circle cx={rx} cy={ry - H} r={8} fill="#ef4444" />
          <text x={rx} y={ry - H + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white">!</text>
        </g>
      )}

      {/* Emoji label on top face */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={emojiSize}
        pointerEvents="none"
        style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
      >
        {def.emoji}
      </text>

      {/* Selection toolbar */}
      {isSelected && !isDragging && (
        <foreignObject
          x={cx - 60}
          y={ty - H - 36}
          width={120}
          height={32}
          style={{ overflow: 'visible' }}
        >
          <div style={{
            display: 'flex', gap: 3, background: 'white', borderRadius: 8,
            padding: '3px 5px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: 11, whiteSpace: 'nowrap',
          }}>
            <button
              onClick={() => rotateFurniture(pf.instanceId)}
              title={t('btn.rotate')}
              style={{ padding: '2px 6px', borderRadius: 4, background: '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer' }}
            >↻</button>
            {def.anchorable && (
              <button
                onClick={() => toggleAnchor(pf.instanceId)}
                title={pf.isAnchored ? t('btn.unanchor') : t('btn.anchor')}
                style={{ padding: '2px 6px', borderRadius: 4, background: pf.isAnchored ? '#dbeafe' : '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer' }}
              >
                {pf.isAnchored ? '⚓' : '🔩'}
              </button>
            )}
            <button
              onClick={() => removeFurniture(pf.instanceId)}
              title={t('btn.remove')}
              style={{ padding: '2px 6px', borderRadius: 4, background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', color: '#dc2626' }}
            >✕</button>
          </div>
        </foreignObject>
      )}
    </g>
  )
}
