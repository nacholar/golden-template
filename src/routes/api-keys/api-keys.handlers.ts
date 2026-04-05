import { eq } from "drizzle-orm";
import type { Context } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { createDb } from "@/db";
import { apiKeys } from "@/db/schema";
import { createAuth } from "@/lib/auth";
import type { AppBindings } from "@/lib/types";

import type { CreateRoute, ListRoute, RevokeRoute } from "./api-keys.routes";

async function getSessionUser(c: Context<AppBindings>) {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session?.user ?? null;
}

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

export const list = async (c: Context<AppBindings>) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ message: "Not authenticated" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const db = createDb(c.env.DB);
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

export const create = async (c: Context<AppBindings>) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ message: "Not authenticated" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = await c.req.json<{ name: string; expiresAt?: string }>();
  const rawKey = generateApiKey();
  const keyHash = await hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 10);

  const db = createDb(c.env.DB);
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

export const revoke = async (c: Context<AppBindings>) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ message: "Not authenticated" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const idParam = c.req.param("id");
  const id = Number(idParam);
  const db = createDb(c.env.DB);

  const [updated] = await db.update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id))
    .returning();

  if (!updated || updated.userId !== user.id) {
    return c.json({ message: "Not Found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ message: "API key revoked" }, HttpStatusCodes.OK);
};
