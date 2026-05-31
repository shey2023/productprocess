'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStage(name: string, description: string | null = null) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('stages')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { error } = await supabase
    .from('stages')
    .insert({ name, description, position: nextPosition })

  if (error) throw error
  revalidatePath('/admin/stages')
}

export async function renameStage(id: string, name: string, description: string | null = null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('stages')
    .update({ name, description })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/stages')
}

export async function deleteStage(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('stages').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/admin/stages')
}

export async function reorderStages(orderedIds: string[]) {
  const supabase = await createClient()

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('stages').update({ position: index }).eq('id', id)
    )
  )

  revalidatePath('/admin/stages')
}
