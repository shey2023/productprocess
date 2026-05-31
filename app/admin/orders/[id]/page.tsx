import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabaseAdmin, JEWELRY_BUCKET } from "@/lib/supabase-server";
import { getStages, stageLabelFrom } from "@/lib/stages";
import { updateOrderDetails, addUpdate, deleteOrder, deleteUpdate } from "@/lib/actions";
import CopyLink from "@/components/CopyLink";
import DeleteOrderButton from "@/components/DeleteOrderButton";
import DeleteUpdateButton from "@/components/DeleteUpdateButton";

export const dynamic = "force-dynamic";

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const stages = await getStages();

  const { data: updates } = await supabaseAdmin
    .from("order_updates")
    .select("id, stage, note_text, created_at, order_update_images(storage_path)")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  const allPaths =
    updates?.flatMap((u) =>
      (u.order_update_images ?? []).map((i) => i.storage_path),
    ) ?? [];
  const signed = new Map<string, string>();
  if (allPaths.length) {
    const { data } = await supabaseAdmin.storage
      .from(JEWELRY_BUCKET)
      .createSignedUrls(allPaths, 3600);
    data?.forEach((d) => {
      if (d.signedUrl && d.path) signed.set(d.path, d.signedUrl);
    });
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const trackUrl = `${proto}://${host}/track/${order.public_token}`;

  const phone = order.phone_number?.replace(/\D/g, "");
  const waUrl = phone
    ? `https://wa.me/972${phone.replace(/^0/, "")}?text=${encodeURIComponent(
        `שלום ${order.customer_name}, הנה הקישור למעקב אחר התכשיט שלך: ${trackUrl}`,
      )}`
    : null;

  const updateDetails = updateOrderDetails.bind(null, id);
  const submitUpdate = addUpdate.bind(null, id);
  const removeOrder = deleteOrder.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href="/admin"
        className="text-xs tracking-wide text-stone transition hover:text-ink"
      >
        ← חזרה להזמנות
      </Link>

      <header className="mb-10 mt-6 border-b border-hairline pb-6 sm:mb-12 sm:mt-8 sm:pb-8">
        <p className="eyebrow mb-2">{stageLabelFrom(stages, order.current_stage)}</p>
        <h1 className="text-2xl font-normal text-ink sm:text-3xl">{order.customer_name}</h1>
        <p className="mt-1 text-sm text-stone">{order.jewelry_type}</p>
        {order.phone_number && (
          <p className="mt-1 text-sm text-stone" dir="ltr">{order.phone_number}</p>
        )}
      </header>

      {/* Customer link + WhatsApp */}
      <section className="mb-10 sm:mb-12">
        <p className="eyebrow mb-3">קישור ללקוח</p>
        <CopyLink url={trackUrl} />
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm text-stone transition hover:border-[#25D366] hover:text-[#25D366]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            שלח קישור ב-WhatsApp
          </a>
        )}
      </section>

      {/* New update */}
      <section className="panel mb-8 p-5 sm:p-8">
        <h2 className="mb-5 text-lg font-normal text-ink sm:mb-6 sm:text-xl">עדכון חדש</h2>
        <form action={submitUpdate} className="space-y-4">
          <div>
            <label className="label">שלב</label>
            <select name="stage" defaultValue={order.current_stage} className="field">
              {stages.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">הערה ללקוח</label>
            <textarea name="note_text" rows={3} className="field" />
          </div>
          <div>
            <label className="label">תמונות</label>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              className="block w-full text-sm text-stone file:mr-0 file:ml-4 file:rounded-full file:border file:border-hairline file:bg-ivory file:px-4 file:py-2 file:text-sm file:text-ink"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3 sm:w-auto">
            פרסם עדכון
          </button>
        </form>
      </section>

      {/* Order details */}
      <section className="panel mb-10 p-5 sm:mb-12 sm:p-8">
        <h2 className="mb-5 text-lg font-normal text-ink sm:mb-6 sm:text-xl">פרטי הזמנה</h2>
        <form action={updateDetails} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">שם הלקוח</label>
              <input name="customer_name" defaultValue={order.customer_name ?? ""} className="field" />
            </div>
            <div>
              <label className="label">טלפון / WhatsApp</label>
              <input name="phone_number" type="tel" defaultValue={order.phone_number ?? ""} className="field" dir="ltr" />
            </div>
            <div>
              <label className="label">סוג תכשיט</label>
              <input name="jewelry_type" defaultValue={order.jewelry_type ?? ""} className="field" />
            </div>
            <div>
              <label className="label">חומר</label>
              <input name="material" defaultValue={order.material ?? ""} className="field" />
            </div>
            <div>
              <label className="label">אבנים</label>
              <input name="stones" defaultValue={order.stones ?? ""} className="field" />
            </div>
            <div>
              <label className="label">מידה</label>
              <input name="size" defaultValue={order.size ?? ""} className="field" />
            </div>
            <div>
              <label className="label">מחיר (₪)</label>
              <input name="price" type="number" step="0.01" defaultValue={order.price ?? ""} className="field" />
            </div>
            <div>
              <label className="label">תאריך סיום משוער</label>
              <input name="estimated_completion_date" type="date" defaultValue={order.estimated_completion_date ?? ""} className="field" />
            </div>
          </div>
          <div>
            <label className="label">הערות פנימיות</label>
            <textarea
              name="internal_notes"
              rows={3}
              defaultValue={order.internal_notes ?? ""}
              placeholder="הערות לשימוש פנימי בלבד — הלקוח לא רואה זאת"
              className="field"
            />
          </div>
          <button type="submit" className="btn-ghost w-full py-3 sm:w-auto">
            שמור פרטים
          </button>
        </form>
      </section>

      {/* Update history */}
      <section>
        <p className="eyebrow mb-5 sm:mb-6">היסטוריית עדכונים</p>
        {!updates?.length ? (
          <p className="text-sm text-stone">אין עדיין עדכונים.</p>
        ) : (
          <ol className="relative space-y-8 border-r border-hairline pr-5 sm:pr-6">
            {updates.map((u) => {
              const removeUpdate = deleteUpdate.bind(null, u.id, id);
              return (
              <li key={u.id} className="relative">
                <span className="absolute -right-[25px] top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-ivory sm:-right-[27px]" />
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="font-serif text-base text-ink sm:text-lg">
                    {stageLabelFrom(stages, u.stage)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone">
                      {new Date(u.created_at).toLocaleDateString("he-IL")}
                    </span>
                    <DeleteUpdateButton onConfirm={removeUpdate} />
                  </div>
                </div>
                {u.note_text && (
                  <p className="mb-3 text-sm leading-relaxed text-stone">{u.note_text}</p>
                )}
                {!!u.order_update_images?.length && (
                  <div className="flex flex-wrap gap-2">
                    {u.order_update_images.map((img) => {
                      const src = signed.get(img.storage_path);
                      return src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={img.storage_path} src={src} alt=""
                          className="h-20 w-20 rounded-lg object-cover ring-1 ring-hairline sm:h-24 sm:w-24" />
                      ) : null;
                    })}
                  </div>
                )}
              </li>
            )})}
          </ol>
        )}
      </section>

      {/* Danger zone */}
      <section className="mt-16 border-t border-hairline pt-8">
        <p className="eyebrow mb-3 text-stone/60">אזור מסוכן</p>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-stone">
            מחיקת הזמנה תסיר לצמיתות את כל הנתונים, העדכונים והתמונות.
          </p>
          <DeleteOrderButton
            customerName={order.customer_name ?? "לקוח"}
            onConfirm={removeOrder}
          />
        </div>
      </section>
    </main>
  );
}
