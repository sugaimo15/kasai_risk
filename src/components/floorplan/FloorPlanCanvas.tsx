import { useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { getFurnitureById } from '@/data/furniture'
import { getBoundingBox } from '@/utils/geometry'
import { useIsMobile } from '@/hooks/useIsMobile'
import RiskOverlay from './RiskOverlay'
import FurnitureItem from './FurnitureItem'
import Room from './Room'

const CELL = 40

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
  const isMobile = useIsMobile()

  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null)

  const { setNodeRef } = useDroppable({ id: 'floor-plan' })

  const width = room.widthCells * CELL
  const height = room.heightCells * CELL

  const pendingDef = pendingDefId ? getFurnitureById(pendingDefId) : null

  function getSVGCoords(clientX: number, clientY: number): { gridX: number; gridY: number } | null {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.floor((clientX - rect.left) / CELL)
    const y = Math.floor((clientY - rect.top) / CELL)
    return { gridX: Math.max(0, Math.min(x, room.widthCells - 1)), gridY: Math.max(0, Math.min(y, room.heightCells - 1)) }
  }

  function handleCanvasTap(e: React.PointerEvent<SVGRectElement>) {
    if (!pendingDef) return
    e.stopPropagation()
    const pos = getSVGCoords(e.clientX, e.clientY)
    if (pos) {
      const maxX = room.widthCells - pendingDef.widthCells
      const maxY = room.heightCells - pendingDef.heightCells
      placeFurniture(
        pendingDef,
        Math.max(0, Math.min(pos.gridX, maxX)),
        Math.max(0, Math.min(pos.gridY, maxY))
      )
      onPendingPlace?.()
    }
  }

  const affectedIds = new Set(findings.flatMap(f => f.affectedInstanceIds))

  const perspectiveStyle = isMobile
    ? {}
    : { transform: 'rotateX(30deg) rotateZ(-5deg)', transformOrigin: 'center center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }

  return (
    <div
      ref={setNodeRef}
      className="flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-4"
      data-floor-plan-container
    >
      {pendingDef && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {pendingDef.emoji} {pendingDef.id} — 配置したい場所をタップ
        </div>
      )}

      <div style={{ perspective: isMobile ? undefined : '800px', display: 'inline-block' }}>
        <div style={{ display: 'inline-block', ...perspectiveStyle }}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ display: 'block', cursor: pendingDef ? 'crosshair' : 'default', touchAction: 'none' }}
            aria-label="間取り図"
          >
            <Room room={room} cellSize={CELL} />
            <RiskOverlay findings={findings} cellSize={CELL} />

            {placedFurniture.map(pf => {
              const def = getFurnitureById(pf.definitionId)
              if (!def) return null
              const box = getBoundingBox(pf, def)
              const isAffected = affectedIds.has(pf.instanceId)

              return (
                <FurnitureItem
                  key={pf.instanceId}
                  pf={pf}
                  def={def}
                  box={box}
                  cellSize={CELL}
                  isAffected={isAffected}
                  isDragging={draggingId === pf.instanceId}
                  disableInteraction={!!pendingDef}
                  onDragStart={() => setDraggingId(pf.instanceId)}
                  onDragMove={(clientX, clientY) => {
                    const pos = getSVGCoords(clientX, clientY)
                    if (pos) setGhostPos({ x: pos.gridX * CELL, y: pos.gridY * CELL })
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

            {pendingDef && (
              <rect
                x={0} y={0}
                width={width} height={height}
                fill="rgba(99,102,241,0.04)"
                style={{ cursor: 'crosshair' }}
                onPointerUp={handleCanvasTap}
              />
            )}

            {ghostPos && draggingId && (() => {
              const pf = placedFurniture.find(p => p.instanceId === draggingId)
              const def = pf ? getFurnitureById(pf.definitionId) : null
              if (!pf || !def) return null
              const box = getBoundingBox(pf, def)
              return (
                <rect
                  x={ghostPos.x} y={ghostPos.y}
                  width={box.w * CELL} height={box.h * CELL}
                  fill="rgba(99,102,241,0.2)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4"
                  rx={4}
                  pointerEvents="none"
                />
              )
            })()}
          </svg>
        </div>
      </div>
    </div>
  )
}
