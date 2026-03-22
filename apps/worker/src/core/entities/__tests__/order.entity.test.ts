import { describe, it, expect } from "vitest";
import { OrderEntity } from "../order.entity.js";

describe("OrderEntity", () => {
  it("creates an entity with the given userId", () => {
    const order = OrderEntity.create("user123");

    expect(order.userId).toBe("user123");
  });

  it("preserves userId exactly as provided", () => {
    const order = OrderEntity.create("Leon@Example.COM");

    expect(order.userId).toBe("Leon@Example.COM");
  });

  it("each call to create returns a distinct instance", () => {
    const a = OrderEntity.create("user1");
    const b = OrderEntity.create("user2");

    expect(a.userId).toBe("user1");
    expect(b.userId).toBe("user2");
  });
});
