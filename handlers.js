import fs from "node:fs/promises";
import ejs from "ejs";
import path from "node:path";
import { AppError } from "./errors.js";
import { getGroups, getPicturesPath } from "./utils.js";

/**
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const indexHandler = async (req, res) => {
  res.writeHead(200, {
    "content-type": "text/html",
    date: Date.now().toString(),
  });

  const searchParams = new URL(
    req.url,
    process.env.HOST ?? "http://localhost:3000/",
  ).searchParams;
  const groupToFilterBy = searchParams.get("group");

  try {
    const indexPath = "./static/index.ejs";
    const picturesPath = getPicturesPath();

    const files = await getFiles(picturesPath, groupToFilterBy);
    const groups = getGroups();

    const data = {
      files,
      groups,
    };

    // https://dev.to/webduvet/static-content-server-with-nodejs-without-frameworks-d61
    ejs.renderFile(indexPath, data, (err, data) => {
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
