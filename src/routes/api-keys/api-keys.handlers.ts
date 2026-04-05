import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { apiKeys } from "@/db/schema";
import { NotFoundError } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute, ListRoute, RevokeRoute } from "./api-keys.routes";

function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `gt_${Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("")}`;
}

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const keys = await db.query.apiKeys.findMany({
    where: (fields, ops) => ops.and(
      ops.eq(fields.userId, user.id),
      ops.isNull(fields.revokedAt),
    ),
  });

  return c.json(keys.map(k => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    revokedAt: k.revokedAt?.toISOString() ?? null,
    createdAt: k.createdAt?.toISOString() ?? null,
  })), HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const body = c.req.valid("json");

  const rawKey = generateApiKey();
  const keyHash = await hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 10);

  const [created] = await db.insert(apiKeys).values({
    userId: user.id,
    name: body.name,
    keyHash,
    keyPrefix,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
  }).returning();

  return c.json({
    id: created.id,
    name: created.name,
    key: rawKey,
    keyPrefix: created.keyPrefix,
    expiresAt: created.expiresAt?.toISOString() ?? null,
    createdAt: created.createdAt?.toISOString() ?? null,
  }, HttpStatusCodes.OK);
};

export const revoke: AppRouteHandler<RevokeRoute> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const { id } = c.req.valid("param");

  const existing = await db.query.apiKeys.findFirst({
    where: (fields, ops) => ops.and(
      ops.eq(fields.id, id),
      ops.eq(fields.userId, user.id),
      ops.isNull(fields.revokedAt),
    ),
  });

  if (!existing) {
    throw new NotFoundError("API key", id);
  }

  await db.update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id));

  return c.json({ message: "API key revoked" }, HttpStatusCodes.OK);
};
