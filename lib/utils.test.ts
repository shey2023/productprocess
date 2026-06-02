import { describe, it, expect } from "vitest";
import { slugify } from "./utils";

describe("slugify", () => {
  it("lowercases ASCII labels and replaces spaces with underscores", () => {
    const result = slugify("Hello World");
    expect(result).toMatch(/^hello_world_[0-9a-f]{4}$/);
  });

  it("preserves Hebrew (Unicode letter) characters", () => {
    const result = slugify("עיצוב");
    expect(result).toMatch(/^עיצוב_[0-9a-f]{4}$/);
  });

  it("strips leading and trailing spaces", () => {
    const result = slugify("  trimmed  ");
    expect(result).toMatch(/^trimmed_[0-9a-f]{4}$/);
  });

  it("strips leading and trailing underscores from base", () => {
    const result = slugify("!!! label !!!");
    expect(result).toMatch(/^label_[0-9a-f]{4}$/);
  });

  it("strips special characters like !@#", () => {
    const result = slugify("hello!@#world");
    expect(result).toMatch(/^hello_world_[0-9a-f]{4}$/);
  });

  it("returns a random hex string for an empty label", () => {
    const result = slugify("");
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  it("returns a random hex string for an all-symbol label", () => {
    const result = slugify("!!!###");
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  it("generates unique slugs for the same input", () => {
    const a = slugify("Stage");
    const b = slugify("Stage");
    // Base is the same but the random suffix differs (with very high probability)
    expect(a).not.toBe(b);
  });
});
