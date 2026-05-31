import { randomBytes } from "crypto";

export function slugify(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return base ? `${base}_${randomBytes(2).toString("hex")}` : randomBytes(4).toString("hex");
}
