import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import * as HttpStatusCodes from "stoker/http-status-codes";

export class AppError extends Error {
  readonly status: ContentfulStatusCode;
  readonly code: string;

  constructor(status: ContentfulStatusCode, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    super(
      HttpStatusCodes.NOT_FOUND,
      "NOT_FOUND",
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Not authenticated") {
    super(HttpStatusCodes.UNAUTHORIZED, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(HttpStatusCodes.FORBIDDEN, "FORBIDDEN", message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(HttpStatusCodes.BAD_REQUEST, "BAD_REQUEST", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(HttpStatusCodes.CONFLICT, "CONFLICT", message);
  }
}

export function handleError(err: Error, c: Context) {
  const logger = c.get("logger");

  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger?.error({ err, status: err.status }, err.message);
    }
    return c.json(err.toJSON(), err.status);
  }

  // Handle Hono's built-in HTTPException (e.g. malformed JSON)
  if (err instanceof HTTPException) {
    const status = err.status as ContentfulStatusCode;
    return c.json(
      {
        error: {
          code: "HTTP_EXCEPTION",
          message: err.message,
        },
      },
      status,
    );
  }

  // Handle malformed JSON parse errors
  if (err instanceof SyntaxError || err.message.includes("Unexpected")) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Malformed request body",
        },
      },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  logger?.error({ err }, "Unhandled error");
  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    },
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
  );
}
