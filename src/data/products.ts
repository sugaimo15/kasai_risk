import type { AffiliateProduct } from '@/types'

export const affiliateProducts: AffiliateProduct[] = [
  {
    id: 'furniture_anchor',
    nameKey: 'product.furniture_anchor.name',
    descriptionKey: 'product.furniture_anchor.desc',
    riskRuleIds: ['tall_furniture_unanchored', 'unanchored_topple_general'],
    affiliateUrl: 'https://www.amazon.co.jp/s?k=家具転倒防止+突っ張り棒&tag=YOUR_TAG',
    imageEmoji: '🔩',
  },
  {
    id: 'fire_extinguisher',
    nameKey: 'product.fire_extinguisher.name',
    descriptionKey: 'product.fire_extinguisher.desc',
    riskRuleIds: ['fire_source_near_flammable', 'curtain_near_gas', 'multiple_fire_sources_close'],
    affiliateUrl: 'https://www.amazon.co.jp/s?k=住宅用+消火器&tag=YOUR_TAG',
    imageEmoji: '🧯',
  },
  {
    id: 'smoke_detector',
    nameKey: 'product.smoke_detector.name',
    descriptionKey: 'product.smoke_detector.desc',
    riskRuleIds: ['fire_source_near_flammable', 'curtain_near_gas'],
    affiliateUrl: 'https://www.amazon.co.jp/s?k=火災報知器+煙感知器&tag=YOUR_TAG',
    imageEmoji: '🔔',
  },
  {
    id: 'fireproof_curtain',
    nameKey: 'product.fireproof_curtain.name',
    descriptionKey: 'product.fireproof_curtain.desc',
    riskRuleIds: ['curtain_near_gas', 'fire_source_near_flammable'],
    affiliateUrl: 'https://www.amazon.co.jp/s?k=防炎カーテン&tag=YOUR_TAG',
    imageEmoji: '🪟',
  },
  {
    id: 'emergency_kit',
    nameKey: 'product.emergency_kit.name',
    descriptionKey: 'product.emergency_kit.desc',
    riskRuleIds: ['exit_blocked', 'narrow_escape_path'],
    affiliateUrl: 'https://www.amazon.co.jp/s?k=防災セット+非常用持出袋&tag=YOUR_TAG',
    imageEmoji: '🎒',
  },
]
