import { createClient } from '@/lib/supabase/server'

export type Stage = {
  id: string
  key: string
  label: string
  description: string | null
  sort_order: number
  is_final: boolean
  created_at: string
}

export async function getStages(): Promise<Stage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stages')
    .select('id, key, label, description, sort_order, is_final, created_at')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}
