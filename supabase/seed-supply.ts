import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('Seeding demo data...')

  // --- Messages ---
  console.log('Seeding Message table...')
  const { error: msgError } = await supabase.from('Message').upsert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      workerId: 'worker-01',
      spanishRaw: 'Necesitamos más concreto en la zona norte.',
      englishRaw: 'We need more concrete in the north area.',
      englishFormatted: 'Requesting additional concrete for the north zone.',
      category: 'materials',
      urgency: 'high',
      twilioSid: 'SM0001',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      workerId: 'worker-02',
      spanishRaw: 'La entrega llegó dañada.',
      englishRaw: 'The delivery arrived damaged.',
      englishFormatted: 'Report of damaged delivery.',
      category: 'issue',
      urgency: 'urgent',
      twilioSid: 'SM0002',
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      workerId: 'worker-03',
      spanishRaw: '¿Podemos recibir más guantes?',
      englishRaw: 'Can we receive more gloves?',
      englishFormatted: 'Request for additional gloves.',
      category: 'materials',
      urgency: 'normal',
      twilioSid: 'SM0003',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ], { onConflict: 'id' })

  if (msgError) console.error('Message seed error:', msgError)
  else console.log('Messages seeded')

  // --- Supervisor Replies ---
  console.log('Seeding SupervisorReply table...')
  const { error: replyError } = await supabase.from('SupervisorReply').upsert([
    {
      id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      messageId: '11111111-1111-1111-1111-111111111111',
      englishRaw: 'Approved. Ordering one more truck.',
      spanishTrans: 'Aprobado. Pediremos otro camión.',
      actionSummary: 'Order extra concrete truck.',
      createdAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    },
    {
      id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
      messageId: '22222222-2222-2222-2222-222222222222',
      englishRaw: 'Take photos and send to supplier.',
      spanishTrans: 'Tomen fotos y envíenlas al proveedor.',
      actionSummary: 'Collect evidence and notify supplier.',
      createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    },
  ], { onConflict: 'id' })

  if (replyError) console.error('SupervisorReply seed error:', replyError)
  else console.log('SupervisorReplies seeded')

  // --- Supply Orders ---
  console.log('Seeding SupplyOrder table...')
  const { error: delOrderError } = await supabase
    .from('SupplyOrder')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (delOrderError) console.error('Error clearing SupplyOrder:', delOrderError)

  const { error: orderError } = await supabase.from('SupplyOrder').insert([
    {
      id: 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      crewId: 'crew-A',
      item: 'Concrete 4000 PSI',
      normalizedItem: 'concrete',
      quantity: 10,
      unit: 'yards',
      supplier: 'Best Concrete Co',
      cost: 2500.00,
      orderedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      deliveredAt: null,
      notes: 'Rush order',
    },
    {
      id: 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
      crewId: 'crew-B',
      item: 'Work gloves',
      normalizedItem: 'gloves',
      quantity: 50,
      unit: 'pairs',
      supplier: 'Safety Supply',
      cost: 320.00,
      orderedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      notes: null,
    },
  ])

  if (orderError) console.error('SupplyOrder seed error:', orderError)
  else console.log('SupplyOrders seeded')

  // --- Supply Requests ---
  console.log('Seeding SupplyRequest table...')
  const { error: delReqError } = await supabase
    .from('SupplyRequest')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (delReqError) console.error('Error clearing SupplyRequest:', delReqError)

  const { error: reqError } = await supabase.from('SupplyRequest').insert([
    {
      id: 'ccccccc1-cccc-cccc-cccc-ccccccccccc1',
      originalMessageId: '11111111-1111-1111-1111-111111111111',
      crewId: 'crew-A',
      workerId: 'worker-01',
      item: 'Concrete 4000 PSI',
      normalizedItem: 'concrete',
      quantity: 10,
      unit: 'yards',
      urgency: 'high',
      status: 'APPROVED',
      suggestedQuantity: 12,
      suggestedSupplier: 'Best Concrete Co',
      estimatedTotal: 3000.00,
      responseTimeMinutes: 15,
      approvedBy: 'supervisor-1',
      approvedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      modifiedQuantity: 12,
      rejectionReason: null,
      createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    },
    {
      id: 'ccccccc2-cccc-cccc-cccc-ccccccccccc2',
      originalMessageId: '33333333-3333-3333-3333-333333333333',
      crewId: 'crew-B',
      workerId: 'worker-03',
      item: 'Work gloves',
      normalizedItem: 'gloves',
      quantity: null,
      unit: 'pairs',
      urgency: 'normal',
      status: 'PENDING',
      suggestedQuantity: 40,
      suggestedSupplier: 'Safety Supply',
      estimatedTotal: 250.00,
      responseTimeMinutes: null,
      approvedBy: null,
      approvedAt: null,
      modifiedQuantity: null,
      rejectionReason: null,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'ccccccc3-cccc-cccc-cccc-ccccccccccc3',
      originalMessageId: null,
      crewId: 'crew-C',
      workerId: 'worker-09',
      item: 'Lumber 2x4',
      normalizedItem: 'lumber_2x4',
      quantity: 100,
      unit: 'pieces',
      urgency: 'normal',
      status: 'REJECTED',
      suggestedQuantity: 80,
      suggestedSupplier: 'Timber Yard',
      estimatedTotal: 900.00,
      responseTimeMinutes: 60,
      approvedBy: null,
      approvedAt: null,
      modifiedQuantity: null,
      rejectionReason: 'Already over budget.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ])

  if (reqError) console.error('SupplyRequest seed error:', reqError)
  else console.log('SupplyRequests seeded')

  console.log('Done!')
  process.exit(0)
}

seed()
