import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IOrderRepository } from "../../../../core/repositories/order.repository.js";
import { OrderEntity } from "../../../../core/entities/order.entity.js";
import { CreateOrderUseCase } from "../create-order.use-case.js";

const mockRepo: IOrderRepository = {
  create: vi.fn(),
};

describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateOrderUseCase(mockRepo);
  });

  it("creates an OrderEntity with the given userId and passes it to the repository", async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(undefined);

    await useCase.execute("user123");

    expect(mockRepo.create).toHaveBeenCalledOnce();
    const order = vi.mocked(mockRepo.create).mock.calls[0][0];
    expect(order).toBeInstanceOf(OrderEntity);
    expect(order.userId).toBe("user123");
  });

  it("calls repository create once per execution", async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(undefined);

    await useCase.execute("user1");
    await useCase.execute("user2");

    expect(mockRepo.create).toHaveBeenCalledTimes(2);
  });

  it("propagates repository errors", async () => {
    vi.mocked(mockRepo.create).mockRejectedValue(new Error("DB write failed"));

    await expect(useCase.execute("user1")).rejects.toThrow("DB write failed");
  });
});
