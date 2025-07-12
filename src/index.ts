import http from "http";
import https from "https";
import { Server } from "socket.io";
import app from "./app";
import { SNICallback } from "./config/ssl";
import { startCronJobs } from "./cronJobs";
import { setupSocket } from "./socket";
import { env } from "./config/env";

let mainServer: http.Server | https.Server;

if (env.NODE_ENV === "production") {
  const serverOptions: https.ServerOptions = {
    SNICallback,
  };

  mainServer = https.createServer(serverOptions, app);

  mainServer.listen(7030, () => {
    console.log("HTTPS server running on https://validpanel.com:7030/");
  });

  const secondaryHttpServer = http.createServer(app);
  secondaryHttpServer.listen(5020, () => {
    console.log("HTTP fallback running on http://validpanel.com:5020/");
  });
} else {
  mainServer = http.createServer(app);

  mainServer.listen(7030, () => {
    console.log("Development server running on http://localhost:7030/");
  });
}

startCronJobs();

const io = new Server(mainServer, {
  cors: {
    origin: "*",
  },
  pingTimeout: 5000,
});

setupSocket(io);
