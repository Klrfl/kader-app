import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "./database.types";

const dialect = new SqliteDialect({
  database: new SQLite("./database.sqlite"),
});

export const db = new Kysely<DB>({
  dialect,
  log: ["query", "error"],
});
