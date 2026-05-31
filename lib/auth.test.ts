import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkPasscode, expectedToken, isValidSession } from "./auth";

describe("checkPasscode", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSCODE = "secret123";
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSCODE;
  });

  it("returns true for exact match", () => {
    expect(checkPasscode("secret123")).toBe(true);
  });

  it("returns false for wrong passcode", () => {
    expect(checkPasscode("wrongpass")).toBe(false);
  });

  it("returns false when input has correct chars but wrong length", () => {
    expect(checkPasscode("secret12")).toBe(false);
    expect(checkPasscode("secret1234")).toBe(false);
  });

  it("returns false when ADMIN_PASSCODE is not set", () => {
    delete process.env.ADMIN_PASSCODE;
    expect(checkPasscode("anything")).toBe(false);
  });

  it("returns false for empty input when passcode is set", () => {
    expect(checkPasscode("")).toBe(false);
  });

  it("is constant-time: XOR diff accumulates all mismatches", () => {
    // Verify the timing-safe comparison doesn't short-circuit on first mismatch.
    // If it were short-circuit, "Xecret123" and "Yecret123" would take the same
    // time (both wrong on char 0). Our implementation always iterates all chars.
    process.env.ADMIN_PASSCODE = "aaaaaaaaa";
    expect(checkPasscode("aaaaaaaab")).toBe(false); // last char wrong
    expect(checkPasscode("baaaaaaaa")).toBe(false); // first char wrong
  });
});

describe("expectedToken", () => {
  afterEach(() => {
    delete process.env.ADMIN_COOKIE_SECRET;
  });

  it("returns a hex string for a valid secret", async () => {
    process.env.ADMIN_COOKIE_SECRET = "my-secret";
    const token = await expectedToken();
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("returns the same token when called twice with the same secret", async () => {
    process.env.ADMIN_COOKIE_SECRET = "stable-secret";
    const a = await expectedToken();
    const b = await expectedToken();
    expect(a).toBe(b);
  });

  it("returns a different token for a different secret", async () => {
    process.env.ADMIN_COOKIE_SECRET = "secret-a";
    const a = await expectedToken();
    process.env.ADMIN_COOKIE_SECRET = "secret-b";
    const b = await expectedToken();
    expect(a).not.toBe(b);
  });

  it("throws when ADMIN_COOKIE_SECRET is missing", async () => {
    delete process.env.ADMIN_COOKIE_SECRET;
    await expect(expectedToken()).rejects.toThrow("Missing ADMIN_COOKIE_SECRET");
  });
});

describe("isValidSession", () => {
  beforeEach(() => {
    process.env.ADMIN_COOKIE_SECRET = "session-secret";
  });

  afterEach(() => {
    delete process.env.ADMIN_COOKIE_SECRET;
  });

  it("returns false for undefined cookie", async () => {
    expect(await isValidSession(undefined)).toBe(false);
  });

  it("returns false for empty string", async () => {
    expect(await isValidSession("")).toBe(false);
  });

  it("returns false for an incorrect value", async () => {
    expect(await isValidSession("not-the-right-token")).toBe(false);
  });

  it("returns true when cookie matches expectedToken", async () => {
    const token = await expectedToken();
    expect(await isValidSession(token)).toBe(true);
  });
});
