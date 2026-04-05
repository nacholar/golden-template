import Stripe from "stripe";

import type { CheckoutSessionParams, PaymentProvider, WebhookEvent } from "./provider";

const TIER_MAP: Record<string, WebhookEvent["tier"]> = {
  pro_monthly: "pro",
  pro_yearly: "pro",
  enterprise_monthly: "enterprise",
  enterprise_yearly: "enterprise",
};

export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: "2025-06-30.basil" });
    this.webhookSecret = webhookSecret;
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({ email, name });
    return customer.id;
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { userId: params.userId },
    });
    return { url: session.url! };
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<WebhookEvent> {
    const event = await this.stripe.webhooks.constructEventAsync(body, signature, this.webhookSecret);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.lookup_key ?? "";
        // Access period dates from the subscription object
        const periodStart = (sub as any).current_period_start;
        const periodEnd = (sub as any).current_period_end;
        return {
          type: event.type === "customer.subscription.created" ? "subscription_created" : "subscription_updated",
          subscriptionId: sub.id,
          customerId: sub.customer as string,
          status: sub.status === "active" ? "active" : sub.status === "trialing" ? "trialing" : sub.status === "past_due" ? "past_due" : "cancelled",
          tier: TIER_MAP[priceId] ?? "pro",
          currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          type: "subscription_deleted",
          subscriptionId: sub.id,
          customerId: sub.customer as string,
          status: "cancelled",
          tier: "free",
        };
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string ?? "";
        return {
          type: "payment_failed",
          subscriptionId,
          customerId: invoice.customer as string,
          status: "past_due",
          tier: "pro",
        };
      }
      default:
        throw new Error(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
