import { DndContext, type DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { getFurnitureById } from '@/data/furniture'
import { useIsMobile } from '@/hooks/useIsMobile'
import FloorPlanCanvas from '@/components/floorplan/FloorPlanCanvas'
import FurniturePalette from '@/components/palette/FurniturePalette'
import RiskPanel from '@/components/risk/RiskPanel'
import BottomSheet from '@/components/ui/BottomSheet'
import AdBanner from '@/components/monetization/AdBanner'
import RiskScoreGauge from '@/components/risk/RiskScoreGauge'

export default function SimulatorPage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const placeFurniture = useFloorPlanStore(s => s.placeFurniture)
  const findings = useFloorPlanStore(s => s.findings)
  const room = useFloorPlanStore(s => s.room)

  // Desktop drag state
  const [activeDef, setActiveDef] = useState<string | null>(null)

  // Mobile tap-to-place state
  const [pendingDefId, setPendingDefId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<'palette' | 'risk' | null>(null)

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

    const gridX = Math.max(0, Math.min(Math.floor((dropX - svgRect.left) / CELL), room.widthCells - def.widthCells))
    const gridY = Math.max(0, Math.min(Math.floor((dropY - svgRect.top) / CELL), room.heightCells - def.heightCells))
    placeFurniture(def, gridX, gridY)
  }

  function handleMobileSelect(defId: string) {
    setPendingDefId(defId)
    setSheet(null)
  }

  function handlePendingPlace() {
    setPendingDefId(null)
  }

  const activeDefObj = activeDef ? getFurnitureById(activeDef) : null
  const pendingDefObj = pendingDefId ? getFurnitureById(pendingDefId) : null
  const highCount = findings.filter(f => f.severity === 'high').length

  // ── Mobile layout ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {pendingDefObj && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm">
            <span>{pendingDefObj.emoji} <strong>{t(pendingDefObj.labelKey)}</strong> — 配置したい場所をタップ</span>
            <button
              className="ml-auto text-white/80 hover:text-white text-xs border border-white/40 rounded px-2 py-0.5"
              onClick={() => setPendingDefId(null)}
            >
              キャンセル
            </button>
          </div>
        )}

        {!pendingDefObj && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b text-xs text-gray-500">
            <span>📍 {t(room.labelKey)}</span>
            {highCount > 0 && (
              <span className="text-red-600 font-bold">⚠️ 高リスク {highCount}件</span>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <FloorPlanCanvas pendingDefId={pendingDefId} onPendingPlace={handlePendingPlace} />
        </div>

        <nav className="flex border-t bg-white shrink-0">
          <button
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs text-gray-600 active:bg-gray-100"
            onClick={() => setSheet(sheet === 'palette' ? null : 'palette')}
          >
            <span className="text-xl">🪑</span>
            <span>家具を追加</span>
          </button>

          <Link
            to="/results"
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs text-gray-600 active:bg-gray-100"
          >
            <span className="text-xl">📋</span>
            <span>結果を見る</span>
          </Link>

          <button
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs active:bg-gray-100 relative ${highCount > 0 ? 'text-red-600' : 'text-gray-600'}`}
            onClick={() => setSheet(sheet === 'risk' ? null : 'risk')}
          >
            <span className="text-xl">🔍</span>
            <span>リスク診断</span>
            {highCount > 0 && (
              <span className="absolute top-1.5 right-4 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{highCount}</span>
            )}
          </button>
        </nav>

        <BottomSheet
          isOpen={sheet === 'palette'}
          onClose={() => setSheet(null)}
          title="家具を選択"
        >
          <FurniturePalette onSelect={handleMobileSelect} selectedDefId={pendingDefId} />
        </BottomSheet>

        <BottomSheet
          isOpen={sheet === 'risk'}
          onClose={() => setSheet(null)}
          title="リスク診断"
        >
          <div className="p-2">
            <RiskScoreGauge findings={findings} />
          </div>
          <div className="px-2 pb-4">
            <RiskPanel />
          </div>
        </BottomSheet>
      </div>
    )
  }

  // ── Desktop layout ─────────────────────────────────────────────
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-b border-amber-200">
          <span className="text-xs text-amber-700">💡 {t('simulator.click_hint')}</span>
          <span className="ml-auto">
            <AdBanner slot="simulator-top" format="horizontal" />
          </span>
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
