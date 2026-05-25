export type FurnitureCategory = 'storage' | 'seating' | 'appliance' | 'sleeping' | 'kitchen' | 'other'
export type RiskTag = 'topple_hazard' | 'fire_source' | 'exit_blocker' | 'flammable' | 'heavy_overhead'
export type Rotation = 0 | 90 | 180 | 270
export type Severity = 'low' | 'medium' | 'high'
export type RiskType = 'fire' | 'earthquake' | 'evacuation'
export type FloorType = 'wood' | 'tatami' | 'tile' | 'concrete'

export interface GridRect {
  x: number
  y: number
  w: number
  h: number
}

export interface FurnitureDefinition {
  id: string
  labelKey: string
  category: FurnitureCategory
  widthCells: number
  heightCells: number
  color: string
  riskTags: RiskTag[]
  weight: 'light' | 'medium' | 'heavy'
  anchorable: boolean
  emoji: string
  boxH: number  // isometric box height in screen pixels
}

export interface PlacedFurniture {
  instanceId: string
  definitionId: string
  gridX: number
  gridY: number
  rotation: Rotation
  isAnchored: boolean
}

export interface RoomTemplate {
  id: string
  labelKey: string
  widthCells: number
  heightCells: number
  doors: GridRect[]
  windows: GridRect[]
  floorType: FloorType
}

export interface RuleTriggerResult {
  affectedIds: string[]
  affectedZones: GridRect[]
  detailKey: string
  fixSuggestionKey: string
}

export interface RiskRule {
  id: string
  titleKey: string
  severity: Severity
  riskType: RiskType
  triggerFn: (placed: PlacedFurniture[], room: RoomTemplate) => RuleTriggerResult | null
}

export interface RiskFinding {
  ruleId: string
  severity: Severity
  riskType: RiskType
  titleKey: string
  detailKey: string
  fixSuggestionKey: string
  affectedInstanceIds: string[]
  affectedZones: GridRect[]
}

export interface AffiliateProduct {
  id: string
  nameKey: string
  riskRuleIds: string[]
  affiliateUrl: string
  imageEmoji: string
  descriptionKey: string
}
