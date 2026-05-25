import type { RoomTemplate } from '@/types'
import { toIso, ROOM_WALL_H } from '@/utils/isometric'

const floorTiles: Record<string, [string, string]> = {
  wood:     ['#D4A870', '#C89858'],
  tatami:   ['#B8C060', '#A8B050'],
  tile:     ['#D8D8E0', '#C4C4CE'],
  concrete: ['#C0C0C0', '#B4B4B4'],
}

const WALL_RIGHT = '#EEE8D8'   // right back wall (row=0, brighter/lit)
const WALL_LEFT  = '#D8D0C0'   // left back wall  (col=0, shadowed)
const WALL_WIN   = '#A8C8E8'   // window glass
const WALL_DOOR  = '#C8B490'   // door opening

interface RoomProps {
  room: RoomTemplate
  originX: number
  originY: number
}

export default function Room({ room, originX, originY }: RoomProps) {
  const { widthCells, heightCells, floorType, windows, doors } = room
  const [c1, c2] = floorTiles[floorType]

  function iso(c: number, r: number) {
    return toIso(c, r, originX, originY)
  }

  function pts(...coords: [number, number][]) {
    return coords.map(([x, y]) => `${x},${y}`).join(' ')
  }

  return (
    <g>
      {/* ── Shadow under the room ──────────────────────────── */}
      <ellipse
        cx={originX}
        cy={originY + (widthCells + heightCells) * 12 + ROOM_WALL_H / 2}
        rx={(widthCells + heightCells) * 12}
        ry={(widthCells + heightCells) * 4}
        fill="rgba(0,0,0,0.12)"
      />

      {/* ── Floor tiles ────────────────────────────────────── */}
      {Array.from({ length: widthCells }, (_, col) =>
        Array.from({ length: heightCells }, (_, row) => {
          const [tx, ty] = iso(col, row)
          const [rx, ry] = iso(col + 1, row)
          const [bx, by] = iso(col + 1, row + 1)
          const [lx, ly] = iso(col, row + 1)
          const fill = (col + row) % 2 === 0 ? c1 : c2
          return (
            <polygon
              key={`f-${col}-${row}`}
              points={pts([tx, ty], [rx, ry], [bx, by], [lx, ly])}
              fill={fill}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={0.5}
            />
          )
        })
      )}

      {/* ── Left back wall (along col=0) ───────────────────── */}
      {Array.from({ length: heightCells }, (_, row) => {
        const [lx, ly] = iso(0, row)
        const [bx, by] = iso(0, row + 1)
        const isWin = windows.some(w => w.x === 0 && w.y <= row && w.y + w.h > row)
        const isDoor = doors.some(d => d.x === 0 && d.y <= row && d.y + d.h > row)
        const fill = isDoor ? WALL_DOOR : isWin ? WALL_WIN : WALL_LEFT
        return (
          <g key={`lw-${row}`}>
            <polygon
              points={pts([lx, ly - ROOM_WALL_H], [bx, by - ROOM_WALL_H], [bx, by], [lx, ly])}
              fill={fill}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={1}
            />
            {isWin && (
              <>
                <line x1={lx} y1={ly - ROOM_WALL_H * 0.7} x2={bx} y2={by - ROOM_WALL_H * 0.7}
                  stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                <line x1={lx} y1={ly - ROOM_WALL_H * 0.35} x2={bx} y2={by - ROOM_WALL_H * 0.35}
                  stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
              </>
            )}
          </g>
        )
      })}

      {/* ── Right back wall (along row=0) ──────────────────── */}
      {Array.from({ length: widthCells }, (_, col) => {
        const [tx, ty] = iso(col, 0)
        const [rx, ry] = iso(col + 1, 0)
        const isWin = windows.some(w => w.y === 0 && w.x <= col && w.x + w.w > col)
        const isDoor = doors.some(d => d.y === 0 && d.x <= col && d.x + d.w > col)
        const fill = isDoor ? WALL_DOOR : isWin ? WALL_WIN : WALL_RIGHT
        return (
          <g key={`rw-${col}`}>
            <polygon
              points={pts([tx, ty - ROOM_WALL_H], [rx, ry - ROOM_WALL_H], [rx, ry], [tx, ty])}
              fill={fill}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={1}
            />
            {isWin && (
              <>
                <line x1={tx} y1={ty - ROOM_WALL_H * 0.7} x2={rx} y2={ry - ROOM_WALL_H * 0.7}
                  stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                <line x1={tx} y1={ty - ROOM_WALL_H * 0.35} x2={rx} y2={ry - ROOM_WALL_H * 0.35}
                  stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
              </>
            )}
          </g>
        )
      })}

      {/* ── Wall top edge (ridge line) ─────────────────────── */}
      {/* Left wall ridge */}
      <polyline
        points={[
          iso(0, 0), iso(0, heightCells)
        ].map(([x, y]) => `${x},${y - ROOM_WALL_H}`).join(' ')}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={1.5}
      />
      {/* Right wall ridge */}
      <polyline
        points={[
          iso(0, 0), iso(widthCells, 0)
        ].map(([x, y]) => `${x},${y - ROOM_WALL_H}`).join(' ')}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={1.5}
      />
    </g>
  )
}
