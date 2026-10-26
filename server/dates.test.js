import { describe, expect, it } from "vitest";
import { toLocalISO } from "./dates.js";

describe("toLocalISO", () => {
  it("formata a data local como AAAA-MM-DD", () => {
    expect(toLocalISO(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toLocalISO(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("usa o dia do fuso local, igual ao en-CA do navegador", () => {
    const dates = [
      new Date(2026, 0, 5),
      new Date(Date.UTC(2026, 0, 1, 0, 30)),
      new Date(2026, 11, 31, 23, 59),
      new Date(Date.UTC(2026, 6, 15, 3, 15)),
    ];
    for (const date of dates) {
      expect(toLocalISO(date)).toBe(date.toLocaleDateString("en-CA"));
    }
  });

  it("diferencia do dia UTC quando os fusos divergem", () => {
    const nearMidnightUTC = new Date(Date.UTC(2026, 0, 1, 0, 30));
    const utcDay = nearMidnightUTC.toISOString().slice(0, 10);
    const localDay = toLocalISO(nearMidnightUTC);
    // No fuso local a data só pode ser igual ou anterior à UTC, nunca posterior.
    expect(localDay <= utcDay).toBe(true);
  });
});
