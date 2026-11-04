import { AppError, type AppErrorOptions } from "./app-error.ts";

/** 400 — The request is malformed or missing required information. */
export class BadRequestError extends AppError {
  override readonly statusCode: number = 400;
  override readonly code: string = "BAD_REQUEST";

  constructor(message = "The request is invalid.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 401 — The request requires authentication. */
export class UnauthorizedError extends AppError {
  override readonly statusCode: number = 401;
  override readonly code: string = "UNAUTHORIZED";

  constructor(message = "Authentication is required.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 403 — The caller is authenticated but not allowed to perform the action. */
export class ForbiddenError extends AppError {
  override readonly statusCode: number = 403;
  override readonly code: string = "FORBIDDEN";

  constructor(message = "You do not have permission to perform this action.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 404 — The requested resource does not exist. */
export class NotFoundError extends AppError {
  override readonly statusCode: number = 404;
  override readonly code: string = "NOT_FOUND";

  constructor(message = "The requested resource was not found.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 409 — The request conflicts with the current state of the resource. */
export class ConflictError extends AppError {
  override readonly statusCode: number = 409;
  override readonly code: string = "CONFLICT";

  constructor(
    message = "The request conflicts with the current state of the resource.",
    options: AppErrorOptions = {},
  ) {
    super(message, options);
  }
}

/** 422 — The request is well-formed but semantically invalid. */
export class UnprocessableEntityError extends AppError {
  override readonly statusCode: number = 422;
  override readonly code: string = "UNPROCESSABLE_ENTITY";

  constructor(message = "The request could not be processed.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 429 — The caller is sending too many requests. */
export class TooManyRequestsError extends AppError {
  override readonly statusCode: number = 429;
  override readonly code: string = "TOO_MANY_REQUESTS";

  constructor(message = "Too many requests. Please try again later.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 500 — An unexpected failure. Details are hidden in production. */
export class InternalServerError extends AppError {
  override readonly statusCode: number = 500;
  override readonly code: string = "INTERNAL_SERVER_ERROR";
  override readonly isOperational: boolean = false;

  constructor(message = "An unexpected error occurred.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}

/** 503 — A dependency is unavailable or the service is shutting down. */
export class ServiceUnavailableError extends AppError {
  override readonly statusCode: number = 503;
  override readonly code: string = "SERVICE_UNAVAILABLE";
  override readonly isOperational: boolean = false;

  constructor(message = "The service is temporarily unavailable.", options: AppErrorOptions = {}) {
    super(message, options);
  }
}
