import { getStages } from '@/lib/stages'
import StagesClient from './StagesClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StagesPage() {
  const stages = await getStages()

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto" dir="rtl">
      <div className="mb-1 text-sm text-gray-400 text-right">
        <Link href="/admin/orders" className="hover:text-gray-600 transition-colors">
          ← חזרה להזמנות
        </Link>
      </div>

      <div className="mt-6 mb-8 text-right">
        <p className="text-xs text-gray-400 tracking-widest mb-1">הגדרות</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">שלבי הייצור</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          הרשימה משותפת לכל ההזמנות. שלב מסומן כ&quot;סופי&quot; מציג ללקוח מסך חגיגי של &quot;התכשיט מוכן&quot;.
        </p>
      </div>

      <StagesClient initialStages={stages} />
    </div>
  )
}
