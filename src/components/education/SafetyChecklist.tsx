import { useTranslation } from 'react-i18next'
import type { RiskFinding } from '@/types'
import RiskBadge from '@/components/risk/RiskBadge'
import Button from '@/components/ui/Button'

export default function SafetyChecklist({ findings }: { findings: RiskFinding[] }) {
  const { t } = useTranslation()
  const actionable = findings.filter(f => f.severity !== 'low' || findings.length < 5)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800">{t('checklist.title')}</h2>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          {t('btn.print')}
        </Button>
      </div>

      {actionable.length === 0 ? (
        <p className="text-gray-500 text-sm">{t('checklist.empty')}</p>
      ) : (
        <ol className="space-y-3">
          {actionable.map((finding, i) => (
            <li key={finding.ruleId} className="flex gap-3">
              <span className="text-gray-400 font-mono text-sm min-w-[1.5rem]">{i + 1}.</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <RiskBadge severity={finding.severity} />
                  <span className="text-sm font-medium">{t(finding.titleKey)}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{t(finding.fixSuggestionKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
