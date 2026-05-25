import { useTranslation } from 'react-i18next'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import RiskScoreGauge from './RiskScoreGauge'
import RiskCard from './RiskCard'

export default function RiskPanel() {
  const { t } = useTranslation()
  const findings = useFloorPlanStore(s => s.findings)

  return (
    <aside className="flex flex-col h-full bg-gray-50 border-l">
      <div className="p-3 border-b bg-white">
        <h2 className="font-bold text-gray-800 text-sm">{t('simulator.risk_title')}</h2>
      </div>

      <div className="bg-white border-b">
        <RiskScoreGauge findings={findings} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {findings.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            <div className="text-4xl mb-2">✅</div>
            <p>{t('simulator.no_risk')}</p>
          </div>
        ) : (
          findings.map(finding => (
            <RiskCard key={`${finding.ruleId}-${finding.affectedInstanceIds.join('-')}`} finding={finding} />
          ))
        )}
      </div>
    </aside>
  )
}
