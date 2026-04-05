import type { MiddlewareHandler } from "hono";

import { createAuth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import type { AppBindings } from "@/lib/types";

/**
 * Middleware that requires an authenticated session.
 * Sets `user` on the context variables for downstream handlers.
 */
export function requireSession(): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session?.user) {
      throw new UnauthorizedError();
    }

    c.set("user", session.user);
    await next();
  };
}
