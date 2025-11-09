import type { Kysely } from "kysely";
import { sql } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .createTable("students")
    .addColumn("id", "integer", (c) => c.primaryKey().notNull().autoIncrement())
    .addColumn("group_id", "integer", (c) =>
      c.references("groups.id").notNull()
    )
    .addColumn("name", "text")
    .addColumn("nickname", "text")
    .addColumn("hobby", "text")
    .addColumn("nim", "text")
    .addColumn("instagram_handle", "text")
    .addColumn("date_of_birth", "timestamp")
    .addColumn("blood_type", "text")
    .addColumn("address", "text")
    .execute();

  db.schema
    .createTable("images")
    .addColumn("id", "integer", (c) => c.primaryKey().notNull().autoIncrement())
    .addColumn("filename", "text", (c) => c.unique())
    .addColumn("created_at", "timestamp", (c) =>
      c.defaultTo(sql`datetime('now')`)
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropTable("images");
  db.schema.dropTable("students");
}
