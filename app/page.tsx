'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
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
      alert('Error al enviar mensaje. Por favor intenta de nuevo.')
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
    <div className="min-h-screen bg-dark-grey flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ControlPanel workerId={workerId} onWorkerIdChange={setWorkerId} />
        {!speechSupported && (
          <div className="mx-4 mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ El reconocimiento de voz no está disponible en este navegador. Por favor usa Chrome o Edge.
            </p>
          </div>
        )}
        <div className="flex-1 bg-cream rounded-t-lg mx-4 mb-4 overflow-hidden flex flex-col">
          <ConversationList messages={messages} isLoading={isLoading} />
        </div>
        <div className="px-4 pb-4">
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
