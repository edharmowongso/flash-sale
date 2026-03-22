import { OrderEntity } from "../../../core/entities/order.entity.js";
import type { IOrderRepository } from "../../../core/repositories/order.repository.js";

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(userId: string): Promise<void> {
    const order = OrderEntity.create(userId);

    await this.orderRepository.create(order);
  }
}
