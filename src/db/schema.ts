import { z } from "@hono/zod-openapi";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

// ─── Better-Auth managed tables ──────────────────────────────────────────────
// These tables are created/managed by Better-Auth's migration system.
// We define them here for Drizzle query access.

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, table => [
  uniqueIndex("user_email_idx").on(table.email),
]);

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, table => [
  uniqueIndex("session_token_idx").on(table.token),
]);

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ─── Custom tables ───────────────────────────────────────────────────────────

export const apiKeys = sqliteTable("api_keys", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("api_keys_hash_idx").on(table.keyHash),
  index("api_keys_user_idx").on(table.userId),
]);

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier", { enum: ["free", "pro", "enterprise"] }).notNull().default("free"),
  paymentProvider: text("payment_provider", { enum: ["lemonsqueezy", "fintoc", "mercadopago"] }),
  externalSubscriptionId: text("external_subscription_id"),
  externalCustomerId: text("external_customer_id"),
  status: text("status", { enum: ["active", "cancelled", "past_due", "trialing"] }).notNull().default("active"),
  currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("subscriptions_user_idx").on(table.userId),
  uniqueIndex("subscriptions_external_id_idx").on(table.externalSubscriptionId),
]);

// ─── Demo tasks table (from starter) ────────────────────────────────────────

export const tasks = sqliteTable("tasks", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  done: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// ─── Zod schemas ─────────────────────────────────────────────────────────────

// Tasks
export const selectTasksSchema = toZodV4SchemaTyped(createSelectSchema(tasks));
export const insertTasksSchema = toZodV4SchemaTyped(createInsertSchema(
  tasks,
  { name: field => field.min(1).max(500) },
).required({ done: true }).omit({ id: true, createdAt: true, updatedAt: true }));
// @ts-expect-error partial exists on zod v4 type
export const patchTasksSchema = insertTasksSchema.partial();

// API Keys
export const selectApiKeysSchema = toZodV4SchemaTyped(createSelectSchema(apiKeys));
export const insertApiKeysSchema = toZodV4SchemaTyped(createInsertSchema(
  apiKeys,
  { name: field => field.min(1).max(255) },
).omit({ id: true, keyHash: true, keyPrefix: true, lastUsedAt: true, revokedAt: true, createdAt: true, updatedAt: true }));

// Subscriptions
export const selectSubscriptionsSchema = toZodV4SchemaTyped(createSelectSchema(subscriptions));

// Shared OpenAPI schemas
export const apiKeyResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  keyPrefix: z.string(),
  expiresAt: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export const apiKeyCreatedResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string().openapi({ description: "The full API key — shown only once" }),
  keyPrefix: z.string(),
  expiresAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export const subscriptionResponseSchema = z.object({
  id: z.number(),
  tier: z.enum(["free", "pro", "enterprise"]),
  status: z.enum(["active", "cancelled", "past_due", "trialing"]),
  paymentProvider: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
});
