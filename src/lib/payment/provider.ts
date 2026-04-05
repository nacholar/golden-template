export interface CheckoutSessionParams {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookEvent {
  type: "subscription_created" | "subscription_updated" | "subscription_deleted" | "payment_failed";
  subscriptionId: string;
  customerId: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  tier: "free" | "pro" | "enterprise";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface PaymentProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }>;
  verifyWebhookSignature(body: string, signature: string): Promise<WebhookEvent>;
  createCustomer(email: string, name: string): Promise<string>;
}
