import type { PurchaseResult } from "../../config/constants.js";

export interface ISaleCacheRepository {
  initialize(stock: number): Promise<void>;
  getStock(): Promise<number>;
  hasUserPurchased(userId: string): Promise<boolean>;
  processPurchase(userId: string): Promise<PurchaseResult>;
}
