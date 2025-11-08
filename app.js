import { createServer } from "node:http";
import { indexHandler } from "./handlers.js";

const server = createServer((req, res) => {
  console.log(req.method, req.url);

  if (req.url.endsWith("/")) {
    return indexHandler(req, res);
  }

  sendFile(req, res);
});

const PORT = "3000";
server.listen(PORT, () => console.log(`listening on ${PORT}`));
