import { Router } from "express";
import { getHealth } from "../controllers/index.ts";

export const healthRouter = Router();

healthRouter.get("/health", getHealth);
