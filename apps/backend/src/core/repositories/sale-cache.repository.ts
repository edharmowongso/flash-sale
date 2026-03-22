export type PurchaseOutcome = "success" | "already_purchased" | "sold_out";

export interface ISaleCacheRepository {
  initialize(stock: number): Promise<void>;
  getStock(): Promise<number>;
  hasUserPurchased(userId: string): Promise<boolean>;
  atomicPurchase(userId: string): Promise<PurchaseOutcome>;
}
