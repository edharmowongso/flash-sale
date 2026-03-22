import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  purchaseRequestSchema,
  purchaseUserIdParamSchema,
  saleStatusResponseSchema,
  purchaseResponseSchema,
  purchaseErrorResponseSchema,
  purchaseStatusResponseSchema,
} from "@flash-sale/shared";
import { SaleCacheService } from "../../infrastructure/cache/sale-cache.service.js";
import { GetSaleStatusUseCase } from "./use-cases/get-sale-status.use-case.js";
import { PurchaseItemUseCase } from "./use-cases/purchase-item.use-case.js";
import { CheckPurchaseUseCase } from "./use-cases/check-purchase.use-case.js";
import { SaleController } from "./controllers/sale.controller.js";

export async function saleRoutes(fastify: FastifyInstance): Promise<void> {
  const saleCacheService = new SaleCacheService(fastify.redis);
  const getSaleStatusUseCase = new GetSaleStatusUseCase(saleCacheService);
  const purchaseItemUseCase = new PurchaseItemUseCase(saleCacheService, fastify.orderQueue);
  const checkPurchaseUseCase = new CheckPurchaseUseCase(saleCacheService);

  const controller = new SaleController(
    getSaleStatusUseCase,
    purchaseItemUseCase,
    checkPurchaseUseCase
  );

  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/sale/status",
    {
      schema: {
        tags: ["Sale"],
        summary: "Get current sale status and remaining stock",
        response: {
          200: saleStatusResponseSchema,
        },
      },
    },
    (req, reply) => controller.getStatus(req, reply)
  );

  server.post(
    "/purchase",
    {
      schema: {
        tags: ["Purchase"],
        summary: "Attempt to purchase the flash sale item",
        body: purchaseRequestSchema,
        response: {
          201: purchaseResponseSchema,
          400: purchaseErrorResponseSchema,
          409: purchaseErrorResponseSchema,
          410: purchaseErrorResponseSchema,
        },
      },
    },
    (req, reply) => controller.purchase(req, reply)
  );

  server.get(
    "/purchase/:userId",
    {
      schema: {
        tags: ["Purchase"],
        summary: "Check if a user has already purchased",
        params: purchaseUserIdParamSchema,
        response: {
          200: purchaseStatusResponseSchema,
        },
      },
    },
    (req, reply) => controller.checkPurchase(req, reply)
  );
}
