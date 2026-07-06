export interface Material {
  map: string
  codes: string[]
  primaire_code: string
  type: 'C' | 'K' | 'M' | 'W' | string
  type_naam: string
  naam: string
  status: 'actief' | 'stop' | string
  oem_bronnen: string[]
  fst_datasheet?: string | null
  bestanden: string[]
  pad: string
  controle_nodig: boolean
}

export interface Parameter {
  bestand: string
  gun: string | null
  gas: string | null
  pad: string
}

export interface Equivalent {
  categorie: string
  pac_alloy: string
  samenstelling: string | null
  hardheid: string | null
  korrelgrootte: string | null
  praxair: string | null
  amdry: string | null
  metco: string | null
}

export interface ApprovalRow {
  pac_product: string
  omschrijving: string | null
  metco: string | null
  approvals: Record<string, string>
}

export interface SystemModule {
  categorie: string
  module: string
  omschrijving: string | null
  kostprijs_eur: number
  leverancier: string | null
  prijs_type: 'vast' | 'percentage' | string
}

export interface LaborRate {
  soort: string
  per_uur: number
  per_dag: number
}

export interface LaborActivity {
  activiteit: string
  standaard_uren: number
}

export interface Quote {
  id: string
  projectnr: string | null
  klant: string | null
  datum: string
  status: string
  marge_pct: number
  materiaalkosten: number
  arbeidskosten: number
  cogs: number
  verkoopprijs: number
  created_by: string | null
  created_at: string
}

export interface QuoteLine {
  id: number
  quote_id: string
  soort: 'module' | 'arbeid' | string
  categorie: string | null
  omschrijving: string | null
  aantal: number | null
  uren: number | null
  tarief: number | null
  kostprijs: number | null
  regel_totaal: number
}
