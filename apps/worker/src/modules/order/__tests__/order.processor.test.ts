import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import { OrderEventType, type OrderJob } from "@flash-sale/shared";
import type { PrismaClient } from "@flash-sale/database";

const mockCreate = vi.fn();

vi.mock(
  "../../../infrastructure/database/prisma/repositories/order.repository.js",
  () => ({
    PrismaOrderRepository: vi.fn().mockImplementation(() => ({
      create: mockCreate,
    })),
  })
);

import { OrderProcessor } from "../order.processor.js";

function makeJob(data: OrderJob): Job<OrderJob> {
  return { id: "test-job-1", data } as unknown as Job<OrderJob>;
}

describe("OrderProcessor", () => {
  let processor: OrderProcessor;
  const mockPrisma = {} as PrismaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new OrderProcessor(mockPrisma);
  });

  it("calls CreateOrderUseCase for CREATE_ORDER events", async () => {
    mockCreate.mockResolvedValue(undefined);

    await processor.process(
      makeJob({ event_type: OrderEventType.CREATE_ORDER, userId: "user1" })
    );

    expect(mockCreate).toHaveBeenCalledOnce();
    const order = mockCreate.mock.calls[0][0];
    expect(order.userId).toBe("user1");
  });

  it("passes userId exactly as received from the job", async () => {
    mockCreate.mockResolvedValue(undefined);

    await processor.process(
      makeJob({ event_type: OrderEventType.CREATE_ORDER, userId: "leon@example.com" })
    );

    const order = mockCreate.mock.calls[0][0];
    expect(order.userId).toBe("leon@example.com");
  });

  it("throws for unknown event_type", async () => {
    const job = makeJob({
      event_type: "UNKNOWN_EVENT" as OrderEventType,
      userId: "user1",
    });

    await expect(processor.process(job)).rejects.toThrow(
      "Unknown event_type: UNKNOWN_EVENT"
    );
  });

  it("propagates errors from the use case", async () => {
    mockCreate.mockRejectedValue(new Error("DB unavailable"));

    await expect(
      processor.process(
        makeJob({ event_type: OrderEventType.CREATE_ORDER, userId: "user1" })
      )
    ).rejects.toThrow("DB unavailable");
  });
});
