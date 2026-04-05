import { createRouter } from "@/lib/create-app";

import * as handlers from "./stripe.handlers";
import * as routes from "./stripe.routes";

const router = createRouter()
  .openapi(routes.stripeWebhook, handlers.stripeWebhook as any);

export default router;
