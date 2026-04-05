import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { subscriptionResponseSchema } from "@/db/schema";
import { unauthorizedSchema } from "@/lib/constants";

const tags = ["Subscriptions"];

export const getCurrent = createRoute({
  path: "/api/subscriptions/me",
  method: "get",
  tags,
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      subscriptionResponseSchema,
      "Current subscription for the authenticated user",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Not authenticated",
    ),
  },
});

export const createCheckout = createRoute({
  path: "/api/subscriptions/checkout",
  method: "post",
  tags,
  security: [{ bearerAuth: [] }],
  request: {
    body: jsonContentRequired(
      z.object({
        priceId: z.string().min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
      "Checkout session creation request",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ url: z.string().url() }),
      "LemonSqueezy Checkout session URL",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Not authenticated",
    ),
  },
});

export type GetCurrentRoute = typeof getCurrent;
export type CreateCheckoutRoute = typeof createCheckout;
