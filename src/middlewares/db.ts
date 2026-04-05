import type { MiddlewareHandler } from "hono";

import { createDb } from "@/db";
import type { AppBindings } from "@/lib/types";

/**
 * Middleware that initializes the database once per request
 * and sets it on the context variables.
 */
export function withDb(): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    c.set("db", createDb(c.env.DB));
    await next();
  };
}
