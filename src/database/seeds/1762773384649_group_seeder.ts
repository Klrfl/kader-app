import type { Kysely } from "kysely";

export async function seed(db: Kysely<any>): Promise<void> {
  await db
    .insertInto("groups")
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
