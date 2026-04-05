import { createRouter } from "@/lib/create-app";
import { requireSession } from "@/middlewares/auth";

import * as handlers from "./api-keys.handlers";
import * as routes from "./api-keys.routes";

const router = createRouter();

// All API key routes require authentication
router.use("/api/api-keys/*", requireSession());
router.use("/api/api-keys", requireSession());

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.revoke, handlers.revoke);

export default router;
