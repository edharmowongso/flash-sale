import type { OrderEntity } from "../entities/order.entity.js";

export interface IOrderRepository {
  create(order: OrderEntity): Promise<void>;
}
