import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()

  const [{ data: orders }, { data: stages }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, customer_name, jewelry_type, current_stage, estimated_completion_date, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('stages').select('key, label'),
  ])

  const stageMap = Object.fromEntries((stages ?? []).map((s) => [s.key, s.label]))

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-gray-400 tracking-widest mb-1">ניהול</p>
          <h1 className="text-4xl font-bold text-gray-900">הזמנות</h1>
        </div>
        <Link
          href="/admin/orders/new"
          className="px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          + הזמנה חדשה
        </Link>
      </div>

      <div dir="rtl">
        {(orders ?? []).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between border-b border-gray-200 py-4 hover:bg-black/5 -mx-2 px-2 rounded transition-colors group"
          >
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-black">{order.customer_name}</p>
              <p className="text-sm text-gray-400 mt-0.5">{order.jewelry_type}</p>
            </div>
            <div className="text-left">
              <span className="text-sm text-gray-500">
                {stageMap[order.current_stage] ?? order.current_stage}
              </span>
              {order.estimated_completion_date && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.estimated_completion_date).toLocaleDateString('he-IL')}
                </p>
              )}
            </div>
          </Link>
        ))}

        {(!orders || orders.length === 0) && (
          <p className="text-center text-gray-400 text-sm py-16">אין הזמנות עדיין</p>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
        <Link
          href="/admin/stages"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          הגדרות שלבי הייצור ←
        </Link>
      </div>
    </div>
  )
}
