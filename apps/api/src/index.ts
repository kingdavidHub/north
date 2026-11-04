import "dotenv/config";
import { createApp } from "./app.ts";
import { registerGlobalErrorHandlers } from "./errors/index.ts";
import { prisma } from "./lib/prisma.ts";

const port = Number(process.env.PORT) || 4000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`North API running at http://localhost:${port}`);
});

let isShuttingDown = false;

/**
 * Stops accepting connections, disconnects Prisma and exits. Forced out after
 * 10s so a stuck connection cannot keep the process alive forever.
 */
function shutdown(reason: string, exitCode = 0): void {
  if (isShuttingDown) {
    console.warn(`[north-api] Received ${reason} while shutting down; exiting immediately.`);
    process.exit(exitCode || 1);
  }

  isShuttingDown = true;

  console.log(`[north-api] Shutting down (${reason})...`);

  const forceExit = setTimeout(() => {
    console.error("[north-api] Forced shutdown after timeout.");
    process.exit(exitCode || 1);
  }, 10_000);
  forceExit.unref();

  server.close(() => {
    void prisma
      .$disconnect()
      .catch((error: unknown) => {
        console.error("[north-api] Failed to disconnect Prisma:", error);
      })
      .finally(() => process.exit(exitCode));
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Errors that escape Express entirely: log, then shut down cleanly.
registerGlobalErrorHandlers((_error, origin) => {
  shutdown(origin, 1);
});
