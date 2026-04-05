import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import { tasks } from "@/db/schema";
import { NotFoundError } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = c.get("db");
  const allTasks = await db.query.tasks.findMany();
  return c.json(allTasks);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = c.get("db");
  const task = c.req.valid("json");
  const [inserted] = await db.insert(tasks).values(task).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");
  const task = await db.query.tasks.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!task) {
    throw new NotFoundError("Task", id);
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [{ code: ZOD_ERROR_CODES.INVALID_UPDATES, path: [], message: ZOD_ERROR_MESSAGES.NO_UPDATES }],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [task] = await db.update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning();

  if (!task) {
    throw new NotFoundError("Task", id);
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");

  const existing = await db.query.tasks.findFirst({
    where: (fields, ops) => ops.eq(fields.id, id),
  });

  if (!existing) {
    throw new NotFoundError("Task", id);
  }

  await db.delete(tasks).where(eq(tasks.id, id));
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
