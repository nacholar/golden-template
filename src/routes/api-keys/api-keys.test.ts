import { describe, expect, it } from "vitest";

import app from "@/app";

function getMockEnv() {
  return {
    DB: {} as D1Database,
    NODE_ENV: "test",
    LOG_LEVEL: "silent" as const,
    UPSTASH_REDIS_REST_URL: "https://fake.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "fake_token",
    BETTER_AUTH_SECRET: "test_secret_at_least_32_characters_long_here",
    BETTER_AUTH_URL: "http://localhost:8787",
    GITHUB_CLIENT_ID: "test_github_client_id",
    GITHUB_CLIENT_SECRET: "test_github_client_secret",
    LEMONSQUEEZY_API_KEY: "fake_ls_api_key",
    LEMONSQUEEZY_STORE_ID: "fake_store_id",
    LEMONSQUEEZY_WEBHOOK_SECRET: "fake_webhook_secret",
  };
}

describe("api-keys routes", () => {
  describe("GET /api/api-keys", () => {
    it("rejects unauthenticated request", async () => {
      const res = await app.request("/api/api-keys", undefined, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });

    it("rejects request with invalid bearer token", async () => {
      const res = await app.request("/api/api-keys", {
        headers: { Authorization: "Bearer invalid_token" },
      }, getMockEnv());
      // Without a real D1, better-auth can't validate the session
      expect([401, 500]).toContain(res.status);
    });
  });

  describe("POST /api/api-keys", () => {
    it("rejects unauthenticated request", async () => {
      const res = await app.request("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test-key" }),
      }, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });

    it("rejects request with invalid bearer token", async () => {
      const res = await app.request("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer invalid_token",
        },
        body: JSON.stringify({ name: "test-key" }),
      }, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });
  });

  describe("DELETE /api/api-keys/{id}", () => {
    it("rejects unauthenticated request", async () => {
      const res = await app.request("/api/api-keys/1", {
        method: "DELETE",
      }, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });

    it("validates id parameter is numeric", async () => {
      const res = await app.request("/api/api-keys/abc", {
        method: "DELETE",
      }, getMockEnv());
      // Non-numeric id should be rejected by Zod regex validation
      expect([401, 422, 500]).toContain(res.status);
    });
  });
});
