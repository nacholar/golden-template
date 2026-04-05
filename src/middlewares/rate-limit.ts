import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { eq, isNull } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";

import { createDb } from "@/db";
import { apiKeys } from "@/db/schema";
import type { AppBindings } from "@/lib/types";

export function rateLimitByApiKey(opts: {
  maxRequests: number;
  windowSec: number;
}): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ message: "Missing or invalid Authorization header" }, 401);
    }

    const rawKey = authHeader.slice(7);

    // Hash the key to look it up
    const encoder = new TextEncoder();
    const data = encoder.encode(rawKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Verify API key exists and is not revoked
    const db = createDb(c.env.DB);
    const apiKey = await db.query.apiKeys.findFirst({
      where: (fields, ops) => ops.and(
        ops.eq(fields.keyHash, keyHash),
        ops.isNull(fields.revokedAt),
      ),
    });

    if (!apiKey) {
      return c.json({ message: "Invalid API key" }, 401);
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return c.json({ message: "API key expired" }, 401);
    }

    // Update lastUsedAt
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    // Rate limit using Upstash
    const ratelimit = new Ratelimit({
      redis: new Redis({
        url: c.env.UPSTASH_REDIS_REST_URL,
        token: c.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(opts.maxRequests, `${opts.windowSec} s`),
    });

    const { success, limit, remaining, reset } = await ratelimit.limit(apiKey.userId);

    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(reset));

    if (!success) {
      return c.json({ message: "Rate limit exceeded" }, 429);
    }

    await next();
  };
}
