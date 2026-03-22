import { createClient } from "redis";
import { PurchaseResult } from "../../config/constants.js";
import type { ISaleCacheRepository } from "../../core/repositories/sale-cache.repository.js";

type RedisClient = ReturnType<typeof createClient>;

const REDIS_STOCK_KEY = "flash_sale:stock";
const REDIS_PURCHASED_KEY = "flash_sale:purchased_users";

const LUA_ATOMIC_PURCHASE = `
local added = redis.call('SADD', KEYS[2], ARGV[1])
if added == 0 then return -1 end
local stock = redis.call('DECR', KEYS[1])
if stock < 0 then
  redis.call('INCR', KEYS[1])
  redis.call('SREM', KEYS[2], ARGV[1])
  return -2
end
return stock`;

export class SaleCacheService implements ISaleCacheRepository {
  constructor(private readonly redis: RedisClient) {}

  async initialize(stock: number): Promise<void> {
    await this.redis.set(REDIS_STOCK_KEY, String(stock), { NX: true });
  }

  async getStock(): Promise<number> {
    const val = await this.redis.get(REDIS_STOCK_KEY);
    const n = parseInt(val ?? "0", 10);

    return n < 0 ? 0 : n;
  }

  async hasUserPurchased(userId: string): Promise<boolean> {
    return this.redis.sIsMember(REDIS_PURCHASED_KEY, userId);
  }

  async processPurchase(userId: string): Promise<PurchaseResult> {
    const result = await this.redis.eval(LUA_ATOMIC_PURCHASE, {
      keys: [REDIS_STOCK_KEY, REDIS_PURCHASED_KEY],
      arguments: [userId],
    });

    const code = result as number;

    if (code === -1) return PurchaseResult.ALREADY_PURCHASED;
    if (code === -2) return PurchaseResult.SOLD_OUT;

    return PurchaseResult.SUCCESS;
  }
}
