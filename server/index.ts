import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleTwilioWebhook } from './twilioWebhook'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('[FLOW][Socket.io] Client connected:', socket.id)

  socket.on('join-worker-room', ({ workerId }: { workerId: string }) => {
    const room = `worker:${workerId}`
    socket.join(room)
    console.log('[FLOW][Socket.io] Worker', workerId, 'joined room:', room, '(socket:', socket.id, ')')
  })

  socket.on('disconnect', () => {
    console.log('[FLOW][Socket.io] Client disconnected:', socket.id)
  })
})

// Make io available to webhook handler
app.locals.io = io

// Twilio webhook endpoint
app.post('/webhook/twilio', handleTwilioWebhook)

const PORT = process.env.SOCKET_SERVER_PORT || 3001

httpServer.listen(PORT, () => {
  console.log('[FLOW][Socket.io] Server running on port', PORT, '(Twilio webhook at /webhook/twilio)')
})
