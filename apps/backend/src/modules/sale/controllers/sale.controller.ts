import type { FastifyRequest, FastifyReply } from "fastify";
import { purchaseRequestSchema, PurchaseResultCode } from "@flash-sale/shared";
import type { GetSaleStatusUseCase } from "../use-cases/get-sale-status.use-case.js";
import type { PurchaseItemUseCase } from "../use-cases/purchase-item.use-case.js";
import type { CheckPurchaseUseCase } from "../use-cases/check-purchase.use-case.js";

export class SaleController {
  constructor(
    private readonly getSaleStatusUseCase: GetSaleStatusUseCase,
    private readonly purchaseItemUseCase: PurchaseItemUseCase,
    private readonly checkPurchaseUseCase: CheckPurchaseUseCase
  ) {}

  async getStatus(_req: FastifyRequest, reply: FastifyReply) {
    const data = await this.getSaleStatusUseCase.execute();

    return reply.send(data);
  }

  async purchase(req: FastifyRequest, reply: FastifyReply) {
    const parsed = purchaseRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        code: PurchaseResultCode.SALE_NOT_ACTIVE,
        message: "Invalid request body",
      });
    }

    const userId = parsed.data.userId.toLowerCase().trim();
    const result = await this.purchaseItemUseCase.execute(userId);

    return reply.status(201).send(result);
  }

  async checkPurchase(req: FastifyRequest, reply: FastifyReply) {
    const params = req.params as { userId: string };
    const userId = params.userId.toLowerCase().trim();
    const result = await this.checkPurchaseUseCase.execute(userId);

    return reply.send(result);
  }
}
