import { useDraggable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import type { FurnitureDefinition } from '@/types'

const tagIcons: Record<string, string> = {
  topple_hazard: '⚠️',
  fire_source: '🔥',
  exit_blocker: '🚪',
  flammable: '💥',
  heavy_overhead: '⬇️',
}

interface FurnitureTileProps {
  def: FurnitureDefinition
  onSelect?: (defId: string) => void
  isSelected?: boolean
}

export default function FurnitureTile({ def, onSelect, isSelected }: FurnitureTileProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${def.id}`,
    data: { type: 'palette', definitionId: def.id },
    disabled: !!onSelect,
  })

  function handleClick() {
    onSelect?.(def.id)
  }

  return (
    <div
      ref={setNodeRef}
      {...(onSelect ? {} : listeners)}
      {...(onSelect ? {} : attributes)}
      onClick={onSelect ? handleClick : undefined}
      className={`flex items-center gap-2 p-2 rounded-lg border select-none transition-all
        ${onSelect ? 'cursor-pointer active:scale-95' : 'cursor-grab active:cursor-grabbing'}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isSelected
          ? 'border-red-500 bg-red-50 ring-2 ring-red-400'
          : 'hover:border-red-300 hover:bg-red-50 border-gray-200 bg-white'
        }`}
    >
      <span className="text-xl w-8 text-center">{def.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{t(def.labelKey)}</p>
        <div className="flex gap-0.5 mt-0.5">
          {def.riskTags.map(tag => (
            <span key={tag} title={t(`tag.${tag}`)} className="text-xs">{tagIcons[tag]}</span>
          ))}
        </div>
      </div>
      {isSelected && <span className="text-red-500 text-sm shrink-0">✓</span>}
    </div>
  )
}
