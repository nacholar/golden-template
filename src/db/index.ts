import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createDb(d1: D1Database) {
  return drizzle(d1, {
    casing: "snake_case",
    schema,
  });
}

export type Database = ReturnType<typeof createDb>;
