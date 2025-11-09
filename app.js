import { createServer } from "node:http";
import { indexHandler, sendFile } from "./handlers.js";

const server = createServer((req, res) => {
  console.log(req.method, req.url);

  const reqUrl = new URL(req.url, "http://localhost:3000");

  if (reqUrl.pathname === "/") {
    return indexHandler(req, res);
  }

  sendFile(req, res);
});

const PORT = "3000";
server.listen(PORT, () =>
  console.log(`listening on http://localhost:${PORT} (ctrl+click to open)`),
);
