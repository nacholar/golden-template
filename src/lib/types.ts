import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

import type { Database } from "@/db";
import type { Environment } from "@/env";

export interface AppBindings {
  Bindings: Environment;
  Variables: {
    logger: PinoLogger;
    db: Database;
    user: { id: string; name: string; email: string };
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
