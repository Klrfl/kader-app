import fs from "node:fs";

/**
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const indexHandler = (_, res) => {
  const pathToIndex = "./static/index.html";

  // https://dev.to/webduvet/static-content-server-with-nodejs-without-frameworks-d61
  fs.readFile(pathToIndex, (err, data) => {
    if (err) console.error(err);

    return res.end(data);
  });
};

/**
 * @param req typeof IncomingMessage
 * @param res typeof ServerResponse
 */
export const fileHandler = (_, res) => {
  const path = "../";

  const files = fs.readdirSync(path);
  const filteredFiles = files.filter((f) => f.match(/.*\.jpe?g$/));

  res.writeHead(200, { "content-type": "application/json" });
  return res.end(JSON.stringify({ filtered_files: filteredFiles }));
};
