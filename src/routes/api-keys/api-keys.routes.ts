import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { apiKeyCreatedResponseSchema, apiKeyResponseSchema, insertApiKeysSchema } from "@/db/schema";
import { notFoundSchema, unauthorizedSchema } from "@/lib/constants";

const tags = ["API Keys"];

export const list = createRoute({
  path: "/api/api-keys",
  method: "get",
  tags,
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(apiKeyResponseSchema),
      "List of API keys for the authenticated user",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Not authenticated",
    ),
  },
});

export const create = createRoute({
  path: "/api/api-keys",
  method: "post",
  tags,
  security: [{ bearerAuth: [] }],
  request: {
    body: jsonContentRequired(
      z.object({
        name: z.string().min(1).max(255),
        expiresAt: z.string().datetime().optional().openapi({ description: "ISO 8601 expiration date" }),
      }),
      "API key creation request",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      apiKeyCreatedResponseSchema,
      "The created API key (key shown only once)",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Not authenticated",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertApiKeysSchema),
      "Validation error(s)",
    ),
  },
});

export const revoke = createRoute({
  path: "/api/api-keys/{id}",
  method: "delete",
  tags,
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().regex(/^\d+$/).transform(Number) }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string() }),
      "API key revoked",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "API key not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Not authenticated",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type RevokeRoute = typeof revoke;
