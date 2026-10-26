import { describe, expect, it } from "vitest";
import { nextWeekdayISO, toLocalISO } from "./dates";

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
});

describe("nextWeekdayISO", () => {
  it("pula sábado e domingo", () => {
    // 2026-01-03 é sábado e 2026-01-04 é domingo.
    expect(nextWeekdayISO(new Date(2026, 0, 3))).toBe("2026-01-05");
    expect(nextWeekdayISO(new Date(2026, 0, 4))).toBe("2026-01-05");
  });

  it("mantém o dia quando já é dia útil", () => {
    expect(nextWeekdayISO(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(nextWeekdayISO(new Date(2026, 0, 9))).toBe("2026-01-09");
  });
});
