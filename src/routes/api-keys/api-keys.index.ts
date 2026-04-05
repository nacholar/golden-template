import { createRouter } from "@/lib/create-app";

import * as handlers from "./api-keys.handlers";
import * as routes from "./api-keys.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list as any)
  .openapi(routes.create, handlers.create as any)
  .openapi(routes.revoke, handlers.revoke as any);

export default router;
