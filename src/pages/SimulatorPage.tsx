import { DndContext, type DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { getFurnitureById } from '@/data/furniture'
import FloorPlanCanvas from '@/components/floorplan/FloorPlanCanvas'
import FurniturePalette from '@/components/palette/FurniturePalette'
import RiskPanel from '@/components/risk/RiskPanel'
import AdBanner from '@/components/monetization/AdBanner'

export default function SimulatorPage() {
  const { t } = useTranslation()
  const placeFurniture = useFloorPlanStore(s => s.placeFurniture)
  const room = useFloorPlanStore(s => s.room)
  const [activeDef, setActiveDef] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event: { active: { data: { current?: { definitionId?: string } } } }) {
    const defId = event.active.data.current?.definitionId
    if (defId) setActiveDef(defId)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDef(null)
    const { over, active } = event
    if (over?.id !== 'floor-plan') return

    const defId = active.data.current?.definitionId as string | undefined
    if (!defId) return

    const def = getFurnitureById(defId)
    if (!def) return

    const container = document.querySelector('[data-floor-plan-container]')
    if (!container) return
    const CELL = 40

    const svgWrapper = container.querySelector('svg')
    if (!svgWrapper) return
    const svgRect = svgWrapper.getBoundingClientRect()

    const dropX = event.activatorEvent instanceof PointerEvent
      ? event.activatorEvent.clientX + (event.delta?.x ?? 0)
      : svgRect.left + svgRect.width / 2
    const dropY = event.activatorEvent instanceof PointerEvent
      ? event.activatorEvent.clientY + (event.delta?.y ?? 0)
      : svgRect.top + svgRect.height / 2

    const gridX = Math.max(0, Math.min(
      Math.floor((dropX - svgRect.left) / CELL),
      room.widthCells - def.widthCells
    ))
    const gridY = Math.max(0, Math.min(
      Math.floor((dropY - svgRect.top) / CELL),
      room.heightCells - def.heightCells
    ))

    placeFurniture(def, gridX, gridY)
  }

  const activeDefObj = activeDef ? getFurnitureById(activeDef) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-b border-amber-200">
          <span className="text-xs text-amber-700">💡 {t('simulator.click_hint')}</span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-48 shrink-0 border-r overflow-y-auto bg-white">
            <FurniturePalette />
          </aside>

          <FloorPlanCanvas />

          <aside className="w-56 shrink-0 overflow-y-auto">
            <RiskPanel />
            <div className="p-2">
              <AdBanner slot="simulator-side" format="rectangle" />
            </div>
          </aside>
        </div>
      </main>

      <DragOverlay>
        {activeDefObj && (
          <div className="bg-white border-2 border-red-400 rounded-lg px-3 py-2 shadow-xl text-sm font-medium pointer-events-none">
            {activeDefObj.emoji} {t(activeDefObj.labelKey)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
