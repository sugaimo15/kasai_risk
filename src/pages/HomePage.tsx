import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdBanner from '@/components/monetization/AdBanner'

const features = [
  { key: '1', icon: '🏠' },
  { key: '2', icon: '📋' },
  { key: '3', icon: '🛒' },
]

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-[calc(100vh-3.5rem-4rem)]">
      <AdBanner slot="home-top" format="horizontal" />

      <section className="bg-gradient-to-b from-red-50 to-white py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4">🏠🔥</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4 whitespace-pre-line">
            {t('home.hero.title')}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            {t('home.hero.desc')}
          </p>
          <Link
            to="/simulator"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors shadow-lg"
          >
            {t('btn.start')} →
          </Link>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.article
              key={f.key}
              className="bg-white rounded-xl border p-5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h2 className="font-bold text-gray-800 mb-1">{t(`home.feature${f.key}.title`)}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{t(`home.feature${f.key}.desc`)}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-8">
        <AdBanner slot="home-middle" format="rectangle" />
      </div>

      <div className="text-center pb-12">
        <Link
          to="/simulator"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors"
        >
          {t('btn.start')} →
        </Link>
      </div>
    </main>
  )
}
