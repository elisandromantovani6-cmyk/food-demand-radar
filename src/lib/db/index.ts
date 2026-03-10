import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Graceful: only connect if DATABASE_URL is set
const client = connectionString ? postgres(connectionString) : null;
export const db = client ? drizzle(client, { schema }) : null;

export type DB = NonNullable<typeof db>;

export function isDbAvailable(): boolean {
  return db !== null;
}
