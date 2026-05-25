import { useTranslation } from 'react-i18next'
import type { AffiliateProduct } from '@/types'

export default function ProductCard({ product }: { product: AffiliateProduct }) {
  const { t } = useTranslation()
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
    >
      <span className="text-2xl">{product.imageEmoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{t(product.nameKey)}</p>
        <p className="text-xs text-gray-500 truncate">{t(product.descriptionKey)}</p>
      </div>
      <span className="text-orange-500 text-xs font-medium shrink-0">Amazon →</span>
    </a>
  )
}
