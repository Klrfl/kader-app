import type { Kysely } from "kysely";
import { sql } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .createTable("images")
    .addColumn("id", "integer", (c) => c.primaryKey().notNull().autoIncrement())
    .addColumn("student_id", "integer", (c) =>
      c.notNull().references("students.id").onDelete("cascade")
    )
    .addColumn("filename", "text", (c) => c.unique())
    .addColumn(
      "created_at",
      "timestamp",
      (c) => c.defaultTo(sql`(datetime('now'))`) // don't forget to wrap with brackets
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropTable("images").execute();
}
