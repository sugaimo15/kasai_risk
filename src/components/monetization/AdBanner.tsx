import { useTranslation } from 'react-i18next'

interface AdBannerProps {
  slot?: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
}

const heights: Record<string, string> = {
  horizontal: 'h-16',
  rectangle: 'h-32',
  vertical: 'h-48',
}

export default function AdBanner({ slot = 'default', format = 'horizontal' }: AdBannerProps) {
  const { t } = useTranslation()
  const isDev = import.meta.env.DEV

  if (isDev) {
    return (
      <div className={`w-full ${heights[format]} bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center rounded`}>
        <span className="text-xs text-gray-400">{t('ad.placeholder')} ({slot})</span>
      </div>
    )
  }

  return (
    <ins
      className="adsbygoogle block"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={slot}
      data-ad-format={format === 'horizontal' ? 'horizontal' : 'rectangle'}
    />
  )
}
