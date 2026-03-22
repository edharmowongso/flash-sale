import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  SALE_START: z.coerce.date(),
  SALE_END: z.coerce.date(),
  SALE_STOCK: z.coerce.number().int().positive(),
});

export const env = EnvSchema.parse(process.env);
