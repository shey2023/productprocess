import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import OrderDetailClient from './OrderDetailClient'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: order }, { data: stages }, { data: updates }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', params.id).single(),
    supabase.from('stages').select('id, key, label, sort_order, is_final').order('sort_order'),
    supabase
      .from('order_updates')
      .select('id, stage, note_text, created_at')
      .eq('order_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (!order) notFound()

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto" dir="rtl">
      <div className="mb-1 text-sm text-gray-400">
        <Link href="/admin/orders" className="hover:text-gray-600 transition-colors">
          ← חזרה להזמנות
        </Link>
      </div>

      <div className="mt-6 mb-2">
        <p className="text-xs text-gray-400 tracking-widest mb-1">הזמנה</p>
        <h1 className="text-4xl font-bold text-gray-900">{order.customer_name}</h1>
        <p className="text-gray-400 mt-1">{order.jewelry_type}</p>
      </div>

      {/* Public link */}
      <div className="mt-3 mb-8">
        <a
          href={`/order/${order.public_token}`}
          target="_blank"
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          קישור ללקוח ←
        </a>
      </div>

      <OrderDetailClient
        order={order}
        stages={stages ?? []}
        updates={updates ?? []}
      />
    </div>
  )
}
