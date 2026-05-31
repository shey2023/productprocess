import { createClient } from '@/lib/supabase/server'

export type Stage = {
  id: string
  name: string
  description: string | null
  position: number
  created_at: string
}

export async function getStages(): Promise<Stage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stages')
    .select('id, name, description, position, created_at')
    .order('position', { ascending: true })

  if (error) throw error
  return data ?? []
}
