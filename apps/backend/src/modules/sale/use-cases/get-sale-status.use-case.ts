import { SaleEntity } from "../../../core/entities/sale.entity.js";
import type { ISaleCacheRepository } from "../../../core/repositories/sale-cache.repository.js";
import { type SaleStatusResponse } from "@flash-sale/shared";
import { env } from "../../../config/env.js";

export class GetSaleStatusUseCase {
  constructor(private readonly saleCacheRepository: ISaleCacheRepository) {}

  async execute(): Promise<SaleStatusResponse> {
    const status = SaleEntity.getStatus();
    const stockRemaining = await this.saleCacheRepository.getStock();

    return {
      status,
      stockRemaining,
      totalStock: env.SALE_STOCK,
      startTime: env.SALE_START.toISOString(),
      endTime: env.SALE_END.toISOString(),
    };
  }
}
