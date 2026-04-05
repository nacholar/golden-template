import { createRouter } from "@/lib/create-app";

import * as handlers from "./subscriptions.handlers";
import * as routes from "./subscriptions.routes";

const router = createRouter()
  .openapi(routes.getCurrent, handlers.getCurrent as any)
  .openapi(routes.createCheckout, handlers.createCheckout as any);

export default router;
