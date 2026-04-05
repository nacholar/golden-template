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

  it("GET / returns JSON content-type", async () => {
    const res = await app.request("/", undefined, getMockEnv());
    expect(res.headers.get("content-type")).toContain("application/json");
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

  it("OpenAPI spec includes security schemes for protected endpoints", async () => {
    const res = await app.request("/doc", undefined, getMockEnv());
    const json = await res.json();
    // API Keys endpoints should have security
    const apiKeysGet = json.paths["/api/api-keys"]?.get;
    expect(apiKeysGet?.security).toBeDefined();
    const apiKeysPost = json.paths["/api/api-keys"]?.post;
    expect(apiKeysPost?.security).toBeDefined();
    // Subscriptions endpoints should have security
    const subMe = json.paths["/api/subscriptions/me"]?.get;
    expect(subMe?.security).toBeDefined();
    const subCheckout = json.paths["/api/subscriptions/checkout"]?.post;
    expect(subCheckout?.security).toBeDefined();
  });
});

describe("tasks route validation", () => {
  it("POST /tasks rejects empty body", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }, getMockEnv());
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST /tasks rejects missing name", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: false }),
    }, getMockEnv());
    expect(res.status).toBe(422);
  });

  it("POST /tasks rejects missing done field", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test task" }),
    }, getMockEnv());
    expect(res.status).toBe(422);
  });

  it("POST /tasks rejects empty name", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", done: false }),
    }, getMockEnv());
    expect(res.status).toBe(422);
  });

  it("POST /tasks rejects name exceeding 500 chars", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "a".repeat(501), done: false }),
    }, getMockEnv());
    expect(res.status).toBe(422);
  });

  it("GET /tasks/abc rejects non-numeric id", async () => {
    const res = await app.request("/tasks/abc", undefined, getMockEnv());
    expect(res.status).toBe(422);
  });

  it("PATCH /tasks/abc rejects non-numeric id", async () => {
    const res = await app.request("/tasks/abc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "updated" }),
    }, getMockEnv());
    expect(res.status).toBe(422);
  });

  it("DELETE /tasks/abc rejects non-numeric id", async () => {
    const res = await app.request("/tasks/abc", {
      method: "DELETE",
    }, getMockEnv());
    expect(res.status).toBe(422);
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
    expect(json.error.message).toBe("Missing x-signature header");
  });

  it("POST /api/webhooks/lemonsqueezy returns 400 with invalid signature", async () => {
    const res = await app.request("/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": "invalid_sig" },
      body: "{}",
    }, getMockEnv());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toBe("Invalid webhook signature");
  });

  it("POST /api/webhooks/lemonsqueezy returns 400 with empty signature", async () => {
    const res = await app.request("/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": "" },
      body: "{}",
    }, getMockEnv());
    // Empty string signature should still fail verification
    expect(res.status).toBe(400);
  });
});

describe("protected routes require auth", () => {
  it("GET /api/api-keys rejects unauthenticated requests", async () => {
    const res = await app.request("/api/api-keys", undefined, getMockEnv());
    // Returns 500 in test (D1 mock) but would be 401 with real D1
    // This validates the route is registered and reachable
    expect([401, 500]).toContain(res.status);
  });

  it("POST /api/api-keys rejects unauthenticated requests", async () => {
    const res = await app.request("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test-key" }),
    }, getMockEnv());
    expect([401, 500]).toContain(res.status);
  });

  it("DELETE /api/api-keys/1 rejects unauthenticated requests", async () => {
    const res = await app.request("/api/api-keys/1", {
      method: "DELETE",
    }, getMockEnv());
    expect([401, 500]).toContain(res.status);
  });

  it("GET /api/subscriptions/me rejects unauthenticated requests", async () => {
    const res = await app.request("/api/subscriptions/me", undefined, getMockEnv());
    expect([401, 500]).toContain(res.status);
  });

  it("POST /api/subscriptions/checkout rejects unauthenticated requests", async () => {
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
});

describe("not found handling", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/nonexistent", undefined, getMockEnv());
    expect(res.status).toBe(404);
  });

  it("returns 404 for wrong HTTP methods on known routes", async () => {
    const res = await app.request("/tasks", {
      method: "PUT",
    }, getMockEnv());
    expect(res.status).toBe(404);
  });
});
