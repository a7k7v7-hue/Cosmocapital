import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getWeightedGci,
  getDaysOnStage,
  isStuck,
  formatGci,
  STUCK_DAYS_THRESHOLD,
  STAGES,
  DEFAULT_GCI,
} from "../pipeline";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("getWeightedGci", () => {
  it("multiplies by stage probability", () => {
    const stage1Prob = STAGES[0].probability; // 0.05
    expect(getWeightedGci(1_000_000, 1)).toBe(Math.round(1_000_000 * stage1Prob));
  });

  it("returns full amount at stage 7 (probability 1.0)", () => {
    expect(getWeightedGci(5_000_000, 7)).toBe(5_000_000);
  });

  it("returns 0 for unknown stage", () => {
    expect(getWeightedGci(1_000_000, 99)).toBe(0);
  });

  it("rounds the result", () => {
    // stage 2 probability is 0.15, 1_000_003 * 0.15 = 150_000.45 → rounds to 150000
    const result = getWeightedGci(1_000_003, 2);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("getDaysOnStage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns 0 for today", () => {
    expect(getDaysOnStage(new Date("2026-06-10T08:00:00Z"))).toBe(0);
  });

  it("returns correct days for a Date object", () => {
    const fiveDaysAgo = new Date("2026-06-05T12:00:00Z");
    expect(getDaysOnStage(fiveDaysAgo)).toBe(5);
  });

  it("accepts ISO string", () => {
    expect(getDaysOnStage("2026-05-11T12:00:00Z")).toBe(30);
  });
});

describe("isStuck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns false when under threshold", () => {
    const recentDate = new Date(Date.now() - (STUCK_DAYS_THRESHOLD - 1) * DAY_MS);
    expect(isStuck(recentDate)).toBe(false);
  });

  it("returns true when at threshold", () => {
    const thresholdDate = new Date(Date.now() - STUCK_DAYS_THRESHOLD * DAY_MS);
    expect(isStuck(thresholdDate)).toBe(true);
  });

  it("returns true when over threshold", () => {
    const oldDate = new Date(Date.now() - (STUCK_DAYS_THRESHOLD + 10) * DAY_MS);
    expect(isStuck(oldDate)).toBe(true);
  });
});

describe("formatGci", () => {
  it("formats millions correctly", () => {
    expect(formatGci(4_500_000)).toBe("4.5 млн ₽");
  });

  it("strips trailing .0 for whole millions", () => {
    expect(formatGci(4_000_000)).toBe("4 млн ₽");
  });

  it("formats thousands for amounts under 1 million", () => {
    expect(formatGci(500_000)).toBe("500 тыс. ₽");
  });

  it("formats exactly 1 million", () => {
    expect(formatGci(1_000_000)).toBe("1 млн ₽");
  });
});

describe("DEFAULT_GCI", () => {
  it("all deal types have positive default GCI", () => {
    const types = ["LI_RENT", "LI_SALE_LAND", "BB_RENT", "BB_SALE_LAND", "BTS_SLB_MANDATE"];
    for (const t of types) {
      expect(DEFAULT_GCI[t]).toBeGreaterThan(0);
    }
  });

  it("BTS_SLB_MANDATE has highest default GCI (mandate deals are largest)", () => {
    const values = Object.values(DEFAULT_GCI);
    expect(DEFAULT_GCI["BTS_SLB_MANDATE"]).toBe(Math.max(...values));
  });
});

describe("STAGES", () => {
  it("has 7 stages", () => {
    expect(STAGES).toHaveLength(7);
  });

  it("stage probabilities increase monotonically", () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].probability).toBeGreaterThan(STAGES[i - 1].probability);
    }
  });

  it("final stage has probability 1.0", () => {
    expect(STAGES[STAGES.length - 1].probability).toBe(1.0);
  });
});
