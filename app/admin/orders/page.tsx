import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_name, jewelry_type, current_stage, estimated_completion_date, created_at')
    .order('created_at', { ascending: false })

  const { data: stages } = await supabase
    .from('stages')
    .select('key, label')

  const stageMap = Object.fromEntries((stages ?? []).map((s) => [s.key, s.label]))

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הזמנות</h1>
        <Link
          href="/admin/orders/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + הזמנה חדשה
        </Link>
      </div>

      <div className="space-y-3">
        {(orders ?? []).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                <p className="text-sm text-gray-500">{order.jewelry_type}</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                {stageMap[order.current_stage] ?? order.current_stage}
              </span>
            </div>
          </Link>
        ))}

        {(!orders || orders.length === 0) && (
          <p className="text-center text-gray-400 text-sm py-12">אין הזמנות עדיין</p>
        )}
      </div>
    </div>
  )
}
