import { supabase } from './supabaseClient'
import type { Material, Parameter } from '../types'
import materialsJson from '../data/materials.json'
import parametersJson from '../data/parameters.json'

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
