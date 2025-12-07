import { sql, type Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("group_images")
    .addColumn("id", "integer", (c) => c.primaryKey().notNull().autoIncrement())
    .addColumn("group_id", "integer", (c) =>
      c.references("groups.id").unique().notNull()
    )
    .addColumn("filename", "text", (c) => c.unique().notNull())
    .addColumn("has_been_printed", "boolean", (c) =>
      c.notNull().defaultTo(false)
    )
    .addColumn(
      "created_at",
      "timestamp",
      (c) => c.notNull().defaultTo(sql`(datetime('now'))`) // don't forget to wrap with brackets
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropTable("group_images").execute();
}
