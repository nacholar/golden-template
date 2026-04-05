import { betterAuth } from "better-auth";

import type { Environment } from "@/env";

export function createAuth(env: Environment) {
  return betterAuth({
    database: env.DB,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
