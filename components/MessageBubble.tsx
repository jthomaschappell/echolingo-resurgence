'use client'

import UrgencyBadge from './UrgencyBadge'

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
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isSupervisorReply = !!message.actionSummary

  return (
    <div className="mb-4">
      {message.spanishRaw && (
        <div className="mb-2">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-orange flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <UrgencyBadge urgency={message.urgency} />
              </div>
              <p className="text-gray-800 text-sm">{message.spanishRaw}</p>
              {message.englishRaw && (
                <p className="text-gray-600 text-xs mt-1 italic">
                  {message.englishRaw}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {isSupervisorReply && (
        <div className="mt-2 p-3 bg-green-100 rounded-lg border-l-4 border-green-500">
          <p className="text-green-800 text-sm font-medium">
            {message.actionSummary}
          </p>
          {message.spanishTrans && (
            <p className="text-green-700 text-xs mt-1">
              {message.spanishTrans}
            </p>
          )}
        </div>
      )}
      {message.englishFormatted && !isSupervisorReply && (
        <div className="text-xs text-gray-500 mt-1">
          Enviado al supervisor
        </div>
      )}
    </div>
  )
}
