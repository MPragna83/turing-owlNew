// drizzle.config.ts
import "dotenv/config";               // <-- loads DATABASE_URL from .env
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Ensure the database is provisioned and .env is configured.");
}

export default defineConfig({
  schema: "./shared/schema.ts",       // your schema file
  out: "./migrations",                // where migration files will be generated
  dialect: "postgresql",              // you're using Postgres
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // non-null assertion since we checked above
  },
});
