import type { Kysely } from "kysely";

// replace `any` with your database interface.
export async function seed(db: Kysely<any>): Promise<void> {
  db.insertInto("groups")
    .values([
      { name: "adarna" },
      { name: "sankova" },
      { name: "anqa" },
      { name: "caladrius" },
      { name: "griffin" },
      { name: "bennu" },
      { name: "phoenix" },
      { name: "simurgh" },
      { name: "chakora" },
      { name: "huma" },
      { name: "camrosh" },
      { name: "syrin" },
      { name: "shahbaz" },
      { name: "ROC" },
      { name: "peryton" },
      { name: "vermillion" },
      { name: "aethon" },
      { name: "noctua" },
    ])
    .execute();
}
