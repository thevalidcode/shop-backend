"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "7030",
    MASTER_KEY: process.env.MASTER_KEY || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    SESSION_SECRET: process.env.SESSION_SECRET || "",
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
    DATABASE_URL: process.env.DATABASE_URL || "",
    RATE_KEY: process.env.RATE_KEY || "",
};
