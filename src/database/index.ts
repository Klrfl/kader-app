import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "./database.types";

if (!import.meta.env.DATABASE_URL) {
  console.warn(
    "WARNING: DATABASE_URL not set in .env file. defaulting to default database path (database.sqlite)"
  );
}

const DATABASE_URL = import.meta.env.DATABASE_URL || "./database.sqlite";

const dialect = new SqliteDialect({
  database: new SQLite(DATABASE_URL),
});

export const db = new Kysely<DB>({
  dialect,
  log: ["error"],
});
