import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("combina classes CSS", () => {
    expect(cn("text-red-500", "font-bold")).toBe("text-red-500 font-bold");
  });

  it("resolve classes conflitantes do Tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});