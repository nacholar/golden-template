import { describe, expect, it } from "vitest";

import { parseEnv } from "@/env";

function validEnv() {
  return {
    DB: {} as D1Database,
    NODE_ENV: "test",
    LOG_LEVEL: "info",
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

describe("parseEnv", () => {
  it("parses valid environment successfully", () => {
    const env = parseEnv(validEnv());
    expect(env.NODE_ENV).toBe("test");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.UPSTASH_REDIS_REST_URL).toBe("https://fake.upstash.io");
    expect(env.BETTER_AUTH_SECRET).toBeDefined();
    expect(env.DB).toBeDefined();
  });

  it("applies default NODE_ENV when missing", () => {
    const data = validEnv();
    delete (data as any).NODE_ENV;
    const env = parseEnv(data);
    expect(env.NODE_ENV).toBe("development");
  });

  it("applies default LOG_LEVEL when missing", () => {
    const data = validEnv();
    delete (data as any).LOG_LEVEL;
    const env = parseEnv(data);
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("accepts all valid LOG_LEVEL values", () => {
    for (const level of ["fatal", "error", "warn", "info", "debug", "trace", "silent"]) {
      const data = { ...validEnv(), LOG_LEVEL: level };
      const env = parseEnv(data);
      expect(env.LOG_LEVEL).toBe(level);
    }
  });

  it("throws on missing UPSTASH_REDIS_REST_URL", () => {
    const data = validEnv();
    delete (data as any).UPSTASH_REDIS_REST_URL;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing UPSTASH_REDIS_REST_TOKEN", () => {
    const data = validEnv();
    delete (data as any).UPSTASH_REDIS_REST_TOKEN;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing BETTER_AUTH_SECRET", () => {
    const data = validEnv();
    delete (data as any).BETTER_AUTH_SECRET;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing BETTER_AUTH_URL", () => {
    const data = validEnv();
    delete (data as any).BETTER_AUTH_URL;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on invalid BETTER_AUTH_URL (not a URL)", () => {
    const data = { ...validEnv(), BETTER_AUTH_URL: "not-a-url" };
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing GITHUB_CLIENT_ID", () => {
    const data = validEnv();
    delete (data as any).GITHUB_CLIENT_ID;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing GITHUB_CLIENT_SECRET", () => {
    const data = validEnv();
    delete (data as any).GITHUB_CLIENT_SECRET;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing LEMONSQUEEZY_API_KEY", () => {
    const data = validEnv();
    delete (data as any).LEMONSQUEEZY_API_KEY;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing LEMONSQUEEZY_STORE_ID", () => {
    const data = validEnv();
    delete (data as any).LEMONSQUEEZY_STORE_ID;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on missing LEMONSQUEEZY_WEBHOOK_SECRET", () => {
    const data = validEnv();
    delete (data as any).LEMONSQUEEZY_WEBHOOK_SECRET;
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("throws on invalid LOG_LEVEL", () => {
    const data = { ...validEnv(), LOG_LEVEL: "verbose" };
    expect(() => parseEnv(data)).toThrow("Invalid env");
  });

  it("preserves DB binding from input", () => {
    const mockDB = { prepare: () => {} } as unknown as D1Database;
    const data = { ...validEnv(), DB: mockDB };
    const env = parseEnv(data);
    expect(env.DB).toBe(mockDB);
  });
});
