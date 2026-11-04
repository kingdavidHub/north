import { Router } from "express";
import { healthRouter } from "./health.routes.ts";
import { userRouter } from "./user.routes.ts";

/**
 * Root router. Mount every feature router here; the app only ever mounts
 * this one.
 */
export const router = Router();

router.use(healthRouter);
router.use("/users", userRouter);

export { healthRouter, userRouter };
