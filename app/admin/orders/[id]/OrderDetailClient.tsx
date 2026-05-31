'use client'

import { useState, useTransition } from 'react'

type Stage = { id: string; key: string; label: string; sort_order: number; is_final: boolean }
type Update = { id: string; stage: string; note_text: string | null; created_at: string }
type Order = {
  id: string
  customer_name: string
  phone_number: string | null
  jewelry_type: string
  material: string | null
  stones: string | null
  size: string | null
  price: number | null
  currency: string
  estimated_completion_date: string | null
  current_stage: string
  internal_notes: string | null
  public_token: string
}

export default function OrderDetailClient({
  order,
  stages,
  updates,
}: {
  order: Order
  stages: Stage[]
  updates: Update[]
}) {
  const [currentStage, setCurrentStage] = useState(order.current_stage)
  const [note, setNote] = useState('')
  const [allUpdates, setAllUpdates] = useState(updates)
  const [isPending, startTransition] = useTransition()

  const stageMap = Object.fromEntries(stages.map((s) => [s.key, s.label]))

  async function handleStageChange(newStage: string) {
    setCurrentStage(newStage)
    startTransition(async () => {
      await fetch(`/api/orders/${order.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
    })
  }

  async function handleAddUpdate() {
    if (!note.trim()) return
    startTransition(async () => {
      const res = await fetch(`/api/orders/${order.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: note, stage: currentStage }),
      })
      if (res.ok) {
        const newUpdate = await res.json()
        setAllUpdates((prev) => [newUpdate, ...prev])
        setNote('')
      }
    })
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Order info */}
      <div className="space-y-3 border-b border-gray-200 pb-6">
        {[
          { label: 'טלפון', value: order.phone_number },
          { label: 'חומר', value: order.material },
          { label: 'אבנים', value: order.stones },
          { label: 'מידה', value: order.size },
          { label: 'מחיר', value: order.price ? `${order.price} ${order.currency}` : null },
          {
            label: 'תאריך יעד',
            value: order.estimated_completion_date
              ? new Date(order.estimated_completion_date).toLocaleDateString('he-IL')
              : null,
          },
        ]
          .filter((f) => f.value)
          .map((f) => (
            <div key={f.label} className="flex justify-between text-sm">
              <span className="text-gray-400">{f.label}</span>
              <span className="text-gray-800">{f.value}</span>
            </div>
          ))}

        {order.internal_notes && (
          <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            {order.internal_notes}
          </div>
        )}
      </div>

      {/* Stage selector */}
      <div>
        <p className="text-xs text-gray-400 tracking-widest mb-3">שלב נוכחי</p>
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <button
              key={stage.key}
              onClick={() => handleStageChange(stage.key)}
              className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                currentStage === stage.key
                  ? 'border-gray-800 bg-gray-800 text-white'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add update */}
      <div>
        <p className="text-xs text-gray-400 tracking-widest mb-3">הוסף עדכון</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="הערה ללקוח..."
          className="w-full bg-transparent border-b border-gray-300 focus:border-gray-600 outline-none text-sm pb-1 text-right resize-none"
        />
        <button
          onClick={handleAddUpdate}
          disabled={!note.trim() || isPending}
          className="mt-3 px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          {isPending ? '...' : 'שלח עדכון'}
        </button>
      </div>

      {/* Updates history */}
      {allUpdates.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 tracking-widest mb-3">היסטוריה</p>
          <div className="space-y-3">
            {allUpdates.map((u) => (
              <div key={u.id} className="border-b border-gray-100 pb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{stageMap[u.stage] ?? u.stage}</span>
                  <span>{new Date(u.created_at).toLocaleDateString('he-IL')}</span>
                </div>
                {u.note_text && <p className="text-sm text-gray-700">{u.note_text}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
