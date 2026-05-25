import { useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { getFurnitureById } from '@/data/furniture'
import { getBoundingBox } from '@/utils/geometry'
import RiskOverlay from './RiskOverlay'
import FurnitureItem from './FurnitureItem'
import Room from './Room'

const CELL = 40

export default function FloorPlanCanvas() {
  const room = useFloorPlanStore(s => s.room)
  const placedFurniture = useFloorPlanStore(s => s.placedFurniture)
  const findings = useFloorPlanStore(s => s.findings)
  const moveFurniture = useFloorPlanStore(s => s.moveFurniture)

  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null)

  const { setNodeRef } = useDroppable({ id: 'floor-plan' })

  const width = room.widthCells * CELL
  const height = room.heightCells * CELL

  function getSVGCoords(clientX: number, clientY: number): { gridX: number; gridY: number } | null {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.floor((clientX - rect.left) / CELL)
    const y = Math.floor((clientY - rect.top) / CELL)
    return { gridX: Math.max(0, Math.min(x, room.widthCells - 1)), gridY: Math.max(0, Math.min(y, room.heightCells - 1)) }
  }

  const affectedIds = new Set(findings.flatMap(f => f.affectedInstanceIds))

  return (
    <div
      ref={setNodeRef}
      className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-6"
      data-floor-plan-container
    >
      <div
        style={{ perspective: '800px', display: 'inline-block' }}
      >
        <div style={{ transform: 'rotateX(30deg) rotateZ(-5deg)', transformOrigin: 'center center', display: 'inline-block', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ display: 'block', cursor: 'default' }}
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
