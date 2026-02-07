'use client'

import { useLanguage } from '@/context/LanguageContext'

interface ControlPanelProps {
  workerId: string
  onWorkerIdChange?: (id: string) => void
}

export default function ControlPanel({
  workerId,
  onWorkerIdChange,
}: ControlPanelProps) {
  const { t, isSpanishMode, setSpanishMode } = useLanguage()
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-palette-golden/30 shadow-stripe">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-stripe-muted mb-2 block uppercase tracking-wider">
            {t.workerIdLabel}
          </label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => onWorkerIdChange?.(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-stripe-dark bg-white focus:outline-none focus:ring-2 focus:ring-stripe-primary focus:border-transparent transition-shadow placeholder:text-stripe-muted"
            placeholder={t.workerIdPlaceholder}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-stripe-muted text-sm font-medium">EN</span>
          <button
            role="switch"
            aria-checked={isSpanishMode}
            aria-label={isSpanishMode ? 'Spanish mode on' : 'Spanish mode off'}
            onClick={() => setSpanishMode(!isSpanishMode)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isSpanishMode ? 'bg-stripe-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform left-1 ${
                isSpanishMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-stripe-muted text-sm font-medium">ES</span>
        </div>
      </div>
    </div>
  )
}
