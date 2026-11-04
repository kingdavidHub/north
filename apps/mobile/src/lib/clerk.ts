type ClerkApiError = {
  code?: unknown;
  message?: unknown;
  longMessage?: unknown;
};

type ClerkErrorLike = ClerkApiError & {
  errors?: unknown;
};

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function firstApiError(error: ClerkErrorLike): ClerkApiError | null {
  if (!Array.isArray(error.errors)) {
    return null;
  }

  const [first] = error.errors;

  if (typeof first !== "object" || first === null) {
    return null;
  }

  return first as ClerkApiError;
}

export function isUnsupportedCountryError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const clerkError = error as ClerkErrorLike;
  const codes = [clerkError.code, firstApiError(clerkError)?.code];

  return codes.some((code) => code === "unsupported_country_code");
}

/**
 * Clerk's `longMessage` is the only message the SDK guarantees is safe to
 * show to users. In development, fall back to the developer message and error
 * code so failed auth requests are diagnosable.
 */
export function getClerkErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  const clerkError = error as ClerkErrorLike;
  const apiError = firstApiError(clerkError);

  const userMessage =
    asText(clerkError.longMessage) ??
    asText(apiError?.longMessage) ??
    (__DEV__
      ? (asText(apiError?.message) ?? asText(clerkError.message))
      : null);

  if (userMessage) {
    return userMessage;
  }

  const code = asText(apiError?.code) ?? asText(clerkError.code);

  if (__DEV__ && code) {
    return `Something went wrong (${code}). Please try again.`;
  }

  return "Something went wrong. Please try again.";
}
