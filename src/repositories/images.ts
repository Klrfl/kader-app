import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Image } from "@/types";
import type { Kysely } from "kysely";

interface ImageRepository {
  getImages(filterBy?: string): Promise<Image[]>;
}

export class SQLiteImageRepo implements ImageRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getImages(filterBy?: string) {
    let query = this.db
      .selectFrom("images as i")
      .selectAll()
      .leftJoin("students as s", "s.id", "i.student_id")
      .leftJoin("groups as g", "g.id", "s.group_id");

    if (filterBy) {
      query = query.where("g.name", "=", filterBy ?? "");
    }

    const images = await query.execute();

    return images;
  }
}

export function newImageRepo(): ImageRepository {
  return new SQLiteImageRepo(db);
}
