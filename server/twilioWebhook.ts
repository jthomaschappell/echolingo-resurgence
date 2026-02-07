import { Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { translateEnglishToSpanish } from '../lib/cerebras'
import { extractActionItems } from '../lib/claude'
import { prisma } from '../lib/prisma'

export async function handleTwilioWebhook(req: Request, res: Response) {
  try {
    const io: SocketIOServer = req.app.locals.io
    const { From, Body, MessageSid, AccountSid } = req.body

    // Find the original message - try by Twilio SID first, then by supervisor number
    let originalMessage = await prisma.message.findFirst({
      where: {
        twilioSid: MessageSid,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // If not found by SID, get the most recent message (supervisor is replying to latest)
    if (!originalMessage) {
      originalMessage = await prisma.message.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    if (!originalMessage) {
      console.error('Original message not found for Twilio webhook')
      return res.status(404).send('Message not found')
    }

    const englishText = Body.trim()

    // Translate English to Spanish
    const spanishTrans = await translateEnglishToSpanish(englishText)

    // Extract action items via Claude
    const actionSummary = await extractActionItems(englishText)

    // Store supervisor reply
    const reply = await prisma.supervisorReply.create({
      data: {
        messageId: originalMessage.id,
        englishRaw: englishText,
        spanishTrans,
        actionSummary,
      },
    })

    // Emit to worker's room via Socket.io
    const workerRoom = `worker:${originalMessage.workerId}`
    io.to(workerRoom).emit('supervisor-reply', {
      messageId: originalMessage.id,
      spanishTrans,
      actionSummary,
    })

    console.log(`Supervisor reply sent to worker ${originalMessage.workerId}`)

    // Respond to Twilio (required)
    res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
  } catch (error) {
    console.error('Twilio webhook error:', error)
    res.status(500).send('Error processing webhook')
  }
}
