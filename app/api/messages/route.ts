import { NextRequest, NextResponse } from 'next/server'
import { translateSpanishToEnglish } from '@/lib/cerebras'
import { analyzeAndReformatMessage } from '@/lib/claude'
import { sendWhatsAppMessage } from '@/lib/twilio'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { workerId, spanishText } = await request.json()

    if (!workerId || !spanishText) {
      return NextResponse.json(
        { error: 'Missing workerId or spanishText' },
        { status: 400 }
      )
    }

    // Step 1: Translate Spanish to English via Cerebras
    const englishRaw = await translateSpanishToEnglish(spanishText)

    // Step 2: Analyze and reformat via Claude
    const analysis = await analyzeAndReformatMessage(spanishText, englishRaw)

    // Step 3: Store in database
    const { data: message, error: insertError } = await supabase
      .from('Message')
      .insert({
        workerId,
        spanishRaw: spanishText,
        englishRaw,
        englishFormatted: analysis.englishFormatted,
        category: analysis.category,
        urgency: analysis.urgency,
      })
      .select()
      .single()

    if (insertError || !message) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    // Step 4: Send to supervisor via WhatsApp
    const supervisorWhatsApp = process.env.SUPERVISOR_WHATSAPP
    if (supervisorWhatsApp) {
      try {
        const twilioSid = await sendWhatsAppMessage(
          supervisorWhatsApp,
          analysis.englishFormatted
        )

        // Update message with Twilio SID for reply threading
        await supabase
          .from('Message')
          .update({ twilioSid })
          .eq('id', message.id)
      } catch (error) {
        console.error('Failed to send WhatsApp, but message saved:', error)
        // Continue even if WhatsApp fails - message is saved
      }
    }

    return NextResponse.json({
      messageId: message.id,
      englishRaw,
      englishFormatted: analysis.englishFormatted,
      category: analysis.category,
      urgency: analysis.urgency,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
