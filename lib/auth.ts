export const ADMIN_COOKIE = "jt_admin";

function getSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s) throw new Error("Missing ADMIN_COOKIE_SECRET");
  return s;
}

export async function expectedToken(): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("admin-v1"));
  return Buffer.from(new Uint8Array(sig)).toString("hex");
}

export function checkPasscode(input: string): boolean {
  const expected = process.env.ADMIN_PASSCODE ?? "";
  if (!expected || input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function isValidSession(cookieValue: string | undefined) {
  if (!cookieValue) return false;
  return cookieValue === (await expectedToken());
}
