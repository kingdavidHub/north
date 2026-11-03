export type FatalErrorOrigin = "unhandledRejection" | "uncaughtException";

/** Called when an error escapes Express. Implement it to shut down gracefully. */
export type FatalErrorHandler = (error: unknown, origin: FatalErrorOrigin) => void;

/**
 * Last line of defence for errors that never reach Express — a rejected
 * promise outside of the request lifecycle, or a synchronous throw in an
 * event handler or timer.
 *
 * Once Node reports one of these the process state cannot be trusted, so the
 * handler is responsible for shutting the server down. Register it once,
 * during bootstrap.
 */
export function registerGlobalErrorHandlers(onFatal: FatalErrorHandler): void {
  process.on("unhandledRejection", (reason) => {
    console.error("[north-api] Unhandled promise rejection:", reason);
    onFatal(reason, "unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    console.error("[north-api] Uncaught exception:", error);
    onFatal(error, "uncaughtException");
  });
}
