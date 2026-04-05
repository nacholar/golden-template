// Runtime env parsing — used by drizzle.config.ts and other Node.js scripts
// Not used in Cloudflare Workers context where env comes from bindings

/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}));

const RuntimeEnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_DATABASE_ID: z.string().optional(),
  CLOUDFLARE_D1_TOKEN: z.string().optional(),
  DATABASE_URL: z.string().default("file:dev.db"),
});

const { data: env, error } = RuntimeEnvSchema.safeParse(process.env);

if (error) {
  const errorMessage = `❌ Invalid env - ${Object.entries(error.flatten().fieldErrors).map(([key, errors]) => `${key}: ${(errors as string[]).join(",")}`).join(" | ")}`;
  throw new Error(errorMessage);
}

export default env!;
