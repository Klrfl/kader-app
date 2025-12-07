import { AppError } from "@/errors";
import fs from "node:fs/promises";
import path from "node:path";
import { ActionError } from "astro:actions";

interface Storage {
  normalizeFilename(filename: string): string;
  upload(file: File, filename: string): void;
  delete(filename: string): void;
}

export class FileSystemStorage implements Storage {
  private UPLOAD_BASE: string;

  constructor() {
    this.UPLOAD_BASE = path.resolve("./storage/public/images/");
  }

  normalizeFilename(filename: string): string {
    const uploadBase = this.UPLOAD_BASE;
    const normalizedFilename = encodeURIComponent(filename);
    const absFilename = path.join(uploadBase, normalizedFilename);

    return absFilename;
  }

  async upload(file: File, filename: string) {
    const buf = Buffer.from(await file.arrayBuffer());
    const normalizedFilename = this.normalizeFilename(filename);

    try {
      await fs.writeFile(normalizedFilename, buf);

      console.log("successfully written file to ", normalizedFilename);
    } catch (err) {
      console.error(err);

      const error = new ActionError({
        message: "failed to write file to " + normalizedFilename,
        code: "INTERNAL_SERVER_ERROR",
      });

      return { result: null, error };
    }
  }

  async delete(filename: string) {
    const normalized = this.normalizeFilename(filename);

    try {
      await fs.stat(normalized); // this will throw if file does not exist
      fs.rm(normalized);
    } catch (err) {
      console.log(" file doesn't exist");
      console.error(err);
    }

    return normalized;
  }
}

// add more implementations here
type StorageType = "local";

export function newStorage(storageType: StorageType): Storage {
  switch (storageType) {
    case "local":
      return new FileSystemStorage();
    default:
      throw new AppError("invalid storage", "STORAGE_INSTANTIATION_ERROR");
  }
}
