'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import { useLanguage } from '@/context/LanguageContext'
import ControlPanel from '@/components/ControlPanel'
import ConversationList from '@/components/ConversationList'
import MicrophoneButton from '@/components/MicrophoneButton'
import { Message } from '@/components/MessageBubble'
import { io, Socket } from 'socket.io-client'

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export default function WorkerPage() {
  const { t } = useLanguage()
  const [workerId, setWorkerId] = useState('worker-001')
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [speechSupported, setSpeechSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001'
    console.log('[FLOW][Worker] Connecting to Socket.io server:', socketUrl)
    const newSocket = io(socketUrl)
    
    newSocket.on('connect', () => {
      console.log('[FLOW][Worker] Socket.io connected successfully, socketId:', newSocket.id)
      console.log('[FLOW][Worker] Joining worker room:', workerId)
      newSocket.emit('join-worker-room', { workerId })
    })

    newSocket.on('supervisor-reply', (data: { spanishTrans: string; actionSummary: string; messageId: string }) => {
      console.log('[FLOW][Worker] Received supervisor-reply via Socket.io:', {
        messageId: data.messageId,
        spanishTrans: data.spanishTrans?.slice(0, 50) + '...',
        actionSummary: data.actionSummary?.slice(0, 50) + '...',
      })
      const replyMessage: Message = {
        id: `reply-${Date.now()}`,
        spanishRaw: '',
        urgency: 'normal',
        createdAt: new Date(),
        ...data,
      }
      setMessages((prev) => [...prev, replyMessage])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [workerId])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        console.error('Speech Recognition not supported in this browser')
        setSpeechSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = 'es-MX' // Mexican Spanish
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        console.log('[FLOW][Worker][Voice] Speech recognition started, listening for Mexican Spanish')
        setIsRecording(true)
      }

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        const confidence = event.results[0][0].confidence
        console.log('[FLOW][Worker][Voice] Speech recognition result:', { transcript, confidence })
        setIsRecording(false)
        await handleVoiceInput(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('[FLOW][Worker][Voice] Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        console.log('[FLOW][Worker][Voice] Speech recognition ended')
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const handleVoiceInput = async (spanishText: string) => {
    console.log('[FLOW][Worker] Voice input received, forwarding to API:', { workerId, spanishText })
    // Optimistic UI update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      spanishRaw: spanishText,
      urgency: 'normal',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempMessage])
    setIsLoading(true)

    try {
      console.log('[FLOW][Worker] POSTing to /api/messages...')
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId,
          spanishText,
        }),
      })

      console.log('[FLOW][Worker] API response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      console.log('[FLOW][Worker] API success, received:', {
        messageId: data.messageId,
        urgency: data.urgency,
        category: data.category,
      })
      
      // Update the temporary message with real data
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? {
                ...msg,
                id: data.messageId,
                englishRaw: data.englishRaw,
                englishFormatted: data.englishFormatted,
                urgency: data.urgency,
                category: data.category,
              }
            : msg
        )
      )
    } catch (error) {
      console.error('[FLOW][Worker] Error sending message:', error)
      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      alert(t.sendError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrophoneClick = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        console.log('[FLOW][Worker][Voice] Microphone button pressed, starting speech recognition')
        recognitionRef.current.start()
      } catch (error) {
        console.error('[FLOW][Worker][Voice] Error starting recognition:', error)
      }
    } else if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Language-themed background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay for readability - warm cream tint from palette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(253, 248, 240, 0.92) 0%, rgba(253, 248, 240, 0.88) 50%, rgba(243, 234, 220, 0.92) 100%)',
        }}
      />

      <Header />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 max-w-4xl mx-auto w-full px-6">
        {/* Hero section */}
        <div className="py-12">
          <p className="text-stripe-muted text-sm font-medium mb-2">
            {t.heroTagline}
          </p>
          <h1 className="text-stripe-dark text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {t.heroTitle}
            <span className="text-palette-orange">{t.heroTitleHighlight}</span>
          </h1>
          <p className="text-stripe-muted text-lg max-w-2xl">
            {t.heroDescription}
          </p>
        </div>

        <ControlPanel workerId={workerId} onWorkerIdChange={setWorkerId} />
        {!speechSupported && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm">
              ⚠️ {t.speechNotSupported}
            </p>
          </div>
        )}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl border border-palette-golden/30 overflow-hidden flex flex-col min-h-[200px] shadow-stripe">
          <ConversationList messages={messages} isLoading={isLoading} />
        </div>
        <div className="py-6">
          <MicrophoneButton
            isRecording={isRecording}
            onClick={handleMicrophoneClick}
            disabled={isLoading || !speechSupported}
          />
        </div>
      </div>
    </div>
  )
}
