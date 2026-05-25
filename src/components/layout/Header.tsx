import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { roomTemplates } from '@/data/rooms'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import Button from '@/components/ui/Button'

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const isSimulator = location.pathname === '/simulator'
  const room = useFloorPlanStore(s => s.room)
  const setRoom = useFloorPlanStore(s => s.setRoom)
  const resetAll = useFloorPlanStore(s => s.resetAll)

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="flex items-center gap-3 px-4 h-14">
        <Link to="/" className="flex items-center gap-2 font-bold text-red-600 shrink-0">
          <span className="text-xl">🏠</span>
          <span className="text-sm hidden sm:inline">{t('app.title')}</span>
        </Link>

        <nav className="flex items-center gap-2 ml-2">
          <Link
            to="/"
            className={`text-sm px-3 py-1 rounded-md transition-colors ${location.pathname === '/' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/simulator"
            className={`text-sm px-3 py-1 rounded-md transition-colors ${isSimulator ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('nav.simulator')}
          </Link>
        </nav>

        {isSimulator && (
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={room.id}
              onChange={e => setRoom(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:border-red-400"
              aria-label={t('simulator.room_select')}
            >
              {roomTemplates.map(r => (
                <option key={r.id} value={r.id}>{t(r.labelKey)}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" onClick={resetAll}>
              {t('btn.reset')}
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
