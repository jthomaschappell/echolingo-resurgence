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

  // Only the likely translation given construction context (strip quotation marks)
  const raw =
    isSupervisorReply
      ? (message.spanishTrans || message.actionSummary)
      : (message.englishFormatted || message.englishRaw)
  const translation = (raw?.replace(/^["']+|["']+$/g, '').trim()) || raw

  if (!translation) return null

  const sender = isSupervisorReply ? 'Supervisor' : (workerId || 'Worker')

  return (
    <div className="mb-5 p-4 bg-white/90 rounded-xl border border-palette-golden/20 shadow-stripe">
      <p className="text-stripe-dark text-base">{translation}</p>
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
