import { useTranslation } from 'react-i18next'
import type { RiskFinding } from '@/types'
import Modal from '@/components/ui/Modal'
import RiskBadge from '@/components/risk/RiskBadge'
import { affiliateProducts } from '@/data/products'
import ProductCard from '@/components/monetization/ProductCard'

interface TipModalProps {
  finding: RiskFinding
  isOpen: boolean
  onClose: () => void
}

const riskTypeIcon: Record<string, string> = {
  fire: '🔥',
  earthquake: '🌋',
  evacuation: '🚪',
}

export default function TipModal({ finding, isOpen, onClose }: TipModalProps) {
  const { t } = useTranslation()

  const relatedProducts = affiliateProducts.filter(p =>
    p.riskRuleIds.includes(finding.ruleId)
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(finding.titleKey)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{riskTypeIcon[finding.riskType]}</span>
          <RiskBadge severity={finding.severity} />
          <span className="text-sm text-gray-500">{t(`riskType.${finding.riskType}`)}</span>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 text-sm mb-1">リスクの説明</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{t(finding.detailKey)}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <h3 className="font-semibold text-green-800 text-sm mb-1">💡 改善方法</h3>
          <p className="text-sm text-green-700 leading-relaxed">{t(finding.fixSuggestionKey)}</p>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-2">おすすめ防災グッズ</h3>
            <div className="space-y-2">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{t('results.affiliate_notice')}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
