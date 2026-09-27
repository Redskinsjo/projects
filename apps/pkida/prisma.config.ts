import { config } from "dotenv";
import { defineConfig } from "prisma/config";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Generation/build does not need credentials. Migrations require DATABASE_URL.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
