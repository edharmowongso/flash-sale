import { describe, it, expect, vi, afterEach } from "vitest";
import { SaleStatus } from "@flash-sale/shared";

vi.mock("../../../config/env.js", () => ({
  env: {
    SALE_START: new Date("2026-01-01T10:00:00Z"),
    SALE_END: new Date("2026-01-01T11:00:00Z"),
    SALE_STOCK: 100,
  },
}));

import { SaleEntity } from "../sale.entity.js";

describe("SaleEntity.getStatus()", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns UPCOMING when current time is before SALE_START", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:59:59Z"));

    expect(SaleEntity.getStatus()).toBe(SaleStatus.UPCOMING);
  });

  it("returns ACTIVE when current time is within the sale window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z"));

    expect(SaleEntity.getStatus()).toBe(SaleStatus.ACTIVE);
  });

  it("returns ENDED when current time is after SALE_END", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T11:00:01Z"));

    expect(SaleEntity.getStatus()).toBe(SaleStatus.ENDED);
  });
});
