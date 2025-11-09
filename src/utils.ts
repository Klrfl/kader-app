import path from "node:path";
import fs from "node:fs/promises";
import { AppError } from "./errors";

/**
 * get path used in pictures
 * @returns string
 * */
export const getPicturesPath = () => {
  if (!import.meta.env.FILE_PATH) {
    console.error("don't forget to set FILE_PATH in your .env file");
  }

  return path.resolve(import.meta.env.FILE_PATH);
};

// TODO: use an sqlite database or something
/**
 * get all groups at kaderisasi
 * @returns string[]
 * */
export const getGroups = () => [
  "adarna",
  "anqa",
  "bennu",
  "caladrius",
  "huma",
  "sankova",
  "simurgh",
];

export const getFiles = async (
  picturesPath: string,
  filterBy: string
): Promise<{ files: string[] | null; error: AppError | null }> => {
  try {
    const files = await fs.readdir(path.resolve(picturesPath));

    const filteredFiles = files
      .filter((f) => f.match(/.*\.jpe?g$/))
      .filter((f) => f.startsWith(filterBy));

    return { files: filteredFiles, error: null };
  } catch (err: unknown) {
    if (err instanceof AppError && err.code === "ENOENT") {
      const error = new AppError(
        `no folder ${path.resolve(picturesPath)}. make sure folder exists`,
        "NO_FOLDER_FOUND"
      );

      return { files: null, error };
    }
  }

  return { files: null, error: null };
};
