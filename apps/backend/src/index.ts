import { buildApp } from "./app.js";
import { SaleCacheService } from "./infrastructure/cache/sale-cache.service.js";
import { env } from "./config/env.js";

async function main(): Promise<void> {
  const app = await buildApp();
  await app.ready();

  const saleCacheService = new SaleCacheService(app.redis);
  await saleCacheService.initialize(env.SALE_STOCK);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });

    app.log.info(`Swagger docs at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
