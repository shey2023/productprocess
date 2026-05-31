"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin, JEWELRY_BUCKET } from "@/lib/supabase-server";

function newToken(): string {
  return randomBytes(12).toString("hex");
}

function slugify(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return base ? `${base}_${randomBytes(2).toString("hex")}` : randomBytes(4).toString("hex");
}

export async function addStage(label: string, description: string | null = null, isFinal = false) {
  if (!label.trim()) throw new Error("label required");

  const { data: last } = await supabaseAdmin
    .from("stages")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("stages").insert({
    key: slugify(label),
    label: label.trim(),
    description: description ?? '',
    sort_order: (last?.sort_order ?? 0) + 10,
    is_final: isFinal,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/stages");
}

export async function updateStage(
  id: string,
  label: string,
  description: string | null,
  is_final: boolean,
) {
  const { error } = await supabaseAdmin
    .from("stages")
    .update({ label, description: description ?? '', is_final })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/stages");
}

export async function deleteUpdate(updateId: string, orderId: string) {
  const { data: images } = await supabaseAdmin
    .from("order_update_images")
    .select("storage_path")
    .eq("update_id", updateId);

  if (images?.length) {
    await supabaseAdmin.storage.from(JEWELRY_BUCKET).remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabaseAdmin.from("order_updates").delete().eq("id", updateId);
  if (error) throw new Error(error.message);

  // Revert current_stage to latest remaining update, if any
  const { data: latest } = await supabaseAdmin
    .from("order_updates")
    .select("stage")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest) {
    await supabaseAdmin.from("orders").update({ current_stage: latest.stage }).eq("id", orderId);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function deleteStage(stageId: string) {
  const { error } = await supabaseAdmin.from("stages").delete().eq("id", stageId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/stages");
}

export async function reorderStages(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabaseAdmin.from("stages").update({ sort_order: (index + 1) * 10 }).eq("id", id),
    ),
  );
  revalidatePath("/admin/stages");
}

export async function createOrder(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v ? String(v).trim() : null;
  };

  const priceRaw = get("price");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      public_token: newToken(),
      customer_name: get("customer_name"),
      phone_number: get("phone_number"),
      jewelry_type: get("jewelry_type"),
      material: get("material"),
      stones: get("stones"),
      size: get("size"),
      price: priceRaw ? Number(priceRaw) : null,
      estimated_completion_date: get("estimated_completion_date"),
      internal_notes: get("internal_notes"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  redirect(`/admin/orders/${data.id}`);
}

export async function updateOrderDetails(orderId: string, formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v ? String(v).trim() : null;
  };
  const priceRaw = get("price");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      customer_name: get("customer_name"),
      phone_number: get("phone_number"),
      jewelry_type: get("jewelry_type"),
      material: get("material"),
      stones: get("stones"),
      size: get("size"),
      price: priceRaw ? Number(priceRaw) : null,
      estimated_completion_date: get("estimated_completion_date"),
      internal_notes: get("internal_notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function deleteOrder(orderId: string) {
  const { data: updates } = await supabaseAdmin
    .from("order_updates")
    .select("id, order_update_images(storage_path)")
    .eq("order_id", orderId);

  const paths =
    updates?.flatMap((u) =>
      (u.order_update_images ?? []).map((i) => i.storage_path),
    ) ?? [];

  if (paths.length) {
    await supabaseAdmin.storage.from(JEWELRY_BUCKET).remove(paths);
  }

  const { error } = await supabaseAdmin.from("orders").delete().eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  redirect(
    `/admin?toast=success&msg=${encodeURIComponent("ההזמנה נמחקה בהצלחה")}`,
  );
}

export async function addUpdate(orderId: string, formData: FormData) {
  const stage = String(formData.get("stage") ?? "").trim();
  const note = String(formData.get("note_text") ?? "").trim();
  if (!stage) throw new Error("stage required");

  const { data: upd, error: updErr } = await supabaseAdmin
    .from("order_updates")
    .insert({ order_id: orderId, stage, note_text: note || null })
    .select("id")
    .single();
  if (updErr) throw new Error(updErr.message);

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${orderId}/${upd.id}/${randomBytes(6).toString("hex")}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabaseAdmin.storage
      .from(JEWELRY_BUCKET)
      .upload(path, buf, { contentType: file.type || "image/jpeg" });
    if (upErr) throw new Error(upErr.message);
    await supabaseAdmin
      .from("order_update_images")
      .insert({ update_id: upd.id, storage_path: path });
  }

  await supabaseAdmin
    .from("orders")
    .update({ current_stage: stage, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
}
