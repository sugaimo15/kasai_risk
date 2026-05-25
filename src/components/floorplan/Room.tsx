import type { RoomTemplate } from '@/types'

const floorColors: Record<string, string> = {
  wood: '#DEB887',
  tatami: '#C8C87A',
  tile: '#D0D0D8',
  concrete: '#B8B8B8',
}

const floorPattern: Record<string, string> = {
  wood: 'wood',
  tatami: 'tatami',
  tile: 'tile',
  concrete: 'concrete',
}

interface RoomProps {
  room: RoomTemplate
  cellSize: number
}

export default function Room({ room, cellSize: C }: RoomProps) {
  const W = room.widthCells * C
  const H = room.heightCells * C
  const baseColor = floorColors[room.floorType]

  return (
    <g>
      <defs>
        <pattern id="wood" x="0" y="0" width={C} height={C / 4} patternUnits="userSpaceOnUse">
          <rect width={C} height={C / 4} fill={baseColor} />
          <line x1="0" y1={C / 8} x2={C} y2={C / 8} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
        </pattern>
        <pattern id="tatami" x="0" y="0" width={C * 2} height={C} patternUnits="userSpaceOnUse">
          <rect width={C * 2} height={C} fill={baseColor} />
          <rect x="0" y="0" width={C} height={C} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          <rect x={C} y="0" width={C} height={C} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        </pattern>
        <pattern id="tile" x="0" y="0" width={C} height={C} patternUnits="userSpaceOnUse">
          <rect width={C} height={C} fill={baseColor} />
          <rect x="0" y="0" width={C} height={C} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </pattern>
        <pattern id="concrete" x="0" y="0" width={C} height={C} patternUnits="userSpaceOnUse">
          <rect width={C} height={C} fill={baseColor} />
        </pattern>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={`url(#${floorPattern[room.floorType]})`} />

      {room.windows.map((win, i) => (
        <g key={`win-${i}`}>
          {win.x === 0 && (
            <>
              <rect x={0} y={win.y * C} width={4} height={win.h * C} fill="#A8C8E8" />
              <line x1={2} y1={win.y * C} x2={2} y2={(win.y + win.h) * C} stroke="#6A9FCC" strokeWidth={1} />
            </>
          )}
          {win.y === 0 && (
            <>
              <rect x={win.x * C} y={0} width={win.w * C} height={4} fill="#A8C8E8" />
              <line x1={win.x * C} y1={2} x2={(win.x + win.w) * C} y2={2} stroke="#6A9FCC" strokeWidth={1} />
            </>
          )}
        </g>
      ))}

      {room.doors.map((door, i) => (
        <g key={`door-${i}`}>
          {door.y === room.heightCells - 1 && (
            <>
              <rect x={door.x * C} y={H - 6} width={door.w * C} height={6} fill="#F5DEB3" stroke="#8B6914" strokeWidth={1} />
              <path
                d={`M ${door.x * C} ${H - 6} A ${door.w * C} ${door.w * C} 0 0 1 ${(door.x + door.w) * C} ${H - 6}`}
                fill="none" stroke="#8B6914" strokeWidth={1} strokeDasharray="3 2"
              />
            </>
          )}
          {door.x === room.widthCells - 1 && (
            <>
              <rect x={W - 6} y={door.y * C} width={6} height={door.h * C} fill="#F5DEB3" stroke="#8B6914" strokeWidth={1} />
            </>
          )}
        </g>
      ))}

      <rect x="0" y="0" width={W} height={H} fill="none" stroke="#555" strokeWidth={6} />

      {room.doors.map((door, i) => (
        <rect key={`door-gap-${i}`}
          x={door.x * C} y={door.y * C}
          width={door.w * C} height={door.h * C}
          fill={floorColors[room.floorType]}
          stroke="none"
        />
      ))}
    </g>
  )
}
