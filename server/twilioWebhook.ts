import { Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import twilio from 'twilio'
import { translateEnglishToSpanish } from '../lib/cerebras'
import { extractActionItems } from '../lib/claude'
import { supabase } from '../lib/supabase'
import { handleApprovalCommand } from './supply/approvalHandler'

export async function handleTwilioWebhook(req: Request, res: Response) {
  try {
    console.log('[FLOW][TwilioWebhook] Incoming webhook received')
    const io: SocketIOServer = req.app.locals.io

    // Twilio signature validation
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const webhookUrl = process.env.TWILIO_WEBHOOK_URL
    if (authToken && webhookUrl) {
      const signature = req.headers['x-twilio-signature'] as string
      const valid = twilio.validateRequest(authToken, signature, webhookUrl, req.body)
      if (!valid) {
        console.error('[FLOW][TwilioWebhook] Invalid Twilio signature')
        return res.status(403).send('Forbidden')
      }
      console.log('[FLOW][TwilioWebhook] Twilio signature validated')
    }

    const { From, Body, MessageSid, AccountSid } = req.body
    console.log('[FLOW][TwilioWebhook] Request body:', { From, Body: Body?.slice(0, 80) + '...', MessageSid })

    // Check for supply approval commands (APPROVE, MODIFY, REJECT, ASK)
    const approvalResult = await handleApprovalCommand(Body.trim(), io)
    if (approvalResult.handled) {
      console.log('[FLOW][TwilioWebhook] Supply approval command handled:', approvalResult.response)
      res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
      return
    }

    // Find the original message - try by Twilio SID first, then by supervisor number
    console.log('[FLOW][TwilioWebhook] Querying PostgreSQL for original message by twilioSid:', MessageSid)
    let { data: originalMessage } = await supabase
      .from('Message')
      .select()
      .eq('twilioSid', MessageSid)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If not found by SID, get the most recent message (supervisor is replying to latest)
    if (!originalMessage) {
      console.log('[FLOW][TwilioWebhook] Not found by SID, querying PostgreSQL for latest message')
      const { data: latest } = await supabase
        .from('Message')
        .select()
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle()
      originalMessage = latest
    }

    if (!originalMessage) {
      console.error('[FLOW][TwilioWebhook] Original message not found')
      return res.status(404).send('Message not found')
    }
    console.log('[FLOW][TwilioWebhook] Found original message:', { id: originalMessage.id, workerId: originalMessage.workerId })

    const englishText = Body.trim()
    console.log('[FLOW][TwilioWebhook] Supervisor reply (English):', englishText?.slice(0, 80) + '...')

    // Translate English to Spanish
    console.log('[FLOW][TwilioWebhook] Calling Cerebras for English→Spanish translation...')
    const spanishTrans = await translateEnglishToSpanish(englishText)
    console.log('[FLOW][TwilioWebhook] Cerebras translation done')

    // Extract action items via Claude
    console.log('[FLOW][TwilioWebhook] Calling Claude for action item extraction...')
    const actionSummary = await extractActionItems(englishText)
    console.log('[FLOW][TwilioWebhook] Claude extraction done')

    // Store supervisor reply
    console.log('[FLOW][TwilioWebhook] Storing SupervisorReply in PostgreSQL...')
    const { error: replyError } = await supabase.from('SupervisorReply').insert({
      messageId: originalMessage.id,
      englishRaw: englishText,
      spanishTrans,
      actionSummary,
    })

    if (replyError) {
      console.error('[FLOW][TwilioWebhook] PostgreSQL insert SupervisorReply failed:', replyError)
      return res.status(500).send('Error storing reply')
    }
    console.log('[FLOW][TwilioWebhook] SupervisorReply stored in PostgreSQL')

    // Emit to worker's room via Socket.io
    const workerRoom = `worker:${originalMessage.workerId}`
    console.log('[FLOW][TwilioWebhook] Emitting supervisor-reply via Socket.io to room:', workerRoom)
    io.to(workerRoom).emit('supervisor-reply', {
      messageId: originalMessage.id,
      englishRaw: englishText,
      spanishTrans,
      actionSummary,
    })

    console.log('[FLOW][TwilioWebhook] Supervisor reply delivered to worker', originalMessage.workerId, 'via Socket.io')

    // Respond to Twilio (required)
    res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
  } catch (error) {
    console.error('[FLOW][TwilioWebhook] Unhandled error:', error)
    res.status(500).send('Error processing webhook')
  }
}
