import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
