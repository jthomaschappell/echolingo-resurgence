import Anthropic from '@anthropic-ai/sdk'

const claudeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface MessageAnalysis {
  category: 'delay_report' | 'clarification' | 'completion' | 'safety'
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

  try {
    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Analyze this construction site communication and provide:
1. Category: one of [delay_report, clarification, completion, safety]
2. A professionally formatted English message suitable for a construction supervisor

Original Spanish: "${spanishText}"
English Translation: "${englishRaw}"

Respond in JSON format:
{
  "category": "delay_report|clarification|completion|safety",
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
        return {
          category: parsed.category || 'clarification',
          urgency: hasUrgency ? 'high' : 'normal',
          englishFormatted: parsed.englishFormatted || englishRaw,
        }
      }
    }

    // Fallback
    return {
      category: hasUrgency ? 'safety' : 'clarification',
      urgency: hasUrgency ? 'high' : 'normal',
      englishFormatted: englishRaw,
    }
  } catch (error) {
    console.error('Claude analysis error:', error)
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
      return content.text.trim()
    }

    return 'Mensaje del supervisor recibido.'
  } catch (error) {
    console.error('Claude action extraction error:', error)
    return 'Mensaje del supervisor recibido.'
  }
}
