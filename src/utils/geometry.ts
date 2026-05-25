import type { GridRect, PlacedFurniture, FurnitureDefinition, RoomTemplate } from '@/types'

export function getBoundingBox(pf: PlacedFurniture, def: FurnitureDefinition): GridRect {
  const w = pf.rotation === 0 || pf.rotation === 180 ? def.widthCells : def.heightCells
  const h = pf.rotation === 0 || pf.rotation === 180 ? def.heightCells : def.widthCells
  return { x: pf.gridX, y: pf.gridY, w, h }
}

export function doRectsOverlap(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function distanceBetweenRects(a: GridRect, b: GridRect): number {
  const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w))
  const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h))
  return Math.sqrt(dx * dx + dy * dy)
}

export function cellsAdjacentToDoor(door: GridRect, margin: number = 1): GridRect {
  return {
    x: door.x - margin,
    y: door.y - margin,
    w: door.w + margin * 2,
    h: door.h + margin * 2,
  }
}

export function isRectInRoom(rect: GridRect, room: RoomTemplate): boolean {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= room.widthCells && rect.y + rect.h <= room.heightCells
}

export function hasSleepingFurnitureNearby(
  rect: GridRect,
  placed: PlacedFurniture[],
  defs: Map<string, FurnitureDefinition>,
  maxDist: number
): boolean {
  return placed.some(pf => {
    const def = defs.get(pf.definitionId)
    if (!def || def.category !== 'sleeping') return false
    const box = getBoundingBox(pf, def)
    return distanceBetweenRects(rect, box) <= maxDist
  })
}
