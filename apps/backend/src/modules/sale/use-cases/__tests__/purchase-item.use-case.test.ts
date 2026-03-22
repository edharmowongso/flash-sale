import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PurchaseResult } from "../../../../config/constants.js";
import type { ISaleCacheRepository } from "../../../../core/repositories/sale-cache.repository.js";
import type { OrderJob } from "@flash-sale/shared";
import type { Queue } from "bullmq";
import { PurchaseResultCode } from "@flash-sale/shared";
import {
  BadRequestError,
  ConflictError,
  GoneError,
} from "../../../../common/errors/app-error.js";

vi.mock("../../../../config/env.js", () => ({
  env: {
    SALE_START: new Date("2026-01-01T10:00:00Z"),
    SALE_END: new Date("2026-01-01T11:00:00Z"),
    SALE_STOCK: 100,
  },
}));

import { PurchaseItemUseCase } from "../purchase-item.use-case.js";

const mockRepo: ISaleCacheRepository = {
  initialize: vi.fn(),
  getStock: vi.fn(),
  hasUserPurchased: vi.fn(),
  processPurchase: vi.fn(),
};

const mockQueue = {
  add: vi.fn().mockResolvedValue({}),
} as unknown as Queue<OrderJob>;

describe("PurchaseItemUseCase", () => {
  let useCase: PurchaseItemUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new PurchaseItemUseCase(mockRepo, mockQueue);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws BadRequestError when sale has not started yet", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));
    await expect(useCase.execute("user1")).rejects.toThrow(BadRequestError);
    await expect(useCase.execute("user1")).rejects.toThrow("not started yet");
  });

  it("throws BadRequestError when sale has ended", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    await expect(useCase.execute("user1")).rejects.toThrow(BadRequestError);
    await expect(useCase.execute("user1")).rejects.toThrow("ended");
  });

  it("throws ConflictError when user already purchased", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z"));
    vi.mocked(mockRepo.processPurchase).mockResolvedValue(PurchaseResult.ALREADY_PURCHASED);
    await expect(useCase.execute("user1")).rejects.toThrow(ConflictError);
  });

  it("throws GoneError when item is sold out", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z"));
    vi.mocked(mockRepo.processPurchase).mockResolvedValue(PurchaseResult.SOLD_OUT);
    await expect(useCase.execute("user1")).rejects.toThrow(GoneError);
  });

  it("returns success response and enqueues job on successful purchase", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z"));
    vi.mocked(mockRepo.processPurchase).mockResolvedValue(PurchaseResult.SUCCESS);

    const result = await useCase.execute("user1");

    expect(result.success).toBeTruthy();
    expect(result.code).toBe(PurchaseResultCode.SUCCESS);
    expect(mockQueue.add).toHaveBeenCalledOnce();
    expect(mockQueue.add).toHaveBeenCalledWith(
      "order",
      expect.objectContaining({ userId: "user1" })
    );
  });
});
