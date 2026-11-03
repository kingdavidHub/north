import { Router } from "express";
import { validateUser } from "../controllers/index.ts";

export const userRouter = Router();

userRouter.post("/validate", validateUser);
