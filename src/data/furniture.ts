import type { FurnitureDefinition } from '@/types'

export const furnitureDefinitions: FurnitureDefinition[] = [
  { id: 'bookshelf_tall', labelKey: 'furniture.bookshelf_tall', category: 'storage', widthCells: 2, heightCells: 1, color: '#8B6914', riskTags: ['topple_hazard'], weight: 'heavy', anchorable: true, emoji: '📚' },
  { id: 'bookshelf_short', labelKey: 'furniture.bookshelf_short', category: 'storage', widthCells: 2, heightCells: 1, color: '#A07820', riskTags: [], weight: 'medium', anchorable: true, emoji: '📗' },
  { id: 'gas_stove', labelKey: 'furniture.gas_stove', category: 'kitchen', widthCells: 2, heightCells: 1, color: '#888', riskTags: ['fire_source'], weight: 'medium', anchorable: false, emoji: '🍳' },
  { id: 'sofa_3seat', labelKey: 'furniture.sofa_3seat', category: 'seating', widthCells: 3, heightCells: 2, color: '#6B8E6B', riskTags: ['exit_blocker'], weight: 'heavy', anchorable: false, emoji: '🛋️' },
  { id: 'sofa_1seat', labelKey: 'furniture.sofa_1seat', category: 'seating', widthCells: 1, heightCells: 2, color: '#7A9E7A', riskTags: [], weight: 'medium', anchorable: false, emoji: '💺' },
  { id: 'tv_stand', labelKey: 'furniture.tv_stand', category: 'storage', widthCells: 3, heightCells: 1, color: '#4A4A4A', riskTags: ['topple_hazard'], weight: 'medium', anchorable: false, emoji: '📺' },
  { id: 'bed_single', labelKey: 'furniture.bed_single', category: 'sleeping', widthCells: 2, heightCells: 4, color: '#B8A4C8', riskTags: [], weight: 'medium', anchorable: false, emoji: '🛏️' },
  { id: 'bed_double', labelKey: 'furniture.bed_double', category: 'sleeping', widthCells: 3, heightCells: 4, color: '#A89AB8', riskTags: [], weight: 'heavy', anchorable: false, emoji: '🛏️' },
  { id: 'wardrobe', labelKey: 'furniture.wardrobe', category: 'storage', widthCells: 3, heightCells: 1, color: '#7B5E3A', riskTags: ['topple_hazard', 'exit_blocker'], weight: 'heavy', anchorable: true, emoji: '🚪' },
  { id: 'refrigerator', labelKey: 'furniture.refrigerator', category: 'kitchen', widthCells: 1, heightCells: 2, color: '#C0C8D0', riskTags: ['topple_hazard'], weight: 'heavy', anchorable: false, emoji: '🧊' },
  { id: 'curtain', labelKey: 'furniture.curtain', category: 'other', widthCells: 3, heightCells: 1, color: '#D4A0A0', riskTags: ['flammable'], weight: 'light', anchorable: false, emoji: '🪟' },
  { id: 'desk', labelKey: 'furniture.desk', category: 'storage', widthCells: 2, heightCells: 2, color: '#C8A878', riskTags: [], weight: 'medium', anchorable: false, emoji: '🪑' },
  { id: 'dining_table', labelKey: 'furniture.dining_table', category: 'seating', widthCells: 3, heightCells: 2, color: '#D4B896', riskTags: [], weight: 'medium', anchorable: false, emoji: '🍽️' },
  { id: 'washing_machine', labelKey: 'furniture.washing_machine', category: 'appliance', widthCells: 1, heightCells: 1, color: '#A0B8C8', riskTags: [], weight: 'heavy', anchorable: false, emoji: '🫧' },
  { id: 'piano', labelKey: 'furniture.piano', category: 'other', widthCells: 2, heightCells: 3, color: '#2A2A2A', riskTags: ['heavy_overhead', 'exit_blocker'], weight: 'heavy', anchorable: false, emoji: '🎹' },
  { id: 'chest', labelKey: 'furniture.chest', category: 'storage', widthCells: 2, heightCells: 1, color: '#A08060', riskTags: ['topple_hazard'], weight: 'heavy', anchorable: true, emoji: '🗄️' },
]

export const getFurnitureById = (id: string): FurnitureDefinition | undefined =>
  furnitureDefinitions.find(f => f.id === id)
