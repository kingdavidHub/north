import { UserSchema, type User } from "@north/shared";
import { NotFoundError } from "../errors/index.ts";
import { prisma } from "../lib/prisma.ts";

/**
 * Only these columns are ever returned to clients. Password and PIN hashes
 * must never leave the database boundary.
 */
const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  displayName: true,
  avatarUrl: true,
  status: true,
  kycStatus: true,
  createdAt: true,
} as const;

/**
 * Validates an untrusted user payload.
 *
 * A failed parse throws a `ZodError`, which the global error handler turns
 * into a `422 VALIDATION_ERROR` response. There is no need to catch it here.
 */
export function validateUserPayload(payload: unknown): User {
  return UserSchema.parse(payload);
}

/**
 * Loads a single active user by id and throws a domain error when it is
 * missing or soft-deleted.
 *
 * This is intentionally not mounted on a route yet: the API has no
 * authentication layer, so exposing user profiles would leak PII. Wire it up
 * only behind an authenticated, self-or-admin route.
 *
 * @throws {NotFoundError} when no active user matches the given id.
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: publicUserSelect,
  });

  if (!user) {
    throw new NotFoundError(`User "${id}" was not found.`);
  }

  return user;
}
