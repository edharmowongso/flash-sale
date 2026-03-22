import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { createClient } from "redis";
import { env } from "../../config/env.js";

export type RedisClient = ReturnType<typeof createClient>;

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClient;
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  const client = createClient({ url: env.REDIS_URL });

  client.on("error", (err: Error) => {
    fastify.log.error(err, "Redis client error");
  });

  await client.connect();
  fastify.log.info("Redis connected");

  fastify.decorate("redis", client);

  fastify.addHook("onClose", async () => {
    await client.quit();
  });
};

export default fp(redisPlugin, { name: "redis" });
