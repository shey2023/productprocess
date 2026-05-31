import { describe, it, expect } from "vitest";
import { render, container } from "@testing-library/react";
import MiniTimeline from "./MiniTimeline";

const stages = [
  { key: "design" },
  { key: "crafting" },
  { key: "finishing" },
  { key: "delivery" },
];

describe("MiniTimeline", () => {
  it("renders a dot for each stage", () => {
    const { container } = render(
      <MiniTimeline stages={stages} currentKey="crafting" />,
    );
    const dots = container.querySelectorAll("span");
    expect(dots.length).toBe(stages.length);
  });

  it("renders nothing when stages array is empty", () => {
    const { container } = render(
      <MiniTimeline stages={[]} currentKey="design" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("marks the current stage dot as wider (active)", () => {
    const { container } = render(
      <MiniTimeline stages={stages} currentKey="crafting" />,
    );
    const dots = Array.from(container.querySelectorAll("span"));
    const currentIdx = stages.findIndex((s) => s.key === "crafting"); // index 1
    expect(dots[currentIdx].className).toContain("w-3");
  });

  it("marks prior stages as completed (gold, not wider)", () => {
    const { container } = render(
      <MiniTimeline stages={stages} currentKey="crafting" />,
    );
    const dots = Array.from(container.querySelectorAll("span"));
    // stage 0 (design) is before currentIdx=1
    expect(dots[0].className).toContain("bg-gold");
    expect(dots[0].className).not.toContain("w-3");
  });

  it("marks future stages as inactive", () => {
    const { container } = render(
      <MiniTimeline stages={stages} currentKey="crafting" />,
    );
    const dots = Array.from(container.querySelectorAll("span"));
    // stages 2 and 3 are after current
    expect(dots[2].className).toContain("bg-hairline");
    expect(dots[3].className).toContain("bg-hairline");
  });

  it("marks all stages as completed when isFinal is true", () => {
    const { container } = render(
      <MiniTimeline stages={stages} currentKey="delivery" isFinal={true} />,
    );
    const dots = Array.from(container.querySelectorAll("span"));
    dots.forEach((dot) => {
      expect(dot.className).toContain("bg-gold");
      expect(dot.className).not.toContain("bg-hairline");
    });
  });
});
