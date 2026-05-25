import type { RiskRule, PlacedFurniture, GridRect } from '@/types'
import { furnitureDefinitions } from '@/data/furniture'
import {
  getBoundingBox,
  distanceBetweenRects,
  cellsAdjacentToDoor,
  doRectsOverlap,
  hasSleepingFurnitureNearby,
} from '@/utils/geometry'

const defMap = new Map(furnitureDefinitions.map(f => [f.id, f]))

function getBox(pf: PlacedFurniture) {
  const def = defMap.get(pf.definitionId)
  return def ? getBoundingBox(pf, def) : null
}

function getDef(pf: PlacedFurniture) {
  return defMap.get(pf.definitionId)
}

export const riskRules: RiskRule[] = [
  {
    id: 'exit_blocked',
    titleKey: 'risk.exit_blocked.title',
    severity: 'high',
    riskType: 'evacuation',
    triggerFn(placed, room) {
      const allDoors = room.doors
      const affected: string[] = []
      const zones: GridRect[] = []

      for (const door of allDoors) {
        const zone = cellsAdjacentToDoor(door, 1)
        for (const pf of placed) {
          const def = getDef(pf)
          if (!def) continue
          const box = getBoundingBox(pf, def)
          if (doRectsOverlap(box, zone)) {
            affected.push(pf.instanceId)
            zones.push(zone)
          }
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: [...new Set(affected)],
        affectedZones: zones,
        detailKey: 'risk.exit_blocked.detail',
        fixSuggestionKey: 'risk.exit_blocked.fix',
      }
    },
  },
  {
    id: 'fire_source_near_flammable',
    titleKey: 'risk.fire_source_near_flammable.title',
    severity: 'high',
    riskType: 'fire',
    triggerFn(placed) {
      const fireSources = placed.filter(pf => getDef(pf)?.riskTags.includes('fire_source'))
      const flammables = placed.filter(pf => getDef(pf)?.riskTags.includes('flammable'))

      const affected: string[] = []
      const zones: GridRect[] = []

      for (const src of fireSources) {
        const srcBox = getBox(src)
        if (!srcBox) continue
        for (const flm of flammables) {
          const flmBox = getBox(flm)
          if (!flmBox) continue
          if (distanceBetweenRects(srcBox, flmBox) <= 2) {
            affected.push(src.instanceId, flm.instanceId)
            zones.push(srcBox, flmBox)
          }
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: [...new Set(affected)],
        affectedZones: zones,
        detailKey: 'risk.fire_source_near_flammable.detail',
        fixSuggestionKey: 'risk.fire_source_near_flammable.fix',
      }
    },
  },
  {
    id: 'tall_furniture_unanchored',
    titleKey: 'risk.tall_furniture_unanchored.title',
    severity: 'high',
    riskType: 'earthquake',
    triggerFn(placed) {
      const affected: string[] = []
      const zones: GridRect[] = []

      for (const pf of placed) {
        const def = getDef(pf)
        if (!def) continue
        if (!def.riskTags.includes('topple_hazard') || def.weight !== 'heavy' || !def.anchorable) continue
        if (pf.isAnchored) continue
        const box = getBoundingBox(pf, def)
        if (hasSleepingFurnitureNearby(box, placed, defMap, 3)) {
          affected.push(pf.instanceId)
          zones.push(box)
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: affected,
        affectedZones: zones,
        detailKey: 'risk.tall_furniture_unanchored.detail',
        fixSuggestionKey: 'risk.tall_furniture_unanchored.fix',
      }
    },
  },
  {
    id: 'tall_furniture_near_exit',
    titleKey: 'risk.tall_furniture_near_exit.title',
    severity: 'medium',
    riskType: 'earthquake',
    triggerFn(placed, room) {
      const affected: string[] = []
      const zones: GridRect[] = []

      const exits = [...room.doors, ...room.windows]
      for (const pf of placed) {
        const def = getDef(pf)
        if (!def || !def.riskTags.includes('topple_hazard')) continue
        const box = getBoundingBox(pf, def)
        for (const exit of exits) {
          if (distanceBetweenRects(box, exit) <= 2) {
            affected.push(pf.instanceId)
            zones.push(box)
            break
          }
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: [...new Set(affected)],
        affectedZones: zones,
        detailKey: 'risk.tall_furniture_near_exit.detail',
        fixSuggestionKey: 'risk.tall_furniture_near_exit.fix',
      }
    },
  },
  {
    id: 'heavy_overhead_storage',
    titleKey: 'risk.heavy_overhead_storage.title',
    severity: 'high',
    riskType: 'earthquake',
    triggerFn(placed) {
      const affected: string[] = []
      const zones: GridRect[] = []

      for (const pf of placed) {
        const def = getDef(pf)
        if (!def || !def.riskTags.includes('heavy_overhead')) continue
        const box = getBoundingBox(pf, def)
        if (hasSleepingFurnitureNearby(box, placed, defMap, 2)) {
          affected.push(pf.instanceId)
          zones.push(box)
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: affected,
        affectedZones: zones,
        detailKey: 'risk.heavy_overhead_storage.detail',
        fixSuggestionKey: 'risk.heavy_overhead_storage.fix',
      }
    },
  },
  {
    id: 'multiple_fire_sources_close',
    titleKey: 'risk.multiple_fire_sources_close.title',
    severity: 'medium',
    riskType: 'fire',
    triggerFn(placed) {
      const fireSources = placed.filter(pf => getDef(pf)?.riskTags.includes('fire_source'))
      if (fireSources.length < 2) return null

      const affected: string[] = []
      const zones: GridRect[] = []

      for (let i = 0; i < fireSources.length; i++) {
        for (let j = i + 1; j < fireSources.length; j++) {
          const boxA = getBox(fireSources[i])
          const boxB = getBox(fireSources[j])
          if (boxA && boxB && distanceBetweenRects(boxA, boxB) <= 3) {
            affected.push(fireSources[i].instanceId, fireSources[j].instanceId)
            zones.push(boxA, boxB)
          }
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: [...new Set(affected)],
        affectedZones: zones,
        detailKey: 'risk.multiple_fire_sources_close.detail',
        fixSuggestionKey: 'risk.multiple_fire_sources_close.fix',
      }
    },
  },
  {
    id: 'curtain_near_gas',
    titleKey: 'risk.curtain_near_gas.title',
    severity: 'high',
    riskType: 'fire',
    triggerFn(placed) {
      const curtains = placed.filter(pf => pf.definitionId === 'curtain')
      const gasSources = placed.filter(pf => getDef(pf)?.riskTags.includes('fire_source'))

      const affected: string[] = []
      const zones: GridRect[] = []

      for (const curtain of curtains) {
        const curtainBox = getBox(curtain)
        if (!curtainBox) continue
        for (const gas of gasSources) {
          const gasBox = getBox(gas)
          if (!gasBox) continue
          if (distanceBetweenRects(curtainBox, gasBox) <= 2) {
            affected.push(curtain.instanceId, gas.instanceId)
            zones.push(curtainBox, gasBox)
          }
        }
      }

      if (affected.length === 0) return null
      return {
        affectedIds: [...new Set(affected)],
        affectedZones: zones,
        detailKey: 'risk.curtain_near_gas.detail',
        fixSuggestionKey: 'risk.curtain_near_gas.fix',
      }
    },
  },
  {
    id: 'narrow_escape_path',
    titleKey: 'risk.narrow_escape_path.title',
    severity: 'medium',
    riskType: 'evacuation',
    triggerFn(placed, room) {
      if (room.doors.length === 0) return null

      const door = room.doors[0]
      const doorCenterX = door.x + door.w / 2
      const doorCenterY = door.y + door.h / 2

      const roomCenterX = room.widthCells / 2
      const roomCenterY = room.heightCells / 2

      const pathCells: GridRect[] = []
      const steps = 5
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const cx = Math.round(roomCenterX + (doorCenterX - roomCenterX) * t)
        const cy = Math.round(roomCenterY + (doorCenterY - roomCenterY) * t)
        pathCells.push({ x: cx - 1, y: cy - 1, w: 2, h: 2 })
      }

      const blocking: string[] = []

      for (const pf of placed) {
        const def = getDef(pf)
        if (!def) continue
        const box = getBoundingBox(pf, def)
        for (const cell of pathCells) {
          if (doRectsOverlap(box, cell)) {
            blocking.push(pf.instanceId)
            break
          }
        }
      }

      if (blocking.length < 2) return null
      return {
        affectedIds: [...new Set(blocking)],
        affectedZones: pathCells,
        detailKey: 'risk.narrow_escape_path.detail',
        fixSuggestionKey: 'risk.narrow_escape_path.fix',
      }
    },
  },
  {
    id: 'furniture_cluster_bedroom',
    titleKey: 'risk.furniture_cluster_bedroom.title',
    severity: 'low',
    riskType: 'earthquake',
    triggerFn(placed, room) {
      if (room.floorType !== 'tatami' && room.id !== 'bedroom' && room.id !== 'childrens_room') return null

      const heavyItems = placed.filter(pf => getDef(pf)?.weight === 'heavy')
      if (heavyItems.length <= 4) return null

      return {
        affectedIds: heavyItems.map(pf => pf.instanceId),
        affectedZones: heavyItems.map(pf => getBox(pf)).filter((b): b is GridRect => b !== null),
        detailKey: 'risk.furniture_cluster_bedroom.detail',
        fixSuggestionKey: 'risk.furniture_cluster_bedroom.fix',
      }
    },
  },
  {
    id: 'unanchored_topple_general',
    titleKey: 'risk.unanchored_topple_general.title',
    severity: 'medium',
    riskType: 'earthquake',
    triggerFn(placed) {
      const affected = placed.filter(pf => {
        const def = getDef(pf)
        return def && def.riskTags.includes('topple_hazard') && def.anchorable && !pf.isAnchored
      })

      if (affected.length === 0) return null
      return {
        affectedIds: affected.map(pf => pf.instanceId),
        affectedZones: affected.map(pf => getBox(pf)).filter((b): b is GridRect => b !== null),
        detailKey: 'risk.unanchored_topple_general.detail',
        fixSuggestionKey: 'risk.unanchored_topple_general.fix',
      }
    },
  },
]
