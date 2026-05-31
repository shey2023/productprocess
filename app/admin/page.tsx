import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStages, stageLabelFrom } from "@/lib/stages";
import StatTile from "@/components/StatTile";
import OrderRow from "@/components/OrderRow";
import ToastFromQuery from "@/components/ToastFromQuery";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [{ data: orders }, stages] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id, customer_name, jewelry_type, current_stage, created_at, phone_number")
      .order("created_at", { ascending: false }),
    getStages(),
  ]);

  const total = orders?.length ?? 0;
  const finalStageKeys = new Set(
    stages.filter((s) => s.is_final).map((s) => s.key),
  );
  const done =
    orders?.filter((o) => finalStageKeys.has(o.current_stage)).length ?? 0;
  const inProgress = total - done;

  return (
    <main className="mx-auto max-w-3xl safe-px py-10 sm:py-16">
      <ToastFromQuery />
      <div className="mb-10 border-b border-hairline pb-6 sm:mb-12 sm:pb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">Shey · ניהול</p>
            <h1 className="font-hebrew-serif text-3xl font-normal text-ink sm:text-4xl">
              הזמנות
            </h1>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button className="btn-ghost text-[10px]">יציאה</button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/stages" className="btn-ghost">
            שלבים
          </Link>
          <Link href="/admin/orders/new" className="btn-primary">
            הזמנה חדשה
          </Link>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-12 grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile value={total} label="סה״כ הזמנות" index={0} />
          <StatTile value={inProgress} label="בייצור" accent="gold" index={1} />
          <StatTile value={done} label="הושלמו" index={2} />
        </div>
      )}

      {!orders?.length ? (
        <div className="py-24 text-center">
          <p className="mb-3 font-serif text-3xl text-gold/40">✦</p>
          <p className="text-sm text-stone">
            אין עדיין הזמנות. צרו את ההזמנה הראשונה.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {orders.map((o, i) => {
            const isFinal = finalStageKeys.has(o.current_stage);
            return (
              <OrderRow
                key={o.id}
                order={o}
                stages={stages}
                stageLabel={stageLabelFrom(stages, o.current_stage)}
                isFinal={isFinal}
                index={i}
              />
            );
          })}
        </ul>
      )}
    </main>
  );
}
