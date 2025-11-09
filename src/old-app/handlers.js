import fs from "node:fs/promises";
import path from "node:path";
import { AppError } from "./errors.js";

/**
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const indexHandler = async (req, res) => {
  res.writeHead(200, {
    "content-type": "text/html",
    date: Date.now().toString(),
  });
};

/**
 * get path to your image files
 * @type (picturesPath: string, filterBy: string) => Promise<string[]>
 * */
const getFiles = async (picturesPath, filterBy) => {
  try {
    const files = await fs.readdir(path.resolve(picturesPath));

    const filteredFiles = files
      .filter((f) => f.match(/.*\.jpe?g$/))
      .filter((f) => f.startsWith(filterBy));

    return filteredFiles;
  } catch (err) {
    // rewrap with a more readable error
    if (err.code === "ENOENT") {
      throw new AppError(
        `no folder ${path.resolve(picturesPath)}. make sure folder exists`,
        "NO_FOLDER_FOUND"
      );
    }
  }
};

const mimeTypeTable = {
  jpg: "image/jpeg",
  png: "image/png",
  jpeg: "image/jpeg",
};

/**
 * serve static files
 *
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const sendFile = async (req, res) => {
  const url = new URL(req.url, "http://localhost:3000");

  if (!url) {
    res.writeHead(404);
    return res.end(null);
  }

  const match = url.pathname.match(/\w*.(jpe?g|png)$/);
  if (!match) {
    res.writeHead(404);
    return res.end(null);
  }

  const [_, extension] = match;
  const mimeType = mimeTypeTable[extension];
  const picturesPath = getPicturesPath();

  res.writeHead(200, { "content-type": mimeType });
  const data = await fs.readFile(path.join(picturesPath, url.pathname));
  return res.end(data);
};
