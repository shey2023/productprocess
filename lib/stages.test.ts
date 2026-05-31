import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase-server", () => ({
  supabaseAdmin: {},
  JEWELRY_BUCKET: "jewelry",
}));

import { stageLabelFrom, stageDescriptionFrom, isFinalStage, type Stage } from "./stages";

const stages: Stage[] = [
  { id: "1", key: "design", label: "Design", description: "Initial design phase", sort_order: 10, is_final: false },
  { id: "2", key: "crafting", label: "Crafting", description: null, sort_order: 20, is_final: false },
  { id: "3", key: "delivery", label: "Delivery", description: "Shipped to customer", sort_order: 30, is_final: true },
];

describe("stageLabelFrom", () => {
  it("returns the label for a known stage key", () => {
    expect(stageLabelFrom(stages, "design")).toBe("Design");
    expect(stageLabelFrom(stages, "delivery")).toBe("Delivery");
  });

  it("falls back to the key itself when not found", () => {
    expect(stageLabelFrom(stages, "unknown_key")).toBe("unknown_key");
  });
});

describe("stageDescriptionFrom", () => {
  it("returns the description for a known stage key", () => {
    expect(stageDescriptionFrom(stages, "design")).toBe("Initial design phase");
  });

  it("returns null when the stage has no description", () => {
    expect(stageDescriptionFrom(stages, "crafting")).toBeNull();
  });

  it("returns null for an unknown key", () => {
    expect(stageDescriptionFrom(stages, "unknown_key")).toBeNull();
  });
});

describe("isFinalStage", () => {
  it("returns true for a stage with is_final: true", () => {
    expect(isFinalStage(stages, "delivery")).toBe(true);
  });

  it("returns false for a non-final stage", () => {
    expect(isFinalStage(stages, "design")).toBe(false);
    expect(isFinalStage(stages, "crafting")).toBe(false);
  });

  it("returns false for an unknown key", () => {
    expect(isFinalStage(stages, "unknown_key")).toBe(false);
  });
});
