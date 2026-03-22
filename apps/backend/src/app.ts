import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import redisPlugin from "./common/plugins/redis.js";
import queuePlugin from "./common/plugins/queue.js";
import errorHandlerPlugin from "./common/plugins/error-handler.js";
import { saleRoutes } from "./modules/sale/sale.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "warn" : "info",
    },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  await app.register(swagger, {
    transform: jsonSchemaTransform,
    openapi: {
      info: {
        title: "Flash Sale API",
        description: "API for the flash sale system",
        version: "1.0.0",
      },
      tags: [
        { name: "Sale", description: "Sale status endpoints" },
        { name: "Purchase", description: "Purchase endpoints" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list" },
  });

  await app.register(errorHandlerPlugin);
  await app.register(redisPlugin);
  await app.register(queuePlugin);
  await app.register(saleRoutes);

  app.get("/health", { schema: { hide: true } }, () => ({ status: "ok" }));

  return app;
}
