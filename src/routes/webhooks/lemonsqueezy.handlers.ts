import { eq } from "drizzle-orm";
import type { Context } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { createDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { LemonSqueezyPaymentProvider } from "@/lib/payment/lemonsqueezy";
import type { AppBindings } from "@/lib/types";

export const lemonsqueezyWebhook = async (c: Context<AppBindings>) => {
  const signature = c.req.header("x-signature");
  if (!signature) {
    return c.json({ message: "Missing x-signature header" }, HttpStatusCodes.BAD_REQUEST);
  }

  const body = await c.req.text();
  const provider = new LemonSqueezyPaymentProvider(
    c.env.LEMONSQUEEZY_API_KEY,
    c.env.LEMONSQUEEZY_STORE_ID,
    c.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  );

  let event;
  try {
    event = await provider.verifyWebhookSignature(body, signature);
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
            paymentProvider: "lemonsqueezy",
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
