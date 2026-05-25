import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlacedFurniture, FurnitureDefinition, GridRect } from '@/types'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { toIso, hexDarken, hexLighten, TW, TH } from '@/utils/isometric'

interface FurnitureItemProps {
  pf: PlacedFurniture
  def: FurnitureDefinition
  box: GridRect
  originX: number
  originY: number
  isAffected: boolean
  isDragging: boolean
  disableInteraction?: boolean
  onDragStart: () => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: (clientX: number, clientY: number) => void
}

// ─── Face-point helpers ───────────────────────────────────────────────────────
// All coordinates in SCREEN pixels.

/** Point on the LEFT (SW) face.
 *  u ∈ [0,1] = west→south along bottom edge
 *  vPx = height from floor (0=floor, H=top) */
function makeLeftPt(lx: number, ly: number, bx: number, by: number) {
  return (u: number, vPx: number): [number, number] =>
    [lx + u * (bx - lx), ly + u * (by - ly) - vPx]
}

/** Point on the RIGHT (SE) face.
 *  u ∈ [0,1] = south→east along bottom edge */
function makeRightPt(bx: number, by: number, rx: number, ry: number) {
  return (u: number, vPx: number): [number, number] =>
    [bx + u * (rx - bx), by + u * (ry - by) - vPx]
}

/** Point on the TOP face using grid fractions.
 *  cF ∈ [0,1] = west→east  rF ∈ [0,1] = north→south */
function makeTopPt(col: number, row: number, w: number, h: number, H: number, oX: number, oY: number) {
  return (cF: number, rF: number): [number, number] => {
    const [x, y] = toIso(col + cF * w, row + rF * h, oX, oY)
    return [x, y - H]
  }
}

function pts(...coords: [number, number][]) {
  return coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// ─── Per-furniture decorations ────────────────────────────────────────────────
function renderDecal(
  def: FurnitureDefinition,
  col: number, row: number, w: number, h: number, H: number,
  lx: number, ly: number,
  bx: number, by: number,
  rx: number, ry: number,
  originX: number, originY: number,
): React.ReactNode {
  const LP = makeLeftPt(lx, ly, bx, by)
  const RP = makeRightPt(bx, by, rx, ry)
  const TP = makeTopPt(col, row, w, h, H, originX, originY)

  // Isometric ellipse radii for 1 grid unit
  const eRx = TW / 2  // 24
  const eRy = TH / 2  // 12

  switch (def.id) {
    // ── ガスコンロ ────────────────────────────────
    case 'gas_stove': {
      const burners = w >= h
        ? [[0.25, 0.5], [0.75, 0.5]]
        : [[0.5, 0.25], [0.5, 0.75]]
      return (
        <g pointerEvents="none">
          {/* Dark cooking surface on top */}
          <polygon points={pts(TP(0,0), TP(1,0), TP(1,1), TP(0,1))} fill="#2A2A2A" opacity={0.5} />
          {/* Grate lines */}
          {[0.33, 0.67].map(f => (
            <line key={f} x1={TP(f,0)[0]} y1={TP(f,0)[1]} x2={TP(f,1)[0]} y2={TP(f,1)[1]}
              stroke="#555" strokeWidth={1.5} />
          ))}
          {/* Burner rings */}
          {burners.map(([cF, rF], i) => {
            const [cx, cy] = TP(cF, rF)
            const r = 0.28
            return (
              <g key={i}>
                <ellipse cx={cx} cy={cy} rx={r * eRx * w} ry={r * eRy * w} fill="#1A1A1A" stroke="#666" strokeWidth={1.5} />
                <ellipse cx={cx} cy={cy} rx={r * eRx * w * 0.5} ry={r * eRy * w * 0.5} fill="#444" />
                <ellipse cx={cx} cy={cy} rx={r * eRx * w * 0.2} ry={r * eRy * w * 0.2} fill="#222" />
              </g>
            )
          })}
          {/* Control knobs strip */}
          {(() => {
            const [ax, ay] = LP(0, H * 0.15)
            const [bx2, by2] = LP(1, H * 0.15)
            const [cx2, cy2] = LP(1, 0)
            const [dx, dy] = LP(0, 0)
            return <polygon points={pts([ax,ay],[bx2,by2],[cx2,cy2],[dx,dy])} fill="#555" />
          })()}
        </g>
      )
    }

    // ── 本棚（高・低）────────────────────────────
    case 'bookshelf_tall':
    case 'bookshelf_short': {
      const numShelves = def.id === 'bookshelf_tall' ? 4 : 2
      const bookColors = ['#E53E3E','#3182CE','#38A169','#D69E2E','#805AD5','#DD6B20','#2B6CB0']
      const elems: React.ReactNode[] = []

      // Shelf lines on left face
      for (let i = 1; i < numShelves; i++) {
        const vPx = (i / numShelves) * H
        elems.push(
          <line key={`ls${i}`}
            x1={LP(0, vPx)[0]} y1={LP(0, vPx)[1]}
            x2={LP(1, vPx)[0]} y2={LP(1, vPx)[1]}
            stroke="rgba(0,0,0,0.55)" strokeWidth={2} />,
          <line key={`rs${i}`}
            x1={RP(0, vPx)[0]} y1={RP(0, vPx)[1]}
            x2={RP(1, vPx)[0]} y2={RP(1, vPx)[1]}
            stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
        )
      }

      // Book spines in each shelf section (on left face)
      for (let s = 0; s < numShelves; s++) {
        const vBot = (s / numShelves) * H + 2
        const vTop = ((s + 1) / numShelves) * H - 2
        const numBooks = Math.max(2, Math.floor(w * 2.5))
        for (let b = 0; b < numBooks; b++) {
          const u1 = b / numBooks
          const u2 = (b + 0.72) / numBooks
          const color = bookColors[(s * numBooks + b) % bookColors.length]
          elems.push(
            <polygon key={`bk${s}-${b}`}
              points={pts(LP(u1, vTop), LP(u2, vTop), LP(u2, vBot), LP(u1, vBot))}
              fill={color} opacity={0.85} />
          )
        }
      }
      return <g pointerEvents="none">{elems}</g>
    }

    // ── 冷蔵庫 ───────────────────────────────────
    case 'refrigerator': {
      // Freezer compartment seam (~25% from top on right face)
      const freezeV = H * 0.72
      // Door handle on right face
      const handleU = 0.25
      const hTop = H * 0.55
      const hBot = H * 0.35
      return (
        <g pointerEvents="none">
          {/* Freezer line */}
          <line
            x1={RP(0, freezeV)[0]} y1={RP(0, freezeV)[1]}
            x2={RP(1, freezeV)[0]} y2={RP(1, freezeV)[1]}
            stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
          <line
            x1={LP(0, freezeV)[0]} y1={LP(0, freezeV)[1]}
            x2={LP(1, freezeV)[0]} y2={LP(1, freezeV)[1]}
            stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
          {/* Handles */}
          <line
            x1={RP(handleU, hTop)[0]} y1={RP(handleU, hTop)[1]}
            x2={RP(handleU, hBot)[0]} y2={RP(handleU, hBot)[1]}
            stroke="#888" strokeWidth={3} strokeLinecap="round" />
          <line
            x1={LP(1 - handleU, hTop)[0]} y1={LP(1 - handleU, hTop)[1]}
            x2={LP(1 - handleU, hBot)[0]} y2={LP(1 - handleU, hBot)[1]}
            stroke="#888" strokeWidth={3} strokeLinecap="round" />
          {/* Ventilation grille at bottom */}
          {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(u => (
            <line key={u}
              x1={RP(u, H * 0.08)[0]} y1={RP(u, H * 0.08)[1]}
              x2={RP(u, H * 0.04)[0]} y2={RP(u, H * 0.04)[1]}
              stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
          ))}
        </g>
      )
    }

    // ── ソファ ───────────────────────────────────
    case 'sofa_3seat':
    case 'sofa_1seat': {
      const numCushions = def.id === 'sofa_3seat' ? 3 : 1
      const elems: React.ReactNode[] = []
      // Cushion dividers on top
      for (let i = 1; i < numCushions; i++) {
        const cF = i / numCushions
        elems.push(
          <line key={i}
            x1={TP(cF, 0.1)[0]} y1={TP(cF, 0.1)[1]}
            x2={TP(cF, 0.85)[0]} y2={TP(cF, 0.85)[1]}
            stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
        )
      }
      // Back cushion visible as taller strip on back of sofa (left face)
      const backTop = LP(0, H)
      const backBot = LP(0, H * 0.5)
      const backTop2 = LP(1, H)
      const backBot2 = LP(1, H * 0.5)
      elems.push(
        <polygon key="back"
          points={pts(backTop, backTop2, backBot2, backBot)}
          fill={hexLighten(def.color, 0.15)} opacity={0.9} />
      )
      return <g pointerEvents="none">{elems}</g>
    }

    // ── ベッド ───────────────────────────────────
    case 'bed_single':
    case 'bed_double': {
      // Pillow area at top (≈20% of depth)
      const pillowRowFrac = 0.22
      return (
        <g pointerEvents="none">
          {/* Mattress / blanket surface */}
          <polygon
            points={pts(TP(0.05,pillowRowFrac), TP(0.95,pillowRowFrac), TP(0.95,0.95), TP(0.05,0.95))}
            fill="#E8D8F0" opacity={0.8} />
          {/* Pillow */}
          <polygon
            points={pts(TP(0.1,0.03), TP(0.9,0.03), TP(0.9,pillowRowFrac), TP(0.1,pillowRowFrac))}
            fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
          {/* Quilt lines */}
          {[0.4, 0.6, 0.75].map(rF => (
            <line key={rF}
              x1={TP(0.05, rF)[0]} y1={TP(0.05, rF)[1]}
              x2={TP(0.95, rF)[0]} y2={TP(0.95, rF)[1]}
              stroke="rgba(150,100,200,0.35)" strokeWidth={1} />
          ))}
          {/* Bed frame sides */}
          <polygon
            points={pts(LP(0, H), LP(1, H), LP(1, H * 0.35), LP(0, H * 0.35))}
            fill={hexDarken(def.color, 0.7)} opacity={0.8} />
        </g>
      )
    }

    // ── ワードローブ ─────────────────────────────
    case 'wardrobe': {
      const elems: React.ReactNode[] = []
      // Door panels on left face
      const numDoors = Math.max(1, Math.round(w))
      for (let d = 0; d < numDoors; d++) {
        const u1 = d / numDoors + 0.04
        const u2 = (d + 1) / numDoors - 0.04
        elems.push(
          <polygon key={d}
            points={pts(LP(u1, H * 0.92), LP(u2, H * 0.92), LP(u2, H * 0.06), LP(u1, H * 0.06))}
            fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />,
          // Handle dot
          <circle key={`h${d}`}
            cx={(LP(u2 - 0.08, H * 0.5)[0] + LP(u2 - 0.08, H * 0.5)[0]) / 2}
            cy={LP(u2 - 0.08, H * 0.5)[1]}
            r={2} fill="rgba(255,255,255,0.6)" />
        )
      }
      return <g pointerEvents="none">{elems}</g>
    }

    // ── テレビ台 ─────────────────────────────────
    case 'tv_stand': {
      // TV screen on top face
      return (
        <g pointerEvents="none">
          <polygon
            points={pts(TP(0.08,0.12), TP(0.92,0.12), TP(0.92,0.88), TP(0.08,0.88))}
            fill="#1A1A2E" stroke="#333" strokeWidth={1} />
          {/* Screen glare */}
          <polygon
            points={pts(TP(0.12,0.15), TP(0.35,0.15), TP(0.35,0.4), TP(0.12,0.4))}
            fill="rgba(255,255,255,0.12)" />
        </g>
      )
    }

    // ── カーテン ─────────────────────────────────
    case 'curtain': {
      // Vertical drape folds on left face
      const numFolds = Math.max(4, Math.round(w * 3))
      const elems: React.ReactNode[] = []
      for (let i = 1; i < numFolds; i++) {
        const u = i / numFolds
        const isHigh = i % 2 === 0
        elems.push(
          <line key={i}
            x1={LP(u, H)[0]} y1={LP(u, H)[1]}
            x2={LP(u, 0)[0]} y2={LP(u, 0)[1]}
            stroke={isHigh ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            strokeWidth={1.5} />
        )
      }
      // Curtain rod on top
      elems.push(
        <line key="rod"
          x1={TP(0, 0)[0]} y1={TP(0, 0)[1]}
          x2={TP(1, 0)[0]} y2={TP(1, 0)[1]}
          stroke="#8B6914" strokeWidth={3} />
      )
      return <g pointerEvents="none">{elems}</g>
    }

    // ── ピアノ ───────────────────────────────────
    case 'piano': {
      // White and black keys on top face
      const numKeys = 14
      const elems: React.ReactNode[] = []
      for (let k = 0; k < numKeys; k++) {
        const cF1 = k / numKeys
        const cF2 = (k + 0.9) / numKeys
        const isBlack = [1, 3, 6, 8, 10, 13].includes(k % 12)
        elems.push(
          <polygon key={k}
            points={pts(TP(cF1,0.55), TP(cF2,0.55), TP(cF2,0.95), TP(cF1,0.95))}
            fill={isBlack ? '#111' : '#F8F8F0'}
            stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
        )
      }
      // Keyboard lid edge
      elems.push(
        <polygon key="lid"
          points={pts(TP(0,0.1), TP(1,0.1), TP(1,0.55), TP(0,0.55))}
          fill="#111" />
      )
      return <g pointerEvents="none">{elems}</g>
    }

    // ── ダイニングテーブル ───────────────────────
    case 'dining_table': {
      // Table surface outline + leg dots at corners
      const margin = 0.06
      return (
        <g pointerEvents="none">
          {/* Surface border */}
          <polygon
            points={pts(TP(margin,margin), TP(1-margin,margin), TP(1-margin,1-margin), TP(margin,1-margin))}
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
          {/* Leg circles at corners */}
          {[[0.1,0.1],[0.9,0.1],[0.9,0.9],[0.1,0.9]].map(([cF,rF],i) => {
            const [cx,cy] = TP(cF, rF)
            return <ellipse key={i} cx={cx} cy={cy} rx={TW*0.07} ry={TH*0.07} fill="rgba(0,0,0,0.35)" />
          })}
        </g>
      )
    }

    // ── デスク ───────────────────────────────────
    case 'desk': {
      // Monitor screen on top face + keyboard strip
      return (
        <g pointerEvents="none">
          {/* Monitor */}
          <polygon
            points={pts(TP(0.1,0.05), TP(0.9,0.05), TP(0.9,0.5), TP(0.1,0.5))}
            fill="#1E2A3A" stroke="#444" strokeWidth={1} />
          {/* Keyboard */}
          <polygon
            points={pts(TP(0.15,0.6), TP(0.85,0.6), TP(0.85,0.85), TP(0.15,0.85))}
            fill="#C8C8C0" stroke="#888" strokeWidth={0.5} />
        </g>
      )
    }

    // ── 洗濯機 ───────────────────────────────────
    case 'washing_machine': {
      const [cx, cy] = TP(0.5, 0.5)
      return (
        <g pointerEvents="none">
          {/* Drum circle */}
          <ellipse cx={cx} cy={cy} rx={TW * 0.35} ry={TH * 0.35} fill="#6B8FA8" stroke="#4A6F88" strokeWidth={2} />
          <ellipse cx={cx} cy={cy} rx={TW * 0.2} ry={TH * 0.2} fill="#5A7F98" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        </g>
      )
    }

    // ── チェスト ─────────────────────────────────
    case 'chest': {
      const numDrawers = 3
      const elems: React.ReactNode[] = []
      for (let d = 0; d < numDrawers; d++) {
        const vBot = (d / numDrawers) * H + 2
        const vTop = ((d + 1) / numDrawers) * H - 2
        // Drawer panel
        elems.push(
          <polygon key={d}
            points={pts(LP(0.04, vTop), LP(0.96, vTop), LP(0.96, vBot), LP(0.04, vBot))}
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />,
          // Handle
          <line key={`h${d}`}
            x1={LP(0.5, (vTop + vBot) / 2 + 3)[0]} y1={LP(0.5, (vTop + vBot) / 2 + 3)[1]}
            x2={LP(0.5, (vTop + vBot) / 2 - 3)[0]} y2={LP(0.5, (vTop + vBot) / 2 - 3)[1]}
            stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" />
        )
      }
      return <g pointerEvents="none">{elems}</g>
    }

    default:
      return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FurnitureItem({
  pf, def, box, originX, originY, isAffected, isDragging, disableInteraction,
  onDragStart, onDragMove, onDragEnd,
}: FurnitureItemProps) {
  const { t } = useTranslation()
  const removeFurniture = useFloorPlanStore(s => s.removeFurniture)
  const toggleAnchor = useFloorPlanStore(s => s.toggleAnchor)
  const rotateFurniture = useFloorPlanStore(s => s.rotateFurniture)
  const selectedInstanceId = useFloorPlanStore(s => s.selectedInstanceId)
  const selectFurniture = useFloorPlanStore(s => s.selectFurniture)

  const isSelected = selectedInstanceId === pf.instanceId
  const dragRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })
  const [imgFailed, setImgFailed] = useState(false)

  const { x: col, y: row, w, h } = box
  const H = isDragging ? def.boxH * 0.5 : def.boxH

  const [tx, ty] = toIso(col, row, originX, originY)
  const [rx, ry] = toIso(col + w, row, originX, originY)
  const [bx, by] = toIso(col + w, row + h, originX, originY)
  const [lx, ly] = toIso(col, row + h, originX, originY)

  const topColor   = hexLighten(def.color, 0.22)
  const leftColor  = hexDarken(def.color, 0.75)
  const rightColor = hexDarken(def.color, 0.58)

  const strokeColor = isSelected ? '#6366f1' : isAffected ? '#ef4444' : 'rgba(0,0,0,0.3)'
  const strokeW = isSelected || isAffected ? 2.5 : 1.5

  const cx = (tx + rx + bx + lx) / 4

  function onPointerDown(e: React.PointerEvent<SVGGElement>) {
    if (disableInteraction) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = false
    startRef.current = { x: e.clientX, y: e.clientY }
    onDragStart()
  }

  function onPointerMove(e: React.PointerEvent<SVGGElement>) {
    const dx = Math.abs(e.clientX - startRef.current.x)
    const dy = Math.abs(e.clientY - startRef.current.y)
    if (dx > 4 || dy > 4) {
      dragRef.current = true
      onDragMove(e.clientX, e.clientY)
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGGElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (dragRef.current) {
      onDragEnd(e.clientX, e.clientY)
    } else {
      selectFurniture(isSelected ? null : pf.instanceId)
    }
    dragRef.current = false
  }

  return (
    <g
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={e => e.preventDefault()}
      style={{ cursor: isDragging ? 'grabbing' : disableInteraction ? 'default' : 'grab', userSelect: 'none' }}
      opacity={isDragging ? 0.65 : 1}
      aria-label={t(def.labelKey)}
      role="button"
    >
      {/* Drop shadow */}
      <polygon
        points={`${tx+3},${ty+5} ${rx+3},${ry+5} ${bx+3},${by+5} ${lx+3},${ly+5}`}
        fill="rgba(0,0,0,0.22)"
        pointerEvents="none"
      />

      {/* Furniture body: image sprite if available, else code-drawn 3D box */}
      {imgFailed ? (
        <>
          {/* Left face (SW, darkest) */}
          <polygon
            points={`${lx},${ly-H} ${bx},${by-H} ${bx},${by} ${lx},${ly}`}
            fill={leftColor} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round"
          />
          {/* Right face (SE, medium) */}
          <polygon
            points={`${bx},${by-H} ${rx},${ry-H} ${rx},${ry} ${bx},${by}`}
            fill={rightColor} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round"
          />
          {/* Top face (lightest) */}
          <polygon
            points={`${tx},${ty-H} ${rx},${ry-H} ${bx},${by-H} ${lx},${ly-H}`}
            fill={topColor} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round"
          />
          {renderDecal(def, col, row, w, h, H, lx, ly, bx, by, rx, ry, originX, originY)}
        </>
      ) : (
        <image
          href={`${import.meta.env.BASE_URL}furniture/${def.id}.png`}
          x={lx}
          y={ty - H}
          width={(w + h) * TW / 2}
          height={(w + h) * TH / 2 + H}
          preserveAspectRatio="none"
          onError={() => setImgFailed(true)}
        />
      )}

      {/* Stroke outline when selected or at risk (shown over image too) */}
      {(isSelected || isAffected) && (
        <polygon
          points={`${tx},${ty-H} ${rx},${ry-H} ${bx},${by-H} ${lx},${ly-H}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeLinejoin="round"
          pointerEvents="none"
        />
      )}

      {/* Anchor indicator */}
      {pf.isAnchored && (
        <text x={lx + 4} y={ly - H - 2} fontSize={10} fill="#2563eb" pointerEvents="none">⚓</text>
      )}

      {/* Risk warning badge */}
      {isAffected && !isDragging && (
        <g pointerEvents="none">
          <circle cx={rx} cy={ry - H} r={8} fill="#ef4444" />
          <text x={rx} y={ry - H + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white">!</text>
        </g>
      )}

      {/* Selection toolbar */}
      {isSelected && !isDragging && (
        <foreignObject x={cx - 64} y={ty - H - 38} width={128} height={34} style={{ overflow: 'visible' }}>
          <div style={{
            display: 'flex', gap: 3, background: 'white', borderRadius: 8,
            padding: '3px 5px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: 11, whiteSpace: 'nowrap',
          }}>
            <button onClick={() => rotateFurniture(pf.instanceId)} title={t('btn.rotate')}
              style={{ padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer' }}>↻</button>
            {def.anchorable && (
              <button onClick={() => toggleAnchor(pf.instanceId)} title={pf.isAnchored ? t('btn.unanchor') : t('btn.anchor')}
                style={{ padding: '2px 7px', borderRadius: 4, background: pf.isAnchored ? '#dbeafe' : '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer' }}>
                {pf.isAnchored ? '⚓' : '🔩'}
              </button>
            )}
            <button onClick={() => removeFurniture(pf.instanceId)} title={t('btn.remove')}
              style={{ padding: '2px 7px', borderRadius: 4, background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', color: '#dc2626' }}>✕</button>
          </div>
        </foreignObject>
      )}
    </g>
  )
}
