import fs from "node:fs/promises";
import ejs from "ejs";
import path from "node:path";

/**
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const indexHandler = (_, res) => {
  const path = "./static/index.ejs";
  res.writeHead(200, {
    "content-type": "text/html",
    date: Date.now().toString(),
  });

  const files = getFiles();

  // https://dev.to/webduvet/static-content-server-with-nodejs-without-frameworks-d61
  ejs.renderFile(path, { files }, (err, data) => {
    if (err) console.error(err);

    return res.end(data);
  });
};

const getFiles = () => {
  const path = "../compressed/";

  const files = fs.readdirSync(path);
  const filteredFiles = files.filter((f) => f.match(/.*\.jpe?g$/));
  return filteredFiles;
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
export const sendFile = (req, res) => {
  const url = new URL(req.url, "http://localhost:3000");

  const [_, ext] = url.pathname.match(/.*.(jpe?g|png)$/);
  const mimeType = mimeTypeTable[ext];
  const filePath = "../compressed";

  res.writeHead(200, { "content-type": mimeType });
  fs.readFile(path.join(filePath, url.pathname), () => res.end(contents));

  return res.end("There was an error");
};
