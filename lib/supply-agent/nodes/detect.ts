import { SupplyAgentState } from '../types'

const SUPPLY_VERBS = /need|necesit|ran out|running low|se (nos )?acab|faltan?|requeri|order|pedir|comprar|buy|out of|no (tenemos|hay|queda)/i
const SUPPLY_ITEMS = /bolt|anchor|rebar|concrete|lumber|wood|nail|screw|wire|pipe|drywall|insulation|gravel|sand|cement|plywood|varilla|clavo|tornillo|alambre|tubo|madera|cemento|arena|grava|anclaje|concreto/i

export function detectSupplyRequest(state: SupplyAgentState): Partial<SupplyAgentState> {
  const combined = `${state.spanishText} ${state.englishText}`

  const hasVerb = SUPPLY_VERBS.test(combined)
  const hasItem = SUPPLY_ITEMS.test(combined)

  const isSupplyRequest = hasVerb && hasItem

  console.log('[FLOW][SupplyAgent][Detect]', {
    hasVerb,
    hasItem,
    isSupplyRequest,
  })

  return { isSupplyRequest }
}
