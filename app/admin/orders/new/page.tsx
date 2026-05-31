import Link from "next/link";
import { createOrder } from "@/lib/actions";

export default function NewOrderPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Link
        href="/admin"
        className="text-xs tracking-wide text-stone transition hover:text-ink"
      >
        ← חזרה להזמנות
      </Link>
      <p className="eyebrow mb-2 mt-8">הזמנה חדשה</p>
      <h1 className="mb-10 text-3xl font-normal text-ink">פרטי הזמנה</h1>

      <form action={createOrder} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="label">שם לקוח *</label>
            <input name="customer_name" required className="field" />
          </div>
          <div>
            <label className="label">טלפון / WhatsApp</label>
            <input name="phone_number" type="tel" className="field" dir="ltr" />
          </div>
          <div>
            <label className="label">סוג תכשיט *</label>
            <input name="jewelry_type" required className="field" />
          </div>
          <div>
            <label className="label">חומר (זהב/כסף...)</label>
            <input name="material" className="field" />
          </div>
          <div>
            <label className="label">אבנים</label>
            <input name="stones" className="field" />
          </div>
          <div>
            <label className="label">מידה</label>
            <input name="size" className="field" />
          </div>
          <div>
            <label className="label">מחיר (₪)</label>
            <input name="price" type="number" step="0.01" className="field" />
          </div>
          <div>
            <label className="label">תאריך יעד לסיום</label>
            <input name="estimated_completion_date" type="date" className="field" />
          </div>
        </div>

        <div>
          <label className="label">הערות פנימיות</label>
          <textarea
            name="internal_notes"
            rows={3}
            placeholder="הערות פנימיות שלא יוצגו ללקוח"
            className="field"
          />
        </div>

        <button type="submit" className="btn-primary w-full py-3 sm:w-auto">
          צור הזמנה
        </button>
      </form>
    </main>
  );
}
