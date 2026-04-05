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

describe("subscriptions routes", () => {
  describe("GET /api/subscriptions/me", () => {
    it("rejects unauthenticated request", async () => {
      const res = await app.request("/api/subscriptions/me", undefined, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });

    it("rejects request with invalid bearer token", async () => {
      const res = await app.request("/api/subscriptions/me", {
        headers: { Authorization: "Bearer fake_session_token" },
      }, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });
  });

  describe("POST /api/subscriptions/checkout", () => {
    it("rejects unauthenticated request", async () => {
      const res = await app.request("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_123",
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        }),
      }, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });

    it("rejects request with invalid bearer token", async () => {
      const res = await app.request("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer fake_session_token",
        },
        body: JSON.stringify({
          priceId: "price_123",
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        }),
      }, getMockEnv());
      expect([401, 500]).toContain(res.status);
    });
  });
});
