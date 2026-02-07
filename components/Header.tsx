'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function Header() {
  const { t } = useLanguage()

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-palette-golden/20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-stripe-primary flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-stripe-dark text-lg font-semibold tracking-tight">
          crew link
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-stripe-orange font-medium text-sm hover:opacity-80 transition-opacity">
          {t.signIn}
        </button>
      </div>
    </header>
  )
}
