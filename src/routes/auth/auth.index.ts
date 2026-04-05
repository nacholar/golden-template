import { createRouter } from "@/lib/create-app";
import { createAuth } from "@/lib/auth";

const router = createRouter();

// Programmatic migration endpoint — only available in development
router.all("/api/auth/migrate", async (c) => {
  if (c.env.NODE_ENV === "production") {
    return c.json({ message: "Not available in production" }, 404);
  }

  const { getMigrations } = await import("better-auth/db/migration");
  const auth = createAuth(c.env);
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);

  if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    return c.json({ message: "No migrations needed" });
  }

  await runMigrations();
  return c.json({
    message: "Migrations completed",
    created: toBeCreated.map(t => t.table),
    added: toBeAdded.map(t => t.table),
  });
});

// Better-Auth handles all /api/auth/* routes internally
router.all("/api/auth/**", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

export default router;
