import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DAY = 86400000

const orders = [
  // crew_riverside — anchor bolts
  {
    crewId: 'crew_riverside',
    item: 'anchor bolts 3/8"',
    normalizedItem: 'anchor_bolt',
    quantity: 500,
    unit: 'pieces',
    supplier: 'FastenAll Supply Co.',
    cost: 245.00,
    orderedAt: new Date(Date.now() - 30 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 28 * DAY).toISOString(),
    notes: 'Standard 3/8" galvanized',
  },
  {
    crewId: 'crew_riverside',
    item: 'anchor bolts 3/8"',
    normalizedItem: 'anchor_bolt',
    quantity: 450,
    unit: 'pieces',
    supplier: 'FastenAll Supply Co.',
    cost: 220.50,
    orderedAt: new Date(Date.now() - 60 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 58 * DAY).toISOString(),
    notes: 'Reorder for phase 2',
  },
  {
    crewId: 'crew_riverside',
    item: 'anchor bolts 3/8"',
    normalizedItem: 'anchor_bolt',
    quantity: 600,
    unit: 'pieces',
    supplier: 'FastenAll Supply Co.',
    cost: 294.00,
    orderedAt: new Date(Date.now() - 90 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 87 * DAY).toISOString(),
    notes: 'Initial foundation order',
  },
  // crew_riverside — rebar
  {
    crewId: 'crew_riverside',
    item: 'rebar #4',
    normalizedItem: 'rebar',
    quantity: 200,
    unit: 'pieces',
    supplier: 'SteelMax Distributors',
    cost: 890.00,
    orderedAt: new Date(Date.now() - 15 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 12 * DAY).toISOString(),
    notes: '#4 rebar 20ft lengths',
  },
  {
    crewId: 'crew_riverside',
    item: 'rebar #4',
    normalizedItem: 'rebar',
    quantity: 150,
    unit: 'pieces',
    supplier: 'SteelMax Distributors',
    cost: 667.50,
    orderedAt: new Date(Date.now() - 45 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 42 * DAY).toISOString(),
  },
  // crew_riverside — concrete
  {
    crewId: 'crew_riverside',
    item: 'ready mix concrete',
    normalizedItem: 'concrete',
    quantity: 10,
    unit: 'yards',
    supplier: 'ReadyMix Central',
    cost: 1200.00,
    orderedAt: new Date(Date.now() - 7 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 7 * DAY).toISOString(),
    notes: '3000 PSI mix',
  },
  // crew_downtown — lumber
  {
    crewId: 'crew_downtown',
    item: '2x4 lumber',
    normalizedItem: 'lumber_2x4',
    quantity: 100,
    unit: 'pieces',
    supplier: 'BuildRight Lumber',
    cost: 320.00,
    orderedAt: new Date(Date.now() - 20 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 18 * DAY).toISOString(),
    notes: '8ft studs',
  },
  {
    crewId: 'crew_downtown',
    item: '2x4 lumber',
    normalizedItem: 'lumber_2x4',
    quantity: 80,
    unit: 'pieces',
    supplier: 'BuildRight Lumber',
    cost: 256.00,
    orderedAt: new Date(Date.now() - 50 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 48 * DAY).toISOString(),
  },
  // crew_downtown — drywall
  {
    crewId: 'crew_downtown',
    item: 'drywall 4x8',
    normalizedItem: 'drywall',
    quantity: 50,
    unit: 'sheets',
    supplier: 'WallBoard Direct',
    cost: 420.00,
    orderedAt: new Date(Date.now() - 10 * DAY).toISOString(),
    deliveredAt: new Date(Date.now() - 8 * DAY).toISOString(),
    notes: '1/2" standard',
  },
]

async function seed() {
  console.log('Seeding SupplyOrder table...')

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('SupplyOrder')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows

  if (deleteError) {
    console.error('Error clearing SupplyOrder:', deleteError)
  }

  // Batch insert
  const { data, error } = await supabase
    .from('SupplyOrder')
    .insert(orders)
    .select()

  if (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }

  console.log(`Seeded ${data.length} supply orders`)
  process.exit(0)
}

seed()
