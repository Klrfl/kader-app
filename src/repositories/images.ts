import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Image, UpdateableImage } from "@/types";
import type { Kysely } from "kysely";
import { ActionError } from "astro:actions";
import { AppError } from "@/errors";

type getImagesParams = {
  groupId?: number;
  showPrinted?: boolean;
  sortByNIM?: boolean;
  sortByGroup?: boolean;
};

type VerboseImage = Image & {
  student_name: string | null;
  group_name: string | null;
};

type UploadImageResult =
  | {
      result: Image;
      error: null;
    }
  | {
      result: null;
      error: ActionError;
    };

type GetImageResult =
  | { result: Image; error: null }
  | { result: null; error: AppError };

type DeleteImageResult =
  | { result: null; error: AppError }
  | { result: Image; error: null };

interface ImageRepository {
  getImage(student_id: number): Promise<GetImageResult>;
  getImages(params: getImagesParams): Promise<VerboseImage[]>;
  updateImage(
    student_id: number,
    input: UpdateableImage
  ): Promise<GetImageResult>;
  uploadStudentImage(
    student_id: number,
    filename: string
  ): Promise<UploadImageResult>;
  deleteImage(student_id: number): Promise<DeleteImageResult>;
  markImagesAsPrinted(student_ids: number[]): Promise<boolean>;
}

export class SQLiteImageRepo implements ImageRepository {
  private db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }
  async markImagesAsPrinted(student_ids: number[]): Promise<boolean> {
    // TODO: handle errors
    const _ = await this.db
      .updateTable("images")
      .set({ has_been_printed: Number(true) })
      .where("student_id", "in", student_ids)
      .execute();

    return true;
  }

  async deleteImage(student_id: number): Promise<DeleteImageResult> {
    const image = await this.db
      .deleteFrom("images")
      .where("student_id", "=", student_id)
      .returningAll()
      .executeTakeFirst();
    let error = null;
    if (!image) {
      error = new AppError("failed to delete image", "IMAGE_DELETE_ERROR");
      return { result: null, error };
    }

    return { result: image, error };
  }

  async getImages({
    groupId = 0,
    showPrinted,
    sortByNIM,
    sortByGroup,
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
      ]);

    if (sortByGroup) {
      query = query.orderBy("s.group_id", "asc");
    }

    if (sortByNIM) {
      query = query.orderBy("s.nim", "asc");
    }

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
  ): Promise<GetImageResult> {
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

  async uploadStudentImage(
    student_id: number,
    filename: string
  ): Promise<UploadImageResult> {
    const insertImageResult = await this.db
      .insertInto("images")
      .values({ student_id, filename })
      .onConflict((oc) => oc.column("student_id").doUpdateSet({ filename }))
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

  async getImage(student_id: number): Promise<GetImageResult> {
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
