import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
});

export const env = EnvSchema.parse(process.env);
