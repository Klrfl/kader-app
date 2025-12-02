import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_BASE } from "astro:env/server";
import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Image, UpdateableImage } from "@/types";
import type { Kysely } from "kysely";
import { ActionError } from "astro:actions";
import { AppError } from "@/errors";

type getImagesParams = {
  groupId?: number;
  showPrinted?: boolean;
};

type VerboseImage = Image & {
  student_name: string | null;
  group_name: string | null;
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

type ImageResult =
  | { result: Image; error: null }
  | { result: null; error: AppError };

interface ImageRepository {
  getImage(student_id: number): Promise<ImageResult>;
  getImages(params: getImagesParams): Promise<VerboseImage[]>;
  updateImage(student_id: number, input: UpdateableImage): Promise<ImageResult>;
  uploadStudentImage(
    file: unknown,
    filename: string,
    student_id: number
  ): Promise<UploadResult>;
}

export class SQLiteImageRepo implements ImageRepository {
  private UPLOAD_BASE: string;
  private db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;

    this.UPLOAD_BASE = UPLOAD_BASE;
  }

  async getImages({
    groupId = 0,
    showPrinted,
  }: getImagesParams): Promise<VerboseImage[]> {
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

  async updateImage(
    student_id: number,
    input: UpdateableImage
  ): Promise<ImageResult> {
    const result = await this.db
      .updateTable("images")
      .set(input)
      .where("student_id", "=", student_id)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      const error = new AppError(
        "failed to update image data",
        "IMAGE_UPDATE_ERROR"
      );
      return { result: null, error };
    }

    return { result, error: null };
  }

  async uploadStudentImage(file: File, filename: string, student_id: number) {
    const uploadBase = this.UPLOAD_BASE;
    const normalizedFilename = encodeURIComponent(filename);
    const absFilename = path.join(uploadBase, normalizedFilename);

    const buf = Buffer.from(await file.arrayBuffer());
    try {
      await fs.writeFile(absFilename, buf);

      console.log("successfully written file to ", absFilename);
    } catch (err) {
      console.error(err);

      const error = new ActionError({
        message: "failed to write file to " + absFilename,
        code: "INTERNAL_SERVER_ERROR",
      });

      return { result: null, error };
    }

    const insertImageResult = await this.db
      .insertInto("images")
      .values({ student_id: student_id, filename: normalizedFilename })
      .onConflict((oc) =>
        oc.column("student_id").doUpdateSet({ filename: normalizedFilename })
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

  async getImage(student_id: number): Promise<ImageResult> {
    const image = await this.db
      .selectFrom("images")
      .where("student_id", "=", student_id)
      .selectAll()
      .executeTakeFirst();

    if (!image) {
      const error = new AppError("failed to get image", "IMAGE_SELECT_ERROR");
      return { result: null, error };
    }

    return { result: image, error: null };
  }
}

export function newImageRepo(): ImageRepository {
  return new SQLiteImageRepo(db);
}
