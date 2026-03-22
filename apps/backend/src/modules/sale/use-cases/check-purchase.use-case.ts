import type { ISaleCacheRepository } from "../../../core/repositories/sale-cache.repository.js";
import type { PurchaseStatusResponse } from "@flash-sale/shared";

export class CheckPurchaseUseCase {
  constructor(private readonly saleCacheRepository: ISaleCacheRepository) {}

  async execute(userId: string): Promise<PurchaseStatusResponse> {
    const hasPurchased = await this.saleCacheRepository.hasUserPurchased(userId);

    return { userId, hasPurchased };
  }
}
