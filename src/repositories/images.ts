import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Image } from "@/types";
import type { Kysely } from "kysely";

type getImagesParams = {
  groupId?: number;
  showPrinted?: boolean;
};

interface ImageRepository {
  getImages(params: getImagesParams): Promise<Image[]>;
}

export class SQLiteImageRepo implements ImageRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getImages({ groupId = 0, showPrinted }: getImagesParams) {
    let query = this.db
      .selectFrom("images as i")
      .selectAll()
      .leftJoin("students as s", "s.id", "i.student_id")
      .leftJoin("groups as g", "g.id", "s.group_id");

    if (groupId !== 0) {
      query = query.where("g.id", "=", groupId);
    }

    if (!showPrinted) {
      query = query.where("i.has_been_printed", "=", Number(false));
    }

    const images = await query.execute();

    return images;
  }
}

export function newImageRepo(): ImageRepository {
  return new SQLiteImageRepo(db);
}
