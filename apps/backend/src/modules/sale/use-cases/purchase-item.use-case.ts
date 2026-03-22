import { Queue } from "bullmq";
import { SaleEntity } from "../../../core/entities/sale.entity.js";
import type { ISaleCacheRepository } from "../../../core/repositories/sale-cache.repository.js";
import {
  OrderEventType,
  PurchaseResultCode,
  SaleStatus,
  type PurchaseResponse,
  type OrderJob,
} from "@flash-sale/shared";
import {
  BadRequestError,
  ConflictError,
  GoneError,
} from "../../../common/errors/app-error.js";

export class PurchaseItemUseCase {
  constructor(
    private readonly saleCacheRepository: ISaleCacheRepository,
    private readonly orderQueue: Queue<OrderJob>
  ) {}

  async execute(userId: string): Promise<PurchaseResponse> {
    const status = SaleEntity.getStatus();

    if (status !== SaleStatus.ACTIVE) {
      throw new BadRequestError(
        status === SaleStatus.UPCOMING
          ? "The flash sale has not started yet"
          : "The flash sale has ended"
      );
    }

    const outcome = await this.saleCacheRepository.processPurchase(userId);

    if (outcome === "already_purchased") {
      throw new ConflictError("You have already purchased this item");
    }

    if (outcome === "sold_out") {
      throw new GoneError("Sorry, the item is sold out");
    }

    await this.orderQueue.add("order", { event_type: OrderEventType.CREATE_ORDER, userId });

    return {
      success: true,
      code: PurchaseResultCode.SUCCESS,
      message: "Purchase confirmed! Your order is being processed",
    };
  }
}
