import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { PlacedFurniture, RoomTemplate, RiskFinding, FurnitureDefinition, Rotation } from '@/types'
import { roomTemplates } from '@/data/rooms'
import { assessRisk } from '@/utils/riskEngine'

interface FloorPlanState {
  room: RoomTemplate
  placedFurniture: PlacedFurniture[]
  findings: RiskFinding[]
  selectedInstanceId: string | null
  setRoom: (roomId: string) => void
  placeFurniture: (def: FurnitureDefinition, gridX: number, gridY: number) => void
  moveFurniture: (instanceId: string, gridX: number, gridY: number) => void
  removeFurniture: (instanceId: string) => void
  toggleAnchor: (instanceId: string) => void
  rotateFurniture: (instanceId: string) => void
  selectFurniture: (instanceId: string | null) => void
  resetAll: () => void
}

function recalculate(placed: PlacedFurniture[], room: RoomTemplate): RiskFinding[] {
  return assessRisk(placed, room)
}

export const useFloorPlanStore = create<FloorPlanState>((set, get) => ({
  room: roomTemplates[0],
  placedFurniture: [],
  findings: [],
  selectedInstanceId: null,

  setRoom(roomId) {
    const room = roomTemplates.find(r => r.id === roomId) ?? roomTemplates[0]
    set({ room, placedFurniture: [], findings: [], selectedInstanceId: null })
  },

  placeFurniture(def, gridX, gridY) {
    const newItem: PlacedFurniture = {
      instanceId: uuidv4(),
      definitionId: def.id,
      gridX,
      gridY,
      rotation: 0,
      isAnchored: false,
    }
    const placed = [...get().placedFurniture, newItem]
    set({ placedFurniture: placed, findings: recalculate(placed, get().room) })
  },

  moveFurniture(instanceId, gridX, gridY) {
    const placed = get().placedFurniture.map(pf =>
      pf.instanceId === instanceId ? { ...pf, gridX, gridY } : pf
    )
    set({ placedFurniture: placed, findings: recalculate(placed, get().room) })
  },

  removeFurniture(instanceId) {
    const placed = get().placedFurniture.filter(pf => pf.instanceId !== instanceId)
    set({
      placedFurniture: placed,
      findings: recalculate(placed, get().room),
      selectedInstanceId: get().selectedInstanceId === instanceId ? null : get().selectedInstanceId,
    })
  },

  toggleAnchor(instanceId) {
    const placed = get().placedFurniture.map(pf =>
      pf.instanceId === instanceId ? { ...pf, isAnchored: !pf.isAnchored } : pf
    )
    set({ placedFurniture: placed, findings: recalculate(placed, get().room) })
  },

  rotateFurniture(instanceId) {
    const placed = get().placedFurniture.map(pf => {
      if (pf.instanceId !== instanceId) return pf
      const next: Rotation = pf.rotation === 270 ? 0 : ((pf.rotation + 90) as Rotation)
      return { ...pf, rotation: next }
    })
    set({ placedFurniture: placed, findings: recalculate(placed, get().room) })
  },

  selectFurniture(instanceId) {
    set({ selectedInstanceId: instanceId })
  },

  resetAll() {
    set({ placedFurniture: [], findings: [], selectedInstanceId: null })
  },
}))
