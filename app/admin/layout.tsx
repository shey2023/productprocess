import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center space-y-3">
          <h1 className="text-xl font-bold text-red-600">שגיאת תצורה</h1>
          <p className="text-sm text-gray-600">
            משתני הסביבה חסרים. יש להגדיר ב-Vercel:
          </p>
          <code className="block text-xs bg-gray-100 rounded p-3 text-left break-all">
            NEXT_PUBLIC_SUPABASE_URL<br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
        </div>
      </div>
    )
  }

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">ניהול</span>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            הזמנות
          </Link>
          <Link
            href="/admin/stages"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            שלבים
          </Link>
        </div>
        <form action="/api/logout" method="post">
          <button type="submit" className="text-sm text-gray-400 hover:text-gray-700">
            יציאה
          </button>
        </form>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
