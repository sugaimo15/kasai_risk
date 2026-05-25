import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { furnitureDefinitions } from '@/data/furniture'
import type { FurnitureCategory } from '@/types'
import FurnitureTile from './FurnitureTile'

const categories: FurnitureCategory[] = ['kitchen', 'storage', 'seating', 'sleeping', 'appliance', 'other']

export default function FurniturePalette() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>('kitchen')

  const filtered = furnitureDefinitions.filter(f => f.category === activeCategory)

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h2 className="text-sm font-bold text-gray-700 mb-2">{t('simulator.palette_title')}</h2>
        <p className="text-xs text-gray-400 mb-2">{t('simulator.palette_hint')}</p>
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 text-xs rounded-full border transition-colors
                ${activeCategory === cat
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-gray-200 text-gray-500 hover:border-red-300'
                }`}
            >
              {t(`category.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map(def => (
          <FurnitureTile key={def.id} def={def} />
        ))}
      </div>
    </div>
  )
}
