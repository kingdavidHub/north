import type { RequestHandler } from "express";
import { getHealthStatus } from "../services/index.ts";

/** `GET /health` — liveness probe. */
export const getHealth: RequestHandler = (_req, res) => {
  res.json(getHealthStatus());
};
