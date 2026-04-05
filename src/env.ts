import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  // D1 is a binding, not a string — handled separately in AppBindings
  // Upstash
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  // Better-Auth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

export type Environment = z.infer<typeof EnvSchema> & {
  DB: D1Database;
};

export function parseEnv(data: any): Environment {
  const { data: env, error } = EnvSchema.safeParse(data);

  if (error) {
    const errorMessage = `❌ Invalid env - ${Object.entries(error.flatten().fieldErrors).map(([key, errors]) => `${key}: ${(errors as string[]).join(",")}`).join(" | ")}`;
    throw new Error(errorMessage);
  }

  return { ...env, DB: data.DB } as Environment;
}
