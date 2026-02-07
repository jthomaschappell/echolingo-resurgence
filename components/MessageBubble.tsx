'use client'

export interface Message {
  id: string
  spanishRaw: string
  englishRaw?: string
  englishFormatted?: string
  urgency: 'normal' | 'high'
  category?: string
  createdAt: Date | string
  spanishTrans?: string
  actionSummary?: string
  contextNotes?: string
  /** When true, user spoke English → translation is Spanish. When false, user spoke Spanish → translation is English. */
  spokenLanguage?: 'en' | 'es'
}

interface MessageBubbleProps {
  message: Message
  workerId?: string
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MessageBubble({ message, workerId }: MessageBubbleProps) {
  const isSupervisorReply = 'actionSummary' in message && message.actionSummary

  // Original spoken text and translation
  const spoken =
    isSupervisorReply
      ? (message.englishRaw || '').trim()
      : message.spokenLanguage === 'en'
        ? (message.englishRaw || '').trim()
        : (message.spanishRaw || '').trim()
  const rawTranslation =
    isSupervisorReply
      ? (message.spanishTrans || message.actionSummary)
      : (message.englishFormatted || message.englishRaw)
  const translation = (rawTranslation?.replace(/^["']+|["']+$/g, '').trim()) || rawTranslation

  if (!spoken && !translation) return null

  const sender = isSupervisorReply ? 'Supervisor' : (workerId || 'Worker')

  return (
    <div className="mb-5 p-4 bg-white/90 rounded-xl border border-palette-golden/20 shadow-stripe">
      {spoken && (
        <p className="text-stripe-dark text-base mb-2">
          <span className="text-stripe-muted text-sm font-medium uppercase tracking-wide">Original</span>
          <span className="block mt-0.5">{spoken}</span>
        </p>
      )}
      {translation && (
        <p className="text-stripe-dark text-base">
          <span className="text-stripe-muted text-sm font-medium uppercase tracking-wide">Translation</span>
          <span className="block mt-0.5">{translation}</span>
        </p>
      )}
      <div className="text-xs text-stripe-muted mt-3 pt-2 border-t border-stripe-muted/20 space-y-1">
        {message.contextNotes && (
          <p className="italic">{message.contextNotes}</p>
        )}
        <div className="flex items-center gap-3">
          <span>{formatDate(message.createdAt)}</span>
          <span>•</span>
          <span>{sender}</span>
        </div>
      </div>
    </div>
  )
}
