import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { Queue } from "bullmq";
import type { OrderJob } from "@flash-sale/shared";
import { env } from "../../config/env.js";

export const QUEUE_NAME = "orders";

declare module "fastify" {
  interface FastifyInstance {
    orderQueue: Queue<OrderJob>;
  }
}

const queuePlugin: FastifyPluginAsync = async (fastify) => {
  const queue = new Queue<OrderJob>(QUEUE_NAME, {
    connection: { url: env.REDIS_URL },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  fastify.decorate("orderQueue", queue);

  fastify.addHook("onClose", async () => {
    await queue.close();
  });
};

export default fp(queuePlugin, { name: "queue" });
