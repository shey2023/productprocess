import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderRow from "./OrderRow";

vi.mock("framer-motion", () => ({
  motion: {
    li: ({ children, ...rest }: React.HTMLAttributes<HTMLLIElement>) => (
      <li {...rest}>{children}</li>
    ),
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("./MiniTimeline", () => ({
  default: () => <div data-testid="mini-timeline" />,
}));

const stages = [
  { key: "design" },
  { key: "crafting" },
  { key: "delivery" },
];

const order = {
  id: "order-1",
  customer_name: "ישראל ישראלי",
  jewelry_type: "טבעת",
  current_stage: "crafting",
  phone_number: "050-1234567",
};

describe("OrderRow", () => {
  it("renders the customer name", () => {
    render(
      <OrderRow
        order={order}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    expect(screen.getByText("ישראל ישראלי")).toBeInTheDocument();
  });

  it("renders the jewelry type", () => {
    render(
      <OrderRow
        order={order}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    expect(screen.getByText("טבעת")).toBeInTheDocument();
  });

  it("renders the stage label", () => {
    render(
      <OrderRow
        order={order}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    expect(screen.getByText("Crafting")).toBeInTheDocument();
  });

  it("links to the correct order page", () => {
    render(
      <OrderRow
        order={order}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/orders/order-1");
  });

  it("renders the phone number when provided", () => {
    render(
      <OrderRow
        order={order}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    expect(screen.getByText("050-1234567")).toBeInTheDocument();
  });

  it("does not render phone number when omitted", () => {
    const orderNoPhone = { ...order, phone_number: null };
    render(
      <OrderRow
        order={orderNoPhone}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    expect(screen.queryByText("050-1234567")).not.toBeInTheDocument();
  });

  it("renders a MiniTimeline", () => {
    render(
      <OrderRow
        order={order}
        stages={stages}
        stageLabel="Crafting"
        isFinal={false}
      />,
    );
    expect(screen.getByTestId("mini-timeline")).toBeInTheDocument();
  });
});
