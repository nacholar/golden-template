import { describe, expect, it } from "vitest";

import { LemonSqueezyPaymentProvider } from "@/lib/payment/lemonsqueezy";

const WEBHOOK_SECRET = "test_webhook_secret";

async function signPayload(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function makePayload(eventName: string, overrides: Record<string, any> = {}) {
  return JSON.stringify({
    meta: {
      event_name: eventName,
      custom_data: { user_id: "user_123" },
    },
    data: {
      id: "sub_456",
      attributes: {
        store_id: 1,
        customer_id: 100,
        variant_id: 200,
        status: "active",
        renews_at: "2026-05-01T00:00:00Z",
        created_at: "2026-04-01T00:00:00Z",
        updated_at: "2026-04-01T00:00:00Z",
        ...overrides,
      },
    },
  });
}

describe("LemonSqueezy webhook signature verification", () => {
  it("verifies valid signature and parses subscription_created", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_created");
    const signature = await signPayload(body, WEBHOOK_SECRET);

    const event = await provider.verifyWebhookSignature(body, signature);

    expect(event.type).toBe("subscription_created");
    expect(event.subscriptionId).toBe("sub_456");
    expect(event.customerId).toBe("100");
    expect(event.status).toBe("active");
    expect(event.currentPeriodEnd).toBeInstanceOf(Date);
  });

  it("rejects invalid signature", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_created");

    await expect(
      provider.verifyWebhookSignature(body, "bad_signature"),
    ).rejects.toThrow("Invalid LemonSqueezy webhook signature");
  });

  it("parses subscription_updated event", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_updated");
    const signature = await signPayload(body, WEBHOOK_SECRET);

    const event = await provider.verifyWebhookSignature(body, signature);

    expect(event.type).toBe("subscription_updated");
    expect(event.status).toBe("active");
  });

  it("parses subscription_expired as subscription_deleted", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_expired", { status: "expired" });
    const signature = await signPayload(body, WEBHOOK_SECRET);

    const event = await provider.verifyWebhookSignature(body, signature);

    expect(event.type).toBe("subscription_deleted");
    expect(event.status).toBe("cancelled");
    expect(event.tier).toBe("free");
  });

  it("parses subscription_payment_failed event", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_payment_failed", { status: "past_due" });
    const signature = await signPayload(body, WEBHOOK_SECRET);

    const event = await provider.verifyWebhookSignature(body, signature);

    expect(event.type).toBe("payment_failed");
    expect(event.status).toBe("past_due");
  });

  it("parses subscription_payment_success as subscription_updated", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_payment_success");
    const signature = await signPayload(body, WEBHOOK_SECRET);

    const event = await provider.verifyWebhookSignature(body, signature);

    expect(event.type).toBe("subscription_updated");
    expect(event.status).toBe("active");
  });

  it("maps on_trial status to trialing", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("subscription_created", { status: "on_trial" });
    const signature = await signPayload(body, WEBHOOK_SECRET);

    const event = await provider.verifyWebhookSignature(body, signature);

    expect(event.status).toBe("trialing");
  });

  it("throws on unhandled event type", async () => {
    const provider = new LemonSqueezyPaymentProvider("fake_key", "1", WEBHOOK_SECRET);
    const body = makePayload("order_created");
    const signature = await signPayload(body, WEBHOOK_SECRET);

    await expect(
      provider.verifyWebhookSignature(body, signature),
    ).rejects.toThrow("Unhandled LemonSqueezy event: order_created");
  });
});
