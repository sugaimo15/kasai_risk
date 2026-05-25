import type { RoomTemplate } from '@/types'

export const roomTemplates: RoomTemplate[] = [
  {
    id: 'ldk',
    labelKey: 'room.ldk',
    widthCells: 14,
    heightCells: 10,
    doors: [{ x: 6, y: 9, w: 2, h: 1 }, { x: 13, y: 4, w: 1, h: 2 }],
    windows: [{ x: 0, y: 2, w: 1, h: 3 }, { x: 4, y: 0, w: 4, h: 1 }],
    floorType: 'wood',
  },
  {
    id: 'bedroom',
    labelKey: 'room.bedroom',
    widthCells: 11,
    heightCells: 9,
    doors: [{ x: 4, y: 8, w: 2, h: 1 }],
    windows: [{ x: 0, y: 3, w: 1, h: 2 }, { x: 3, y: 0, w: 3, h: 1 }],
    floorType: 'tatami',
  },
  {
    id: 'childrens_room',
    labelKey: 'room.childrens_room',
    widthCells: 9,
    heightCells: 8,
    doors: [{ x: 3, y: 7, w: 2, h: 1 }],
    windows: [{ x: 0, y: 2, w: 1, h: 2 }, { x: 2, y: 0, w: 3, h: 1 }],
    floorType: 'wood',
  },
  {
    id: 'entrance',
    labelKey: 'room.entrance',
    widthCells: 8,
    heightCells: 6,
    doors: [{ x: 3, y: 5, w: 2, h: 1 }, { x: 7, y: 2, w: 1, h: 2 }],
    windows: [],
    floorType: 'tile',
  },
]

export const getRoomById = (id: string): RoomTemplate | undefined =>
  roomTemplates.find(r => r.id === id)
