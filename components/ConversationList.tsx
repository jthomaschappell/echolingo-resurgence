'use client'

import { useLanguage } from '@/context/LanguageContext'
import MessageBubble, { Message } from './MessageBubble'

interface ConversationListProps {
  messages: Message[]
  isLoading?: boolean
  workerId?: string
}

export default function ConversationList({
  messages,
  isLoading,
  workerId,
}: ConversationListProps) {
  const { t } = useLanguage()
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      {messages.length === 0 && (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-stripe-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-stripe-primary"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-stripe-dark text-base">
              <span className="font-semibold text-stripe-primary">{t.emptyStateGreeting}</span>{' '}
              {t.emptyStateInstruction}
            </p>
            <p className="text-stripe-muted text-sm mt-1">
              {t.emptyStateNote}
            </p>
          </div>
        </div>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} workerId={workerId} />
      ))}
      {isLoading && (
        <div className="flex items-center gap-3 mt-4 p-4 bg-white/90 rounded-xl border border-palette-golden/20">
          <div className="w-8 h-8 rounded-full border-2 border-stripe-primary/30 border-t-stripe-primary animate-spin" />
          <span className="text-stripe-muted text-sm font-medium">{t.processing}</span>
        </div>
      )}
    </div>
  )
}
