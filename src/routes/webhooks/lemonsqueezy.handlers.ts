import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { subscriptions } from "@/db/schema";
import { BadRequestError } from "@/lib/errors";
import { LemonSqueezyPaymentProvider } from "@/lib/payment/lemonsqueezy";
import type { AppRouteHandler } from "@/lib/types";

import type { LemonSqueezyWebhookRoute } from "./lemonsqueezy.routes";

export const lemonsqueezyWebhook: AppRouteHandler<LemonSqueezyWebhookRoute> = async (c) => {
  const signature = c.req.header("x-signature");
  if (!signature) {
    throw new BadRequestError("Missing x-signature header");
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
    throw new BadRequestError("Invalid webhook signature");
  }

  const db = c.get("db");
  const logger = c.get("logger");

  logger.info({ eventType: event.type, subscriptionId: event.subscriptionId }, "Processing webhook event");

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
