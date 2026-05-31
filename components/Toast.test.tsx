import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./Toast";
import React from "react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

function ToastTrigger({ message, variant }: { message: string; variant?: "success" | "error" | "info" }) {
  const toast = useToast();
  return (
    <button onClick={() => toast.show(message, variant ?? "info")}>
      Show Toast
    </button>
  );
}

function setup(message: string, variant?: "success" | "error" | "info") {
  return render(
    <ToastProvider>
      <ToastTrigger message={message} variant={variant} />
    </ToastProvider>,
  );
}

describe("ToastProvider / useToast", () => {
  it("displays a toast message after show() is called", async () => {
    setup("Hello toast");
    await userEvent.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Hello toast")).toBeInTheDocument();
  });

  it("displays a success toast", async () => {
    setup("Order saved", "success");
    await userEvent.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Order saved")).toBeInTheDocument();
  });

  it("displays an error toast", async () => {
    setup("Something failed", "error");
    await userEvent.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });

  it("has an accessible live region for screen readers", () => {
    const { container } = setup("Test");
    const liveRegion = container.querySelector("[aria-live='polite']");
    expect(liveRegion).not.toBeNull();
  });

  it("dismiss button removes the toast", async () => {
    setup("Dismissible toast");
    await userEvent.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getByText("Dismissible toast")).toBeInTheDocument();

    const dismiss = screen.getByRole("button", { name: "סגור" });
    await userEvent.click(dismiss);
    expect(screen.queryByText("Dismissible toast")).not.toBeInTheDocument();
  });
});
