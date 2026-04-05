import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Webhooks"];

export const lemonsqueezyWebhook = createRoute({
  path: "/api/webhooks/lemonsqueezy",
  method: "post",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ received: z.boolean() }),
      "Webhook processed successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ message: z.string() }),
      "Invalid webhook signature",
    ),
  },
});

export type LemonSqueezyWebhookRoute = typeof lemonsqueezyWebhook;
