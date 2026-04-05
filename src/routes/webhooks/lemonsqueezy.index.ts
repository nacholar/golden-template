import { createRouter } from "@/lib/create-app";

import * as handlers from "./lemonsqueezy.handlers";
import * as routes from "./lemonsqueezy.routes";

const router = createRouter()
  .openapi(routes.lemonsqueezyWebhook, handlers.lemonsqueezyWebhook as any);

export default router;
