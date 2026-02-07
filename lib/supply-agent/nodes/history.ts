import { SupplyAgentState, HistoryContext } from '../types'
import { supabase } from '@/lib/supabase'

export async function lookupHistory(state: SupplyAgentState): Promise<Partial<SupplyAgentState>> {
  if (!state.entities) {
    console.log('[FLOW][SupplyAgent][History] No entities, skipping history lookup')
    return { history: null }
  }

  try {
    const crewId = state.workerId
    const normalizedItem = state.entities.normalizedItem

    console.log('[FLOW][SupplyAgent][History] Looking up history for crew:', crewId, 'item:', normalizedItem)

    const { data: orders, error } = await supabase
      .from('SupplyOrder')
      .select()
      .eq('crewId', crewId)
      .eq('normalizedItem', normalizedItem)
      .order('orderedAt', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[FLOW][SupplyAgent][History] Supabase error:', error)
      return { history: null }
    }

    if (!orders || orders.length === 0) {
      console.log('[FLOW][SupplyAgent][History] No history found')
      return {
        history: {
          averageQuantity: null,
          lastSupplier: null,
          averageCost: null,
          orderCount: 0,
        },
      }
    }

    const quantities = orders.map((o) => o.quantity).filter((q): q is number => q != null)
    const costs = orders.map((o) => o.cost).filter((c): c is number => c != null)

    const history: HistoryContext = {
      averageQuantity: quantities.length > 0 ? Math.round(quantities.reduce((a, b) => a + b, 0) / quantities.length) : null,
      lastSupplier: orders[0].supplier || null,
      averageCost: costs.length > 0 ? Math.round((costs.reduce((a, b) => a + b, 0) / costs.length) * 100) / 100 : null,
      orderCount: orders.length,
    }

    console.log('[FLOW][SupplyAgent][History] Found history:', history)
    return { history }
  } catch (error) {
    console.error('[FLOW][SupplyAgent][History] Error:', error)
    return { history: null }
  }
}
