import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { expectedToken } from "@/lib/auth";

const BASE = "http://localhost";

function makeLoginRequest(passcode: string): NextRequest {
  const formData = new FormData();
  formData.append("passcode", passcode);
  return new NextRequest(new URL("/api/admin/login", BASE), {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSCODE = "correctpass";
    process.env.ADMIN_COOKIE_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSCODE;
    delete process.env.ADMIN_COOKIE_SECRET;
  });

  it("redirects to /admin/login?error=1 for wrong passcode", async () => {
    const res = await POST(makeLoginRequest("wrongpass"));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/admin/login?error=1");
  });

  it("does not set a cookie for wrong passcode", async () => {
    const res = await POST(makeLoginRequest("wrongpass"));
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeNull();
  });

  it("redirects to /admin on correct passcode", async () => {
    const res = await POST(makeLoginRequest("correctpass"));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/admin");
    expect(res.headers.get("location")).not.toContain("error=1");
  });

  it("sets jt_admin cookie with the expected token on correct passcode", async () => {
    const res = await POST(makeLoginRequest("correctpass"));
    const cookie = res.headers.get("set-cookie") ?? "";
    const token = await expectedToken();
    expect(cookie).toContain(`jt_admin=${token}`);
  });

  it("sets cookie as httpOnly", async () => {
    const res = await POST(makeLoginRequest("correctpass"));
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("sets cookie with SameSite=Lax", async () => {
    const res = await POST(makeLoginRequest("correctpass"));
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie.toLowerCase()).toContain("samesite=lax");
  });
});
