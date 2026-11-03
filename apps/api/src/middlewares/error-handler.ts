import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/index.ts";

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface NormalizedError {
  statusCode: number;
  body: ErrorBody;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Prisma throws `PrismaClientKnownRequestError` for constraint violations.
 * Those map cleanly onto HTTP statuses, so callers never have to catch them.
 */
const PRISMA_ERROR_MAP: Record<string, { statusCode: number; code: string; message: string }> = {
  P2002: {
    statusCode: 409,
    code: "CONFLICT",
    message: "A record with these details already exists.",
  },
  P2003: {
    statusCode: 400,
    code: "BAD_REQUEST",
    message: "The request references a record that does not exist.",
  },
  P2025: {
    statusCode: 404,
    code: "NOT_FOUND",
    message: "The requested record was not found.",
  },
};

/**
 * Connection-level failures are temporary outages, not internal bugs. Prisma
 * surfaces them as known request errors whose code is the transport/P-code.
 */
const PRISMA_UNAVAILABLE_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "P1001",
  "P1002",
  "P1008",
  "P2024",
]);

const SERVICE_UNAVAILABLE: NormalizedError = {
  statusCode: 503,
  body: {
    success: false,
    error: {
      code: "SERVICE_UNAVAILABLE",
      message: "The service is temporarily unavailable. Please try again.",
    },
  },
};

/**
 * body-parser (used by `express.json`/`express.urlencoded`) rejects oversized
 * or unsupported payloads with an `http-errors` object. Honour those exposed
 * 4xx statuses instead of reporting them as server failures.
 */
const CLIENT_ERROR_RESPONSES: Record<number, { code: string; message: string }> = {
  400: { code: "BAD_REQUEST", message: "The request is invalid." },
  413: { code: "PAYLOAD_TOO_LARGE", message: "The request body is too large." },
  415: { code: "UNSUPPORTED_MEDIA_TYPE", message: "The request content type is not supported." },
};

/**
 * Detected by name rather than `instanceof` so it keeps working when more
 * than one copy of zod is loaded in the dependency tree.
 */
function isZodError(error: unknown): error is Error & { issues: unknown[] } {
  return (
    error instanceof Error &&
    error.name === "ZodError" &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

/**
 * Detected structurally so the handler does not depend on the generated
 * Prisma client.
 */
function isPrismaKnownError(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    error.name === "PrismaClientKnownRequestError" &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

/** Detected structurally so the handler does not depend on the Prisma client. */
function isPrismaInitializationError(error: unknown): error is Error {
  return error instanceof Error && error.name === "PrismaClientInitializationError";
}

function getClientError(
  error: unknown,
): { statusCode: number; code: string; message: string } | undefined {
  if (!(error instanceof Error)) return undefined;

  const candidate = error as Error & {
    status?: unknown;
    statusCode?: unknown;
    expose?: unknown;
  };

  const status =
    typeof candidate.status === "number"
      ? candidate.status
      : typeof candidate.statusCode === "number"
        ? candidate.statusCode
        : undefined;

  if (status === undefined || status < 400 || status >= 500) return undefined;
  if (candidate.expose !== true) return undefined;

  const mapped = CLIENT_ERROR_RESPONSES[status];
  if (mapped) return { statusCode: status, ...mapped };

  return {
    statusCode: status,
    code: "BAD_REQUEST",
    message: "The request could not be processed.",
  };
}

/**
 * Turns any thrown value — `AppError`, zod validation failure, Prisma
 * constraint error, malformed JSON body or plain `Error` — into a status
 * code and a response body.
 */
function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
    };
  }

  if (isZodError(error)) {
    return {
      statusCode: 422,
      body: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The request data is invalid.",
          details: error.issues,
        },
      },
    };
  }

  if (isPrismaKnownError(error)) {
    if (PRISMA_UNAVAILABLE_CODES.has(error.code)) {
      return SERVICE_UNAVAILABLE;
    }

    const mapped = PRISMA_ERROR_MAP[error.code];

    if (mapped) {
      return {
        statusCode: mapped.statusCode,
        body: {
          success: false,
          error: { code: mapped.code, message: mapped.message },
        },
      };
    }
  }

  if (isPrismaInitializationError(error)) {
    return SERVICE_UNAVAILABLE;
  }

  // express.json() throws a SyntaxError for malformed request bodies.
  if (error instanceof SyntaxError && "body" in error) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "The request body is not valid JSON.",
        },
      },
    };
  }

  // body-parser marks its own client errors (413, 415, ...) as exposed 4xx.
  const clientError = getClientError(error);

  if (clientError) {
    return {
      statusCode: clientError.statusCode,
      body: {
        success: false,
        error: { code: clientError.code, message: clientError.message },
      },
    };
  }

  // Unknown failure: never leak internals to clients in production.
  return {
    statusCode: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          !isProduction && error instanceof Error && error.message
            ? error.message
            : "Something went wrong. Please try again.",
      },
    },
  };
}

/**
 * Global Express error handler. Must be the last middleware registered.
 *
 * Every error thrown from a route, controller or service ends up here and is
 * answered with a consistent JSON envelope:
 *
 * ```json
 * { "success": false, "error": { "code": "NOT_FOUND", "message": "…" } }
 * ```
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // The response already started streaming: let Express close the connection.
  if (res.headersSent) {
    next(error);
    return;
  }

  const { statusCode, body } = normalizeError(error);

  if (statusCode >= 500) {
    console.error(`[north-api] ${req.method} ${req.originalUrl} failed with ${statusCode}:`, error);
  } else if (!isProduction) {
    console.warn(
      `[north-api] ${req.method} ${req.originalUrl} -> ${statusCode} ${body.error.code}`,
    );
  }

  res.status(statusCode).json(body);
};
