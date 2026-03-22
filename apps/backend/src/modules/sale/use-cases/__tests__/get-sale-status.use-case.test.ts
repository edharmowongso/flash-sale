import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ISaleCacheRepository } from "../../../../core/repositories/sale-cache.repository.js";
import { SaleStatus } from "@flash-sale/shared";

vi.mock("../../../../config/env.js", () => ({
  env: {
    SALE_START: new Date("2026-01-01T10:00:00Z"),
    SALE_END: new Date("2026-01-01T11:00:00Z"),
    SALE_STOCK: 100,
  },
}));

import { GetSaleStatusUseCase } from "../get-sale-status.use-case.js";

const mockRepo: ISaleCacheRepository = {
  initialize: vi.fn(),
  getStock: vi.fn(),
  hasUserPurchased: vi.fn(),
  processPurchase: vi.fn(),
};

describe("GetSaleStatusUseCase", () => {
  let useCase: GetSaleStatusUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetSaleStatusUseCase(mockRepo);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns correct shape with ACTIVE status and stock", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z"));
    vi.mocked(mockRepo.getStock).mockResolvedValue(75);

    const result = await useCase.execute();

    expect(result.status).toBe(SaleStatus.ACTIVE);
    expect(result.stockRemaining).toBe(75);
    expect(result.totalStock).toBe(100);
    expect(result.startTime).toBe("2026-01-01T10:00:00.000Z");
    expect(result.endTime).toBe("2026-01-01T11:00:00.000Z");
  });

  it("returns UPCOMING status before sale starts", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));
    vi.mocked(mockRepo.getStock).mockResolvedValue(100);

    const result = await useCase.execute();

    expect(result.status).toBe(SaleStatus.UPCOMING);
  });

  it("returns ENDED status after sale ends", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    vi.mocked(mockRepo.getStock).mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result.status).toBe(SaleStatus.ENDED);
    expect(result.stockRemaining).toBe(0);
  });
});
