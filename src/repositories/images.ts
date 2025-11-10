import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Kysely } from "kysely";

interface ImageRepository {
  getImages(filterBy?: string): Promise<string[]>;
}

export class SQLiteImageRepo implements ImageRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  getImages(filterBy?: string) {
    const images = this.db
      .selectFrom("images")
      .selectAll()
      .where("name", "=", filterBy)
      .execute();

    return images;
  }
}

export function newImageRepo(): ImageRepository {
  return new SQLiteImageRepo(db);
}
