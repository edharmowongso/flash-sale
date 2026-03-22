import type { Job } from "bullmq";
import { OrderEventType, type OrderJob } from "@flash-sale/shared";
import type { PrismaClient } from "@flash-sale/database";
import { PrismaOrderRepository } from "../../infrastructure/database/prisma/repositories/order.repository.js";
import { CreateOrderUseCase } from "./use-cases/create-order.use-case.js";

export class OrderProcessor {
  private readonly createOrderUseCase: CreateOrderUseCase;

  constructor(prisma: PrismaClient) {
    const orderRepository = new PrismaOrderRepository(prisma);

    this.createOrderUseCase = new CreateOrderUseCase(orderRepository);
  }

  async process(job: Job<OrderJob>): Promise<void> {
    switch (job.data.event_type) {
      case OrderEventType.CREATE_ORDER:
        await this.createOrderUseCase.execute(job.data.userId);

        break;
      default:
        throw new Error(`Unknown event_type: ${job.data.event_type}`);
    }
  }
}
