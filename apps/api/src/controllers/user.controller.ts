import type { RequestHandler } from "express";
import { validateUserPayload } from "../services/index.ts";

/**
 * `POST /users/validate` — validates an untrusted user payload.
 *
 * The controller stays thin: validation lives in the service layer and any
 * failure is handled by the global error handler.
 */
export const validateUser: RequestHandler = (req, res) => {
  const user = validateUserPayload(req.body);

  res.status(200).json({
    message: "User data is valid",
    user,
  });
};
