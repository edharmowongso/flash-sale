import { Worker } from "bullmq";
import { PrismaClient } from "@flash-sale/database";
import { env } from "./config/env.js";
import type { OrderJob } from "@flash-sale/shared";
import { OrderProcessor } from "./modules/order/order.processor.js";

const QUEUE_NAME = "orders";

const prisma = new PrismaClient();
const orderProcessor = new OrderProcessor(prisma);

const worker = new Worker<OrderJob>(
  QUEUE_NAME,
  async (job) => {
    await orderProcessor.process(job);
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: env.WORKER_CONCURRENCY,
  }
);

worker.on("completed", (job) => {
  console.info(`[worker] job ${job.id} completed — event: ${job.data.event_type}, user: ${job.data.userId}`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});

const shutdown = async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.info(
  `[worker] listening on queue "${QUEUE_NAME}" (concurrency: ${env.WORKER_CONCURRENCY})`
);
