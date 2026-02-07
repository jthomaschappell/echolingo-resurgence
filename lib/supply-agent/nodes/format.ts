import { SupplyAgentState, SupplierRecommendation } from '../types'
import { supabase } from '@/lib/supabase'

const SUPPLIER_DB: Record<string, SupplierRecommendation> = {
  anchor_bolt: { name: 'FastenAll Supply Co.', estimatedTotal: 245.00, deliveryDays: 2 },
  rebar: { name: 'SteelMax Distributors', estimatedTotal: 890.00, deliveryDays: 3 },
  concrete: { name: 'ReadyMix Central', estimatedTotal: 1200.00, deliveryDays: 1 },
  lumber_2x4: { name: 'BuildRight Lumber', estimatedTotal: 320.00, deliveryDays: 2 },
  lumber_2x6: { name: 'BuildRight Lumber', estimatedTotal: 480.00, deliveryDays: 2 },
  plywood: { name: 'BuildRight Lumber', estimatedTotal: 560.00, deliveryDays: 2 },
  nail: { name: 'FastenAll Supply Co.', estimatedTotal: 45.00, deliveryDays: 1 },
  screw: { name: 'FastenAll Supply Co.', estimatedTotal: 65.00, deliveryDays: 1 },
  wire: { name: 'SteelMax Distributors', estimatedTotal: 120.00, deliveryDays: 2 },
  conduit: { name: 'ElectroPipe Inc.', estimatedTotal: 340.00, deliveryDays: 3 },
  pipe_pvc: { name: 'PlumbPro Supply', estimatedTotal: 280.00, deliveryDays: 2 },
  drywall: { name: 'WallBoard Direct', estimatedTotal: 420.00, deliveryDays: 2 },
  insulation: { name: 'WallBoard Direct', estimatedTotal: 380.00, deliveryDays: 3 },
  gravel: { name: 'ReadyMix Central', estimatedTotal: 650.00, deliveryDays: 1 },
  sand: { name: 'ReadyMix Central', estimatedTotal: 450.00, deliveryDays: 1 },
  gloves: { name: 'Safety Supply', estimatedTotal: 250.00, deliveryDays: 1 },
  safety_glasses: { name: 'Safety Supply', estimatedTotal: 180.00, deliveryDays: 1 },
  hard_hat: { name: 'Safety Supply', estimatedTotal: 150.00, deliveryDays: 1 },
}

export async function formatAndPersist(state: SupplyAgentState): Promise<Partial<SupplyAgentState>> {
  if (!state.entities) {
    return { error: 'Cannot format: no entities extracted' }
  }

  const entities = state.entities
  const history = state.history
  const supplier = SUPPLIER_DB[entities.normalizedItem] ?? {
    name: 'General Construction Supply',
    estimatedTotal: null,
    deliveryDays: null,
  }

  // Use history average if no quantity specified (falsy-0 safe with ??)
  const quantity = entities.quantity ?? history?.averageQuantity ?? null
  const unit = entities.unit ?? 'pieces'
  const supplierName = history?.lastSupplier ?? supplier.name

  // Build WhatsApp message
  const urgencyEmoji = entities.urgency === 'critical' ? '🔴' : entities.urgency === 'high' ? '🟡' : '🟢'
  const lines: string[] = []

  // Header line (request ID will be added after DB persist)
  lines.push(`${urgencyEmoji} SUPPLY REQUEST`)
  lines.push(``)
  lines.push(`Item: ${entities.item} (${entities.normalizedItem})`)
  if (quantity != null) lines.push(`Quantity: ${quantity} ${unit}`)
  lines.push(`Urgency: ${entities.urgency.toUpperCase()}`)
  lines.push(`Worker: ${state.workerId}`)
  lines.push(``)

  if (history && history.orderCount > 0) {
    lines.push(`📊 History (${history.orderCount} prior orders):`)
    if (history.averageQuantity != null) lines.push(`  Avg qty: ${history.averageQuantity}`)
    if (history.lastSupplier) lines.push(`  Last supplier: ${history.lastSupplier}`)
    if (history.averageCost != null) lines.push(`  Avg cost: $${history.averageCost}`)
    lines.push(``)
  }

  lines.push(`🏪 Suggested supplier: ${supplierName}`)
  if (supplier.estimatedTotal != null) lines.push(`  Est. total: $${supplier.estimatedTotal}`)
  if (supplier.deliveryDays != null) lines.push(`  Delivery: ~${supplier.deliveryDays} days`)
  lines.push(``)
  lines.push(`Reply: APPROVE / MODIFY [qty] / REJECT [reason] / ASK [question]`)

  // Persist to Supabase
  let supplyRequestId: string | null = null
  try {
    const { data: inserted, error: insertError } = await supabase
      .from('SupplyRequest')
      .insert({
        originalMessageId: state.messageId,
        crewId: state.workerId,
        workerId: state.workerId,
        item: entities.item,
        normalizedItem: entities.normalizedItem,
        quantity,
        unit,
        urgency: entities.urgency,
        status: 'PENDING',
        suggestedQuantity: history?.averageQuantity ?? null,
        suggestedSupplier: supplierName,
        estimatedTotal: supplier.estimatedTotal ?? null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[FLOW][SupplyAgent][Format] Supabase insert error:', insertError)
    } else if (inserted) {
      supplyRequestId = inserted.id
      const shortId = inserted.id.slice(-4)
      // Update header with request ID
      lines[0] = `${urgencyEmoji} SUPPLY REQUEST [REQ-${shortId}]`
      console.log('[FLOW][SupplyAgent][Format] Persisted SupplyRequest:', inserted.id)
    }
  } catch (err) {
    console.error('[FLOW][SupplyAgent][Format] DB write failed, returning message without persisting:', err)
  }

  const whatsappMessage = lines.join('\n')

  console.log('[FLOW][SupplyAgent][Format] Formatted message:', whatsappMessage.slice(0, 120) + '...')

  return {
    supplier,
    whatsappMessage,
    supplyRequestId,
  }
}
