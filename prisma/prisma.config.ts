import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// DATABASE_URL may not be available during prisma generate in CI/CD
const databaseUrl = env("DATABASE_URL") ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
