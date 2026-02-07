import { SupplyAgentState } from './types'
import { detectSupplyRequest } from './nodes/detect'
import { extractEntities } from './nodes/extract'
import { lookupHistory } from './nodes/history'
import { formatAndPersist } from './nodes/format'

export async function runSupplyAgent(input: {
  spanishText: string
  englishText: string
  workerId: string
  messageId: string
}): Promise<SupplyAgentState> {
  console.log('[FLOW][SupplyAgent] Starting supply agent for message:', input.messageId)

  let state: SupplyAgentState = {
    spanishText: input.spanishText,
    englishText: input.englishText,
    workerId: input.workerId,
    messageId: input.messageId,
    isSupplyRequest: false,
    entities: null,
    history: null,
    supplier: null,
    whatsappMessage: null,
    supplyRequestId: null,
    error: null,
  }

  // Validate required inputs
  if (!state.spanishText || !state.englishText) {
    console.log('[FLOW][SupplyAgent] Missing text input, aborting')
    return { ...state, error: 'Missing spanishText or englishText' }
  }

  if (!state.workerId) {
    console.log('[FLOW][SupplyAgent] Missing workerId, aborting')
    return { ...state, error: 'Missing workerId' }
  }

  // Node 1: Detect
  const detectResult = detectSupplyRequest(state)
  state = { ...state, ...detectResult }

  if (!state.isSupplyRequest) {
    console.log('[FLOW][SupplyAgent] Not a supply request, done')
    return state
  }

  // Node 2: Extract entities
  const extractResult = await extractEntities(state)
  state = { ...state, ...extractResult }

  if (!state.entities) {
    console.log('[FLOW][SupplyAgent] Entity extraction failed:', state.error)
    return state
  }

  // Node 3: History lookup
  const historyResult = await lookupHistory(state)
  state = { ...state, ...historyResult }

  // Node 4: Format and persist
  const formatResult = await formatAndPersist(state)
  state = { ...state, ...formatResult }

  console.log('[FLOW][SupplyAgent] Complete. Supply request ID:', state.supplyRequestId)
  return state
}
