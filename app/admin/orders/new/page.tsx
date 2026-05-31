'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewOrderPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    customer_name: '',
    phone_number: '',
    jewelry_type: '',
    material: '',
    stones: '',
    size: '',
    price: '',
    estimated_completion_date: '',
    internal_notes: '',
  })

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const { id } = await res.json()
        router.push(`/admin/orders/${id}`)
      }
    })
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-xl mx-auto" dir="rtl">
      <div className="mb-1 text-sm text-gray-400 text-right">
        <Link href="/admin/orders" className="hover:text-gray-600 transition-colors">
          ← חזרה להזמנות
        </Link>
      </div>

      <div className="mt-6 mb-8">
        <p className="text-xs text-gray-400 tracking-widest mb-1">הזמנה חדשה</p>
        <h1 className="text-4xl font-bold text-gray-900">פרטי הזמנה</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { key: 'customer_name', label: 'שם לקוח', required: true },
          { key: 'phone_number', label: 'טלפון' },
          { key: 'jewelry_type', label: 'סוג תכשיט', required: true },
          { key: 'material', label: 'חומר (זהב/כסף...)' },
          { key: 'stones', label: 'אבנים' },
          { key: 'size', label: 'מידה' },
          { key: 'price', label: 'מחיר (₪)', type: 'number' },
          { key: 'estimated_completion_date', label: 'תאריך יעד', type: 'date' },
        ].map(({ key, label, required, type }) => (
          <div key={key}>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            <input
              type={type ?? 'text'}
              value={(form as Record<string, string>)[key]}
              onChange={(e) => set(key, e.target.value)}
              required={required}
              className="w-full bg-transparent border-b border-gray-300 focus:border-gray-600 outline-none text-base pb-1 text-right"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs text-gray-400 mb-1">הערות פנימיות</label>
          <textarea
            value={form.internal_notes}
            onChange={(e) => set('internal_notes', e.target.value)}
            rows={3}
            className="w-full bg-transparent border-b border-gray-300 focus:border-gray-600 outline-none text-sm pb-1 text-right resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-full border border-gray-400 text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 mt-4"
        >
          {isPending ? 'שומר...' : 'צור הזמנה'}
        </button>
      </form>
    </div>
  )
}
