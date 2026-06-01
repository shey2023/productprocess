import { notFound } from "next/navigation";
import { supabaseAdmin, JEWELRY_BUCKET } from "@/lib/supabase-server";
import { getStages, stageLabelFrom, stageDescriptionFrom, isFinalStage } from "@/lib/stages";
import JourneyTrail from "@/components/JourneyTrail";
import UpdateCard from "@/components/UpdateCard";
import CompletionHero from "@/components/CompletionHero";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("public_token", token)
    .single();
  if (!order) notFound();

  const [stages, updatesRes] = await Promise.all([
    getStages(),
    supabaseAdmin
      .from("order_updates")
      .select("id, stage, note_text, created_at, order_update_images(storage_path)")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
  ]);
  const updates = updatesRes.data;

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

  const done = isFinalStage(stages, order.current_stage);
  const heroImage = allPaths.length ? signed.get(allPaths[0]) : undefined;

  // Build the customer-facing journey:
  // unique stages from updates in chronological order (oldest → newest).
  // Skipped stages do not appear. The last item is the current stage.
  const journeySteps: { key: string; label: string }[] = (() => {
    const seen = new Set<string>();
    const out: { key: string; label: string }[] = [];
    const chronological = [...(updates ?? [])].reverse();
    for (const u of chronological) {
      if (!seen.has(u.stage)) {
        seen.add(u.stage);
        out.push({ key: u.stage, label: stageLabelFrom(stages, u.stage) });
      }
    }
    // Edge: no updates yet — still show the current stage as a single step
    if (out.length === 0) {
      out.push({
        key: order.current_stage,
        label: stageLabelFrom(stages, order.current_stage),
      });
    }
    return out;
  })();

  return (
    <main className="mx-auto max-w-2xl safe-px py-10 sm:py-16">
      {done ? (
        <CompletionHero
          customerName={order.customer_name}
          stageLabel={stageLabelFrom(stages, order.current_stage)}
          heroImage={heroImage}
        />
      ) : (
        <header className="mb-14 text-center sm:mb-20">
          <p className="eyebrow mb-4">Shey · בית מלאכה</p>
          <div className="mx-auto mb-4 h-12 w-12">
            <img src="/logo.svg" alt="לוגו שי" className="h-full w-full object-contain" />
          </div>
          <p className="text-sm text-stone">שלום {order.customer_name},</p>
          <h1 className="font-hebrew-serif mt-2 text-3xl font-normal leading-tight text-ink sm:text-5xl">
            {order.jewelry_type}
          </h1>
          <p className="mt-3 text-sm text-stone sm:mt-4">
            התכשיט שלך נמצא כעת בשלב{" "}
            <span className="text-gold-deep">
              {stageLabelFrom(stages, order.current_stage)}
            </span>
          </p>
          {stageDescriptionFrom(stages, order.current_stage) && (
            <p className="mx-auto mt-2 max-w-sm text-xs text-stone/70 italic">
              {stageDescriptionFrom(stages, order.current_stage)}
            </p>
          )}

          {/* Journey so far — shown only when 2+ stages have happened.
              With a single stage, the headline above already tells the story. */}
          {journeySteps.length >= 2 && (
            <div className="mx-auto mt-10 max-w-xl sm:mt-12">
              <JourneyTrail steps={journeySteps} />
            </div>
          )}
        </header>
      )}

      {/* Details */}
      <section className="panel mb-10 grid grid-cols-2 gap-x-4 gap-y-4 p-6 sm:gap-x-6 sm:gap-y-5 sm:p-8 sm:grid-cols-3">
        {order.material && <Detail label="חומר" value={order.material} />}
        {order.stones && <Detail label="אבנים" value={order.stones} />}
        {order.size && <Detail label="מידה" value={order.size} />}
        {order.price != null && (
          <Detail
            label="מחיר"
            value={`${Number(order.price).toLocaleString("he-IL")} ${
              order.currency === "ILS" ? "₪" : order.currency
            }`}
          />
        )}
        {!done && order.estimated_completion_date && (
          <Detail
            label="סיום משוער"
            value={new Date(order.estimated_completion_date).toLocaleDateString(
              "he-IL",
            )}
          />
        )}
      </section>

      {/* Timeline */}
      <section>
        <p className="eyebrow mb-6">עדכונים מבית המלאכה</p>
        {!updates?.length ? (
          <p className="text-sm text-stone">
            עדיין אין עדכונים. נעדכן אותך בקרוב.
          </p>
        ) : (
          <ol className="relative space-y-10 border-r border-hairline pr-5 sm:pr-6">
            {updates.map((u, i) => {
              const images = (u.order_update_images ?? [])
                .map((img) => signed.get(img.storage_path))
                .filter((s): s is string => Boolean(s));
              return (
                <UpdateCard
                  key={u.id}
                  index={i}
                  stageLabel={stageLabelFrom(stages, u.stage)}
                  stageDescription={stageDescriptionFrom(stages, u.stage)}
                  createdAt={u.created_at}
                  noteText={u.note_text}
                  images={images}
                />
              );
            })}
          </ol>
        )}
      </section>

      <footer className="safe-pb mt-16 border-t border-hairline pt-8 text-center sm:mt-20">
        <p className="eyebrow">תודה שבחרת בנו</p>
      </footer>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
