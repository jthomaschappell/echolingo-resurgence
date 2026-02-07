import { NextRequest, NextResponse } from 'next/server'
import { translateSpanishToEnglish } from '@/lib/cerebras'
import { analyzeAndReformatMessage } from '@/lib/claude'
import { sendWhatsAppMessage } from '@/lib/twilio'
import { supabase } from '@/lib/supabase'
import { runSupplyAgent } from '@/lib/supply-agent/graph'

export async function POST(request: NextRequest) {
  try {
    console.log('[FLOW][API] POST /api/messages received')
    const { workerId, spanishText } = await request.json()
    console.log('[FLOW][API] Request body:', { workerId, spanishText: spanishText?.slice(0, 80) + '...' })

    if (!workerId || !spanishText) {
      console.log('[FLOW][API] Validation failed: missing workerId or spanishText')
      return NextResponse.json(
        { error: 'Missing workerId or spanishText' },
        { status: 400 }
      )
    }

    // Step 1: Translate Spanish to English via Cerebras
    console.log('[FLOW][API] Step 1: Calling Cerebras for Spanish→English translation...')
    const englishRaw = await translateSpanishToEnglish(spanishText)
    console.log('[FLOW][API] Cerebras translation complete:', { englishRaw: englishRaw?.slice(0, 80) + '...' })

    // Step 2: Analyze and reformat via Claude
    console.log('[FLOW][API] Step 2: Calling Claude for analysis and reformatting...')
    const analysis = await analyzeAndReformatMessage(spanishText, englishRaw)
    console.log('[FLOW][API] Claude analysis complete:', {
      category: analysis.category,
      urgency: analysis.urgency,
      englishFormatted: analysis.englishFormatted?.slice(0, 80) + '...',
    })

    // Step 3: Store in database
    console.log('[FLOW][API] Step 3: Storing in PostgreSQL (Supabase)...')
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
      console.error('[FLOW][API] PostgreSQL insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }
    console.log('[FLOW][API] PostgreSQL insert success, messageId:', message.id)

    // Step 4: Send to supervisor via WhatsApp
    const supervisorWhatsApp = process.env.SUPERVISOR_WHATSAPP
    if (supervisorWhatsApp) {
      try {
        console.log('[FLOW][API] Step 4: Sending to Supervisor via WhatsApp...', { to: supervisorWhatsApp })
        const twilioSid = await sendWhatsAppMessage(
          supervisorWhatsApp,
          analysis.englishFormatted
        )
        console.log('[FLOW][API] WhatsApp sent successfully, twilioSid:', twilioSid)

        // Update message with Twilio SID for reply threading
        await supabase
          .from('Message')
          .update({ twilioSid })
          .eq('id', message.id)
        console.log('[FLOW][API] Updated message with twilioSid for reply threading')
      } catch (error) {
        console.error('[FLOW][API] Failed to send WhatsApp, but message saved:', error)
        // Continue even if WhatsApp fails - message is saved
      }
    } else {
      console.log('[FLOW][API] SUPERVISOR_WHATSAPP not set, skipping WhatsApp send')
    }

    // Step 5: Run supply agent if material need detected
    let supplyResult = null
    if (analysis.category === 'material_need') {
      console.log('[FLOW][API] Step 5: Material need detected, running supply agent...')
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      try {
        supplyResult = await runSupplyAgent({
          spanishText,
          englishText: englishRaw,
          workerId,
          messageId: message.id,
        })
        console.log('[FLOW][API] Supply agent complete, isSupply:', supplyResult.isSupplyRequest)

        // Send supply request to supervisor via WhatsApp
        if (supplyResult.isSupplyRequest && supplyResult.whatsappMessage && supervisorWhatsApp) {
          await sendWhatsAppMessage(supervisorWhatsApp, supplyResult.whatsappMessage)
          console.log('[FLOW][API] Supply request sent to supervisor via WhatsApp')
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          console.error('[FLOW][API] Supply agent timed out after 30s')
        } else {
          console.error('[FLOW][API] Supply agent error:', err)
        }
      } finally {
        clearTimeout(timeout)
      }
    } else {
      console.log('[FLOW][API] Step 5: Category is', analysis.category, '— skipping supply agent')
    }

    console.log('[FLOW][API] Request complete, returning response')
    return NextResponse.json({
      messageId: message.id,
      englishRaw,
      englishFormatted: analysis.englishFormatted,
      category: analysis.category,
      urgency: analysis.urgency,
      supplyRequestId: supplyResult?.supplyRequestId ?? null,
    })
  } catch (error) {
    console.error('[FLOW][API] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
