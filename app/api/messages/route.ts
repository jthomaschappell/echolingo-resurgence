import { NextRequest, NextResponse } from 'next/server'
import { translateSpanishToEnglish, translateEnglishToSpanish } from '@/lib/cerebras'
import { analyzeAndReformatMessage, analyzeAndReformatMessageEnglishToSpanish } from '@/lib/claude'
import { sendWhatsAppMessage } from '@/lib/twilio'
import { supabase } from '@/lib/supabase'
import { runSupplyAgent } from '@/lib/supply-agent/graph'

export async function POST(request: NextRequest) {
  try {
    console.log('[FLOW][API] POST /api/messages received')
    const body = await request.json()
    const { workerId, spokenText, spanishText, isSpanishMode } = body
    const text = spokenText ?? spanishText
    const mode = isSpanishMode === true
    console.log('[FLOW][API] Request body:', { workerId, spokenText: text?.slice(0, 80) + '...', isSpanishMode: mode })

    if (!workerId || !text) {
      console.log('[FLOW][API] Validation failed: missing workerId or spokenText')
      return NextResponse.json(
        { error: 'Missing workerId or spokenText' },
        { status: 400 }
      )
    }

    let spanishRaw: string
    let englishRaw: string
    let formattedForSupervisor: string
    let category: string
    let urgency: string
    let contextNotes: string | undefined

    if (mode) {
      // ES mode (UI in Spanish): User spoke Spanish → translate to English → supervisor receives English
      console.log('[FLOW][API] Spanish→English flow (ES mode)')
      const spanishText = text
      console.log('[FLOW][API] Step 1: Calling Cerebras for Spanish→English translation...')
      englishRaw = await translateSpanishToEnglish(spanishText)
      console.log('[FLOW][API] Cerebras translation complete:', { englishRaw: englishRaw?.slice(0, 80) + '...' })

      console.log('[FLOW][API] Step 2: Calling Claude for analysis and reformatting...')
      const analysis = await analyzeAndReformatMessage(spanishText, englishRaw)
      formattedForSupervisor = analysis.englishFormatted
      category = analysis.category
      urgency = analysis.urgency
      contextNotes = analysis.contextNotes
      spanishRaw = spanishText
    } else {
      // EN mode (UI in English): User spoke English → translate to Spanish → supervisor receives Spanish
      console.log('[FLOW][API] English→Spanish flow (EN mode)')
      const englishText = text
      console.log('[FLOW][API] Step 1: Calling Cerebras for English→Spanish translation...')
      spanishRaw = await translateEnglishToSpanish(englishText)
      console.log('[FLOW][API] Cerebras translation complete:', { spanishRaw: spanishRaw?.slice(0, 80) + '...' })

      console.log('[FLOW][API] Step 2: Calling Claude for analysis and Spanish formatting...')
      const analysis = await analyzeAndReformatMessageEnglishToSpanish(englishText, spanishRaw)
      formattedForSupervisor = analysis.spanishFormatted
      category = analysis.category
      urgency = analysis.urgency
      contextNotes = analysis.contextNotes
      englishRaw = englishText
    }

    console.log('[FLOW][API] Claude analysis complete:', {
      category,
      urgency,
      formattedForSupervisor: formattedForSupervisor?.slice(0, 80) + '...',
    })

    // Step 3: Store in database
    console.log('[FLOW][API] Step 3: Storing in PostgreSQL (Supabase)...')
    const { data: message, error: insertError } = await supabase
      .from('Message')
      .insert({
        workerId,
        spanishRaw,
        englishRaw,
        englishFormatted: formattedForSupervisor,
        category,
        urgency,
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
          formattedForSupervisor
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
    if (category === 'material_need') {
      console.log('[FLOW][API] Step 5: Material need detected, running supply agent...')
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      try {
        supplyResult = await runSupplyAgent({
          spanishText: spanishRaw,
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
      console.log('[FLOW][API] Step 5: Category is', category, '— skipping supply agent')
    }

    console.log('[FLOW][API] Request complete, returning response')
    return NextResponse.json({
      messageId: message.id,
      spanishRaw,
      englishRaw,
      englishFormatted: formattedForSupervisor,
      category,
      urgency,
      contextNotes: contextNotes ?? null,
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
