import fs from "node:fs";
import { createServer } from "node:http";

const path = "../";
const files = fs.readdirSync(path);
const filteredFiles = files.filter((f) => f.match(/.*\.jpe?g$/));

const server = createServer((req, res) => {
  console.log(req.method, req.url);

  if (req.url.endsWith("/")) {
    const pathToIndex = "./static/index.html";

    // https://dev.to/webduvet/static-content-server-with-nodejs-without-frameworks-d61
    fs.readFile(pathToIndex, (err, data) => {
      if (err) console.error(err);

      return res.end(data);
    });
  }

  if (req.url == "/files") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ filtered_files: filteredFiles }));
  }
});

const PORT = "3000";
server.listen(PORT, () => console.log(`listening on ${PORT}`));
