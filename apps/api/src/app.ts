import cors from "cors";
import express, { type Express } from "express";
import { errorHandler, notFoundHandler } from "./middlewares/index.ts";
import { router } from "./routes/index.ts";

/**
 * Builds the Express application.
 *
 * Order matters:
 * 1. Global middleware (CORS, body parsing).
 * 2. Feature routes.
 * 3. Root-level not-found fallback.
 * 4. Global error handler — always last.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
