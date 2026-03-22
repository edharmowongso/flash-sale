import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { SaleStatus, PurchaseResultCode } from "@flash-sale/shared";
import { PurchaseResult } from "../../../config/constants.js";
import type { OrderJob } from "@flash-sale/shared";
import type { Queue } from "bullmq";

vi.mock("../../../config/env.js", () => ({
  env: {
    SALE_START: new Date("2026-01-01T10:00:00Z"),
    SALE_END: new Date("2026-01-01T11:00:00Z"),
    SALE_STOCK: 100,
    REDIS_URL: "redis://localhost:6379",
    CORS_ORIGIN: "http://localhost:5173",
    NODE_ENV: "test",
    PORT: 3000,
  },
}));

const mockProcessPurchase = vi.fn();
const mockGetStock = vi.fn();
const mockHasUserPurchased = vi.fn();

vi.mock("../../../infrastructure/cache/sale-cache.service.js", () => ({
  SaleCacheService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    getStock: mockGetStock,
    hasUserPurchased: mockHasUserPurchased,
    processPurchase: mockProcessPurchase,
  })),
}));

import errorHandlerPlugin from "../../../common/plugins/error-handler.js";
import { saleRoutes } from "../sale.routes.js";

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("redis", {} as never);
  app.decorate("orderQueue", {
    add: vi.fn().mockResolvedValue({}),
  } as unknown as Queue<OrderJob>);
  app.register(errorHandlerPlugin);
  app.register(saleRoutes);
  return app;
}

describe("Sale API routes (integration)", () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeAll(async () => {
    app = buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z")); // Active by default
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("GET /sale/status", () => {
    it("returns 200 with sale status and stock", async () => {
      mockGetStock.mockResolvedValue(80);

      const res = await app.inject({ method: "GET", url: "/sale/status" });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.status).toBe(SaleStatus.ACTIVE);
      expect(body.stockRemaining).toBe(80);
      expect(body.totalStock).toBe(100);
    });
  });

  describe("POST /purchase", () => {
    it("returns 201 on successful purchase", async () => {
      mockProcessPurchase.mockResolvedValue("success");

      const res = await app.inject({
        method: "POST",
        url: "/purchase",
        payload: { userId: "leon" },
      });
      const body = res.json();
      expect(body.success).toBeTruthy();
      expect(body.code).toBe(PurchaseResultCode.SUCCESS);
    });

    it("returns 400 when sale has not started", async () => {
      vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));

      const res = await app.inject({
        method: "POST",
        url: "/purchase",
        payload: { userId: "leon" },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().success).toBeFalsy();
    });

    it("returns 400 when sale has ended", async () => {
      vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));

      const res = await app.inject({
        method: "POST",
        url: "/purchase",
        payload: { userId: "leon" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 409 when user has already purchased", async () => {
      mockProcessPurchase.mockResolvedValue(PurchaseResult.ALREADY_PURCHASED);

      const res = await app.inject({
        method: "POST",
        url: "/purchase",
        payload: { userId: "leon" },
      });

      expect(res.statusCode).toBe(409);
      expect(res.json().success).toBeFalsy();
    });

    it("returns 410 when item is sold out", async () => {
      mockProcessPurchase.mockResolvedValue(PurchaseResult.SOLD_OUT);

      const res = await app.inject({
        method: "POST",
        url: "/purchase",
        payload: { userId: "leon" },
      });

      expect(res.statusCode).toBe(410);
      expect(res.json().success).toBeFalsy();
    });

    it("returns 400 when userId is missing from body", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/purchase",
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    it("normalizes userId to lowercase before processing", async () => {
      mockProcessPurchase.mockResolvedValue(PurchaseResult.SUCCESS);

      await app.inject({
        method: "POST",
        url: "/purchase",
        payload: { userId: "Leon@Example.COM" },
      });

      expect(mockProcessPurchase).toHaveBeenCalledWith("leon@example.com");
    });
  });

  describe("GET /purchase/:userId", () => {
    it("returns hasPurchased: true when user has purchased", async () => {
      mockHasUserPurchased.mockResolvedValue(true);

      const res = await app.inject({
        method: "GET",
        url: "/purchase/leon",
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ userId: "leon", hasPurchased: true });
    });

    it("returns hasPurchased: false when user has not purchased", async () => {
      mockHasUserPurchased.mockResolvedValue(false);

      const res = await app.inject({
        method: "GET",
        url: "/purchase/wesker",
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ userId: "wesker", hasPurchased: false });
    });
  });
});
