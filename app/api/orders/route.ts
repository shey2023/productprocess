import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: body.customer_name,
      phone_number: body.phone_number || null,
      jewelry_type: body.jewelry_type,
      material: body.material || null,
      stones: body.stones || null,
      size: body.size || null,
      price: body.price ? Number(body.price) : null,
      estimated_completion_date: body.estimated_completion_date || null,
      internal_notes: body.internal_notes || null,
      public_token: nanoid(10),
      current_stage: 'קליטת_ההזמנה_9c36',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
