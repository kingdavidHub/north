const PHONE_COUNTRY_CODE = "234";

export const PHONE_DIAL_CODE = `+${PHONE_COUNTRY_CODE}`;

function withNigeriaCountryCode(digits: string): string {
  const nationalNumber = digits
    .slice(PHONE_COUNTRY_CODE.length)
    .replace(/^0+/, "");

  return nationalNumber ? `${PHONE_DIAL_CODE}${nationalNumber}` : "";
}

/**
 * Converts a Nigerian national number to E.164 while preserving numbers that
 * already include an explicit country code (`+234...`, `00234...`, `234...`).
 * This keeps pasted E.164 numbers from being prefixed twice.
 */
export function toE164PhoneNumber(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (trimmed.startsWith("+")) {
    return digits.startsWith(PHONE_COUNTRY_CODE)
      ? withNigeriaCountryCode(digits)
      : `+${digits}`;
  }

  if (trimmed.startsWith("00")) {
    const internationalDigits = digits.slice(2);

    return internationalDigits.startsWith(PHONE_COUNTRY_CODE)
      ? withNigeriaCountryCode(internationalDigits)
      : `+${internationalDigits}`;
  }

  const nationalNumber = digits.replace(/^0+/, "");

  if (!nationalNumber) {
    return "";
  }

  if (nationalNumber.startsWith(PHONE_COUNTRY_CODE)) {
    return withNigeriaCountryCode(nationalNumber);
  }

  return `${PHONE_DIAL_CODE}${nationalNumber}`;
}

export function hasValidPhoneLength(value: string): boolean {
  const rawDigits = value.replace(/\D/g, "");

  if (rawDigits.length < 7) {
    return false;
  }

  const e164Digits = toE164PhoneNumber(value).replace(/\D/g, "");

  return e164Digits.length >= 7 && e164Digits.length <= 15;
}

export function splitFullName(fullName: string): {
  firstName?: string;
  lastName?: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {};
  }

  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
