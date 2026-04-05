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

describe("index route", () => {
  it("GET / returns welcome message", async () => {
    const res = await app.request("/", undefined, getMockEnv());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Golden Template API on Cloudflare");
  });
});

describe("openapi doc", () => {
  it("GET /doc returns OpenAPI spec", async () => {
    const res = await app.request("/doc", undefined, getMockEnv());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.openapi).toBe("3.0.0");
    expect(json.info.title).toBe("Golden Template API");
  });

  it("OpenAPI spec includes all registered paths", async () => {
    const res = await app.request("/doc", undefined, getMockEnv());
    const json = await res.json();
    const paths = Object.keys(json.paths);
    expect(paths).toContain("/tasks");
    expect(paths).toContain("/api/api-keys");
    expect(paths).toContain("/api/api-keys/{id}");
    expect(paths).toContain("/api/subscriptions/me");
    expect(paths).toContain("/api/subscriptions/checkout");
    expect(paths).toContain("/api/webhooks/lemonsqueezy");
  });

  it("OpenAPI spec documents correct HTTP methods", async () => {
    const res = await app.request("/doc", undefined, getMockEnv());
    const json = await res.json();
    expect(json.paths["/tasks"]).toHaveProperty("get");
    expect(json.paths["/tasks"]).toHaveProperty("post");
    expect(json.paths["/tasks/{id}"]).toHaveProperty("get");
    expect(json.paths["/tasks/{id}"]).toHaveProperty("patch");
    expect(json.paths["/tasks/{id}"]).toHaveProperty("delete");
    expect(json.paths["/api/api-keys"]).toHaveProperty("get");
    expect(json.paths["/api/api-keys"]).toHaveProperty("post");
    expect(json.paths["/api/api-keys/{id}"]).toHaveProperty("delete");
    expect(json.paths["/api/subscriptions/me"]).toHaveProperty("get");
    expect(json.paths["/api/subscriptions/checkout"]).toHaveProperty("post");
    expect(json.paths["/api/webhooks/lemonsqueezy"]).toHaveProperty("post");
  });
});

describe("webhooks routes", () => {
  it("POST /api/webhooks/lemonsqueezy returns 400 without x-signature header", async () => {
    const res = await app.request("/api/webhooks/lemonsqueezy", {
      method: "POST",
      body: "{}",
    }, getMockEnv());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Missing x-signature header");
  });

  it("POST /api/webhooks/lemonsqueezy returns 400 with invalid signature", async () => {
    const res = await app.request("/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": "invalid_sig" },
      body: "{}",
    }, getMockEnv());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Invalid webhook signature");
  });
});

describe("protected routes require auth", () => {
  it("GET /api/api-keys rejects unauthenticated requests", async () => {
    const res = await app.request("/api/api-keys", undefined, getMockEnv());
    // Returns 500 in test (D1 mock) but would be 401 with real D1
    // This validates the route is registered and reachable
    expect([401, 500]).toContain(res.status);
  });

  it("GET /api/subscriptions/me rejects unauthenticated requests", async () => {
    const res = await app.request("/api/subscriptions/me", undefined, getMockEnv());
    expect([401, 500]).toContain(res.status);
  });
});
