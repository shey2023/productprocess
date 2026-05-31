import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyLink from "./CopyLink";

describe("CopyLink", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("renders a read-only input with the provided URL", () => {
    render(<CopyLink url="https://example.com/track/abc123" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("https://example.com/track/abc123");
    expect(input).toHaveAttribute("readonly");
  });

  it("renders the copy button", () => {
    render(<CopyLink url="https://example.com/track/abc123" />);
    expect(screen.getByRole("button", { name: /העתק/i })).toBeInTheDocument();
  });

  it("calls clipboard.writeText with the URL when copy button is clicked", async () => {
    render(<CopyLink url="https://example.com/track/abc123" />);
    await userEvent.click(screen.getByRole("button", { name: /העתק/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://example.com/track/abc123",
    );
  });

  it("shows a confirmation message after copying", async () => {
    render(<CopyLink url="https://example.com/track/abc123" />);
    await userEvent.click(screen.getByRole("button", { name: /העתק/i }));
    expect(screen.getByRole("button", { name: /הועתק/i })).toBeInTheDocument();
  });
});
