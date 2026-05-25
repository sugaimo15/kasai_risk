import type { PlacedFurniture, RoomTemplate, RiskFinding, RiskRule } from '@/types'
import { riskRules } from '@/data/riskRules'

export function assessRisk(placed: PlacedFurniture[], room: RoomTemplate): RiskFinding[] {
  const findings: RiskFinding[] = []

  for (const rule of riskRules) {
    const result = rule.triggerFn(placed, room)
    if (result) {
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        riskType: rule.riskType,
        titleKey: rule.titleKey,
        detailKey: result.detailKey,
        fixSuggestionKey: result.fixSuggestionKey,
        affectedInstanceIds: result.affectedIds,
        affectedZones: result.affectedZones,
      })
    }
  }

  return findings.sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })
}

export { riskRules }
export type { RiskRule }
