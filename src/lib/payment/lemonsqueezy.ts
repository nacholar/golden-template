import {
  createCheckout,
  createCustomer,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";

import type { CheckoutSessionParams, PaymentProvider, WebhookEvent } from "./provider";

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    id: string;
    attributes: {
      store_id: number;
      customer_id: number;
      variant_id: number;
      status: string;
      renews_at: string | null;
      created_at: string;
      updated_at: string;
      first_subscription_item?: {
        price_id: number;
      };
    };
  };
}

const VARIANT_TIER_MAP: Record<string, WebhookEvent["tier"]> = {
  pro_monthly: "pro",
  pro_yearly: "pro",
  enterprise_monthly: "enterprise",
  enterprise_yearly: "enterprise",
};

function mapStatus(lsStatus: string): WebhookEvent["status"] {
  switch (lsStatus) {
    case "active":
      return "active";
    case "on_trial":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "cancelled";
  }
}

export class LemonSqueezyPaymentProvider implements PaymentProvider {
  private storeId: string;
  private webhookSecret: string;

  constructor(apiKey: string, storeId: string, webhookSecret: string) {
    lemonSqueezySetup({ apiKey });
    this.storeId = storeId;
    this.webhookSecret = webhookSecret;
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const { data, error } = await createCustomer(this.storeId, {
      name,
      email,
    });
    if (error) {
      throw new Error(`LemonSqueezy createCustomer failed: ${error.message}`);
    }
    return data!.data.id;
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }> {
    const { data, error } = await createCheckout(this.storeId, params.priceId, {
      checkoutData: {
        custom: { user_id: params.userId },
      },
      productOptions: {
        redirectUrl: params.successUrl,
      },
    });
    if (error) {
      throw new Error(`LemonSqueezy createCheckout failed: ${error.message}`);
    }
    return { url: data!.data.attributes.url };
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<WebhookEvent> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const digest = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (digest !== signature) {
      throw new Error("Invalid LemonSqueezy webhook signature");
    }

    const payload: LemonSqueezyWebhookPayload = JSON.parse(body);
    const { event_name } = payload.meta;
    const attrs = payload.data.attributes;

    switch (event_name) {
      case "subscription_created":
        return {
          type: "subscription_created",
          subscriptionId: payload.data.id,
          customerId: String(attrs.customer_id),
          status: mapStatus(attrs.status),
          tier: this.resolveTier(payload),
          currentPeriodStart: new Date(attrs.created_at),
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : undefined,
        };
      case "subscription_updated":
        return {
          type: "subscription_updated",
          subscriptionId: payload.data.id,
          customerId: String(attrs.customer_id),
          status: mapStatus(attrs.status),
          tier: this.resolveTier(payload),
          currentPeriodStart: new Date(attrs.updated_at),
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : undefined,
        };
      case "subscription_payment_success":
        return {
          type: "subscription_updated",
          subscriptionId: payload.data.id,
          customerId: String(attrs.customer_id),
          status: "active",
          tier: this.resolveTier(payload),
          currentPeriodStart: new Date(attrs.updated_at),
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : undefined,
        };
      case "subscription_payment_failed":
        return {
          type: "payment_failed",
          subscriptionId: payload.data.id,
          customerId: String(attrs.customer_id),
          status: "past_due",
          tier: this.resolveTier(payload),
        };
      case "subscription_expired":
        return {
          type: "subscription_deleted",
          subscriptionId: payload.data.id,
          customerId: String(attrs.customer_id),
          status: "cancelled",
          tier: "free",
        };
      default:
        throw new Error(`Unhandled LemonSqueezy event: ${event_name}`);
    }
  }

  private resolveTier(payload: LemonSqueezyWebhookPayload): WebhookEvent["tier"] {
    const variantId = String(payload.data.attributes.variant_id);
    return VARIANT_TIER_MAP[variantId] ?? "pro";
  }
}
