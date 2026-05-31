import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CustomerOrderPage({ params }: { params: { token: string } }) {
  const supabase = await createClient()

  const [{ data: order }, { data: stages }] = await Promise.all([
    supabase.from('orders').select('*').eq('public_token', params.token).single(),
    supabase.from('stages').select('key, label, sort_order, is_final').order('sort_order'),
  ])

  if (!order) notFound()

  const stageList = stages ?? []
  const currentStageData = stageList.find((s) => s.key === order.current_stage)
  const isFinal = currentStageData?.is_final ?? false
  const currentIndex = stageList.findIndex((s) => s.key === order.current_stage)

  return (
    <div className="min-h-screen px-6 py-12 max-w-lg mx-auto" dir="rtl">
      {isFinal ? (
        /* Celebration screen */
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-3xl font-bold text-gray-900">התכשיט מוכן!</h1>
          <p className="text-gray-500">
            {order.customer_name}, התכשיט שלך מוכן לאיסוף.
          </p>
          <p className="text-sm text-gray-400 mt-4">{order.jewelry_type}</p>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <p className="text-xs text-gray-400 tracking-widest mb-1">מעקב הזמנה</p>
            <h1 className="text-3xl font-bold text-gray-900">{order.customer_name}</h1>
            <p className="text-gray-400 mt-1">{order.jewelry_type}</p>
          </div>

          {/* Current stage highlight */}
          <div className="bg-white/60 rounded-2xl p-5 mb-8 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">שלב נוכחי</p>
            <p className="text-xl font-semibold text-gray-900">
              {currentStageData?.label ?? order.current_stage}
            </p>
            {order.estimated_completion_date && (
              <p className="text-sm text-gray-400 mt-2">
                תאריך יעד: {new Date(order.estimated_completion_date).toLocaleDateString('he-IL')}
              </p>
            )}
          </div>

          {/* Stage progress */}
          <div>
            <p className="text-xs text-gray-400 tracking-widest mb-4">תהליך הייצור</p>
            <div className="space-y-0">
              {stageList.filter((s) => !s.is_final).map((stage, index) => {
                const done = index < currentIndex
                const active = stage.key === order.current_stage
                return (
                  <div key={stage.key} className="flex items-center gap-3 border-b border-gray-100 py-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        active ? 'bg-gray-800' : done ? 'bg-gray-300' : 'bg-gray-100 border border-gray-300'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        active ? 'text-gray-900 font-semibold' : done ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                    {done && <span className="mr-auto text-xs text-gray-300">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
