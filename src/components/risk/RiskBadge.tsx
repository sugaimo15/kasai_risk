import { useTranslation } from 'react-i18next'
import type { Severity } from '@/types'

const colors: Record<Severity, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export default function RiskBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${colors[severity]}`}>
      {t(`severity.${severity}`)}
    </span>
  )
}
