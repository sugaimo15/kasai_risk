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

export default function FurnitureTile({ def }: { def: FurnitureDefinition }) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${def.id}`,
    data: { type: 'palette', definitionId: def.id },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:border-red-300 hover:bg-red-50 border-gray-200 bg-white'}`}
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
    </div>
  )
}
