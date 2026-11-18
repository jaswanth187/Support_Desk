
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),

  CLIENT_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),

  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),

  REFRESH_TOKEN_EXPIRY_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .default(7),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    z.treeifyError(parsedEnv.error)
  );

  process.exit(1);
}

export const env = parsedEnv.data;
