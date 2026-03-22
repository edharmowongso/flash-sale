import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ISaleCacheRepository } from "../../../../core/repositories/sale-cache.repository.js";
import { CheckPurchaseUseCase } from "../check-purchase.use-case.js";

const mockRepo: ISaleCacheRepository = {
  initialize: vi.fn(),
  getStock: vi.fn(),
  hasUserPurchased: vi.fn(),
  processPurchase: vi.fn(),
};

describe("CheckPurchaseUseCase", () => {
  let useCase: CheckPurchaseUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CheckPurchaseUseCase(mockRepo);
  });

  it("returns hasPurchased: true when user has purchased", async () => {
    vi.mocked(mockRepo.hasUserPurchased).mockResolvedValue(true);

    const result = await useCase.execute("leon");

    expect(result).toEqual({ userId: "leon", hasPurchased: true });
    expect(mockRepo.hasUserPurchased).toHaveBeenCalledWith("leon");
  });

  it("returns hasPurchased: false when user has not purchased", async () => {
    vi.mocked(mockRepo.hasUserPurchased).mockResolvedValue(false);

    const result = await useCase.execute("wesker");

    expect(result).toEqual({ userId: "wesker", hasPurchased: false });
  });
});
