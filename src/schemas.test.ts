import { describe, expect, it } from "vitest";

import {
  apiKeyCreatedResponseSchema,
  apiKeyResponseSchema,
  insertApiKeysSchema,
  insertTasksSchema,
  patchTasksSchema,
  subscriptionResponseSchema,
} from "@/db/schema";

describe("insertTasksSchema", () => {
  it("accepts valid task with name and done", () => {
    const result = insertTasksSchema.safeParse({ name: "My task", done: false });
    expect(result.success).toBe(true);
  });

  it("accepts name at max length (500)", () => {
    const result = insertTasksSchema.safeParse({ name: "a".repeat(500), done: true });
    expect(result.success).toBe(true);
  });

  it("accepts name at min length (1)", () => {
    const result = insertTasksSchema.safeParse({ name: "a", done: false });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = insertTasksSchema.safeParse({ name: "", done: false });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 500 chars", () => {
    const result = insertTasksSchema.safeParse({ name: "a".repeat(501), done: false });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = insertTasksSchema.safeParse({ done: false });
    expect(result.success).toBe(false);
  });

  it("rejects missing done", () => {
    const result = insertTasksSchema.safeParse({ name: "test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = insertTasksSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean done", () => {
    const result = insertTasksSchema.safeParse({ name: "test", done: "yes" });
    expect(result.success).toBe(false);
  });

  it("rejects non-string name", () => {
    const result = insertTasksSchema.safeParse({ name: 123, done: false });
    expect(result.success).toBe(false);
  });

  it("strips extra fields (id, createdAt, updatedAt)", () => {
    const result = insertTasksSchema.safeParse({
      name: "test",
      done: false,
      id: 999,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Schema omits id, createdAt, updatedAt — should still parse successfully
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("createdAt");
      expect(result.data).not.toHaveProperty("updatedAt");
    }
  });
});

describe("patchTasksSchema", () => {
  it("accepts partial update with name only", () => {
    const result = patchTasksSchema.safeParse({ name: "updated" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with done only", () => {
    const result = patchTasksSchema.safeParse({ done: true });
    expect(result.success).toBe(true);
  });

  it("accepts full update with both fields", () => {
    const result = patchTasksSchema.safeParse({ name: "updated", done: true });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = patchTasksSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects name exceeding 500 chars", () => {
    const result = patchTasksSchema.safeParse({ name: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects empty name when provided", () => {
    const result = patchTasksSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean done", () => {
    const result = patchTasksSchema.safeParse({ done: "nope" });
    expect(result.success).toBe(false);
  });
});

describe("insertApiKeysSchema", () => {
  it("accepts valid API key with name and userId", () => {
    const result = insertApiKeysSchema.safeParse({
      userId: "user_123",
      name: "My API Key",
    });
    expect(result.success).toBe(true);
  });

  it("accepts name at max length (255)", () => {
    const result = insertApiKeysSchema.safeParse({
      userId: "user_123",
      name: "a".repeat(255),
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = insertApiKeysSchema.safeParse({
      userId: "user_123",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    const result = insertApiKeysSchema.safeParse({
      userId: "user_123",
      name: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing userId", () => {
    const result = insertApiKeysSchema.safeParse({
      name: "My Key",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = insertApiKeysSchema.safeParse({
      userId: "user_123",
    });
    expect(result.success).toBe(false);
  });

  it("strips omitted fields (id, keyHash, keyPrefix, etc.)", () => {
    const result = insertApiKeysSchema.safeParse({
      userId: "user_123",
      name: "My Key",
      id: 1,
      keyHash: "abc",
      keyPrefix: "gt_",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("keyHash");
      expect(result.data).not.toHaveProperty("keyPrefix");
    }
  });
});

describe("apiKeyResponseSchema", () => {
  it("accepts valid API key response", () => {
    const result = apiKeyResponseSchema.safeParse({
      id: 1,
      name: "Production Key",
      keyPrefix: "gt_abc123",
      expiresAt: "2026-12-31T00:00:00.000Z",
      lastUsedAt: "2026-04-01T00:00:00.000Z",
      revokedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = apiKeyResponseSchema.safeParse({
      id: 1,
      name: "Key",
      keyPrefix: "gt_",
      expiresAt: null,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = apiKeyResponseSchema.safeParse({
      name: "Key",
      keyPrefix: "gt_",
      expiresAt: null,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("apiKeyCreatedResponseSchema", () => {
  it("accepts valid created API key response with full key", () => {
    const result = apiKeyCreatedResponseSchema.safeParse({
      id: 1,
      name: "New Key",
      key: "gt_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      keyPrefix: "gt_abcdef",
      expiresAt: null,
      createdAt: "2026-04-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing key field", () => {
    const result = apiKeyCreatedResponseSchema.safeParse({
      id: 1,
      name: "New Key",
      keyPrefix: "gt_",
      expiresAt: null,
      createdAt: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("subscriptionResponseSchema", () => {
  it("accepts valid subscription with all tiers", () => {
    for (const tier of ["free", "pro", "enterprise"]) {
      const result = subscriptionResponseSchema.safeParse({
        id: 1,
        tier,
        status: "active",
        paymentProvider: "lemonsqueezy",
        currentPeriodEnd: "2026-05-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid statuses", () => {
    for (const status of ["active", "cancelled", "past_due", "trialing"]) {
      const result = subscriptionResponseSchema.safeParse({
        id: 1,
        tier: "pro",
        status,
        paymentProvider: "lemonsqueezy",
        currentPeriodEnd: null,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts free tier with null provider and period", () => {
    const result = subscriptionResponseSchema.safeParse({
      id: 0,
      tier: "free",
      status: "active",
      paymentProvider: null,
      currentPeriodEnd: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tier", () => {
    const result = subscriptionResponseSchema.safeParse({
      id: 1,
      tier: "premium",
      status: "active",
      paymentProvider: null,
      currentPeriodEnd: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = subscriptionResponseSchema.safeParse({
      id: 1,
      tier: "pro",
      status: "expired",
      paymentProvider: null,
      currentPeriodEnd: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = subscriptionResponseSchema.safeParse({
      id: 1,
      tier: "pro",
    });
    expect(result.success).toBe(false);
  });
});
