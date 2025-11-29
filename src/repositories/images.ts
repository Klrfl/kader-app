import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Image } from "@/types";
import type { Kysely } from "kysely";
import { ActionError } from "astro:actions";

type getImagesParams = {
  groupId?: number;
  showPrinted?: boolean;
};

type UploadResult =
  | {
      result: Image;
      error: null;
    }
  | {
      result: null;
      error: ActionError;
    };

interface ImageRepository {
  getImages(params: getImagesParams): Promise<Image[]>;
  uploadStudentImage(
    file: unknown,
    filename: string,
    student_id: number
  ): Promise<UploadResult>;
}

export class SQLiteImageRepo implements ImageRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getImages({ groupId = 0, showPrinted }: getImagesParams) {
    let query = this.db
      .selectFrom("images as i")
      .leftJoin("students as s", "s.id", "i.student_id")
      .leftJoin("groups as g", "g.id", "s.group_id")
      .select([
        "i.id",
        "i.student_id",
        "i.filename",
        "i.created_at",
        "i.has_been_printed",
        "s.nickname as student_name",
        "g.name as group_name",
      ])
      .orderBy("s.group_id", "asc")
      .orderBy("s.nim", "asc");
    if (groupId !== 0) {
      query = query.where("g.id", "=", groupId);
    }

    if (!showPrinted) {
      query = query.where("i.has_been_printed", "=", Number(false));
    }

    const images = await query.execute();

    return images;
  }

  async uploadStudentImage(file: File, filename: string, student_id: number) {
    const wd = path.dirname(fileURLToPath(import.meta.url));
    const imagesBase = path.join(wd, "../../public/images/"); // TODO: don't put the path directly here
    const normalizedFilename = encodeURIComponent(
      filename.trim().toLowerCase()
    );
    const absFilename = path.join(imagesBase, normalizedFilename);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absFilename, buf);

    console.log("successfully written file to ", absFilename);

    const insertImageResult = await this.db
      .insertInto("images")
      .values({ student_id: student_id, filename: normalizedFilename })
      .onConflict((oc) =>
        oc.column("filename").doUpdateSet({ filename: normalizedFilename })
      )
      .returningAll()
      .executeTakeFirst();

    if (!insertImageResult) {
      const error = new ActionError({
        message: "failed to upload image.",
        code: "INTERNAL_SERVER_ERROR",
      });

      return { result: null, error };
    }

    return { result: insertImageResult, error: null };
  }
}

export function newImageRepo(): ImageRepository {
  return new SQLiteImageRepo(db);
}
