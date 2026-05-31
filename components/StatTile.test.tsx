import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StatTile from "./StatTile";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest}>{children}</div>
    ),
    span: ({ children, ...rest }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...rest}>{children}</span>
    ),
  },
}));

describe("StatTile", () => {
  it("renders the numeric value", () => {
    render(<StatTile value={42} label="Total Orders" />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(<StatTile value="N/A" label="Pending" />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<StatTile value={5} label="In Progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders zero correctly", () => {
    render(<StatTile value={0} label="Completed" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders with gold accent when accent is gold", () => {
    const { container } = render(
      <StatTile value={10} label="Done" accent="gold" />,
    );
    expect(container.querySelector(".text-gold-deep")).not.toBeNull();
  });

  it("renders with ink accent by default", () => {
    const { container } = render(<StatTile value={10} label="Done" />);
    expect(container.querySelector(".text-ink")).not.toBeNull();
  });
});
