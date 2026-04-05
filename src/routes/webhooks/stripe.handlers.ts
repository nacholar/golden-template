import { eq } from "drizzle-orm";
import type { Context } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { createDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { StripePaymentProvider } from "@/lib/payment/stripe";
import type { AppBindings } from "@/lib/types";

export const stripeWebhook = async (c: Context<AppBindings>) => {
  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ message: "Missing stripe-signature header" }, HttpStatusCodes.BAD_REQUEST);
  }

  const body = await c.req.text();
  const stripe = new StripePaymentProvider(c.env.STRIPE_SECRET_KEY, c.env.STRIPE_WEBHOOK_SECRET);

  let event;
  try {
    event = await stripe.verifyWebhookSignature(body, signature);
  }
  catch {
    return c.json({ message: "Invalid webhook signature" }, HttpStatusCodes.BAD_REQUEST);
  }

  const db = createDb(c.env.DB);

  switch (event.type) {
    case "subscription_created": {
      const existing = await db.query.subscriptions.findFirst({
        where: (fields, ops) => ops.eq(fields.externalCustomerId, event.customerId),
      });

      if (existing) {
        await db.update(subscriptions)
          .set({
            tier: event.tier,
            status: event.status,
            externalSubscriptionId: event.subscriptionId,
            currentPeriodStart: event.currentPeriodStart,
            currentPeriodEnd: event.currentPeriodEnd,
          })
          .where(eq(subscriptions.id, existing.id));
      }
      break;
    }
    case "subscription_updated": {
      await db.update(subscriptions)
        .set({
          tier: event.tier,
          status: event.status,
          currentPeriodStart: event.currentPeriodStart,
          currentPeriodEnd: event.currentPeriodEnd,
        })
        .where(eq(subscriptions.externalSubscriptionId, event.subscriptionId));
      break;
    }
    case "subscription_deleted": {
      await db.update(subscriptions)
        .set({ tier: "free", status: "cancelled" })
        .where(eq(subscriptions.externalSubscriptionId, event.subscriptionId));
      break;
    }
    case "payment_failed": {
      await db.update(subscriptions)
        .set({ status: "past_due" })
        .where(eq(subscriptions.externalSubscriptionId, event.subscriptionId));
      break;
    }
  }

  return c.json({ received: true }, HttpStatusCodes.OK);
};
