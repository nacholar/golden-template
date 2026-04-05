import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/lib/types";

/**
 * Sets security headers on all responses.
 */
export function securityHeaders(): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "0");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  };
}
