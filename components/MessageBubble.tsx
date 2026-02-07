'use client'

import { useLanguage } from '@/context/LanguageContext'
import UrgencyBadge from './UrgencyBadge'

export interface Message {
  id: string
  spanishRaw: string
  englishRaw?: string
  englishFormatted?: string
  urgency: 'normal' | 'high'
  category?: string
  createdAt: Date | string
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useLanguage()
  const isSupervisorReply = 'actionSummary' in message && message.actionSummary

  return (
    <div className="mb-5">
      {message.spanishRaw && (
        <div className="mb-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-stripe-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">W</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <UrgencyBadge urgency={message.urgency} />
              </div>
              <p className="text-stripe-dark text-base">{message.spanishRaw}</p>
              {message.englishRaw && (
                <p className="text-stripe-muted text-sm mt-1 italic">
                  {message.englishRaw}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {isSupervisorReply && (
        <div className="mt-2 p-4 bg-white/90 rounded-xl border border-palette-golden/20 shadow-stripe">
          <p className="text-stripe-dark text-sm font-medium">
            {(message as any).actionSummary}
          </p>
          {(message as any).spanishTrans && (
            <p className="text-stripe-muted text-sm mt-1">
              {(message as any).spanishTrans}
            </p>
          )}
        </div>
      )}
      {message.englishFormatted && !isSupervisorReply && (
        <div className="text-xs text-stripe-muted mt-1 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          {t.sentToSupervisor}
        </div>
      )}
    </div>
  )
}
