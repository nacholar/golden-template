import * as HttpStatusCodes from "stoker/http-status-codes";

import { LemonSqueezyPaymentProvider } from "@/lib/payment/lemonsqueezy";
import type { AppRouteHandler } from "@/lib/types";

import type { CreateCheckoutRoute, GetCurrentRoute } from "./subscriptions.routes";

export const getCurrent: AppRouteHandler<GetCurrentRoute> = async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const sub = await db.query.subscriptions.findFirst({
    where: (fields, ops) => ops.eq(fields.userId, user.id),
  });

  if (!sub) {
    return c.json({
      id: 0,
      tier: "free" as const,
      status: "active" as const,
      paymentProvider: null,
      currentPeriodEnd: null,
    }, HttpStatusCodes.OK);
  }

  return c.json({
    id: sub.id,
    tier: sub.tier,
    status: sub.status,
    paymentProvider: sub.paymentProvider,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
  }, HttpStatusCodes.OK);
};

export const createCheckout: AppRouteHandler<CreateCheckoutRoute> = async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  const provider = new LemonSqueezyPaymentProvider(
    c.env.LEMONSQUEEZY_API_KEY,
    c.env.LEMONSQUEEZY_STORE_ID,
    c.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  );

  const { url } = await provider.createCheckoutSession({
    userId: user.id,
    priceId: body.priceId,
    successUrl: body.successUrl,
    cancelUrl: body.cancelUrl,
  });

  return c.json({ url }, HttpStatusCodes.OK);
};
