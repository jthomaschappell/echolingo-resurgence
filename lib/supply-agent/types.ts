export interface SupplyEntities {
  item: string
  normalizedItem: string
  quantity: number | null
  unit: string | null
  urgency: 'normal' | 'high' | 'critical'
}

export interface SupplierRecommendation {
  name: string
  estimatedTotal: number | null
  deliveryDays: number | null
}

export interface HistoryContext {
  averageQuantity: number | null
  lastSupplier: string | null
  averageCost: number | null
  orderCount: number
}

export type SupplyRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'MODIFIED'
  | 'REJECTED'
  | 'QUESTIONED'

export interface SupplyAgentState {
  spanishText: string
  englishText: string
  workerId: string
  messageId: string

  // Detection
  isSupplyRequest: boolean

  // Extraction
  entities: SupplyEntities | null

  // History
  history: HistoryContext | null

  // Formatting
  supplier: SupplierRecommendation | null
  whatsappMessage: string | null
  supplyRequestId: string | null

  // Error
  error: string | null
}
