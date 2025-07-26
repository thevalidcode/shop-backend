"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const ssl_1 = require("./config/ssl");
const cronJobs_1 = require("./cronJobs");
const socket_1 = require("./socket");
const env_1 = require("./config/env");
let mainServer;
if (env_1.env.NODE_ENV === "production") {
    const serverOptions = {
        SNICallback: ssl_1.SNICallback,
    };
    mainServer = https_1.default.createServer(serverOptions, app_1.default);
    mainServer.listen(7030, () => {
        console.log("HTTPS server running on https://validpanel.com:7030/");
    });
    const secondaryHttpServer = http_1.default.createServer(app_1.default);
    secondaryHttpServer.listen(5020, () => {
        console.log("HTTP fallback running on http://validpanel.com:5020/");
    });
}
else {
    mainServer = http_1.default.createServer(app_1.default);
    mainServer.listen(7030, () => {
        console.log("Development server running on http://localhost:7030/");
    });
}
(0, cronJobs_1.startCronJobs)();
const io = new socket_io_1.Server(mainServer, {
    cors: {
        origin: "*",
    },
    pingTimeout: 5000,
});
(0, socket_1.setupSocket)(io);
