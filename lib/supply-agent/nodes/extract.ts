import { SupplyAgentState, SupplyEntities } from '../types'
import { normalizeItem, normalizeUnit } from '../tools/normalize'
import { cerebrasClient } from '@/lib/cerebras'

export async function extractEntities(state: SupplyAgentState): Promise<Partial<SupplyAgentState>> {
  try {
    console.log('[FLOW][SupplyAgent][Extract] Extracting entities from:', state.englishText?.slice(0, 80))

    const response = await cerebrasClient.chat.completions.create({
      model: 'llama3.1-8b',
      messages: [
        {
          role: 'system',
          content: `You are a construction supply extraction assistant. Extract supply request details from the message.
Respond ONLY with a JSON object:
{
  "item": "the item name in English",
  "quantity": number or null if not specified,
  "unit": "unit of measurement" or null if not specified,
  "urgency": "normal" | "high" | "critical"
}`,
        },
        {
          role: 'user',
          content: `Spanish: ${state.spanishText}\nEnglish: ${state.englishText}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    })

    const text = response.choices[0]?.message?.content?.trim()
    if (!text) {
      console.log('[FLOW][SupplyAgent][Extract] No response from LLM')
      return { entities: null, error: 'Entity extraction returned empty response' }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.log('[FLOW][SupplyAgent][Extract] No JSON in response:', text)
      return { entities: null, error: 'Entity extraction returned non-JSON response' }
    }

    const parsed = JSON.parse(jsonMatch[0])

    const entities: SupplyEntities = {
      item: parsed.item || 'unknown',
      normalizedItem: normalizeItem(parsed.item || 'unknown'),
      quantity: parsed.quantity ?? null,
      unit: parsed.unit ? normalizeUnit(parsed.unit) : null,
      urgency: parsed.urgency || 'normal',
    }

    console.log('[FLOW][SupplyAgent][Extract] Extracted:', entities)
    return { entities }
  } catch (error) {
    console.error('[FLOW][SupplyAgent][Extract] Error:', error)
    return { entities: null, error: `Entity extraction failed: ${error}` }
  }
}
