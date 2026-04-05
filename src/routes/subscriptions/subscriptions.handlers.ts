import type { Context } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { LemonSqueezyPaymentProvider } from "@/lib/payment/lemonsqueezy";
import type { AppBindings } from "@/lib/types";

async function getSessionUser(c: Context<AppBindings>) {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session?.user ?? null;
}

export const getCurrent = async (c: Context<AppBindings>) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ message: "Not authenticated" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const db = createDb(c.env.DB);
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

export const createCheckout = async (c: Context<AppBindings>) => {
  const user = await getSessionUser(c);
  if (!user) {
    return c.json({ message: "Not authenticated" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = await c.req.json<{ priceId: string; successUrl: string; cancelUrl: string }>();
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
