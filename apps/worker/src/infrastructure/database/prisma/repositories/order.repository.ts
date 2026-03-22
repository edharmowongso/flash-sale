import { PrismaClient } from "@flash-sale/database";
import type { IOrderRepository } from "../../../../core/repositories/order.repository.js";
import { OrderEntity } from "../../../../core/entities/order.entity.js";

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(order: OrderEntity): Promise<void> {
    await this.prisma.order.create({
      data: { userId: order.userId },
    });
  }
}
