"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const generated_1 = require("../../prisma/generated");
const prisma = new generated_1.PrismaClient();
exports.prisma = prisma;
const pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
});
exports.pool = pool;
