import { SaleStatus } from "@flash-sale/shared";
import { env } from "../../config/env.js";

export class SaleEntity {
  static getStatus(): SaleStatus {
    const now = Date.now();

    if (now < env.SALE_START.getTime()) return SaleStatus.UPCOMING;
    if (now > env.SALE_END.getTime()) return SaleStatus.ENDED;

    return SaleStatus.ACTIVE;
  }
}
