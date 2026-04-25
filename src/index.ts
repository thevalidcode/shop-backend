import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { updateAllowedHosts } from "./config/cors.config";
import { setupSocket } from "./socket";
import { env } from "./config/env.config";
import { startCronJobs } from "./cronJobs";

const server = http.createServer(app);

setInterval(updateAllowedHosts, 5 * 60 * 1000);

async function startServer() {
  await updateAllowedHosts();
  startCronJobs();

  server.listen(env.PRIMARY_PORT, () => {
    console.log(`Shop Backend running on http://localhost:${env.PRIMARY_PORT}`);
  });

  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
    path: "/shop/backend/socket.io",
  });

  setupSocket(io);
}

startServer();

