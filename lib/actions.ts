'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStage(label: string, description: string | null = null) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('stages')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 10 : 10

  const key = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_֐-׿]/g, '')
    + '_' + Math.random().toString(36).slice(2, 6)

  const { error } = await supabase.from('stages').insert({
    key,
    label,
    description,
    sort_order: nextOrder,
    is_final: false,
  })

  if (error) throw error
  revalidatePath('/admin/stages')
}

export async function updateStage(
  id: string,
  label: string,
  description: string | null,
  is_final: boolean
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('stages')
    .update({ label, description, is_final })
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
      supabase.from('stages').update({ sort_order: (index + 1) * 10 }).eq('id', id)
    )
  )

  revalidatePath('/admin/stages')
}
