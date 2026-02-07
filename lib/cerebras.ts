import OpenAI from 'openai'

const cerebrasClient = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: 'https://api.cerebras.ai/v1',
})

export async function translateSpanishToEnglish(spanishText: string): Promise<string> {
  try {
    console.log('[FLOW][Cerebras] translateSpanishToEnglish called, input:', spanishText?.slice(0, 80) + '...')
    const response = await cerebrasClient.chat.completions.create({
      model: 'llama3.1-8b',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate the following Mexican Spanish construction site communication into clear, professional English suitable for a construction supervisor.',
        },
        {
          role: 'user',
          content: spanishText,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const result = response.choices[0]?.message?.content?.trim() || spanishText
    console.log('[FLOW][Cerebras] translateSpanishToEnglish done, output:', result?.slice(0, 80) + '...')
    return result
  } catch (error) {
    console.error('[FLOW][Cerebras] translateSpanishToEnglish error:', error)
    throw new Error('Translation failed')
  }
}

export async function translateEnglishToSpanish(englishText: string): Promise<string> {
  try {
    console.log('[FLOW][Cerebras] translateEnglishToSpanish called, input:', englishText?.slice(0, 80) + '...')
    const response = await cerebrasClient.chat.completions.create({
      model: 'llama3.1-8b',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate the following English construction site communication into clear, colloquial Mexican Spanish suitable for a construction worker.',
        },
        {
          role: 'user',
          content: englishText,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const result = response.choices[0]?.message?.content?.trim() || englishText
    console.log('[FLOW][Cerebras] translateEnglishToSpanish done, output:', result?.slice(0, 80) + '...')
    return result
  } catch (error) {
    console.error('[FLOW][Cerebras] translateEnglishToSpanish error:', error)
    throw new Error('Translation failed')
  }
}
