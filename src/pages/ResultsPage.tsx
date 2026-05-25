import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import RiskScoreGauge from '@/components/risk/RiskScoreGauge'
import SafetyChecklist from '@/components/education/SafetyChecklist'
import ProductCard from '@/components/monetization/ProductCard'
import AdBanner from '@/components/monetization/AdBanner'
import { affiliateProducts } from '@/data/products'

export default function ResultsPage() {
  const { t } = useTranslation()
  const findings = useFloorPlanStore(s => s.findings)

  const ruleIds = new Set(findings.map(f => f.ruleId))
  const recommendedProducts = affiliateProducts.filter(p =>
    p.riskRuleIds.some(rid => ruleIds.has(rid))
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('results.title')}</h1>

      <AdBanner slot="results-top" format="horizontal" />

      <div className="bg-white rounded-xl border shadow-sm p-6 mt-4">
        <h2 className="font-semibold text-gray-700 text-sm mb-2">{t('results.score_label')}</h2>
        <RiskScoreGauge findings={findings} />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 mt-4">
        <SafetyChecklist findings={findings} />
      </div>

      {recommendedProducts.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mt-4">
          <h2 className="font-semibold text-gray-700 mb-3">{t('results.recommended')}</h2>
          <div className="space-y-2">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">{t('results.affiliate_notice')}</p>
        </div>
      )}

      <AdBanner slot="results-bottom" format="rectangle" />

      <div className="text-center mt-6">
        <Link
          to="/simulator"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
        >
          ← シミュレーターに戻る
        </Link>
      </div>
    </main>
  )
}
