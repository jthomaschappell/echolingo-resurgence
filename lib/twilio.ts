import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<string> {
  try {
    console.log('[FLOW][WhatsApp] sendWhatsAppMessage called, to:', to, 'message:', message?.slice(0, 80) + '...')
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: to,
    })

    console.log('[FLOW][WhatsApp] Message sent successfully, sid:', twilioMessage.sid)
    return twilioMessage.sid
  } catch (error) {
    console.error('[FLOW][WhatsApp] Twilio error:', error)
    throw new Error('Failed to send WhatsApp message')
  }
}
