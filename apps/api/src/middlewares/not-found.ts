import type { RequestHandler } from "express";
import { NotFoundError } from "../errors/index.ts";

/**
 * Root-level fallback for unmatched requests.
 *
 * Mounted after every route so that any request that reaches it is forwarded
 * to the global error handler as a structured `404 NOT_FOUND` response.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} was not found.`));
};
