import { createRouter } from "@/lib/create-app";
import { requireSession } from "@/middlewares/auth";

import * as handlers from "./subscriptions.handlers";
import * as routes from "./subscriptions.routes";

const router = createRouter();

// All subscription routes require authentication
router.use("/api/subscriptions/*", requireSession());

router
  .openapi(routes.getCurrent, handlers.getCurrent)
  .openapi(routes.createCheckout, handlers.createCheckout);

export default router;
