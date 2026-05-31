import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPasscode, expectedToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const passcode = String(form.get("passcode") ?? "");

  if (!checkPasscode(passcode)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=1", req.url),
      { status: 303 },
    );
  }

  const res = NextResponse.redirect(new URL("/admin", req.url), {
    status: 303,
  });
  res.cookies.set(ADMIN_COOKIE, await expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
