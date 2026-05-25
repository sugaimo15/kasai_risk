export const TW = 48        // tile diamond width in screen pixels
export const TH = 24        // tile diamond height (TW/2)
export const ROOM_WALL_H = 48   // room wall height in pixels
export const PADDING = 16

export function toIso(col: number, row: number, originX: number, originY: number): [number, number] {
  return [
    originX + (col - row) * (TW / 2),
    originY + (col + row) * (TH / 2),
  ]
}

export function fromIso(screenX: number, screenY: number, originX: number, originY: number): [number, number] {
  const dx = (screenX - originX) / (TW / 2)
  const dy = (screenY - originY) / (TH / 2)
  return [(dx + dy) / 2, (dy - dx) / 2]
}

export function calcOrigin(heightCells: number): { originX: number; originY: number } {
  return {
    originX: heightCells * (TW / 2) + PADDING,
    originY: ROOM_WALL_H + PADDING,
  }
}

export function calcSVGSize(widthCells: number, heightCells: number): { svgW: number; svgH: number } {
  return {
    svgW: (widthCells + heightCells) * (TW / 2) + PADDING * 2,
    svgH: (widthCells + heightCells) * (TH / 2) + ROOM_WALL_H + PADDING * 2,
  }
}

export function hexDarken(hex: string, factor: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 0xff) * factor)))
  const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 0xff) * factor)))
  const b = Math.max(0, Math.min(255, Math.round((num & 0xff) * factor)))
  return `rgb(${r},${g},${b})`
}

export function hexLighten(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount)))
  const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount)))
  const b = Math.max(0, Math.min(255, Math.round((num & 0xff) + (255 - (num & 0xff)) * amount)))
  return `rgb(${r},${g},${b})`
}
