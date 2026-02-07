import { Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { translateEnglishToSpanish } from '../lib/cerebras'
import { extractActionItems } from '../lib/claude'
import { supabase } from '../lib/supabase'

export async function handleTwilioWebhook(req: Request, res: Response) {
  try {
    const io: SocketIOServer = req.app.locals.io
    const { From, Body, MessageSid, AccountSid } = req.body

    // Find the original message - try by Twilio SID first, then by supervisor number
    let { data: originalMessage } = await supabase
      .from('Message')
      .select()
      .eq('twilioSid', MessageSid)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If not found by SID, get the most recent message (supervisor is replying to latest)
    if (!originalMessage) {
      const { data: latest } = await supabase
        .from('Message')
        .select()
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle()
      originalMessage = latest
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
    const { error: replyError } = await supabase.from('SupervisorReply').insert({
      messageId: originalMessage.id,
      englishRaw: englishText,
      spanishTrans,
      actionSummary,
    })

    if (replyError) {
      console.error('Failed to store supervisor reply:', replyError)
      return res.status(500).send('Error storing reply')
    }

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
