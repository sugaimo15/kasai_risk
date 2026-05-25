import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { RiskFinding } from '@/types'

function calcScore(findings: RiskFinding[]): number {
  const penalty = findings.reduce((acc, f) => {
    if (f.severity === 'high') return acc + 30
    if (f.severity === 'medium') return acc + 15
    return acc + 5
  }, 0)
  return Math.max(0, 100 - penalty)
}

function scoreLabel(score: number, t: (k: string) => string): string {
  if (score >= 80) return t('score.safe')
  if (score >= 50) return t('score.caution')
  return t('score.danger')
}

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

export default function RiskScoreGauge({ findings }: { findings: RiskFinding[] }) {
  const { t } = useTranslation()
  const score = calcScore(findings)
  const color = scoreColor(score)
  const label = scoreLabel(score, t)

  const radius = 40
  const circumference = Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div className="flex flex-col items-center py-3">
      <svg width="120" height="70" viewBox="0 0 120 70" aria-label={`安全スコア: ${score}`}>
        <path
          d={`M 10 60 A ${radius} ${radius} 0 0 1 110 60`}
          fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round"
        />
        <motion.path
          d={`M 10 60 A ${radius} ${radius} 0 0 1 110 60`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, type: 'spring' }}
        />
        <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>
          {score}
        </text>
      </svg>
      <p className="text-xs text-gray-500 mt-1">{t('simulator.score_label')}</p>
      <p className="text-sm font-semibold mt-0.5" style={{ color }}>{label}</p>
    </div>
  )
}

export { calcScore }
