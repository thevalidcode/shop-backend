import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import app, { updateAllowedOrigins } from "./app";
import { SNICallback } from "./config/ssl";
import { startCronJobs } from "./cronJobs";
import { setupSocket } from "./socket";
import { env } from "./config/env";

let mainServer: http.Server | https.Server;

async function startServer() {
  await updateAllowedOrigins();

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
    const devServerOptions: https.ServerOptions = {
      key: fs.readFileSync(path.join(__dirname, '../localhost-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../localhost.pem')),
    };
    
    mainServer = https.createServer(devServerOptions, app);

    mainServer.listen(7030, () => {
      console.log("Development server running on https://localhost:7030/"); // Note: https
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
}

startServer();