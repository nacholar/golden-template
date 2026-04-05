import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema("Golden Template API"),
          "Golden Template API Index",
        ),
      },
    }),
    (c) => {
      return c.json({
        message: "Golden Template API on Cloudflare",
      }, HttpStatusCodes.OK);
    },
  )
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/health",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
          "Health check response",
        ),
      },
    }),
    (c) => {
      return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    },
  );

export default router;
