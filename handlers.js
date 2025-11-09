import fs from "node:fs/promises";
import ejs from "ejs";
import path from "node:path";
import { AppError } from "./errors.js";

/**
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const indexHandler = async (_, res) => {
  const path = "./static/index.ejs";
  res.writeHead(200, {
    "content-type": "text/html",
    date: Date.now().toString(),
  });

  try {
    const picturesPath = "../compressed";

    const files = await getFiles(picturesPath);
    // https://dev.to/webduvet/static-content-server-with-nodejs-without-frameworks-d61
    ejs.renderFile(path, { files }, (err, data) => {
      if (err) console.error(err);

      return res.end(data);
    });
  } catch (err) {
    console.error(err);

    if (err.code === "NO_FOLDER_FOUND") {
      ejs.renderFile(
        "./static/error.ejs",
        { message: err.message },
        (err, data) => {
          if (err) console.error(err);

          return res.end(data);
        },
      );
    }
  }
};

/**
 * get path to your image files
 * @type (picturesPath: string) => Promise<string[]>
 * */
const getFiles = async (picturesPath) => {
  try {
    const files = await fs.readdir(path.resolve(picturesPath));

    const filteredFiles = files.filter((f) => f.match(/.*\.jpe?g$/));
    return filteredFiles;
  } catch (err) {
    // rewrap with a more readable error
    if (err.code === "ENOENT") {
      throw new AppError(
        `no folder ${path.resolve(picturesPath)}. make sure folder exists`,
        "NO_FOLDER_FOUND",
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

  const [_, ext] = url.pathname.match(/.*.(jpe?g|png)$/);
  const mimeType = mimeTypeTable[ext];
  const filePath = "../compressed";

  res.writeHead(200, { "content-type": mimeType });
  const data = await fs.readFile(path.join(filePath, url.pathname));
  return res.end(data);
};
