import "dotenv/config";
import app from "./app";
import { createServer } from "http";

async function startServer() {
  const server = createServer(app);
  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, () => {
    console.log("[api] server listening");
  });
}

startServer().catch(() => {
  console.error("[api] server failed to start");
});
