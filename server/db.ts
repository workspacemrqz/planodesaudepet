import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { autoConfig } from "./config";

// Validate database environment variables
if (!autoConfig.get('DATABASE_URL')) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("Please create a .env file with your database configuration");
  console.error("Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name");
  throw new Error(
    "DATABASE_URL must be set in your .env file. Did you forget to configure the database connection?",
  );
}

console.log("✅ DATABASE_URL environment variable is configured");

export const pool = new Pool({ connectionString: autoConfig.get('DATABASE_URL') });
export const db = drizzle(pool, { schema });