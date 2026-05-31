import Link from "next/link";
import { getStages } from "@/lib/stages";
import StagesClient from "./StagesClient";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
  const stages = await getStages();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/admin"
        className="text-xs tracking-wide text-stone transition hover:text-ink"
      >
        ← חזרה להזמנות
      </Link>
      <p className="eyebrow mb-2 mt-8">הגדרות</p>
      <h1 className="mb-3 text-3xl font-normal text-ink">שלבי הייצור</h1>
      <p className="mb-10 text-sm text-stone">
        הרשימה משותפת לכל ההזמנות. שלב מסומן כ&quot;סופי&quot; מציג ללקוח מסך
        חגיגי של &quot;התכשיט מוכן&quot;.
      </p>

      <StagesClient initialStages={stages} />
    </main>
  );
}
