import OpenAI from 'openai'

const cerebrasClient = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: 'https://api.cerebras.ai/v1',
})

export async function translateSpanishToEnglish(spanishText: string): Promise<string> {
  try {
    const response = await cerebrasClient.chat.completions.create({
      model: 'llama-3.1-8b-instruct',
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

    return response.choices[0]?.message?.content?.trim() || spanishText
  } catch (error) {
    console.error('Cerebras translation error:', error)
    throw new Error('Translation failed')
  }
}

export async function translateEnglishToSpanish(englishText: string): Promise<string> {
  try {
    const response = await cerebrasClient.chat.completions.create({
      model: 'llama-3.1-8b-instruct',
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

    return response.choices[0]?.message?.content?.trim() || englishText
  } catch (error) {
    console.error('Cerebras translation error:', error)
    throw new Error('Translation failed')
  }
}
