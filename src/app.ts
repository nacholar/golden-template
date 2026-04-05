import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import apiKeys from "@/routes/api-keys/api-keys.index";
import auth from "@/routes/auth/auth.index";
import index from "@/routes/index.route";
import subscriptions from "@/routes/subscriptions/subscriptions.index";
import tasks from "@/routes/tasks/tasks.index";
import lemonsqueezyWebhooks from "@/routes/webhooks/lemonsqueezy.index";

const app = createApp();

configureOpenAPI(app);

// OpenAPI-registered routes
const routes = [
  index,
  tasks,
  apiKeys,
  subscriptions,
  lemonsqueezyWebhooks,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

// Better-Auth routes (self-managed, not OpenAPI-registered)
app.route("/", auth);

export type AppType = typeof routes[number];

export default app;
