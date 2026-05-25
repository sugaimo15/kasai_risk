import { useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { getFurnitureById } from '@/data/furniture'
import { getBoundingBox } from '@/utils/geometry'
import { toIso, fromIso, calcOrigin, calcSVGSize } from '@/utils/isometric'
import RiskOverlay from './RiskOverlay'
import FurnitureItem from './FurnitureItem'
import Room from './Room'

interface FloorPlanCanvasProps {
  pendingDefId?: string | null
  onPendingPlace?: () => void
}

export default function FloorPlanCanvas({ pendingDefId, onPendingPlace }: FloorPlanCanvasProps) {
  const room = useFloorPlanStore(s => s.room)
  const placedFurniture = useFloorPlanStore(s => s.placedFurniture)
  const findings = useFloorPlanStore(s => s.findings)
  const moveFurniture = useFloorPlanStore(s => s.moveFurniture)
  const placeFurniture = useFloorPlanStore(s => s.placeFurniture)

  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [ghostPos, setGhostPos] = useState<{ col: number; row: number } | null>(null)

  const { setNodeRef } = useDroppable({ id: 'floor-plan' })

  const { originX, originY } = calcOrigin(room.heightCells)
  const { svgW, svgH } = calcSVGSize(room.widthCells, room.heightCells)
  const pendingDef = pendingDefId ? getFurnitureById(pendingDefId) : null

  function getSVGCoords(clientX: number, clientY: number): { gridX: number; gridY: number } | null {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const [col, row] = fromIso(clientX - rect.left, clientY - rect.top, originX, originY)
    return {
      gridX: Math.max(0, Math.min(Math.floor(col), room.widthCells - 1)),
      gridY: Math.max(0, Math.min(Math.floor(row), room.heightCells - 1)),
    }
  }

  function handleCanvasTap(e: React.PointerEvent<SVGRectElement>) {
    if (!pendingDef) return
    e.stopPropagation()
    const pos = getSVGCoords(e.clientX, e.clientY)
    if (pos) {
      placeFurniture(
        pendingDef,
        Math.max(0, Math.min(pos.gridX, room.widthCells - pendingDef.widthCells)),
        Math.max(0, Math.min(pos.gridY, room.heightCells - pendingDef.heightCells))
      )
      onPendingPlace?.()
    }
  }

  const affectedIds = new Set(findings.flatMap(f => f.affectedInstanceIds))

  // Painter's algorithm: back to front (ascending gridX + gridY)
  const sortedFurniture = [...placedFurniture].sort(
    (a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY)
  )

  return (
    <div
      ref={setNodeRef}
      className="flex-1 overflow-auto flex items-start justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)' }}
      data-floor-plan-container
    >
      <svg
        ref={svgRef}
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', cursor: pendingDef ? 'crosshair' : 'default', touchAction: 'none', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
        aria-label="間取り図"
      >
        {/* Room: floor + isometric walls */}
        <Room room={room} originX={originX} originY={originY} />

        {/* Risk zone overlay (on floor) */}
        <RiskOverlay findings={findings} originX={originX} originY={originY} />

        {/* Furniture sorted back to front */}
        {sortedFurniture.map(pf => {
          const def = getFurnitureById(pf.definitionId)
          if (!def) return null
          const box = getBoundingBox(pf, def)
          return (
            <FurnitureItem
              key={pf.instanceId}
              pf={pf}
              def={def}
              box={box}
              originX={originX}
              originY={originY}
              isAffected={affectedIds.has(pf.instanceId)}
              isDragging={draggingId === pf.instanceId}
              disableInteraction={!!pendingDef}
              onDragStart={() => setDraggingId(pf.instanceId)}
              onDragMove={(clientX, clientY) => {
                const pos = getSVGCoords(clientX, clientY)
                if (pos) setGhostPos({ col: pos.gridX, row: pos.gridY })
              }}
              onDragEnd={(clientX, clientY) => {
                const pos = getSVGCoords(clientX, clientY)
                if (pos) {
                  const maxX = room.widthCells - box.w
                  const maxY = room.heightCells - box.h
                  moveFurniture(
                    pf.instanceId,
                    Math.max(0, Math.min(pos.gridX, maxX)),
                    Math.max(0, Math.min(pos.gridY, maxY))
                  )
                }
                setDraggingId(null)
                setGhostPos(null)
              }}
            />
          )
        })}

        {/* Ghost preview while dragging */}
        {ghostPos && draggingId && (() => {
          const pf = placedFurniture.find(p => p.instanceId === draggingId)
          const def = pf ? getFurnitureById(pf.definitionId) : null
          if (!pf || !def) return null
          const box = getBoundingBox(pf, def)
          const [tx, ty] = toIso(ghostPos.col, ghostPos.row, originX, originY)
          const [rx, ry] = toIso(ghostPos.col + box.w, ghostPos.row, originX, originY)
          const [bx, by] = toIso(ghostPos.col + box.w, ghostPos.row + box.h, originX, originY)
          const [lx, ly] = toIso(ghostPos.col, ghostPos.row + box.h, originX, originY)
          return (
            <polygon
              points={`${tx},${ty} ${rx},${ry} ${bx},${by} ${lx},${ly}`}
              fill="rgba(99,102,241,0.35)"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="5 3"
              pointerEvents="none"
            />
          )
        })()}

        {/* Tap overlay when in pending placement mode */}
        {pendingDef && (
          <rect
            x={0} y={0} width={svgW} height={svgH}
            fill="rgba(99,102,241,0.04)"
            style={{ cursor: 'crosshair' }}
            onPointerUp={handleCanvasTap}
          />
        )}
      </svg>
    </div>
  )
}
