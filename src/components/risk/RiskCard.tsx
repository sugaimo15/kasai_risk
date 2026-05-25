import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { RiskFinding } from '@/types'
import RiskBadge from './RiskBadge'
import Button from '@/components/ui/Button'
import TipModal from '@/components/education/TipModal'

export default function RiskCard({ finding }: { finding: RiskFinding }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          <span className="text-sm">{t(`riskType.${finding.riskType}`)}</span>
          <RiskBadge severity={finding.severity} />
          <span className="flex-1 text-sm font-medium text-gray-800 ml-1">{t(finding.titleKey)}</span>
          <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{t(finding.detailKey)}</p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
                    {t('btn.detail')}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TipModal finding={finding} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
