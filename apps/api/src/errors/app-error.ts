/**
 * Options shared by every application error.
 */
export interface AppErrorOptions {
  /** Safe, structured context that is serialised into the HTTP response. */
  details?: unknown;
  /** The underlying error. Kept for logging and never sent to clients. */
  cause?: unknown;
}

/**
 * Base class for every error the API raises on purpose.
 *
 * Throw an `AppError` (or one of its subclasses) from a service or a
 * controller and the global error handler will turn it into the matching
 * HTTP response. Anything that is not an `AppError` is treated as an
 * unexpected failure and reported as a `500`.
 *
 * @example
 * throw new NotFoundError(`User "${id}" was not found.`);
 */
export abstract class AppError extends Error {
  /** HTTP status code the error handler should respond with. */
  abstract readonly statusCode: number;

  /** Stable, machine-readable error code (e.g. `NOT_FOUND`). */
  abstract readonly code: string;

  /**
   * Operational errors are expected failures (bad input, missing record,
   * failed precondition) and are safe to expose to clients.
   */
  readonly isOperational: boolean = true;

  /** Safe, structured context that is serialised into the response. */
  readonly details?: unknown;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });

    this.name = new.target.name;
    this.details = options.details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  /** Shape used when an error is serialised to JSON. */
  toJSON(): { code: string; message: string; details?: unknown } {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
