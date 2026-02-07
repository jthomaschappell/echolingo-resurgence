const ITEM_ALIASES: Record<string, string[]> = {
  'anchor_bolt': ['anchor bolt', 'anchor bolts', 'anclaje', 'anclajes', 'anchors', 'ancla'],
  'rebar': ['rebar', 'rebar tie', 'varilla', 'varillas', 'reinforcing bar', 'reinforcement bar'],
  'concrete': ['concrete', 'concreto', 'cement', 'cemento', 'ready mix', 'ready-mix'],
  'lumber_2x4': ['2x4', '2 x 4', 'two by four', 'lumber 2x4', 'madera 2x4'],
  'lumber_2x6': ['2x6', '2 x 6', 'two by six', 'lumber 2x6', 'madera 2x6'],
  'plywood': ['plywood', 'triplay', 'madera contrachapada', 'ply wood'],
  'nail': ['nail', 'nails', 'clavo', 'clavos'],
  'screw': ['screw', 'screws', 'tornillo', 'tornillos'],
  'wire': ['wire', 'alambre', 'wire tie', 'tie wire', 'alambre de amarre'],
  'conduit': ['conduit', 'conduit pipe', 'tubo conduit', 'conducto'],
  'pipe_pvc': ['pvc', 'pvc pipe', 'tubo pvc', 'tubería pvc'],
  'drywall': ['drywall', 'sheetrock', 'tablaroca', 'panel de yeso'],
  'insulation': ['insulation', 'aislamiento', 'aislante', 'fiberglass insulation'],
  'gravel': ['gravel', 'grava', 'aggregate', 'agregado'],
  'sand': ['sand', 'arena'],
  'gloves': ['gloves', 'glove', 'work gloves', 'guantes', 'guante'],
  'safety_glasses': ['safety glasses', 'glasses', 'lentes de seguridad', 'lentes'],
  'hard_hat': ['hard hat', 'hard hats', 'casco', 'cascos'],
}

const UNIT_ALIASES: Record<string, string[]> = {
  'pieces': ['pieces', 'pcs', 'pc', 'piece', 'piezas', 'pieza', 'unidades', 'unidad', 'ea', 'each', 'units', 'unit'],
  'boxes': ['boxes', 'box', 'cajas', 'caja', 'bx'],
  'bags': ['bags', 'bag', 'bolsas', 'bolsa', 'sacos', 'saco', 'costales', 'costal'],
  'feet': ['feet', 'ft', 'foot', 'pies', 'pie', 'linear feet', 'lf'],
  'yards': ['yards', 'yard', 'yd', 'yardas', 'yarda', 'cubic yards', 'cy'],
  'tons': ['tons', 'ton', 'toneladas', 'tonelada'],
  'sheets': ['sheets', 'sheet', 'hojas', 'hoja', 'láminas', 'lámina'],
  'rolls': ['rolls', 'roll', 'rollos', 'rollo'],
  'gallons': ['gallons', 'gallon', 'gal', 'galones', 'galón'],
  'pounds': ['pounds', 'pound', 'lbs', 'lb', 'libras', 'libra'],
  'pairs': ['pairs', 'pair', 'pares', 'par'],
}

export function normalizeItem(input: string): string {
  if (!input || input.length < 3) return input

  const lower = input.toLowerCase().trim()

  for (const [canonical, aliases] of Object.entries(ITEM_ALIASES)) {
    if (aliases.some((alias) => lower === alias)) {
      return canonical
    }
  }

  return lower.replace(/\s+/g, '_')
}

export function normalizeUnit(input: string): string {
  if (!input) return input

  const lower = input.toLowerCase().trim()

  for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.some((alias) => lower === alias)) {
      return canonical
    }
  }

  return lower
}
