'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { translations, type Language } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  isSpanishMode: boolean
  setSpanishMode: (on: boolean) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isSpanishMode, setIsSpanishMode] = useState(false)
  const language: Language = isSpanishMode ? 'es' : 'en'
  const t = translations[language]

  const setSpanishMode = useCallback((on: boolean) => {
    setIsSpanishMode(on)
  }, [])

  return (
    <LanguageContext.Provider value={{ language, isSpanishMode, setSpanishMode, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
