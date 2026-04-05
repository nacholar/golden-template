import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { handleError } from "@/lib/errors";
import { withDb } from "@/middlewares/db";
import { pinoLogger } from "@/middlewares/pino-logger";
import { securityHeaders } from "@/middlewares/security-headers";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  // Global middleware
  app.use(serveEmojiFavicon("🔑"));
  app.use(pinoLogger());
  app.use(securityHeaders());
  app.use(withDb());

  app.notFound(notFound);
  app.onError(handleError);
  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
