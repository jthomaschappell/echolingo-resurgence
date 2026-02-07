import Anthropic from '@anthropic-ai/sdk'

export const claudeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface MessageAnalysis {
  category: 'delay_report' | 'clarification' | 'completion' | 'safety' | 'material_need'
  urgency: 'normal' | 'high'
  englishFormatted: string
}

export async function analyzeAndReformatMessage(
  spanishText: string,
  englishRaw: string
): Promise<MessageAnalysis> {
  // Check for urgency keywords
  const urgencyKeywords = /emergencia|peligro|accidente|lesión/i
  const hasUrgency = urgencyKeywords.test(spanishText)
  console.log('[FLOW][Claude] analyzeAndReformatMessage called, hasUrgency:', hasUrgency)

  try {
    console.log('[FLOW][Claude] Calling Claude API for analysis...')
    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Analyze this construction site communication and provide:
1. Category: one of [delay_report, clarification, completion, safety, material_need]
2. A professionally formatted English message suitable for a construction supervisor

Original Spanish: "${spanishText}"
English Translation: "${englishRaw}"

Respond in JSON format:
{
  "category": "delay_report|clarification|completion|safety|material_need",
  "englishFormatted": "Professional English message formatted for supervisor communication"
}`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const text = content.text.trim()
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const result = {
          category: parsed.category || 'clarification',
          urgency: hasUrgency ? 'high' : 'normal',
          englishFormatted: parsed.englishFormatted || englishRaw,
        }
        console.log('[FLOW][Claude] analyzeAndReformatMessage done:', result)
        return result
      }
    }

    // Fallback
    console.log('[FLOW][Claude] analyzeAndReformatMessage using fallback (no JSON parsed)')
    return {
      category: hasUrgency ? 'safety' : 'clarification',
      urgency: hasUrgency ? 'high' : 'normal',
      englishFormatted: englishRaw,
    }
  } catch (error) {
    console.error('[FLOW][Claude] analyzeAndReformatMessage error (using fallback):', error)
    // Fallback to basic formatting
    return {
      category: hasUrgency ? 'safety' : 'clarification',
      urgency: hasUrgency ? 'high' : 'normal',
      englishFormatted: englishRaw,
    }
  }
}

export async function extractActionItems(englishText: string): Promise<string> {
  try {
    console.log('[FLOW][Claude] extractActionItems called, input:', englishText?.slice(0, 80) + '...')
    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract and summarize the key action items from this supervisor message in bullet points. Format as a concise Spanish summary suitable for a construction worker.

Message: "${englishText}"

Respond with a brief Spanish summary of action items.`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const result = content.text.trim()
      console.log('[FLOW][Claude] extractActionItems done, output:', result?.slice(0, 80) + '...')
      return result
    }

    console.log('[FLOW][Claude] extractActionItems fallback (no text content)')
    return 'Mensaje del supervisor recibido.'
  } catch (error) {
    console.error('[FLOW][Claude] extractActionItems error:', error)
    return 'Mensaje del supervisor recibido.'
  }
}
