export const PHONE_DIAL_CODE = "+234";

export function toE164PhoneNumber(value: string): string {
  const nationalNumber = value.replace(/\D/g, "").replace(/^0+/, "");

  return nationalNumber ? `${PHONE_DIAL_CODE}${nationalNumber}` : "";
}

export function hasValidPhoneLength(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
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
