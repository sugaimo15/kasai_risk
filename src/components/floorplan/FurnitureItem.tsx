import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlacedFurniture, FurnitureDefinition, GridRect } from '@/types'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

interface FurnitureItemProps {
  pf: PlacedFurniture
  def: FurnitureDefinition
  box: GridRect
  cellSize: number
  isAffected: boolean
  isDragging: boolean
  disableInteraction?: boolean
  onDragStart: () => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: (clientX: number, clientY: number) => void
}

export default function FurnitureItem({
  pf, def, box, cellSize: C, isAffected, isDragging, disableInteraction,
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

  const x = box.x * C
  const y = box.y * C
  const w = box.w * C
  const h = box.h * C

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
    if (dx > 3 || dy > 3) {
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
      onContextMenu={e => { e.preventDefault() }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      aria-label={t(def.labelKey)}
      role="button"
    >
      <rect
        x={x} y={y} width={w} height={h}
        rx={4}
        fill={isDragging ? `${def.color}80` : def.color}
        stroke={isSelected ? '#6366f1' : isAffected ? '#ef4444' : 'rgba(0,0,0,0.2)'}
        strokeWidth={isSelected ? 3 : isAffected ? 2 : 1}
        opacity={isDragging ? 0.5 : 1}
      />

      <text
        x={x + w / 2} y={y + h / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(w, h) * 0.45}
        pointerEvents="none"
      >
        {def.emoji}
      </text>

      {pf.isAnchored && (
        <text x={x + 2} y={y + 10} fontSize={10} pointerEvents="none">⚓</text>
      )}

      {isAffected && !isDragging && (
        <g>
          <circle cx={x + w - 8} cy={y + 8} r={8} fill="#ef4444" />
          <text x={x + w - 8} y={y + 8} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white" pointerEvents="none">!</text>
        </g>
      )}

      {isSelected && !isDragging && (
        <foreignObject x={x} y={y + h + 2} width={Math.max(w, 120)} height={60} style={{ overflow: 'visible' }}>
          <div
            style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 6, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 11 }}
          >
            <button onClick={() => rotateFurniture(pf.instanceId)} title={t('btn.rotate')} style={{ padding: '2px 6px', borderRadius: 4, background: '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer' }}>↻</button>
            {def.anchorable && (
              <button onClick={() => toggleAnchor(pf.instanceId)} title={pf.isAnchored ? t('btn.unanchor') : t('btn.anchor')} style={{ padding: '2px 6px', borderRadius: 4, background: pf.isAnchored ? '#dbeafe' : '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer' }}>
                {pf.isAnchored ? '⚓' : '🔩'}
              </button>
            )}
            <button onClick={() => removeFurniture(pf.instanceId)} title={t('btn.remove')} style={{ padding: '2px 6px', borderRadius: 4, background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', color: '#dc2626' }}>✕</button>
          </div>
        </foreignObject>
      )}
    </g>
  )
}
