import { supabase } from './supabaseClient'
import type { Material, Parameter, Equivalent, ApprovalRow, SystemModule, LaborRate, LaborActivity } from '../types'
import materialsJson from '../data/materials.json'
import parametersJson from '../data/parameters.json'
import equivalentsJson from '../data/equivalents.json'
import approvalsMatrixJson from '../data/approvals_matrix.json'
import systemModulesJson from '../data/systems_modules.json'
import laborRatesJson from '../data/labor_rates.json'

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase.from('materials').select('*').order('primaire_code')
  if (error || !data || data.length === 0) return materialsJson as Material[]
  return data as Material[]
}

export async function getMaterial(code: string): Promise<Material | null> {
  const { data } = await supabase.from('materials').select('*').eq('primaire_code', code).maybeSingle()
  if (data) return data as Material
  return (materialsJson as Material[]).find((m) => m.primaire_code === code) ?? null
}

export async function getParameters(): Promise<Parameter[]> {
  const { data, error } = await supabase.from('parameters').select('*').order('gun')
  if (error || !data || data.length === 0) return parametersJson as Parameter[]
  return data as Parameter[]
}

export async function getEquivalents(): Promise<Equivalent[]> {
  const { data, error } = await supabase.from('equivalents').select('*').order('pac_alloy')
  if (error || !data || data.length === 0) return equivalentsJson as Equivalent[]
  return data as Equivalent[]
}

export async function getApprovals(): Promise<ApprovalRow[]> {
  const { data, error } = await supabase.from('approvals_matrix').select('*').order('pac_product')
  if (error || !data || data.length === 0) return approvalsMatrixJson as ApprovalRow[]
  return data as ApprovalRow[]
}

export async function getSystemModules(): Promise<SystemModule[]> {
  const { data, error } = await supabase.from('system_modules').select('*').order('categorie')
  if (error || !data || data.length === 0) return systemModulesJson as SystemModule[]
  return data as SystemModule[]
}

export async function getLaborRates(): Promise<LaborRate[]> {
  const { data, error } = await supabase.from('labor_rates').select('*').order('per_uur')
  if (error || !data || data.length === 0) return laborRatesJson.tarieven as LaborRate[]
  return data as LaborRate[]
}

export async function getLaborActivities(): Promise<LaborActivity[]> {
  const { data, error } = await supabase.from('labor_activities').select('*').order('activiteit')
  if (error || !data || data.length === 0) return laborRatesJson.activiteiten as LaborActivity[]
  return data as LaborActivity[]
}
