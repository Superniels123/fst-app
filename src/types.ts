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
