import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { expectedToken } from "@/lib/auth";
import { middleware } from "./middleware";

const BASE = "http://localhost";

function makeRequest(pathname: string, cookieValue?: string): NextRequest {
  const req = new NextRequest(new URL(pathname, BASE));
  if (cookieValue !== undefined) {
    req.cookies.set("jt_admin", cookieValue);
  }
  return req;
}

describe("middleware", () => {
  beforeEach(() => {
    process.env.ADMIN_COOKIE_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.ADMIN_COOKIE_SECRET;
  });

  it("lets /admin/login through without a cookie", async () => {
    const res = await middleware(makeRequest("/admin/login"));
    expect(res.status).not.toBe(302);
    expect(res.status).not.toBe(303);
  });

  it("redirects /admin to /admin/login when no cookie is present", async () => {
    const res = await middleware(makeRequest("/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("redirects /admin to /admin/login when cookie is wrong", async () => {
    const res = await middleware(makeRequest("/admin", "bad-token"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("allows /admin through when cookie matches expectedToken", async () => {
    const token = await expectedToken();
    const res = await middleware(makeRequest("/admin", token));
    expect(res.status).not.toBe(307);
  });

  it("protects nested routes like /admin/orders/123", async () => {
    const res = await middleware(makeRequest("/admin/orders/123"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("allows /admin/orders/123 through with valid cookie", async () => {
    const token = await expectedToken();
    const res = await middleware(makeRequest("/admin/orders/123", token));
    expect(res.status).not.toBe(307);
  });
});
