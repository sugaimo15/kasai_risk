import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-gray-800 text-gray-400 text-xs py-4 px-6 text-center">
      <p>© 2025 {t('app.title')} — 東京消防庁・国土交通省の基準に基づく防災教育ツール</p>
      <p className="mt-1">{t('results.affiliate_notice')}</p>
    </footer>
  )
}
