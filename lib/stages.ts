import "server-only";
import { supabaseAdmin } from "./supabase-server";

export type Stage = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_final: boolean;
};

export async function getStages(): Promise<Stage[]> {
  const { data } = await supabaseAdmin
    .from("stages")
    .select("id, key, label, description, sort_order, is_final")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export function stageLabelFrom(stages: Stage[], key: string): string {
  return stages.find((s) => s.key === key)?.label ?? key;
}

export function isFinalStage(stages: Stage[], key: string): boolean {
  return stages.find((s) => s.key === key)?.is_final ?? false;
}
