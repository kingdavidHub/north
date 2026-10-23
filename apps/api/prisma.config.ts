import "dotenv/config";

import { defineConfig, env } from "prisma/config";

// Fallback keeps `prisma generate` and `prisma validate` usable before a real
// database is provisioned. The API itself still requires DATABASE_URL at runtime.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://north:north@localhost:5432/north?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ? env("DATABASE_URL") : databaseUrl,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL
      ? env("SHADOW_DATABASE_URL")
      : undefined,
  },
});
