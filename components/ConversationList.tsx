'use client'

import MessageBubble, { Message } from './MessageBubble'

interface ConversationListProps {
  messages: Message[]
  isLoading?: boolean
}

export default function ConversationList({
  messages,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <div className="flex items-start gap-2 mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-golden-amber flex-shrink-0 mt-1"
          >
            <path
              d="M8 2L6 4L8 6M16 2L18 4L16 6M8 22L6 20L8 18M16 22L18 20L16 18M4 8L2 10L4 12M20 8L22 10L20 12M12 2V4M12 20V22M2 12H4M20 12H22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-gray-800 text-sm">
            <span className="text-primary-orange font-semibold">¡Hola!</span>{' '}
            Pulsa el micrófono y habla en español.
          </p>
        </div>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex items-center gap-2 text-primary-orange">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm">Cargando...</span>
        </div>
      )}
    </div>
  )
}
